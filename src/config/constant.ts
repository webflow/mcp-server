export const JWT_EXPIRATION_TIME = "36h";
export const DE_AUTH_STATE = "webflow_designer";
export const ERRORS = {
  DESIGNER_CONNECTION_ERROR:
    "Unable to connect to Webflow Designer, Please make sure Webflow Designer MCP app is running on Webflow Designer",
  TOOL_CALL_TIMEOUT:
    "Tool call timed out, Please check Webflow Designer MCP app is running on Webflow Designer or restart the Webflow Designer App",
};
const packageJson = require("../../package.json") as any;
// Common request options, including User-Agent header
export const requestOptions = {
  headers: {
    "User-Agent": `Webflow MCP Server/${packageJson.version}`,
  },
};
