export const getToolConfig = (formData: FormData) => {
  const isCMSEnabled = formData.get("cms") === "on";
  const isCustomCodeEnabled =
    formData.get("custom-code") === "on";
  const isElementManipulationEnabled =
    formData.get("element-manipulation") === "on";
  const isStyleManagementEnabled =
    formData.get("style-management") === "on";
  const isAssetManagementEnabled =
    formData.get("asset-management") === "on";
  const isComponentManagementEnabled =
    formData.get("component-management") === "on";
  const isVariableManagementEnabled =
    formData.get("variable-management") === "on";
  const isMemoryEnabled = formData.get("memory") === "on";

  const toolConfig = {
    isCMSEnabled,
    isCustomCodeEnabled,
    isElementManipulationEnabled,
    isStyleManagementEnabled,
    isAssetManagementEnabled,
    isComponentManagementEnabled,
    isVariableManagementEnabled,
    isMemoryEnabled,
  };
  return toolConfig;
};

export type ToolConfig = ReturnType<typeof getToolConfig>;
