export const getToolConfig = (config: string) => {
  if (!config) {
    return {
      isCMSEnabled: true,
      isCustomCodeEnabled: true,
      isElementManipulationEnabled: false,
      isStyleManagementEnabled: false,
      isAssetManagementEnabled: false,
      isComponentManagementEnabled: true,
      isVariableManagementEnabled: false,
    };
  }
  if (config === "all") {
    return {
      isCMSEnabled: true,
      isCustomCodeEnabled: true,
      isElementManipulationEnabled: true,
      isStyleManagementEnabled: true,
      isAssetManagementEnabled: true,
      isComponentManagementEnabled: true,
      isVariableManagementEnabled: true,
    };
  }
  const configValues = config.split(",");
  const isCMSEnabled = configValues.includes("cms");
  const isCustomCodeEnabled =
    configValues.includes("custom-code");
  const isElementManipulationEnabled =
    configValues.includes("element-manipulation");
  const isStyleManagementEnabled = configValues.includes(
    "style-management"
  );
  const isAssetManagementEnabled = configValues.includes(
    "asset-management"
  );
  const isComponentManagementEnabled =
    configValues.includes("component-management");
  const isVariableManagementEnabled = configValues.includes(
    "variable-management"
  );

  const toolConfig = {
    isCMSEnabled,
    isCustomCodeEnabled,
    isElementManipulationEnabled,
    isStyleManagementEnabled,
    isAssetManagementEnabled,
    isComponentManagementEnabled,
    isVariableManagementEnabled,
  };
  return toolConfig;
};

export type ToolConfig = ReturnType<typeof getToolConfig>;
