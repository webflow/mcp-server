import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import {
  registerAiChatTools,
  registerCmsTools,
  registerComponentsTools,
  registerPagesTools,
  registerScriptsTools,
  registerSiteTools,
} from "./data-tools";
import { RCPType } from "../types/deTools";
import {
  getAllAssetsOnSite,
  getAssetById,
  learnMoreAboutStyles,
  toolRules,
  updateAssetNameById,
  checkIfInsideComponentView,
  createAssetFolderOnSite,
  createComponentFromElement,
  createComponentInstance,
  createDomElement,
  createImageElement,
  createLinkElement,
  createStandardElements,
  createStyle,
  createTextElement,
  createVariable,
  createVariableCollection,
  createVariableMode,
  enterIntoComponentView,
  exitComponentView,
  getAllAssetFoldersOnSite,
  getAllComponents,
  getAllElementOnCurrentActivePage,
  getAllStylesOnSite,
  getAllVariableCollections,
  getAllVariablesFromCollection,
  getCurrentPage,
  getDefaultVariableCollection,
  getImagePreviewFromURL,
  getSelectedElement,
  getVariableById,
  getVariableByName,
  getVariableCollectionById,
  moveAssetInsideFolder,
  moveMultipleAssetInsideFolder,
  removeAttributesFromElement,
  removeSelectedElement,
  renameComponentName,
  selectElementOnCurrentActivePage,
  setAttributesToElement,
  setStylesOnSelectedElement,
  setTextOnSelectedElement,
  switchPage,
  updateAssetAltTextById,
  updateSelectedImageElementAltText,
  updateSelectedImageElementAsset,
  updateStyleById,
  updateVariableCollectionName,
  updateVariableValue,
} from "./de-tools";
import { ToolConfig } from "../utils/getToolConfig";

export const registerDataTools = (
  server: McpServer,
  getClient: () => WebflowClient,
  toolConfig: ToolConfig
) => {
  const {
    isCMSEnabled,
    isCustomCodeEnabled,
    isComponentManagementEnabled,
  } = toolConfig;

  registerAiChatTools(server);

  if (isCMSEnabled) {
    registerCmsTools(server, getClient);
  }
  if (isComponentManagementEnabled) {
    registerComponentsTools(server, getClient);
  }

  registerPagesTools(server, getClient);

  if (isCustomCodeEnabled) {
    registerScriptsTools(server, getClient);
  }

  registerSiteTools(server, getClient);
};

export const registerDesignerTools = (
  server: McpServer,
  rpc: RCPType,
  toolConfig: ToolConfig
) => {
  const {
    isAssetManagementEnabled,
    isComponentManagementEnabled,
    isVariableManagementEnabled,
    isElementManipulationEnabled,
    isStyleManagementEnabled,
  } = toolConfig;

  // General
  toolRules(server, rpc);
  learnMoreAboutStyles(server, rpc);

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
  switchPage(server, rpc);

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
};
