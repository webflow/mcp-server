import { OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { signState } from "../../jwt";
import { EnvWithOAuthProvider } from "../../../types/env";

export const renderAuthorizePage = async (
  request: Request,
  env: EnvWithOAuthProvider,
  ctx: ExecutionContext
) => {
  const state = await env.OAUTH_PROVIDER.parseAuthRequest(
    request
  );
  const client = await env.OAUTH_PROVIDER.lookupClient(
    state.clientId
  );

  const clientName = client?.clientName || "MCP CLI Proxy";
  const clientWebsite =
    client?.clientUri ||
    "https://github.com/modelcontextprotocol/mcp-cli";

  const signedState = signState(
    {
      oauthReqInfo: state,
    },
    env
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MCP CLI Proxy | Authorization Request</title>
        <style>
          /* Modern, responsive styling with system fonts */
          :root {
            --primary-color: #0070f3;
            --error-color: #f44336;
            --warning-color: #ff9800;
            --border-color: #e5e7eb;
            --text-color: #333;
            --background-color: #fff;
            --card-shadow: 0 8px 36px 8px rgba(0, 0, 0, 0.1);
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                         Helvetica, Arial, sans-serif, "Apple Color Emoji", 
                         "Segoe UI Emoji", "Segoe UI Symbol";
            line-height: 1.6;
            color: var(--text-color);
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 2rem auto;
            padding: 1rem;
          }
          
          .precard {
            padding: 2rem;
            text-align: center;
          }
          
          .card {
            background-color: var(--background-color);
            border-radius: 8px;
            box-shadow: var(--card-shadow);
            padding: 2rem;
          }
          
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }
          
          .logo {
            width: 48px;
            height: 48px;
            margin-right: 1rem;
            border-radius: 8px;
            object-fit: contain;
          }
          
          .title {
            margin: 0;
            font-size: 1.3rem;
            font-weight: 400;
          }
          
          .alert {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 400;
            margin: 1rem 0;
            text-align: center;
          }
          
          .description {
            color: #555;
          }
          
          .client-info {
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 1rem 1rem 0.5rem;
            margin-bottom: 1.5rem;
          }
          
          .client-name {
            font-weight: 600;
            font-size: 1.2rem;
            margin: 0 0 0.5rem 0;
          }
          
          .client-detail {
            display: flex;
            margin-bottom: 0.5rem;
            align-items: baseline;
          }
          
          .detail-label {
            font-weight: 500;
            min-width: 120px;
          }
          
          .detail-value {
            font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            word-break: break-all;
          }
          
          .detail-value a {
            color: inherit;
            text-decoration: underline;
          }
          
          .detail-value.small {
            font-size: 0.8em;
          }
          
          .external-link-icon {
            font-size: 0.75em;
            margin-left: 0.25rem;
            vertical-align: super;
          }
          
          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
          }
          
          .button {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            font-size: 1rem;
          }
          
          .button-primary {
            background-color: var(--primary-color);
            color: white;
          }
          
          .button-secondary {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-color);
          }
          
          /* Responsive adjustments */
          @media (max-width: 640px) {
            .container {
              margin: 1rem auto;
              padding: 0.5rem;
            }
            
            .card {
              padding: 1.5rem;
            }
            
            .client-detail {
              flex-direction: column;
            }
            
            .detail-label {
              min-width: unset;
              margin-bottom: 0.25rem;
            }
            
            .actions {
              flex-direction: column;
            }
            
            .button {
              width: 100%;
            }
          }

          /* Tool Selection Styles */
          .tool-selection {
            margin: 2rem 0;
          }
          
          .tool-selection p {
            margin: 0 0 1rem;
            font-weight: 500;
            color: var(--text-color);
          }
          
          .tool-selection-group {
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }
          
          .tool-selection-group > p {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0;
            color: var(--text-color);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
          }

          .tool-selection-group > p::after {
            content: '▼';
            font-size: 0.8em;
            transition: transform 0.3s ease;
          }

          .tool-selection-group.collapsed > p::after {
            transform: rotate(-90deg);
          }

          .tool-selection-group-content {
            margin-top: 1rem;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
          }

          .tool-selection-group.collapsed .tool-selection-group-content {
            max-height: 0;
            margin-top: 0;
          }
          
          .tool-selection-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 1rem;
            padding: 0.75rem;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          
          
          .tool-selection-item:last-child {
            margin-bottom: 0;
          }
          
          .tool-selection-item input[type="checkbox"] {
            margin: 0.25rem 0 0 0;
            width: 16px;
            height: 16px;
            border: 2px solid var(--border-color);
            border-radius: 3px;
            cursor: pointer;
            flex-shrink: 0;
          }
          
          .tool-selection-item .checkbox-content {
            display: flex;
            flex-direction: column;
            margin-left: 0.75rem;
          }
          
          .tool-selection-item input[type="checkbox"]:checked {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
          }
          
          .tool-selection-item label {
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 0.25rem;
          }
          
          .tool-selection-item p {
            margin: 0;
            font-size: 0.9rem;
            color: #666;
          }
          
          .tool-selection-note {
            background-color: #f8fafc;
            border-left: 3px solid var(--primary-color);
            padding: 0.75rem 1rem;
            margin-top: 1rem;
            border-radius: 0 4px 4px 0;
          }
          
          .tool-selection-note p {
            margin: 0;
            font-size: 0.85rem;
            color: #64748b;
            font-style: italic;
          }

           .tool-selection-note.warning {
            background-color: #f8fafc;
            border-left: 3px solid var(--warning-color);
          }
          
          @media (max-width: 640px) {
            .tool-selection-item {
              flex-direction: column;
            }
            
            .tool-selection-item label {
              margin: 0.5rem 0;
            }
          }
        </style>
       <script>
          function toggleGroup(element) {
            const group = element.parentElement;
            const content = group.querySelector('.tool-selection-group-content');
            
            if (group.classList.contains('collapsed')) {
              group.classList.remove('collapsed');
              content.style.maxHeight = content.scrollHeight + 'px';
            } else {
              group.classList.add('collapsed');
              content.style.maxHeight = null;
            }
          }

          function saveToolSelections() {
            const checkboxes = document.querySelectorAll('.tool-selection-item input[type="checkbox"]');
            const selections = {};
            
            checkboxes.forEach(checkbox => {
              selections[checkbox.id] = checkbox.checked;
            });
            
            localStorage.setItem('webflowMcpToolSelections', JSON.stringify(selections));
          }

          function loadToolSelections() {
            const savedSelections = localStorage.getItem('webflowMcpToolSelections');
            if (savedSelections) {
              const selections = JSON.parse(savedSelections);
              Object.keys(selections).forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                  checkbox.checked = selections[id];
                }
              });
            }
          }

          // Initialize all groups as collapsed and handle checkbox changes
          document.addEventListener('DOMContentLoaded', function() {
            const groups = document.querySelectorAll('.tool-selection-group');
            groups.forEach(group => {
              const content = group.querySelector('.tool-selection-group-content');
              content.style.maxHeight = null;
            });

            // Load saved selections
            loadToolSelections();

            // Add change event listeners to all checkboxes
            const checkboxes = document.querySelectorAll('.tool-selection-item input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              checkbox.addEventListener('change', saveToolSelections);
            });
          });

          // Save selections before form submission
          document.querySelector('form').addEventListener('submit', function() {
            saveToolSelections();
          });
        </script>
      </head>
      <body>
        <div class="container">
          <div class="precard">
            <div class="header">
              <img src="https://dhygzobemt712.cloudfront.net/Logo/Social_Square_Blue.png" alt="Webflow MCP Server Logo" class="logo">
            <h1 class="title"><strong>Webflow MCP Server</strong></h1>
            </div>
            
            <p class="description">On the next screen, you’ll be asked to grant the Webflow MCP server access to specific sites or workspaces. If you didn’t initiate this request, please click “Cancel” or simply close this tab.</p>
          </div>
            
          <div class="card">
            
            <h2 class="alert"><strong>${clientName}</strong> is requesting access</h1>
            
            <div class="client-info">
              <div class="client-detail">
                <div class="detail-label">Name:</div>
                <div class="detail-value">
                  ${clientName}
                </div>
              </div>
              
              
                <div class="client-detail">
                  <div class="detail-label">Website:</div>
                  <div class="detail-value small">
                    <a href="${clientWebsite}" target="_blank" rel="noopener noreferrer">
                      ${clientWebsite}
                    </a>
                  </div>
                </div>
              
              
              
              
              
              
              
                <div class="client-detail">
                  <div class="detail-label">Redirect URIs:</div>
                  <div class="detail-value small">
                    <div>${state.redirectUri}</div>
                  </div>
                </div>
              
              
              
            </div>
            
            <p>This MCP Client is requesting to be authorized on Webflow MCP Server. If you approve, you will be redirected to complete authentication.</p>
            
            <form method="post" action="/oauth/authorize">
              <input type="hidden" name="state" value="${signedState}">
              <div class="tool-selection">
                <p>Choose the tools you'd like to enable for your workflow:</p>
                <div class="tool-selection-group collapsed">
                  <p onclick="toggleGroup(this)">Data API Tools</p>
                  <div class="tool-selection-group-content">
                    <div class="tool-selection-item">
                      <input type="checkbox" id="cms" name="cms" checked>
                      <div class="checkbox-content">
                        <label for="cms">CMS</label>
                        <p>Manage CMS collections, items and create CMS fields. (13 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-item">
                      <input type="checkbox" id="custom-code" name="custom-code" checked>
                      <div class="checkbox-content">
                        <label for="custom-code">Custom Code</label>
                        <p>Manage custom code scripts. (4 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-note">
                      <p>Note : 8 Data API Tools are additional mandatory tools for Webflow MCP to work.</p>
                    </div>
                  </div>
                </div>
                <div class="tool-selection-group collapsed">
                  <p onclick="toggleGroup(this)">Designer API Tools</p>
                  <div class="tool-selection-group-content">
                    <div class="tool-selection-item">
                      <input type="checkbox" id="element-manipulation" name="element-manipulation" checked>
                      <div class="checkbox-content">
                        <label for="element-manipulation">Element Manipulation</label>
                        <p>Manage elements on the page. (15 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-item">
                      <input type="checkbox" id="style-management" name="style-management" checked>
                      <div class="checkbox-content">
                        <label for="style-management">Style Management</label>
                        <p>Manage styles on the Webflow site. (3 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-item">
                      <input type="checkbox" id="asset-management" name="asset-management">
                      <div class="checkbox-content">
                        <label for="asset-management">Asset Management</label>
                        <p>Manage assets on the Webflow site. (9 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-item">
                      <input type="checkbox" id="component-management" name="component-management">
                      <div class="checkbox-content">
                        <label for="component-management">Component Management</label>
                        <p>Manage components on the Webflow site. (7 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-item">
                      <input type="checkbox" id="variable-management" name="variable-management">
                      <div class="checkbox-content">
                        <label for="variable-management">Variable Management</label>
                        <p>Manage variables on the Webflow site. (11 Tools)</p>
                      </div>
                    </div>
                    <div class="tool-selection-note">
                      <p>Note : 5 Designer API Tools are additional mandatory tools for Webflow MCP to work.</p>
                    </div>
                  </div>
                </div>
                <div class="tool-selection-group collapsed">
                  <p onclick="toggleGroup(this)">Smart Optimization Tools</p>
                  <div class="tool-selection-group-content">
                    <div class="tool-selection-item">
                      <input type="checkbox" id="memory" name="memory">
                      <div class="checkbox-content">
                        <label for="memory">Memory</label>
                        <p>Enable intelligent context tracking to remember your preferences and design decisions. (9 Tools)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
               <div class="tool-selection-note warning">
                <p>Note : Too many tools can degrade performance. We recommend selecting only the tools you need. some models may not see more than 40 tools.</p>
              </div>
              <div class="actions">
                <button type="button" class="button button-secondary" onclick="window.history.back()">Cancel</button>
                <button type="submit" class="button button-primary">Approve</button>
              </div>
            </form>
          </div>
        </div>
      </body>
    </html>
  `;
};
