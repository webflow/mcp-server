import express from "express";
import http from "http";
import {
  Socket,
  Server as SocketIOServer,
} from "socket.io";
import cors from "cors";
import { RPCType } from "../types/RPCType";
import { generateUUIDv4, getFreePort } from "../utils";

type returnType = {
  callTool: RPCType["callTool"];
};

const START_PORT = 1338;
const END_PORT = 1638;

const initRPC = (
  io: SocketIOServer,
  port: number
): returnType => {
  const url = `http://localhost:${port}`;
  const siteIdToSocketMap = new Map<string, Set<Socket>>();
  const pendingToolResponse = new Map<
    string,
    (response: any) => void
  >();

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
      const toolResponse =
        pendingToolResponse.get(requestId);
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
        }, 20000); //20 seconds
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

export const initDesignerAppBridge =
  async (): Promise<returnType> => {
    // Initialize Express app
    const app = express();
    app.use(cors()); // Enable CORS for all routes

    // Create HTTP server using the Express app
    const server = http.createServer(app);

    // Initialize Socket.IO with the HTTP server
    const io = new SocketIOServer(server, {
      cors: {
        origin: "*", // Allow connections from any origin
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow specified HTTP methods
      },
      pingTimeout: 20000, // Close connection after 20s of inactivity
      transports: ["websocket", "polling"], // Enable both WebSocket and HTTP polling
    });

    app.get("/", (_, res) => {
      res.send("Webflow MCP is running");
    });

    try {
      const port = await getFreePort(START_PORT, END_PORT);
      server.listen(port);

      const rpc = initRPC(io, port);

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
