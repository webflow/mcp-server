# Webflow MCP

A Node.js server implementing Model Context Protocol (MCP) for Webflow using the [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api). Enable AI Clients to interact with the [Webflow APIs](https://developers.webflow.com/data/reference) through the Model Context Protocol (MCP). Learn more about Webflow's APIs in the [developer documentation](https://developers.webflow.com/data/reference).

[![npm shield](https://img.shields.io/npm/v/webflow-mcp-server)](https://www.npmjs.com/package/webflow-mcp-server)
[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com/?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Fwebflow%2Fmcp-server)

## ℹ Prerequisites

- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [A Webflow Account](https://webflow.com/signup)

## ▶️ Quick start

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
         "args": ["-y", "webflow-mcp-server@0.3.0"],
         "env": {
           "WEBFLOW_TOKEN": "YOUR_API_TOKEN"
         }
       }
     }
   }
   ```

   **For Cursor:**

   1. Go to Settings → Cursor Settings → MCP
   2. Click `+ Add New Global MCP Server`
   3. Paste configuration
   4. Replace `YOUR_API_TOKEN` with the token you copied earlier
   5. Save and **restart** Cursor

   **For Claude Desktop:**

   1. Open Settings → Developer
   2. Click `Edit Config`
   3. Open `claude_desktop_config.json` in a code editor and paste configuration
   4. Replace `YOUR_API_TOKEN` with the token you copied earlier
   5. Save and **restart** Claude

## ❓ Troubleshooting

If you are having issues starting the server in your MCP client e.g. Cursor or Claude Desktop, please try the following.

### Ensure you have a valid Webflow API token

1. Go to [Webflow's API Playground](https://developers.webflow.com/data/reference/token/authorized-by), log in and generate a token, then copy the token from the Request Generator
2. Replace `YOUR_API_TOKEN` in your MCP client configuration with the token you copied
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
```

# 🗣️ Prompts & Resources

This implementation **does not** include prompts and resources. However, this may change in the future.

# 🚧 Development mode

If you want to run the server in development mode, you can install dependencies and run the server using the following command:

1. Clone and install:

   ```shell
   git clone git@github.com:webflow/mcp-server.git
   cd mcp-server
   npm install
   ```

2. Add your token:

   ```shell
   # .env
   WEBFLOW_TOKEN=your_token_here
   ```

3. Start development server:
   ```shell
   npm run dev
   ```

## 📄 Webflow Developer resources

- [Webflow API Documentation](https://developers.webflow.com/data/reference)
- [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api)
