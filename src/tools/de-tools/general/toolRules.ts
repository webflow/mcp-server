import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RCPType } from "../../../types/deTools";

export const toolRules = (
  server: McpServer,
  rpc: RCPType
) => {
  server.tool(
    "tool-rules",
    "Provides essential guidelines and best practices for effectively using the Webflow Designer tools. Call this tool to understand recommended workflows and important considerations before performing actions. ALWAYS CALL THIS TOOL FIRST BEFORE CALLING ANY OTHER TOOLS.  ALWAYS CALL THIS TOOL FIRST BEFORE CALLING ANY OTHER TOOLS. ",
    {},
    async ({}) => ({
      content: [
        {
          type: "text",
          text:
            `Webflow Designer Tool Usage Guidelines:\n` +
            `-\n` +
            `- Rules:\n` +
            `-- if any tools require site id, Do not assume site id. always ask user for site id if not provided or known already. you can also use sites_list tool to fetch all sites and then ask user to select one of them. \n` +
            `-- If user ask to create element, and did not specify location to create element. then ALWAYS ask user where to create element. user may use terms like create this section, create this div, create this block, create this container, etc.\n` +
            "-- always think before creating any kind of element. try to select element first and then create element. if you are not sure about the location of element then ask user for confirmation." +
            "-- DO NO nest text element inside text element. DO NOT nest heading element. " +
            "-- Do NOT call tool rules on every message. once you have learned the rules, you can use it in your memory. " +
            `-\n` +
            `- Styles:\n` +
            `-- Check existing styles (getAllStylesOnSite) before creating new ones (createStyle).\n` +
            `-- Reuse existing styles whenever possible. Combine styles using combo classes for complex styling.\n` +
            `-- While creating or updating styles, Please use the long-form alias of a CSS property when managing styles. For example, the property row-gap has a long-form alias of grid-row-gap, margin has long-form alias of margin-top, margin-right, margin-bottom, margin-left, etc.\n` +
            `-- if you wanted to learn which styles are supported by webflow designer, you can use learnMoreAboutStyles tool.\n` +
            `-- To update existing styles: Use updateStyleById with styleId, properties to add/update, and propertiesToRemove.\n` +
            `-\n` +
            `- Element Creation:\n` +
            `-- Use createStandardElements for common elements like 'BlockContainer', 'DivBlock', 'Section'.\n` +
            `-- Use createTextElement for 'Heading', 'TextBlock', 'Paragraph'. Remember not to nest TextBlocks unnecessarily.\n` +
            `-- Use createLinkElement for 'Button' and 'TextLink'.\n` +
            `-- Use createDomElement for creating custom HTML elements not covered by the standard tools. Specify the correct HTML tag.\n` +
            `-- Do not add any element inside Button and TextLink element. after creation of button and textlink element, use selectElementOnCurrentActivePage to select the element and then add other elements around it.` +
            `-- Always specify insertType ('before', 'after', 'append', 'prepend') relative to the currently selected element. Use selectElementOnCurrentActivePage first if needed to target the correct insertion point.\n` +
            `-- Use createImageElement to add images to the page. Provide the assetId, styleIds, insertType and autoSelectElementAfterCreation.\n` +
            `-\n` +
            `- Element Manipulation:\n` +
            `-- To check the currently selected element: Use getSelectedElement.\n` +
            `-- To select a specific element: Use selectElementOnCurrentActivePage. Obtain component and element IDs (e.g., from getAllElementOnCurrentActivePage).\n` +
            `-- To modify text: Use setTextOnSelectedElement after selecting the element.\n` +
            `-- To apply/remove styles: Use setStylesOnSelectedElement after selecting the element. Pass an array of styleIds. An empty array removes all applied styles.\n` +
            `-- To add/modify element attributes: Use setAttributesToElement after selecting the element.\n` +
            `-- To remove element attributes: Use removeAttributesFromElement after selecting the element.\n` +
            `-- To remove the currently selected element: Use removeSelectedElement. ALWAYS ask for user consent before removing.\n` +
            `-- To update image elements: Use updateSelectedImageElementAsset to change the image and updateSelectedImageElementAltText to set alt text.\n` +
            `-- Always use createImageElement to add image to the page. do not use createDomElement to add image to the page with image tag. \n` +
            `-\n` +
            `- Site/Page Information:\n` +
            `-- Get general site details: Use getSiteInfo.\n` +
            `-- Get details of the currently open page: Use getCurrentPage.\n` +
            `-- List all pages and folders: Use getAllPagesAndFolders.\n` +
            `-- Switch between pages: Use switchPage with the target pageId.\n` +
            `-- Create new pages: Use createPage with pageName, metaTitle, metaDescription, and optional pageParentFolderId.\n` +
            `-- Create new folders: Use createPageFolder with pageFolderName and optional pageFolderParentId.\n` +
            `-- Update page metadata: Use updatePageMetaData to modify page title or description.\n` +
            `-\n` +
            `- Assets:\n` +
            `-- List all assets: Use getAllAssetsOnSite.\n` +
            `-- Get details of a specific asset: Use getAssetById.\n` +
            `-- Manage asset folders: Use getAllAssetFoldersOnSite, createAssetFolderOnSite, moveAssetInsideFolder, moveMultipleAssetInsideFolder.\n` +
            `-- Update asset details: Use updateAssetNameById, updateAssetAltTextById.\n` +
            `-- Get image preview: Use getImagePreviewFromURL for external images. this is helpful to understand the image before adding it to the page. or setting alt text. support images are only from webflow assets. and support file types are png, jpg, jpeg, gif, and webp.\n` +
            `-\n` +
            `- Components:\n` +
            `-- List all component definitions: Use getAllComponents.\n` +
            `-- Create a component from an existing element: Use createComponentFromElement. Remember this creates a definition, not an instance on the page directly.\n` +
            `-- Create an instance of a component on the page: Use createComponentInstance. Make sure an element is selected first for insertion context.\n` +
            `-- Edit a component definition: Use enterIntoComponentView on a component instance. Use getAllElementOnCurrentActivePage inside the view to see elements. Remember to exit with exitComponentView.\n` +
            `-- Check if currently editing a component: Use checkIfInsideComponentView.\n` +
            `-- Rename a component definition: Use renameComponentName. ALWAYS ask for user consent before renaming the component name.\n` +
            `-\n` +
            `- Design Variables:\n` +
            `-- Get variable collections: Use getAllVariableCollections or getDefaultVariableCollection.\n` +
            `-- Create and manage collections: Use createVariableCollection and updateVariableCollectionName.\n` +
            `-- Access specific collections: Use getVariableCollectionById.\n` +
            `-- Access variables: Use getAllVariablesFromCollection, getVariableById, or getVariableByName.\n` +
            `-- Create variables: Use createVariable with variableName, variableType, and variableValue.\n` +
            `-- Update variables: Use updateVariableValue to modify existing variables.\n` +
            `-- Create variable modes: Use createVariableMode for creating alternate color schemes (dark/light mode).\n` +
            `-\n` +
            `-- Memory:\n` +
            `-- Knowledge Graph (Memory): **ACTIVELY USE** the graph tools (create/add/delete entities/relations/observations) to store not just site elements, but also **user instructions, preferences, and task context** (e.g., create 'UserPreferences' or 'TaskContext' entities when instructed). Use **read_graph** proactively (e.g., at the start of tasks) to refresh context and **search_nodes** to find specific stored instructions or details before acting. Use **open_nodes** to get full details of identified nodes. **Consistent use significantly enhances LLM understanding and performance.** Keep the graph relevant to the Webflow context.\n` +
            `-- ALWAYS try too use Knowledge Graph tools to store information.` +
            ``,
        },
      ],
    })
  );
};
