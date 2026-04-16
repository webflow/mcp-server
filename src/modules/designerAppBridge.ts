import express from "express";
import http from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { WebflowClient } from "webflow-api";
import { RPCType } from "../types/RPCType";
import { generateUUIDv4, getFreePort } from "../utils";
import { uploadAssetFromUrl } from "../tools/assetUpload";

type returnType = {
  callTool: RPCType["callTool"];
};

type BridgeOptions = {
  /**
   * Optional Webflow Data API client accessor. Required to enable the
   * `/api/upload-asset` HTTP endpoint; otherwise that route returns 500.
   */
  getClient?: () => WebflowClient;
};

const START_PORT = 1338;
const END_PORT = 1638;

const initRPC = (io: SocketIOServer, port: number): returnType => {
  const url = `http://localhost:${port}`;
  const siteIdToSocketMap = new Map<string, Set<Socket>>();
  const pendingToolResponse = new Map<string, (response: any) => void>();

  io.on("connection", (socket) => {
    const { siteId } = socket.handshake.query as {
      siteId: string;
    };
    if (!siteId) {
      socket.emit("error", "Site ID is required");
      setTimeout(() => {
        socket.disconnect();
      }, 1000);
      return;
    }

    if (!siteIdToSocketMap.has(siteId)) {
      siteIdToSocketMap.set(siteId, new Set());
    }
    siteIdToSocketMap.get(siteId)!.add(socket);

    socket.emit("connection-confirmation", {
      siteId,
      message: "Connected to Webflow MCP",
    });

    socket.on("tool-call-response", (data) => {
      const { requestId, data: responseData } = data as {
        requestId: string;
        data: any;
      };
      if (!requestId) {
        return;
      }
      if (!pendingToolResponse.has(requestId)) {
        return;
      }
      const toolResponse = pendingToolResponse.get(requestId);
      if (toolResponse) {
        toolResponse(responseData);
        pendingToolResponse.delete(requestId);
      }
    });

    socket.on("disconnect", () => {
      if (siteIdToSocketMap.has(siteId)) {
        siteIdToSocketMap.get(siteId)?.delete(socket);
      }
    });
  });
  const callTool = (toolName: string, args: any) => {
    if (toolName === "local_de_mcp_connection_tool") {
      return Promise.resolve({
        status: true,
        message: `Share this url with the user to connect to the Webflow Designer App. ${url}. Please share complete url with the USER.`,
        url,
      });
    }
    const { siteId } = args as any;
    if (!siteId) {
      return Promise.resolve({
        status: false,
        error: "Site ID is required",
      });
    }
    const requestId = `${siteId}-${generateUUIDv4()}`;
    return new Promise((resolve) => {
      if (
        siteIdToSocketMap.has(siteId) &&
        siteIdToSocketMap.get(siteId)!.size > 0
      ) {
        const sockets = siteIdToSocketMap.get(siteId)!;
        for (const socket of sockets) {
          socket.emit("call-tool", {
            toolName,
            args,
            siteId,
            requestId,
          });
        }
        const cleanup = () => {
          clearTimeout(timerId);
          pendingToolResponse.delete(requestId);
        };
        const timerId = setTimeout(() => {
          cleanup();
          resolve({
            error: `Tool call timed out, Please check Webflow Designer MCP app is running on Webflow Designer or restart the Webflow Designer App. make sure you are using correct url ${url} on app.`,
          });
        }, 60000); //60 seconds
        const toolResponse = (data: any) => {
          cleanup();
          resolve(data);
        };
        pendingToolResponse.set(requestId, toolResponse);
      } else {
        resolve({
          status: false,
          error:
            "No active Designer app connection to the site, Please make sure Designer app is open and connected, or check the site id is valid, all site ids can be found using the sites_list tool.",
        });
      }
    });
  };

  return {
    callTool,
  };
};

export const initDesignerAppBridge = async (
  options: BridgeOptions = {},
): Promise<returnType> => {
  const { getClient } = options;

  // Initialize Express app
  const app = express();
  // Allow Private Network Access (Chrome requires this for localhost access from public origins)
  // Must be before cors() so the header is set before the preflight response is sent
  app.use((req, res, next) => {
    if (req.headers["access-control-request-private-network"]) {
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    next();
  });
  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    }),
  );
  // Parse JSON bodies for the HTTP proxy endpoints
  app.use(express.json({ limit: "10mb" }));

  // Create HTTP server using the Express app
  const server = http.createServer(app);

  // Initialize Socket.IO with the HTTP server
  const io = new SocketIOServer(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    },
    pingTimeout: 600000, // 10 minutes — long timeout for extraction workflows
    transports: ["websocket", "polling"], // Enable both WebSocket and HTTP polling
  });

  app.get("/", (_, res) => {
    res.send("Webflow MCP is running");
  });

  try {
    const port = await getFreePort(START_PORT, END_PORT);
    server.listen(port);

    const rpc = initRPC(io, port);

    // ── HTTP Proxy for tool calls (hackathon) ─────────────────
    // Allows external apps (e.g. Designer extensions) to call MCP tools
    // via HTTP POST instead of stdio. Forwards to the Designer RPC bridge.
    // POST /api/tool-call { toolName, args }
    app.post("/api/tool-call", async (req, res) => {
      try {
        const { toolName, args } = req.body ?? {};
        if (!toolName || !args) {
          res.status(400).json({ error: "toolName and args required" });
          return;
        }
        const result = await rpc.callTool(toolName, args);
        res.json({ result });
      } catch (err: any) {
        res.status(500).json({ error: err.message ?? "Tool call failed" });
      }
    });

    // GET /api/status — health check for the bridge
    app.get("/api/status", (_, res) => {
      res.json({ status: "ok", port });
    });

    // POST /api/upload-asset — upload image from URL to Webflow site
    // { siteId, url, fileName?, altText? } → { assetId, fileName, hostedUrl? }
    // Uses the Webflow Data API directly (bypasses the Designer RPC bridge),
    // so getClient must be supplied when initializing the bridge.
    app.post("/api/upload-asset", async (req, res) => {
      try {
        if (!getClient) {
          res.status(500).json({
            error:
              "Asset upload endpoint is not configured — bridge was initialized without a Webflow client.",
          });
          return;
        }
        const { siteId, url, fileName, altText } = req.body ?? {};
        if (!siteId || !url) {
          res.status(400).json({ error: "siteId and url are required" });
          return;
        }
        const result = await uploadAssetFromUrl(getClient(), {
          siteId,
          url,
          fileName,
          altText,
        });
        if (!result.success) {
          res.status(500).json({ error: result.error });
          return;
        }
        res.json({
          assetId: result.assetId,
          fileName: result.fileName,
          hostedUrl: result.hostedUrl,
          assetUrl: result.assetUrl,
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message ?? "Upload failed" });
      }
    });

    return rpc;
  } catch (e) {
    return {
      callTool: () => {
        return Promise.resolve({
          status: false,
          error: `Unable to find a free port to start the Webflow Designer App Bridge. Please make sure you have port ${START_PORT}-${END_PORT} free.`,
        });
      },
    };
  }
};
