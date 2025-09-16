# Webflow's Official MCP Server

A Node.js server implementing Model Context Protocol (MCP) for Webflow using the [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api). Enable AI agents to interact with Webflow APIs. Learn more about Webflow's Data API in the [developer documentation](https://developers.webflow.com/data/reference).

[![npm shield](https://img.shields.io/npm/v/webflow-mcp-server)](https://www.npmjs.com/package/webflow-mcp-server)
[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com/?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Fwebflow%2Fmcp-server)

## ℹ Prerequisites

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [A Webflow Account](https://webflow.com/signup)

## 🚀 Getting started (OAuth remote MCP server)

Get started by installing Webflow's remote MCP server, which uses OAuth to authenticate with your Webflow sites, and a companion app that syncs your live canvas with your AI agent.

For local installation, see the [NPM package documentation](https://www.npmjs.com/package/webflow-mcp-server).

### Requirements

- Node.js 22.3.0 or higher

> Note: The MCP server currently supports Node.js 22.3.0 or higher. If you run into version issues, see Node.js compatibility below.

### Cursor

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

> Tip: Prefer a project-level `mcp.json` to avoid repeated auth prompts across multiple Cursor windows. See Cursor’s docs on configuration locations.

4. Save and close the file. Cursor will automatically open an OAuth login page where you can authorize the Webflow sites and install the companion app.

#### Open the Webflow Designer

- Open your site in the Webflow Designer.
- Or ask your AI agent:

```text
Give me a link to open <MY_SITE_NAME> in the Webflow Designer
```

#### Open the MCP Webflow App

1. In the Designer, open the Apps panel (press `E`).
2. Launch "Webflow MCP Bridge App" (installed during OAuth).
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

### Claude Desktop

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

4. Save and restart Claude Desktop (`Cmd/Ctrl + R`). An OAuth login page will open to authorize sites and install the companion app.

#### Open the Webflow Designer (Claude Desktop)

- Open your site in the Webflow Designer.
- Or ask your AI agent:

```text
Give me a link to open <MY_SITE_NAME> in the Webflow Designer
```

#### Open the MCP Webflow App (Claude Desktop)

1. In the Designer, open the Apps panel (press `E`).
2. Launch "Webflow MCP Bridge App" (installed during OAuth).
3. Wait for the app to connect to the MCP server.

#### Write your first prompt (Claude Desktop)

```text
Analyze my last 5 blog posts and suggest 3 new topic ideas with SEO keywords
```

```text
Find older blog posts that mention similar topics and add internal links to my latest post
```

```text
Create a hero section card on my home page with a CTA button and responsive design
```

### Windsurf

1. Navigate to `Windsurf → Settings → Windsurf Settings`.
2. Go to `Cascade → MCP Servers → Manage MCPs`.
3. Click "View raw configuration" and add:

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

4. Save. Use the settings page "Refresh" button. A browser will open the OAuth flow to authorize sites (this also installs the companion app).

#### Open the Webflow Designer (Windsurf)

- Open your site in the Webflow Designer.
- Or ask your AI agent:

```text
Give me a link to open <MY_SITE_NAME> in the Webflow Designer
```

#### Open the MCP Webflow App (Windsurf)

1. In the Designer, open the Apps panel (press `E`).
2. Launch "Webflow MCP Bridge App" (installed during OAuth).
3. Wait for the app to connect to the MCP server.

#### Write your first prompt (Windsurf)

```text
Analyze my last 5 blog posts and suggest 3 new topic ideas with SEO keywords
```

```text
Find older blog posts that mention similar topics and add internal links to my latest post
```

```text
Create a hero section card on my home page with a CTA button and responsive design
```

### Reset your OAuth token

If you need to reset your OAuth token, run:

```bash
rm -rf ~/.mcp-auth
```

### Node.js compatibility

If you encounter issues with Node.js, try one of the following:

#### Use Node.js 22.3.0 with nvm

1. Install nvm:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Restart your terminal or source your shell configuration file, e.g.:

   ```bash
   source ~/.bashrc
   ```

3. Install and set default:

   ```bash
   nvm install 22.3.0
   nvm use 22.3.0
   nvm alias default 22.3.0
   ```

4. Clear `npx` cache (optional):

   ```bash
   rm -rf ~/.npm/_npx
   ```

5. Verify installation:

   ```bash
   node --version
   npm --version
   ```

#### Use Node Version Switcher (NVS)

1. Install Node Version Switcher (NVS) (see the official repository for OS-specific steps):

   ```bash
   git clone https://github.com/jasongin/nvs ~/.nvs && ~/.nvs/nvs.sh install
   ```

2. Add Node.js 22.3.0 and use it:

   ```bash
   nvs add 22.3.0
   nvs use 22.3.0
   ```

3. (Optional) Install `mcp-remote` globally when on 22.3.0:

   ```bash
   npm install -g mcp-remote
   ```

4. If your AI client needs explicit paths, determine them:

   ```bash
   nvs which 22.3.0
   which mcp-remote
   ```

## ▶️ Quick start (hosted on Cloudflare workers)

**For Cursor:**

1. Go to `Settings` → `Cursor Settings` → `MCP`
2. Click `+ Add New Global MCP Server`
3. Paste the following configuration (or add the `webflow` part to your existing configuration)

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx mcp-remote https://mcp.webflow.com/sse"
    }
  }
}
```

4. Save, Cursor will automatically open a new browser window showing an OAuth login page to authorize the Webflow sites you want the MCP server to have access to.

**For Claude Desktop:**

1. Open `Settings` → `Developer`
2. Click `Edit Config`
3. Open `claude_desktop_config.json` in a code editor and paste the following configuration (or add the `webflow` part to your existing configuration)

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

4. Save the file and restart Claude Desktop (command/ctrl + R). When Claude restarts, it will automatically open a new browser window showing an OAuth login page to authorize the Webflow sites you want the MCP server to have access to.

**For Windsurf:**

1. Navigate to `Windsurf - Settings` → `Advanced Settings`
2. Scroll down to the `Cascade` section → `Add Server` → `Add custom server +`
3. Paste the following configuration (or add the `webflow` part to your existing configuration)

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

4. Click `Save`, Windsurf will automatically open a new browser window showing an OAuth login page to authorize the Webflow sites you want the MCP server to have access to.

**For VS Code:**

1. Open `settings.json`
2. Paste the following configuration (or add the `webflow` part to your existing configuration)

```json
{
  "mcp": {
    "servers": {
      "webflow": {
        "command": "npx",
        "args": ["mcp-remote", "https://mcp.webflow.com/sse"]
      }
    }
  }
}
```

4. `Save` the file. You should see a `start` button appear over the "webflow" key which you can click to open and run the auth flow. Alternatively, restart VS Code and the auth flow should start automatically.

**Important note**

All these methods rely on the `mcp-remote` [npm package](https://www.npmjs.com/package/mcp-remote) which is still considered experimental as of April 30, 2025.
If at any point you have issues, and want to reset your OAuth tokens, you can run the following command before restarting your MCP client:

```shell
rm -rf ~/.mcp-auth
```

## ▶️ Quick start (local installation)

1. **Get your Webflow API token**

- Go to [Webflow's API Playground](https://developers.webflow.com/data/reference/token/authorized-by)
- Log in and generate a token
- Copy the token from the Request Generator
  ![Get API Token](https://prod.ferndocs.com/_next/image?url=https%3A%2F%2Ffiles.buildwithfern.com%2Fwebflow-preview-6a549203-c0da-4038-8adf-1dbed286cb83.docs.buildwithfern.com%2F2025-03-28T17%3A56%3A04.435Z%2Fassets%2Fimages%2Fapi-key-playground.png&w=3840&q=75)

2. **Add to your AI editor**

```json
{
  "mcpServers": {
    "webflow": {
      "command": "npx",
      "args": ["-y", "webflow-mcp-server@0.6.0"],
      "env": {
        "WEBFLOW_TOKEN": "<YOUR_WEBFLOW_TOKEN>"
      }
    }
  }
}
```

**For Cursor:**

1. Go to Settings → Cursor Settings → MCP
2. Click `+ Add New Global MCP Server`
3. Paste configuration
4. Replace `YOUR_WEBFLOW_TOKEN` with the token you copied earlier
5. Save and **restart** Cursor

**For Claude Desktop:**

1. Open Settings → Developer
2. Click `Edit Config`
3. Open `claude_desktop_config.json` in a code editor and paste configuration
4. Replace `YOUR_WEBFLOW_TOKEN` with the token you copied earlier 5. Save and **restart** Claude

## ❓ Troubleshooting

If you are having issues starting the server in your MCP client e.g. Cursor or Claude Desktop, please try the following.

### Ensure you have a valid Webflow API token

1. Go to [Webflow's API Playground](https://developers.webflow.com/data/reference/token/authorized-by), log in and generate a token, then copy the token from the Request Generator
2. Replace `YOUR_WEBFLOW_TOKEN` in your MCP client configuration with the token you copied
3. Save and **restart** your MCP client

### Ensure you have the Node and NPM installed

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

### Sites

```
sites - list; // List all sites
sites - get; // Get site details
sites - publish; // Publish site changes
```

### Pages

```
pages - list; // List all pages
pages - get - metadata; // Get page metadata
pages - update - page - settings; // Update page settings
pages - get - content; // Get page content
pages - update - static - content; // Update page content
```

### Components

```
components - list // List all components in a site
components - get - content // Get component content (text, images, nested components)
components - update - content // Update component content for localization
components - get - properties // Get component properties (default values)
components - update - properties // Update component properties for localization
```

### CMS

```
collections - list; // List collections
collections - get; // Get collection details
collections - create; // Create a collection
collection - fields - create - static; // Create a static field
collection - fields - create - option; // Create an option field
collection - fields - create - reference; // Create a reference field
collection - fields - update; // Update a custom field
collections - items - create - item - live; // Create items
collections - items - update - items - live; // Update items
collections - items - list - items; // List collection items
collections - items - create - item; // Create collection items (staged)
collections - items - update - items; // Update collection items (staged)
collections - items - publish - items; // Publish collection items
```

### Custom Code

```
custom code - add - inline - site - script // Register an inline script for a site
custom code - get - registered - site - script - list // List all scripts registered to a site
custom code - get - applied - site - script - list //Get all scripts applied to a site
custom code - delete site custom code // Remove scripts from a site
```

### Components

```
components - list; // List all components for a site
components - content - get; // Get static content from a component definition
components - content - update; // Update content within a component definition for secondary locales
components - properties - get; // Get the default property values of a component definition
components - properties - update; // Update the default property values of a component definition for secondary locales
```

### Ask Webflow AI

```
ask - webflow - ai; // Search Webflow Docs using AI search
```

# 🗣️ Prompts & Resources

This implementation **doesn't** include `prompts` or `resources` from the MCP specification. However, this may change in the future when there is broader support across popular MCP clients.

# 🚧 Development mode

If you want to run the server in development mode, you can install dependencies and run the server using the following command:

1. Clone and install:

```shell
git clone git@github.com:webflow/mcp-server.git
cd mcp-server
npm install
```

2. Add your token to a `.env` file at the root of the project:

```shell
# .env
WEBFLOW_TOKEN=<YOUR_WEBFLOW_TOKEN>
```

3. Start development server:

```shell
npm start
```

## 📄 Webflow Developer resources

- [Webflow API Documentation](https://developers.webflow.com/data/reference)
- [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api)

## ⚠️ Known Limitations

### Static Page Content Updates

The `pages_update_static_content` endpoint currently only supports updates to localized static pages in secondary locales. Updates to static content in the default locale aren't supported and will result in errors.
