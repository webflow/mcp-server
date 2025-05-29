import { ERRORS } from "../../config/constant";
import {
  isJson,
  jsonResponse,
} from "../../utils/jsonUtils";
import { parseQuery } from "../../utils/parseRequest";
import { getUser } from "../auth";

export class WFDesignerRPC {
  state: DurableObjectState;
  env: any;
  sockets: WebSocket[] = [];
  siteId: string = "";
  pendingToolResponse = new Map<
    string,
    (data: any) => void
  >();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") === "websocket") {
      const query = parseQuery(request);
      const _user = await getUser(query.token, this.env);
      if (!_user) {
        return new Response("Unauthorized", {
          status: 401,
        });
      }
      this.siteId = _user.siteId;
      const [client, server] = Object.values(
        new WebSocketPair()
      );
      server.accept();

      this.handleWebSocket(server);
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
    const url = new URL(request.url);
    if (
      request.method === "POST" &&
      url.hostname === "internal" &&
      url.pathname === "/tool"
    ) {
      const { toolName, args } = (await request.json()) as {
        toolName: string;
        args: any;
      };
      const result = await this.callTool(toolName, args);
      return jsonResponse(result);
    }

    return new Response("Invalid request", { status: 400 });
  }

  send(socket: WebSocket, type: string, data: any) {
    socket.send(
      JSON.stringify({
        type,
        data,
      })
    );
  }

  callTool(toolName: string, args: any): Promise<any> {
    return new Promise((resolve) => {
      const requestId = `${
        this.siteId
      }-${crypto.randomUUID()}`;
      this.sockets = this.sockets.filter(
        (s) => s.readyState === WebSocket.OPEN
      );
      if (this.sockets.length === 0) {
        resolve({
          error:
            "No active Designer app connection to the site, Please make sure Designer app is open and connected, or check the site id is valid, all site ids can be found using the sites_list tool.",
        });
        return;
      }
      for (const s of this.sockets) {
        this.send(s, "call-tool", {
          toolName,
          args,
          siteId: this.siteId,
          requestId,
        });
      }
      const cleanup = () => {
        clearTimeout(timerId);
        this.pendingToolResponse.delete(requestId);
      };
      const timerId = setTimeout(() => {
        cleanup();
        resolve({
          error: ERRORS.TOOL_CALL_TIMEOUT,
        });
      }, 20000); //20 seconds

      const toolResponse = (data: any) => {
        cleanup();
        resolve(data);
      };

      this.pendingToolResponse.set(requestId, toolResponse);
    });
  }

  handleWebSocket(ws: WebSocket) {
    this.sockets.push(ws);
    this.send(ws, "connection-confirmation", {
      siteId: this.siteId,
    });

    ws.addEventListener("message", (e) => {
      const message = e.data.toString();
      if (isJson(message)) {
        const { type, data } = JSON.parse(message);

        if (type === "tool-call-response") {
          const { requestId, data: responseData } =
            data as {
              requestId: string;
              data: any;
            };
          if (this.pendingToolResponse.has(requestId)) {
            this.pendingToolResponse.get(requestId)!(
              responseData
            );
            this.pendingToolResponse.delete(requestId);
          }
        }
      }
    });

    ws.addEventListener("close", () => {
      this.sockets = this.sockets.filter((s) => s !== ws);
    });
  }
}

export const serveRPC = async (
  request: Request,
  env: Env
) => {
  const query = parseQuery(request);
  if (!query.token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const _user = await getUser(query.token, env);
  if (!_user) {
    return new Response("Unauthorized", { status: 401 });
  }
  //shared rpc object per site
  const id = env.RPC_OBJECT.idFromName(_user.siteId);
  const rpc = env.RPC_OBJECT.get(id);
  if (!rpc) {
    return new Response("RPC not found", { status: 404 });
  }
  return rpc.fetch(request);
};

export const callTool = async (
  siteId: string,
  toolName: string,
  args: any,
  env: Env
) => {
  //shared rpc object per site
  const rpc = env.RPC_OBJECT.idFromName(siteId);
  if (!rpc) {
    return {
      status: false,
      error: ERRORS.DESIGNER_CONNECTION_ERROR,
    };
  }
  const rpcObject = env.RPC_OBJECT.get(rpc);
  if (!rpcObject) {
    return {
      status: false,
      error: ERRORS.DESIGNER_CONNECTION_ERROR,
    };
  }
  const result = await rpcObject.fetch(
    "https://internal/tool",
    {
      method: "POST",
      body: JSON.stringify({
        toolName,
        args,
      }),
    }
  );

  const data = await result.json();
  return data as any;
};
