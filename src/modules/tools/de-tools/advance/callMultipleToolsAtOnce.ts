import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../mcp/";
import { z } from "zod";
import { createStyle } from "../styles/createStyle.js";
import { updateStyleById } from "../styles/updateStyleById.js";
import { updateVariableValue } from "../variables/updateVariableValue.js";
import { createVariableMode } from "../variables/createVariableMode.js";
import { createVariable } from "../variables/createVariable.js";
import { createImageElement } from "../elements/createImageElement.js";
import { updateSelectedImageElementAsset } from "../elements/updateSelectedImageElementAsset.js";
import { updateSelectedImageElementAltText } from "../elements/updateSelectedImageElementAltText.js";
import { createLinkElement } from "../elements/createLinkElement.js";
import { setAttributesToElement } from "../elements/setAttributesToElement.js";
import { removeAttributesFromElement } from "../elements/removeAttributesFromElement.js";
import { createDomElement } from "../elements/createDomElement.js";
import { createStandardElements } from "../elements/createStandardElements.js";
import { createTextElement } from "../elements/createTextElement.js";
import { selectElementOnCurrentActivePage } from "../elements/selectElementOnCurrentActivePage.js";
import { setTextOnSelectedElement } from "../elements/setTextOnSelectedElement.js";
import { setStylesOnSelectedElement } from "../elements/setStylesOnSelectedElement.js";
import { getSelectedElement } from "../elements/getSelectedElement.js";
import { renameComponentName } from "../components/renameComponentName.js";
import { createComponentInstance } from "../components/createComponentInstance.js";
import { getAllAssetsOnSite } from "../assets/getAllAssetsOnSite.js";
import { getAssetById } from "../assets/getAssetById.js";
import { updateAssetNameById } from "../assets/updateAssetNameById.js";
import { updateAssetAltTextById } from "../assets/updateAssetAltTextById.js";
import { getAllAssetFoldersOnSite } from "../assets/getAllAssetFoldersOnSite.js";
import { createAssetFolderOnSite } from "../assets/createAssetFolderOnSite.js";
import { moveAssetInsideFolder } from "../assets/moveAssetInsideFolder.js";
import { moveMultipleAssetInsideFolder } from "../assets/moveMultipleAssetInsideFolder.js";
import { getSiteInfo } from "../site/getSiteInfo";

export const callMultipleToolsAtOnce = (
  server: McpServer,
  rpc: RCPType
) => {
  server.tool(
    "callMultipleToolsAtOnce",
    "Call multiple tools at once." +
      "This tools helpful to call tool faster and easier. use this tool smartly." +
      "1. this tool is helpful to call multiple tools at once." +
      "2. you can pass callTools as array of object. each object will have toolName and args." +
      "3. this support all tools of this server. see toolName enum for list of tools." +
      "4. arg is stringified json of tool args. for example if you wanted to call getSiteInfo tool with no args then pass '{}' as arg. if you wanted to call setTextOnSelectedElement tool with text 'Hello World' then pass {'text':'Hello World'} as arg. if you wanted to call createStyle tool with name 'newStyle' and properties 'color:red' then pass {'name':'newStyle','properties':[{'key':'color','value':'red'}]} as arg. and so on." +
      "5. this tool will return the results of all tools in array of object. each object will have toolName and result. " +
      "6. Try to call this tool in small chunks. which are manageable and easy to handle.",
    {
      siteId: z.string(),
      callTools: z
        .array(
          z.object({
            toolName: z.enum([
              "selectElementOnCurrentActivePage",
              "setTextOnSelectedElement",
              "createStyle",
              "setStylesOnSelectedElement",
              "createDomElement",
              "createStandardElement",
              "createTextElement",
              "createLinkElement",
              "setAttributesToElement",
              "removeAttributesFromElement",
              "updateAssetNameById",
              "updateAssetAltTextById",
              "moveAssetInsideFolder",
              "moveMultipleAssetInsideFolder",
              "renameComponentName",
              "createComponentInstance",
              "createImageElement",
              "updateSelectedImageElementAsset",
              "updateSelectedImageElementAltText",
              "updateStyleById",
              "updateVariableValue",
              "createVariableMode",
              "createVariable",
            ]),
            args: z.string(),
          })
        )
        .min(1),
    },
    async ({ callTools, siteId }) => {
      const results: { toolName: string; result: any }[] =
        [];
      for (const callTool of callTools) {
        const toolName = callTool.toolName;
        const args = JSON.parse(callTool.args);

        switch (toolName) {
          case "selectElementOnCurrentActivePage":
            {
              const result =
                await selectElementOnCurrentActivePage(
                  server,
                  rpc,
                  true
                )(args.component, args.element, siteId);
              results.push({ toolName, result });
            }
            break;
          case "setTextOnSelectedElement":
            {
              const result = await setTextOnSelectedElement(
                server,
                rpc,
                true
              )(args.text, siteId);
              results.push({ toolName, result });
            }
            break;
          case "createStyle":
            {
              const result = await createStyle(
                server,
                rpc,
                true
              )(args.name, args.properties, siteId);
              results.push({ toolName, result });
            }
            break;
          case "setStylesOnSelectedElement":
            {
              const result =
                await setStylesOnSelectedElement(
                  server,
                  rpc,
                  true
                )(args.styleIds, siteId);
              results.push({ toolName, result });
            }
            break;
          case "createDomElement":
            {
              const result = await createDomElement(
                server,
                rpc,
                true
              )(
                args.tag,
                args.insertType,
                args.styleIds,
                args.autoSelectElementAfterCreation,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "createStandardElement":
            {
              const result = await createStandardElements(
                server,
                rpc,
                true
              )(
                args.type,
                args.insertType,
                args.autoSelectElementAfterCreation,
                args.styleIds,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "createTextElement":
            {
              const result = await createTextElement(
                server,
                rpc,
                true
              )(
                siteId,
                args.type,
                args.insertType,
                args.styleIds,
                args.text,
                args.headingLevel
              );
              results.push({ toolName, result });
            }
            break;
          case "createLinkElement":
            {
              const result = await createLinkElement(
                server,
                rpc,
                true
              )(
                args.type,
                args.insertType,
                args.styleIds,
                args.text,
                args.linkType,
                args.linkData,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "setAttributesToElement":
            {
              const result = await setAttributesToElement(
                server,
                rpc,
                true
              )(args.attributes, siteId);
              results.push({ toolName, result });
            }
            break;
          case "removeAttributesFromElement":
            {
              const result =
                await removeAttributesFromElement(
                  server,
                  rpc,
                  true
                )(args.attributesNames, siteId);
              results.push({ toolName, result });
            }
            break;
          case "updateAssetNameById":
            {
              const result = await updateAssetNameById(
                server,
                rpc,
                true
              )(args.id, args.name, siteId);
              results.push({ toolName, result });
            }
            break;
          case "updateAssetAltTextById":
            {
              const result = await updateAssetAltTextById(
                server,
                rpc,
                true
              )(args.id, args.altText, siteId);
              results.push({ toolName, result });
            }
            break;
          case "moveAssetInsideFolder":
            {
              const result = await moveAssetInsideFolder(
                server,
                rpc,
                true
              )(args.assetId, args.folderId, siteId);
              results.push({ toolName, result });
            }
            break;
          case "moveMultipleAssetInsideFolder":
            {
              const result =
                await moveMultipleAssetInsideFolder(
                  server,
                  rpc,
                  true
                )(args.assetIds, args.folderId, siteId);
              results.push({ toolName, result });
            }
            break;
          case "renameComponentName":
            {
              const result = await renameComponentName(
                server,
                rpc,
                true
              )(args.componentId, args.newName, siteId);
              results.push({ toolName, result });
            }
            break;
          case "createComponentInstance":
            {
              const result = await createComponentInstance(
                server,
                rpc,
                true
              )(
                args.componentId,
                args.insertType,
                args.autoSelectElementAfterCreation,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "createImageElement":
            {
              const result = await createImageElement(
                server,
                rpc,
                true
              )(
                args.assetId,
                args.insertType,
                args.styleIds,
                args.autoSelectElementAfterCreation,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "updateSelectedImageElementAsset":
            {
              const result =
                await updateSelectedImageElementAsset(
                  server,
                  rpc,
                  true
                )(args.assetId, siteId);
              results.push({ toolName, result });
            }
            break;
          case "updateSelectedImageElementAltText":
            {
              const result =
                await updateSelectedImageElementAltText(
                  server,
                  rpc,
                  true
                )(args.altText, siteId);
              results.push({ toolName, result });
            }
            break;
          case "updateStyleById":
            {
              const result = await updateStyleById(
                server,
                rpc,
                true
              )(
                args.styleId,
                args.properties,
                args.propertiesToRemove,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "updateVariableValue":
            {
              const result = await updateVariableValue(
                server,
                rpc,
                true
              )(
                args.variableCollectionId,
                args.variableId,
                args.value,
                args.modeId,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "createVariableMode":
            {
              const result = await createVariableMode(
                server,
                rpc,
                true
              )(
                args.variableCollectionId,
                args.modeName,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
          case "createVariable":
            {
              const result = await createVariable(
                server,
                rpc,
                true
              )(
                args.variableCollectionId,
                args.variableName,
                args.variableType,
                args.variableValue,
                siteId
              );
              results.push({ toolName, result });
            }
            break;
        }
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results),
          },
        ],
      };
    }
  );
};
