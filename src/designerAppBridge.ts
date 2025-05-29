import express from "express";
import http from "http";
import {
  Socket,
  Server as SocketIOServer,
} from "socket.io";
import cors from "cors";
import { generateUUIDv4, isPortFree } from "./utils";
import { RCPType } from "./types/deTools";

const initRPC = (io: SocketIOServer): RCPType => {
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
            error:
              "Tool call timed out, Please check Webflow Designer MCP app is running on Webflow Designer or restart the Webflow Designer App",
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

export const initDesignerAppBridge = async () => {
  //app port
  const PORT = process.env.APP_PORT;

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

  const isPortAvailable = await isPortFree(Number(PORT));

  if (!isPortAvailable) {
    throw new Error(`Port ${PORT} is already in use`);
  }

  // Start the server on the specified port
  server.listen(PORT);

  const rpc = initRPC(io);

  return rpc;
};
