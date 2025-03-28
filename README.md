# webflow-mcp-server

Node.js server implementing Model Context Protocol (MCP) for Webflow using the [Webflow JavaScript SDK](https://github.com/webflow/js-webflow-api).

## Prerequisites

- Node.js
- npm
- A Webflow account
- A Webflow API token

## Installation Guide

### 1. Obtain a Webflow API token

- Log in to your Webflow account
- Navigate to your site's settings > **Apps & Integrations**
- Scroll to the **API access** section and click **Generate API token**
- Pick a token name and set the token permissions
  - For full access, select **read and write permissions for CMS, Pages, and Sites**
- Click **Generate token**
- Copy the generated token

_Additional documentation can be found here: https://help.webflow.com/hc/en-us/articles/33961356296723-Intro-to-Webflow-s-APIs_

### 2. Build the server

```shell
cd /PATH/TO/PROJECT
npm install
npm run build
```

### 3. Set up your MCP client

Add the following to the configuration file for your MCP client e.g. **Cursor, Windsurf, or Claude Desktop**:

```
{
  "mcpServers": {
    "webflow": {
      "command": "node",
      "args": [
        "/PATH/TO/PROJECT/dist/index.js"
      ],
      "env": {
        "WEBFLOW_TOKEN": "..."
      }
    }
  }
}
```

To find the configuration file in **Cursor**:

1. Open **Cursor Settings** → **MCP**
2. Click `+ Add New MCP Server`

To find the configuration file in **Windsurf**:

1. Open **Windsurf Settings** → **General** → **MCP Servers**
2. Click `+ Add MCP Server`

## Development

If you want to run the server in development mode, you can install dependencies and run the server using the following command:

```shell
cd /PATH/TO/PROJECT
npm install
npm run dev
```

Make sure to add your Webflow API token to the `.env` file:

```
# /PATH/TO/PROJECT/.env
WEBFLOW_TOKEN=...
```

## API

The following tools are made available to MCP clients:

### Sites

```
sites-list: client.sites.list(...)
sites-get: client.sites.get(...)
sites-publish: client.sites.publish(...)
```

### Pages

```
pages-list: client.pages.list(...)
pages-get-metadata: client.pages.getMetadata(...)
pages-update-page-settings: client.pages.updatePageSettings(...)
pages-get-content: client.pages.getContent(...)
pages-update-static-content: client.pages.updateStaticContent(...)
```

### CMS

```
collections-list: client.collections.list(...)
collections-get: client.collections.get(...)
collections-items-create-item-live: client.collections.items.createItemLive(...)
collections-items-update-items-live: client.collections.items.updateItemsLive(...)
```

In this MCP server implementation we have chosen to implement only [tools](https://modelcontextprotocol.io/docs/concepts/tools), not [prompts](https://modelcontextprotocol.io/docs/concepts/prompts) or [resources](https://modelcontextprotocol.io/docs/concepts/resources). Per the MCP docs:

> Tools are designed to be **model-controlled**, meaning that tools are exposed from servers to clients with the intention of the AI model being able to automatically invoke them (with a human in the loop to grant approval).

We currently believe giving the model maximum access to functionality is the right approach. This view is subject to change.
