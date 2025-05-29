import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Assets
import { getAssetById } from "./assets/getAssetById.js";
import { getAllAssetsOnSite } from "./assets/getAllAssetsOnSite.js";
import { updateAssetNameById } from "./assets/updateAssetNameById.js";
import { updateAssetAltTextById } from "./assets/updateAssetAltTextById.js";
import { getAllAssetFoldersOnSite } from "./assets/getAllAssetFoldersOnSite.js";
import { createAssetFolderOnSite } from "./assets/createAssetFolderOnSite.js";
import { moveAssetInsideFolder } from "./assets/moveAssetInsideFolder.js";
import { getImagePreviewFromURL } from "./assets/getImagePreviewFromURL.js";
import { moveMultipleAssetInsideFolder } from "./assets/moveMultipleAssetInsideFolder.js";

// Components
import { getAllComponents } from "./components/getAllComponents.js";
import { enterIntoComponentView } from "./components/enterIntoComponentView.js";
import { exitComponentView } from "./components/exitComponentView.js";
import { checkIfInsideComponentView } from "./components/checkIfInsideComponentView.js";
import { renameComponentName } from "./components/renameComponentName.js";
import { createComponentFromElement } from "./components/createComponentFromElement.js";
import { createComponentInstance } from "./components/createComponentInstance.js";

// Elements
import { getAllElementOnCurrentActivePage } from "./elements/getAllElementOnCurrentActivePage.js";
import { getSelectedElement } from "./elements/getSelectedElement.js";
import { selectElementOnCurrentActivePage } from "./elements/selectElementOnCurrentActivePage.js";
import { setTextOnSelectedElement } from "./elements/setTextOnSelectedElement.js";
import { removeSelectedElement } from "./elements/removeSelectedElement.js";
import { setAttributesToElement } from "./elements/setAttributesToElement.js";
import { removeAttributesFromElement } from "./elements/removeAttributesFromElement.js";
import { updateSelectedImageElementAsset } from "./elements/updateSelectedImageElementAsset.js";
import { updateSelectedImageElementAltText } from "./elements/updateSelectedImageElementAltText.js";
import { createImageElement } from "./elements/createImageElement.js";
import { setStylesOnSelectedElement } from "./elements/setStylesOnSelectedElement.js";
import { createDomElement } from "./elements/createDomElement.js";
import { createStandardElements } from "./elements/createStandardElements.js";
import { createTextElement } from "./elements/createTextElement.js";
import { createLinkElement } from "./elements/createLinkElement.js";

// Pages
import { getCurrentPage } from "./pages/getCurrentPage.js";
// import { switchPage } from "./pages/switchPage.js";
// import { getAllPagesAndFolders } from "./pages/getAllPagesAndFolders.js";
// import { createPage } from "./pages/createPage.js";
// import { updatePageMetaData } from "./pages/updatePageMetaData.js";
// import { createPageFolder } from "./pages/createPageFolder.js";

// Site
// import { getSiteInfo } from "./site/getSiteInfo.js";

// Styles
import { getAllStylesOnSite } from "./styles/getAllStylesOnSite.js";
import { createStyle } from "./styles/createStyle.js";
import { updateStyleById } from "./styles/updateStyleById.js";

// Variables
import { getAllVariableCollections } from "./variables/getAllVariableCollections.js";
import { getDefaultVariableCollection } from "./variables/getDefaultVariableCollection.js";
import { createVariableCollection } from "./variables/createVariableCollection.js";
import { getVariableCollectionById } from "./variables/getVariableCollectionById.js";
import { updateVariableCollectionName } from "./variables/updateVariableCollectionName.js";
import { getAllVariablesFromCollection } from "./variables/getAllVariablesFromCollection.js";
import { getVariableById } from "./variables/getVariableById.js";
import { getVariableByName } from "./variables/getVariableByName.js";
import { updateVariableValue } from "./variables/updateVariableValue.js";
import { createVariableMode } from "./variables/createVariableMode.js";
import { createVariable } from "./variables/createVariable.js";

// General
import { toolRules } from "./general/toolRules.js";
import { learnMoreAboutStyles } from "./general/learnMoreAboutStyles.js";

// Advance
import { callMultipleToolsAtOnce } from "./advance/callMultipleToolsAtOnce.js";
import { RCPType } from "../../mcp/index.js";
import { initMemoryTool } from "./memory.js";
import { ToolConfig } from "../../../utils/getToolConfig.js";
export const initTools = (
  server: McpServer,
  rpc: RCPType,
  toolConfig: ToolConfig
) => {
  const {
    isAssetManagementEnabled,
    isComponentManagementEnabled,
    isVariableManagementEnabled,
    isMemoryEnabled,
    isElementManipulationEnabled,
    isStyleManagementEnabled,
  } = toolConfig;

  // General
  toolRules(server, rpc);
  learnMoreAboutStyles(server, rpc);

  // Advance
  callMultipleToolsAtOnce(server, rpc);

  // Assets
  if (isAssetManagementEnabled) {
    getAllAssetsOnSite(server, rpc);
    getAssetById(server, rpc);
    updateAssetNameById(server, rpc);
    updateAssetAltTextById(server, rpc);
    getAllAssetFoldersOnSite(server, rpc);
    createAssetFolderOnSite(server, rpc);
    moveAssetInsideFolder(server, rpc);
    moveMultipleAssetInsideFolder(server, rpc);
    getImagePreviewFromURL(server, rpc);
  }
  // Components
  if (isComponentManagementEnabled) {
    getAllComponents(server, rpc);
    enterIntoComponentView(server, rpc);
    exitComponentView(server, rpc);
    checkIfInsideComponentView(server, rpc);
    renameComponentName(server, rpc);
    createComponentFromElement(server, rpc);
    createComponentInstance(server, rpc);
  }
  // Elements
  if (isElementManipulationEnabled) {
    getAllElementOnCurrentActivePage(server, rpc);
    getSelectedElement(server, rpc);
    selectElementOnCurrentActivePage(server, rpc);
    setTextOnSelectedElement(server, rpc);
    removeSelectedElement(server, rpc);
    setAttributesToElement(server, rpc);
    removeAttributesFromElement(server, rpc);
    updateSelectedImageElementAsset(server, rpc);
    updateSelectedImageElementAltText(server, rpc);
    createImageElement(server, rpc);
    setStylesOnSelectedElement(server, rpc);
    createDomElement(server, rpc);
    createStandardElements(server, rpc);
    createTextElement(server, rpc);
    createLinkElement(server, rpc);
  }

  // Pages
  getCurrentPage(server, rpc);
  // switchPage(server, rpc); //redundant tool - conflict with DATA tools
  // getAllPagesAndFolders(server, rpc); //redundant tool - conflict with DATA tools
  // createPage(server, rpc); //redundant tool - conflict with DATA tools
  // updatePageMetaData(server, rpc); //redundant tool - conflict with DATA tools
  // createPageFolder(server, rpc); //redundant tool - conflict with DATA tools

  // Site
  // getSiteInfo(server, rpc); //redundant tool - conflict with DATA tools

  // Styles
  if (isStyleManagementEnabled) {
    getAllStylesOnSite(server, rpc);
    createStyle(server, rpc);
    updateStyleById(server, rpc);
  }

  // Variables
  if (isVariableManagementEnabled) {
    getAllVariableCollections(server, rpc);
    getDefaultVariableCollection(server, rpc);
    createVariableCollection(server, rpc);
    getVariableCollectionById(server, rpc);
    updateVariableCollectionName(server, rpc);
    getAllVariablesFromCollection(server, rpc);
    getVariableById(server, rpc);
    getVariableByName(server, rpc);
    updateVariableValue(server, rpc);
    createVariableMode(server, rpc);
    createVariable(server, rpc);
  }

  // Memory
  if (isMemoryEnabled) {
    initMemoryTool(server, rpc.env);
  }
};
