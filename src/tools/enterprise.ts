import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebflowClient } from "webflow-api";
import z from "zod/v3";
import { requestOptions } from "../mcp";
import { Robots } from "webflow-api/api";
import {
  Content,
  formatErrorResponse,
  textContent,
  toolResponse,
} from "../utils/formatResponse";

export function registerEnterpriseTools(
  server: McpServer,
  getClient: () => WebflowClient
) {
  const list301Redirects = async (arg: { site_id: string }) => {
    const response = await getClient().sites.redirects.list(
      arg.site_id,
      requestOptions
    );
    return response;
  };
  const create301Redirect = async (arg: {
    site_id: string;
    fromUrl: string;
    toUrl: string;
  }) => {
    const response = await getClient().sites.redirects.create(
      arg.site_id,
      {
        fromUrl: arg.fromUrl,
        toUrl: arg.toUrl,
      },
      requestOptions
    );
    return response;
  };
  const update301Redirect = async (arg: {
    site_id: string;
    redirect_id: string;
    fromUrl: string;
    toUrl: string;
  }) => {
    const response = await getClient().sites.redirects.update(
      arg.site_id,
      arg.redirect_id,
      {
        fromUrl: arg.fromUrl,
        toUrl: arg.toUrl,
      },
      requestOptions
    );
    return response;
  };
  const delete301Redirect = async (arg: {
    site_id: string;
    redirect_id: string;
  }) => {
    const response = await getClient().sites.redirects.delete(
      arg.site_id,
      arg.redirect_id,
      requestOptions
    );
    return response;
  };
  const getRobotsDotTxt = async (arg: { site_id: string }) => {
    const response = await getClient().sites.robotsTxt.get(
      arg.site_id,
      requestOptions
    );
    return response;
  };
  const updateRobotsDotTxt = async (arg: {
    site_id: string;
    rules?: {
      userAgent: string;
      allow: string[];
      disallow: string[];
    }[];
    sitemap?: string;
  }) => {
    const data: Robots = {};
    if (arg.rules) {
      data.rules = arg.rules;
    }
    if (arg.sitemap) {
      data.sitemap = arg.sitemap;
    }
    const response = await getClient().sites.robotsTxt.patch(
      arg.site_id,
      data,
      requestOptions
    );
    return response;
  };
  const replaceRobotsDotTxt = async (arg: {
    site_id: string;
    rules?: {
      userAgent: string;
      allow: string[];
      disallow: string[];
    }[];
    sitemap?: string;
  }) => {
    const data: Robots = {};
    if (arg.rules) {
      data.rules = arg.rules;
    }
    if (arg.sitemap) {
      data.sitemap = arg.sitemap;
    }
    const response = await getClient().sites.robotsTxt.put(
      arg.site_id,
      data,
      requestOptions
    );
    return response;
  };
  const deleteRobotsDotTxt = async (arg: {
    site_id: string;
    rules?: {
      userAgent: string;
      allow: string[];
      disallow: string[];
    }[];
    sitemap?: string;
  }) => {
    const data: Robots = {};
    if (arg.rules) {
      data.rules = arg.rules;
    }
    if (arg.sitemap) {
      data.sitemap = arg.sitemap;
    }
    const response = await getClient().sites.robotsTxt.patch(
      arg.site_id,
      data,
      requestOptions
    );
    return response;
  };

  const addWellKnownFile = async (arg: {
    site_id: string;
    fileName: string;
    fileData: string;
    contentType: "application/json" | "text/plain";
  }) => {
    const response = await getClient().sites.wellKnown.put(
      arg.site_id,
      {
        fileData: arg.fileData,
        fileName: arg.fileName,
        contentType: arg.contentType,
      },
      requestOptions
    );
    return response;
  };

  const removeWellKnownFiles = async (arg: {
    site_id: string;
    fileNames: string[];
  }) => {
    const response = await getClient().sites.wellKnown.delete(
      arg.site_id,
      {
        fileNames: arg.fileNames,
      },
      requestOptions
    );
    return response;
  };

  server.registerTool(
    "data_enterprise_tool",
    {
      title: "Data Enterprise Tool",
      description:
        "Data tool - Enterprise tool to perform actions like manage 301 redirects, manage robots.txt and more. This tool only works if User's workspace plan is Enterprise or higher, else tool will return an error.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        actions: z
          .array(
            z
              .object({
                list_301_redirects: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to list its 301 redirects."
                      ),
                  })
                  .optional()
                  .describe("List all 301 redirects for a site."),
                create_301_redirect: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to create a 301 redirect."
                      ),
                    fromUrl: z
                      .string()
                      .describe(
                        "The source URL path that will be redirected (e.g., '/old-page')."
                      ),
                    toUrl: z
                      .string()
                      .describe(
                        "The destination URL path where requests will be redirected to (e.g., '/new-page')."
                      ),
                  })
                  .optional()
                  .describe("Create a new 301 redirect for a site."),
                update_301_redirect: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to update a 301 redirect."
                      ),
                    redirect_id: z
                      .string()
                      .describe(
                        "The redirect's unique ID, used to identify which redirect to update."
                      ),
                    fromUrl: z
                      .string()
                      .describe(
                        "The source URL path that will be redirected (e.g., '/old-page')."
                      ),
                    toUrl: z
                      .string()
                      .describe(
                        "The destination URL path where requests will be redirected to (e.g., '/new-page')."
                      ),
                  })
                  .optional()
                  .describe("Update an existing 301 redirect."),
                delete_301_redirect: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to delete a 301 redirect."
                      ),
                    redirect_id: z
                      .string()
                      .describe(
                        "The redirect's unique ID, used to identify which redirect to delete."
                      ),
                  })
                  .optional()
                  .describe("Delete a 301 redirect from a site."),
                get_robots_txt: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to get its robots.txt configuration."
                      ),
                  })
                  .optional()
                  .describe("Get the robots.txt configuration for a site."),
                update_robots_txt: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to update its robots.txt."
                      ),
                    rules: z
                      .array(
                        z.object({
                          userAgent: z
                            .string()
                            .describe(
                              "The user agent to apply rules to (e.g., '*', 'Googlebot')."
                            ),
                          allow: z
                            .array(z.string())
                            .describe("Array of URL paths to allow."),
                          disallow: z
                            .array(z.string())
                            .describe("Array of URL paths to disallow."),
                        })
                      )
                      .optional()
                      .describe(
                        "Array of rules to apply to the robots.txt file."
                      ),
                    sitemap: z
                      .string()
                      .optional()
                      .describe(
                        "URL to the sitemap (e.g., 'https://example.com/sitemap.xml')."
                      ),
                  })
                  .optional()
                  .describe(
                    "Partially update the robots.txt file (PATCH operation)."
                  ),
                replace_robots_txt: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to replace its robots.txt."
                      ),
                    rules: z
                      .array(
                        z.object({
                          userAgent: z
                            .string()
                            .describe(
                              "The user agent to apply rules to (e.g., '*', 'Googlebot')."
                            ),
                          allow: z
                            .array(z.string())
                            .describe("Array of URL paths to allow."),
                          disallow: z
                            .array(z.string())
                            .describe("Array of URL paths to disallow."),
                        })
                      )
                      .optional()
                      .describe(
                        "Array of rules to apply to the robots.txt file."
                      ),
                    sitemap: z
                      .string()
                      .optional()
                      .describe(
                        "URL to the sitemap (e.g., 'https://example.com/sitemap.xml')."
                      ),
                  })
                  .optional()
                  .describe(
                    "Completely replace the robots.txt file (PUT operation)."
                  ),
                delete_robots_txt: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to delete rules from its robots.txt."
                      ),
                    rules: z
                      .array(
                        z.object({
                          userAgent: z
                            .string()
                            .describe(
                              "The user agent to apply rules to (e.g., '*', 'Googlebot')."
                            ),
                          allow: z
                            .array(z.string())
                            .describe("Array of URL paths to allow."),
                          disallow: z
                            .array(z.string())
                            .describe("Array of URL paths to disallow."),
                        })
                      )
                      .optional()
                      .describe(
                        "Array of rules to remove from the robots.txt file."
                      ),
                    sitemap: z
                      .string()
                      .optional()
                      .describe("Sitemap URL to remove."),
                  })
                  .optional()
                  .describe("Delete specific rules from the robots.txt file."),
                add_well_known_file: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to add a well-known file."
                      ),
                    fileName: z
                      .string()
                      .describe(
                        `The name of the well-known file (e.g., 'apple-app-site-association', 'assetlinks.json'). ".noext" is a special file extension that removes other extensions. For example, apple-app-site-association.noext.txt will be uploaded as apple-app-site-association. Use this extension for tools that have trouble uploading extensionless files.`
                      ),
                    fileData: z
                      .string()
                      .describe(
                        "The content/data of the well-known file as a string."
                      ),
                    contentType: z
                      .enum(["application/json", "text/plain"])
                      .describe(
                        "The MIME type of the file content (application/json or text/plain)."
                      ),
                  })
                  .optional()
                  .describe(
                    "Add or update a well-known file to the site's /.well-known/ directory."
                  ),
                remove_well_known_files: z
                  .object({
                    site_id: z
                      .string()
                      .describe(
                        "The site's unique ID, used to remove well-known files."
                      ),
                    fileNames: z
                      .array(z.string())
                      .describe(
                        "Array of file names to remove from the /.well-known/ directory."
                      ),
                  })
                  .optional()
                  .describe(
                    "Remove one or more well-known files from the site."
                  ),
              })
              .strict()
              .refine(
                (d) =>
                  [
                    d.list_301_redirects,
                    d.create_301_redirect,
                    d.update_301_redirect,
                    d.delete_301_redirect,
                    d.get_robots_txt,
                    d.update_robots_txt,
                    d.replace_robots_txt,
                    d.delete_robots_txt,
                    d.add_well_known_file,
                    d.remove_well_known_files,
                  ].filter(Boolean).length >= 1,
                {
                  message:
                    "Provide at least one of list_301_redirects, create_301_redirect, update_301_redirect, delete_301_redirect, get_robots_txt, update_robots_txt, replace_robots_txt, delete_robots_txt, add_well_known_file, remove_well_known_files.",
                }
              )
          )
          .min(1)
          .describe("The actions to perform on the enterprise tool."),
      },
    },
    async ({ actions }) => {
      const result: Content[] = [];
      try {
        for (const action of actions) {
          if (action.list_301_redirects) {
            const content = await list301Redirects(action.list_301_redirects);
            result.push(textContent(content));
          }
          if (action.create_301_redirect) {
            const content = await create301Redirect(action.create_301_redirect);
            result.push(textContent(content));
          }
          if (action.update_301_redirect) {
            const content = await update301Redirect(action.update_301_redirect);
            result.push(textContent(content));
          }
          if (action.delete_301_redirect) {
            const content = await delete301Redirect(action.delete_301_redirect);
            result.push(textContent(content));
          }
          if (action.get_robots_txt) {
            const content = await getRobotsDotTxt(action.get_robots_txt);
            result.push(textContent(content));
          }
          if (action.update_robots_txt) {
            const content = await updateRobotsDotTxt(action.update_robots_txt);
            result.push(textContent(content));
          }
          if (action.replace_robots_txt) {
            const content = await replaceRobotsDotTxt(
              action.replace_robots_txt
            );
            result.push(textContent(content));
          }
          if (action.delete_robots_txt) {
            const content = await deleteRobotsDotTxt(action.delete_robots_txt);
            result.push(textContent(content));
          }
          if (action.add_well_known_file) {
            const content = await addWellKnownFile(action.add_well_known_file);
            result.push(textContent(content));
          }
          if (action.remove_well_known_files) {
            const content = await removeWellKnownFiles(
              action.remove_well_known_files
            );
            result.push(textContent(content));
          }
        }
        return toolResponse(result);
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
}
