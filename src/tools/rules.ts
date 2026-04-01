import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerRulesTools(server: McpServer) {
  server.registerTool(
    "webflow_guide_tool",
    {
      title: "Webflow Guide Tool",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
      description:
        "Provides essential guidelines and best practices for effectively using the Webflow tools. Call this tool to understand recommended workflows and important considerations before performing actions. ALWAYS CALL THIS TOOL FIRST BEFORE CALLING ANY OTHER TOOLS.  ALWAYS CALL THIS TOOL FIRST BEFORE CALLING ANY OTHER TOOLS. ",
      inputSchema: {},
    },
    async ({}) => ({
      content: [
        {
          type: "text",
          text:
            `Webflow Tool Usage Guidelines:\n` +
            `- These rules are essential for using tools correctly and helping users achieve their goals. Follow all instructions precisely.\n` +
            `\n` +
            `General Rules:\n` +
            `-- Data Tools are REST API calls, and Designer Tools are UI tools. You must use the correct tool for the action you want to perform.\n` +
            `-- Do not assume site ID. If a tool requires site_id, you must pass it explicitly. If you're not sure about the site ID, ask the user for it.\n` +
            `-- Always plan your actions before calling any tool. Do not invoke tools randomly without understanding the full workflow.\n` +
            `-- After updating or creating an element, the updated/created element is not automatically selected. If you need more information about that element, use element_tool > select_element with the appropriate element ID to select and inspect it.\n` +
            `-- When creating or updating elements, most users prefer using existing styles. You should reuse styles if they exist, unless the user explicitly wants new ones.\n` +
            `-- To learn or find about localizations and locale id you get use site too and get site details to learn how many locales are supported and their details.\n` +
            `\n` +
            `Element Tool Usage:\n` +
            `-- To get detailed information about the currently selected element, use element_tool > get_selected_element.\n` +
            `-- To select a specific element by its ID, use element_tool > select_element.\n` +
            `-- To retrieve all elements on the current page, use element_tool > get_all_elements. If you only need element structure or class names, set include_style_properties and include_all_breakpoint_styles to false to avoid excessive data and context overflow. Set them to true only if you specifically need style details and all breakpoints.\n` +
            `-- To add or update attributes on an element, use element_tool > add_or_update_attribute. Only do this if the element's metadata shows canHaveAttributes: true.\n` +
            `-- To remove an attribute from an element, use element_tool > remove_attribute. This action is also valid only if canHaveAttributes is true for the element.\n` +
            `-- To update the ID attribute of an element, use element_tool > update_id_attribute. This sets a custom ID (#id) for the element. Do not pass the '#' character in the ID string. If the element already has an ID, you can read it using the domId property.\n` +
            `-- To set one or more styles on an element, use element_tool > set_style. You must pass one or more valid style names that already exist. If multiple styles are applied, they are treated as combo classes.\n` +
            `-- To set or update a link for Button, TextLink, or LinkBlock elements, use element_tool > set_link.\n` +
            `-- To set an image asset on an Image element, use element_tool > set_image_asset. Make sure you pass a valid asset_id. You can retrieve available assets via asset_tool > get_all_assets_and_folders.\n` +
            `-- To update the heading level for a Heading element, use element_tool > set_heading_level. Valid heading levels are integers from 1 to 6, which correspond to h1 through h6.\n` +
            `\n` +
            `Element Builder Tool:\n` +
            `-- To create a new element, use element_builder. Pass the type of element you want to create. After creation, use element_tool > select_element to select the element and gather additional details if needed.\n` +
            `\n` +
            `Component Builder Tool:\n` +
            `-- To insert a component instance, use component_builder. It supports two action types:\n` +
            `---- insert_in_element: Insert a component instance as a child of a parent element (e.g., Container, DivBlock, Section).\n` +
            `---- insert_in_slot: Insert a component instance into a specific slot of an existing component instance. You must provide slot_name when using this action type.\n` +
            `-- Pass the component name in component_schema (not the component ID). You can optionally populate the instance's slots with child components using the slots array in component_schema.\n` +
            `-- After creation, use element_tool > select_element to select the component instance and gather additional details if needed.\n` +
            `-- Only component instances (created via component_builder) are allowed inside slots. You cannot place regular elements inside a slot. Always use insert_in_slot to add components to slots.\n` +
            `\n` +
            `Component Tool (Designer):\n` +
            `-- To get all components in the site, use de_component_tool > get_all_components.\n` +
            `-- To search components by name or description, use de_component_tool > search_components. Pass an optional query string. Returns rich metadata including name, group, description, instance count, editability, and library info.\n` +
            `-- To insert a component instance by component ID, use de_component_tool > insert_component_instance. Pass parent_element_id, component_id, and creation_position.\n` +
            `-- To transform an existing element into a component, use de_component_tool > transform_element_to_component. Pass the element ID and component name.\n` +
            `-- To create a new blank component, use de_component_tool > create_blank_component. Pass name, and optionally group and description.\n` +
            `-- To get the number of instances of a component, use de_component_tool > get_instance_count. Pass the component_id.\n` +
            `-- To get the component currently being edited, use de_component_tool > get_current_component. Returns null if on a regular page.\n` +
            `-- To get the component that contains a specific element, use de_component_tool > get_parent_component. Pass the element ID. Returns null if the element is at page level.\n` +
            `-- To insert a Slot element into a component, use de_component_tool > insert_slot. Pass parent_element_id. You must be in component editing context first (use open_canvas with a component_id).\n` +
            `-- To rename a component, use de_component_tool > rename_component. Pass component_id and new_name.\n` +
            `-- To check if you are currently inside a component view, use de_component_tool > check_if_inside_component_view.\n` +
            `\n` +
            `Canvas Navigation (Designer):\n` +
            `-- To navigate the Designer canvas, use de_component_tool > open_canvas. This is the primary way to switch between component canvas and page canvas.\n` +
            `---- To open a component canvas: pass component_id.\n` +
            `---- To exit component canvas and return to a page: pass page_id.\n` +
            `-- open_canvas is different from open_component_view/close_component_view. open_canvas switches the entire canvas context (like clicking a component in the Components panel). open_component_view/close_component_view enters/exits in-context editing of a component instance on the current page.\n` +
            `-- To enter in-context editing of a component instance, use de_component_tool > open_component_view. Pass the component_instance_id.\n` +
            `-- To exit in-context editing and return to page view, use de_component_tool > close_component_view.\n` +
            `\n` +
            `Element Snapshot Tool Usage:\n` +
            `-- To get a visual snapshot of an element, section, or component, use element_snapshot_tool. Pass the element ID to capture its current visual state as an image.\n` +
            `-- Use this tool to verify visual changes after creating or updating elements. It provides immediate visual feedback without requiring manual inspection.\n` +
            `-- This tool is helpful for debugging layout issues, verifying styling changes, or confirming that elements render as expected.\n` +
            `-- The snapshot returns a PNG image of the specified element. Use it to validate your work before proceeding with additional changes.\n` +
            `-- When the user asks to see or preview an element, use this tool to provide visual confirmation.\n` +
            `\n` +
            `Asset Tool Usage:\n` +
            `-- To create an asset folder, use asset_tool > create_folder. Pass the name of the folder. To create a nested folder, pass parent_folder_id. Otherwise, the folder will be created in the root directory.\n` +
            `-- To retrieve assets and folders, use asset_tool > get_all_assets_and_folders. You can use query as "all", "folders", or "assets". To limit data, use filter_assets_by_ids or search query. Fetch only what you need to avoid context overload.\n` +
            `-- To update an asset, use asset_tool > update_asset. Pass asset_id and optionally pass name, parent_folder_id, or alt_text to update one or more fields.\n` +
            `\n` +
            `Page Tool Usage:\n` +
            `-- To create a page, use page_tool > create_page. Pass the page name. After creation, the system will automatically switch to the new page. The tool returns the page info.\n` +
            `-- To create a page folder, use page_tool > create_page_folder. Pass the folder name. To create a nested folder, also pass parent_id. Otherwise, the folder is created in the root.\n` +
            `-- To get information about the current page, use page_tool > get_current_page. It returns page metadata.\n` +
            `-- To switch to a different page, use page_tool > switch_page. Pass the page_id to switch to that page.\n` +
            `\n` +
            `Style Tool Usage:\n` +
            `-- To create a new style, use style_tool > create_style. Pass the name. For combo classes, pass parent_style_name. Always use longhand property names when defining style properties.\n` +
            `-- To update a style, use style_tool > update_style. If breakpoint is not provided, it defaults to the main breakpoint. If pseudo is not provided, it defaults to "noPseudo".\n` +
            `-- To get existing styles, use style_tool > get_styles. Use filters or queries to retrieve only what's needed. This tool may return a lot of data.\n` +
            `-- Breakpoint-specific style behavior:\n` +
            `---- Styles set on xxl (1920px) apply to screens ≥ 1920px.\n` +
            `---- Styles set on xl (1440px) apply to screens ≥ 1440px.\n` +
            `---- Styles set on large (1280px) apply to screens ≥ 1280px.\n` +
            `---- Styles set on main apply to all devices unless overridden at other breakpoints.\n` +
            `---- Styles set on medium (tablet) apply to screens ≤ 991px.\n` +
            `---- Styles set on small (mobile landscape) apply to screens ≤ 767px.\n` +
            `---- Styles set on tiny (mobile portrait) apply to screens ≤ 478px.\n` +
            `\n` +
            `Variable Tool Usage:\n` +
            `-- To create a variable collection, use variable_tool > create_variable_collection. Pass the name.\n` +
            `-- To create a variable mode, use variable_tool > create_variable_mode. Pass the name and variable_collection_id.\n` +
            `-- To retrieve variable collections, use variable_tool > get_variable_collections. You can filter by query or use filter_collections_by_ids.\n` +
            `-- To retrieve variables, use variable_tool > get_variables. You can filter by query or filter_variables_by_ids.\n` +
            `-- To create variables of different types, use:\n` +
            `---- variable_tool > create_color_variable\n` +
            `---- variable_tool > create_size_variable\n` +
            `---- variable_tool > create_number_variable\n` +
            `---- variable_tool > create_percentage_variable\n` +
            `---- variable_tool > create_font_family_variable\n` +
            `-- In all create_*_variable tools, pass name and variable_collection_id.\n` +
            `-- To update any variable, use the corresponding update tool (e.g., update_color_variable) with name and variable_collection_id.\n` +
            `-- Each variable value can be set using one of three options:\n` +
            `---- static_value: A typed literal value matching the variable type (e.g., "#ff0000" for color, { value: 16, unit: "px" } for size).\n` +
            `---- existing_variable_id: An alias to another variable, binding this variable's value to the referenced one.\n` +
            `---- custom_value: An arbitrary CSS expression string for values that don't fit standard typed formats. Examples: "calc(100vh - 60px)" for a size variable, "color-mix(in srgb, red 50%, blue)" for a color variable. Use custom_value when the user needs CSS functions like calc(), clamp(), min(), max(), color-mix(), or any other valid CSS expression.\n` +
            `-- Only one of static_value, existing_variable_id, or custom_value should be provided per variable value.\n` +
            `-- In Webflow, variables are linked to styles and function like CSS custom properties.\n` +
            `\n` +
            `CMS Data Tool Usage:\n` +
            `-- To get a list of CMS collections, use cms_tool > get_collection_list. Pass the site_id.\n` +
            `-- To get a CMS collection details, use cms_tool > get_collection_details. Pass the collection_id.\n` +
            `-- To create a new CMS collection, use cms_tool > create_collection. Pass the name and site_id.\n` +
            `-- To create a new CMS collection static field, use cms_tool > create_collection_static_field. Pass the collection_id and data.\n` +
            `-- To create a new CMS collection option field, use cms_tool > create_collection_option_field. Pass the collection_id and data.\n` +
            `-- To create a new CMS collection reference field, use cms_tool > create_collection_reference_field. Pass the collection_id and data.\n` +
            `-- To update a CMS collection field, use cms_tool > update_collection_field. Pass the collection_id and field_id and data.\n` +
            `-- To create a new CMS collection item, use cms_tool > create_collection_items_live. Pass the collection_id and data.\n` +
            `-- To update a CMS collection item, use cms_tool > update_collection_items_live. Pass the collection_id and data.\n` +
            `-- To publish a CMS collection item, use cms_tool > publish_collection_items. Pass the collection_id and item_ids.\n` +
            `-- To delete a CMS collection item, use cms_tool > delete_collection_items. Pass the collection_id and items.\n` +
            `\n` +
            `Pages Data Tool Usage:\n` +
            `-- To get a list of pages, use pages_tool > get_pages_list. Pass the site_id.\n` +
            `-- To get the metadata of a page, use pages_tool > get_page_metadata. Pass the page_id.\n` +
            `-- To update page settings, use pages_tool > update_page_settings. Pass the page_id and data.\n` +
            `-- To get the content of a page, use pages_tool > get_page_content. Pass the page_id.\n` +
            `-- To update the static content of a page, use pages_tool > update_page_static_content. Pass the page_id and localeId and nodes.\n` +
            `\n` +
            `### Important rules for creating elements.\n` +
            `-- Always create styles first if you plan to apply them while creating the element. This ensures style references are valid at the time of creation.\n` +
            `-- Always plan out your actions before calling element_builder. Know exactly what type of element to create, what styles or attributes to apply, and how you will use it.\n` +
            `-- Once an element is created using element_builder, it is not automatically selected. To inspect or modify it, use element_tool > select_element and pass the element ID returned from the creation response.\n` +
            `-- Only Container, Section, DivBlock, some valid DOM elements can have children.\n` +
            `-- Only component instances are allowed inside slots. Do not attempt to create or insert regular elements into a slot. Use component_builder to create a component instance and place it inside a slot.\n` +
            `\n` +
            `WHTML Builder Tool:\n` +
            `-- To insert elements from HTML and CSS strings, use whtml_builder. Pass html and optionally css along with parent_element_id and creation_position.\n` +
            `-- HTML Rules:\n` +
            `---- The html field must be a single root element (no fragments). For example, <div><p>Hello</p></div> is valid, but <div>First</div><div>Second</div> is not allowed.\n` +
            `---- The html field must not contain <style> tags. CSS should be provided via the css parameter.\n` +
            `-- CSS Rules:\n` +
            `---- The css field must contain raw CSS rules only. Do not wrap in <style> tags.\n` +
            `---- @keyframes are not allowed.\n` +
            `---- Custom media queries are not allowed. Only the following Webflow breakpoint media queries are valid:\n` +
            `------ Desktop (main): No media query needed (default breakpoint).\n` +
            `------ Tablet (medium): @media screen and (max-width: 991px)\n` +
            `------ Mobile Landscape (small): @media screen and (max-width: 767px)\n` +
            `------ Mobile Portrait (tiny): @media screen and (max-width: 479px)\n` +
            `-- After insertion, the tool returns element info. Use get_children_info and children_depth to control the depth of children info returned.\n`,
        },
      ],
    }),
  );
}
