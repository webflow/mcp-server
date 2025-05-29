export const withCommonDesignerRules = (
  description: string
) => {
  return ` Designer Tool - 
  ${description}, -- do not assume site id. always ask user for site id if not already provided or known. use sites_list tool to fetch all sites and then ask user to select one of them.
  `;
};
