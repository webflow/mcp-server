# Webflow's MCP server

A Node.js server implementing Model Context Protocol (MCP) for Webflow using the [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api). Enable AI agents to interact with Webflow APIs. Learn more about Webflow's Data API in the [developer documentation](https://developers.webflow.com/data/reference).

[![npm shield](https://img.shields.io/npm/v/webflow-mcp-server)](https://www.npmjs.com/package/webflow-mcp-server)
![Webflow](https://img.shields.io/badge/webflow-%23146EF5.svg?style=for-the-badge&logo=webflow&logoColor=white)

## Prerequisites

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [A Webflow Account](https://webflow.com/signup)

## 🚀 Remote installation

Get started by installing Webflow's remote MCP server. The remote server uses OAuth to authenticate with your Webflow sites, and a companion app that syncs your live canvas with your AI agent.

### Requirements

- Node.js 22.3.0 or higher

> Note: The MCP server currently supports Node.js 22.3.0 or higher. If you run into version issues, see the [Node.js compatibility guidance.](https://developers.webflow.com/data/v2.0.0/docs/ai-tools#nodejs-compatibility)

### Cursor

#### Add MCP server to Cursor

1. Go to `Settings → Cursor Settings → MCP & Integrations`.
2. Under MCP Tools, click `+ New MCP Server`.
3. Paste the following configuration into `.cursor/mcp.json` (or add the `webflow` part to your existing configuration):

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx mcp-remote https://mcp.webflow.com/sse"
    }
  }
}
```

> Tip: You can create a project-level `mcp.json` to avoid repeated auth prompts across multiple Cursor windows. See Cursor’s docs on [configuration locations.](https://docs.cursor.com/en/context/mcp#configuration-locations)

4. Save and close the file. Cursor will automatically open an OAuth login page where you can authorize Webflow sites to use with the MCP server.

#### Open the Webflow Designer

- Open your site in the Webflow Designer, or ask your AI agent:

```text
Give me a link to open <MY_SITE_NAME> in the Webflow Designer
```

#### Open the MCP Webflow App

1. In the Designer, open the Apps panel (press `E`).
2. Launch your published "Webflow MCP Bridge App".
3. Wait for the app to connect to the MCP server.

#### Write your first prompt

Try these in your AI chat:

```text
Analyze my last 5 blog posts and suggest 3 new topic ideas with SEO keywords
```

```text
Find older blog posts that mention similar topics and add internal links to my latest post
```

```text
Create a hero section card on my home page with a CTA button and responsive design
```

### Claude desktop

#### Add MCP server to Claude desktop

1. Enable developer mode: `Help → Troubleshooting → Enable Developer Mode`.
2. Open developer settings: `File → Settings → Developer`.
3. Click `Get Started` or edit the configuration to open `claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.webflow.com/sse"]
    }
  }
}
```

4. Save and restart Claude Desktop (`Cmd/Ctrl + R`). An OAuth login page will open to authorize sites.

#### Open the Webflow Designer

- Open your site in the Webflow Designer, or ask your AI agent:

```text
Give me a link to open <MY_SITE_NAME> in the Webflow Designer
```

#### Open the MCP Webflow App

1. In the Designer, open the Apps panel (press `E`).
2. Launch your published "Webflow MCP Bridge App".
3. Wait for the app to connect to the MCP server.

#### Write your first prompt

```text
Analyze my last 5 blog posts and suggest 3 new topic ideas with SEO keywords
```

```text
Find older blog posts that mention similar topics and add internal links to my latest post
```

```text
Create a hero section card on my home page with a CTA button and responsive design
```

### Reset your OAuth Token

To reset your OAuth token, run the following command in your terminal.

```bash
rm -rf ~/.mcp-auth
```

### Node.js compatibility

Please see the Node.js [compatibility guidance on Webflow's developer docs.](https://developers.webflow.com/data/v2.0.0/docs/ai-tools#nodejs-compatibility)

---

## Local Installation

You can also configure the MCP server to run locally. This requires:

- Creating and registering your own MCP Bridge App in a Webflow workspace with Admin permissions
- Configuring your AI client to start the local MCP server with a Webflow API token

### 1. Create and publish the MCP bridge app

Before connecting the local MCP server to your AI client, create and publish the Webflow MCP Bridge App in your workspace.

1. Register a Webflow App in your Workspace. Follow the [Register an App](https://developers.webflow.com/data/v2.0.0/docs/register-an-app) guidance for more details.
2. Clone the MCP Bridge App code:
   ```bash
   git clone https://github.com/virat21/webflow-mcp-bridge-app
   cd webflow-mcp-bridge-app
   ```
3. Configure the app with your App credentials:
   - Set your Client ID and Client Secret in an `.env` file for the App you registered.
   - See the app repo’s README for exact variables and build steps.
4. Build and publish the Designer Extension to your workspace:
   - Build per the repo instructions.
   - Publish the App to your workspace via the Webflow Dashboard → Workspace settings → Apps & Integrations → Develop→ your App → “Publish Extension Version” and upload your `bundle.zip` file.

Once published to your workspace, open your MCP Bridge App in a site on your workspace from the Designer’s Apps panel.

### 2. Configure your AI client

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "webflow-mcp-server@latest"],
      "env": {
        "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_TOKEN>"
      }
    }
  }
}
```

#### Claude desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "webflow-mcp-server@latest"],
      "env": {
        "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_TOKEN>"
      }
    }
  }
}
```

### 3. Use the MCP server with the Webflow Designer

- Open your site in the Webflow Designer.
- Open the Apps panel (press `E`) and launch your published “Webflow MCP Bridge App”.
- Wait for the app to connect to the MCP server, then use tools from your AI client.
- If the Bridge App prompts for a local connection URL, call the `get_designer_app_connection_info` tool from your AI client and paste the returned `http://localhost:<port>` URL.

### Optional: Run locally via shell

```bash
WEBFLOW_TOKEN="<YOUR_WEBFLOW_TOKEN>" npx -y webflow-mcp-server@latest
```

```powershell
# PowerShell
$env:WEBFLOW_TOKEN="<YOUR_WEBFLOW_TOKEN>"
npx -y webflow-mcp-server@latest
```

---

## Local Installation

You can also configure the MCP server to run locally. This requires:

- Creating and registering your own MCP Bridge App in a Webflow workspace with Admin permissions
- Configuring your AI client to start the local MCP server with a Webflow API token

### 1. Create and publish the MCP bridge app

Before connecting the local MCP server to your AI client, create and publish the Webflow MCP Bridge App in your workspace.

1. Register a Webflow App in your Workspace. Follow the [Register an App](https://developers.webflow.com/data/v2.0.0/docs/register-an-app) guidance for more details.
2. Clone the MCP Bridge App code:
   ```bash
   git clone https://github.com/virat21/webflow-mcp-bridge-app
   cd webflow-mcp-bridge-app
   ```
3. Configure the app with your App credentials:
   - Set your Client ID and Client Secret in an `.env` file for the App you registered.
   - See the app repo’s README for exact variables and build steps.
4. Build and publish the Designer Extension to your workspace:
   - Build per the repo instructions.
   - Publish the App to your workspace via the Webflow Dashboard → Workspace settings → Apps & Integrations → Develop→ your App → “Publish Extension Version” and upload your `bundle.zip` file.

Once published to your workspace, open your MCP Bridge App in a site on your workspace from the Designer’s Apps panel.

### 2. Configure your AI client

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "webflow-mcp-server@latest"],
      "env": {
        "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_TOKEN>"
      }
    }
  }
}
```

#### Claude desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "webflow-mcp-server@latest"],
      "env": {
        "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_TOKEN>"
      }
    }
  }
}
```

### 3. Use the MCP server with the Webflow Designer

- Open your site in the Webflow Designer.
- Open the Apps panel (press `E`) and launch your published “Webflow MCP Bridge App”.
- Wait for the app to connect to the MCP server, then use tools from your AI client.
- If the Bridge App prompts for a local connection URL, call the `get_designer_app_connection_info` tool from your AI client and paste the returned `http://localhost:<port>` URL.

### Optional: Run locally via shell

```bash
WEBFLOW_TOKEN="<YOUR_WEBFLOW_TOKEN>" npx -y webflow-mcp-server@latest
```

```powershell
# PowerShell
$env:WEBFLOW_TOKEN="<YOUR_WEBFLOW_TOKEN>"
npx -y webflow-mcp-server@latest
```

### Reset your OAuth Token

To reset your OAuth token, run the following command in your terminal.

```bash
rm -rf ~/.mcp-auth
```

### Node.js compatibility

Please see the Node.js [compatibility guidance on Webflow's developer docs.](https://developers.webflow.com/data/v2.0.0/docs/ai-tools#nodejs-compatibility)

## ❓ Troubleshooting

If you are having issues starting the server in your MCP client e.g. Cursor or Claude Desktop, please try the following.

### Make sure you have a valid Webflow API token

1. Go to [Webflow's API Playground](https://developers.webflow.com/data/reference/token/authorized-by), log in and generate a token, then copy the token from the Request Generator
2. Replace `YOUR_WEBFLOW_TOKEN` in your MCP client configuration with the token you copied
3. Save and **restart** your MCP client

### Make sure you have the Node and NPM installed

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Run the following commands to confirm you have Node and NPM installed:

```shell
node -v
npm -v
```

### Clear your NPM cache

Sometimes clearing your [NPM cache](https://docs.npmjs.com/cli/v8/commands/npm-cache) can resolve issues with `npx`.

```shell
npm cache clean --force
```

### Fix NPM global package permissions

If `npm -v` doesn't work for you but `sudo npm -v` does, you may need to fix NPM global package permissions. See the official [NPM docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) for more information.

Note: if you are making changes to your shell configuration, you may need to restart your shell for changes to take effect.

## 🛠️ Available tools

See the `./tools` directory for a list of available tools

# 🗣️ Prompts & resources

This implementation **doesn't** include `prompts` or `resources` from the MCP specification. However, this may change in the future when there is broader support across popular MCP clients.

## 📄 Webflow developer resources

- [Webflow API Documentation](https://developers.webflow.com/data/reference)
- [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api)

## ⚠️ Known limitations

### Static page content updates

The `pages_update_static_content` endpoint currently only supports updates to localized static pages in secondary locales. Updates to static content in the default locale aren't supported and will result in errors.
