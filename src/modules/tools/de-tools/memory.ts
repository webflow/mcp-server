import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";
import { withCommonDesignerRules } from "../../../utils/withCommonDesignerRules";

export const initMemoryTool = (
  server: McpServer,
  env: Env
) => {
  // We are storing our memory using entities, relations, and observations in a graph structure
  interface Entity {
    name: string;
    entityType: string;
    observations: string[];
  }

  interface Relation {
    from: string;
    to: string;
    relationType: string;
  }

  interface KnowledgeGraph {
    entities: Entity[];
    relations: Relation[];
  }
  //get key for memory
  const getKey = (siteId: string) => {
    return `${siteId}-memory`;
  };

  // The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
  class KnowledgeGraphManager {
    private async loadGraph(
      siteId: string
    ): Promise<KnowledgeGraph> {
      try {
        const data =
          (await env.WFDesignerKV.get(
            getKey(siteId),
            "text"
          )) || "";
        const lines = data
          .split("\n")
          .filter((line) => line.trim() !== "");
        return lines.reduce(
          (graph: KnowledgeGraph, line) => {
            const item = JSON.parse(line);
            if (item.type === "entity")
              graph.entities.push(item as Entity);
            if (item.type === "relation")
              graph.relations.push(item as Relation);
            return graph;
          },
          { entities: [], relations: [] }
        );
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          (error as any).code === "ENOENT"
        ) {
          return { entities: [], relations: [] };
        }
        throw error;
      }
    }

    private async saveGraph(
      siteId: string,
      graph: KnowledgeGraph
    ): Promise<void> {
      const lines = [
        ...graph.entities.map((e) =>
          JSON.stringify({ type: "entity", ...e })
        ),
        ...graph.relations.map((r) =>
          JSON.stringify({ type: "relation", ...r })
        ),
      ];
      await env.WFDesignerKV.put(
        getKey(siteId),
        lines.join("\n"),
        {
          expirationTtl: 60 * 60 * 24 * 30, // 30 days
        }
      );
    }

    async createEntities(
      siteId: string,
      entities: Entity[]
    ): Promise<Entity[]> {
      const graph = await this.loadGraph(siteId);
      const newEntities = entities.filter(
        (e) =>
          !graph.entities.some(
            (existingEntity) =>
              existingEntity.name === e.name
          )
      );
      graph.entities.push(...newEntities);
      await this.saveGraph(siteId, graph);
      return newEntities;
    }

    async createRelations(
      siteId: string,
      relations: Relation[]
    ): Promise<Relation[]> {
      const graph = await this.loadGraph(siteId);
      const newRelations = relations.filter(
        (r) =>
          !graph.relations.some(
            (existingRelation) =>
              existingRelation.from === r.from &&
              existingRelation.to === r.to &&
              existingRelation.relationType ===
                r.relationType
          )
      );
      graph.relations.push(...newRelations);
      await this.saveGraph(siteId, graph);
      return newRelations;
    }

    async addObservations(
      siteId: string,
      observations: {
        entityName: string;
        contents: string[];
      }[]
    ): Promise<
      { entityName: string; addedObservations: string[] }[]
    > {
      const graph = await this.loadGraph(siteId);
      const results = observations.map((o) => {
        const entity = graph.entities.find(
          (e) => e.name === o.entityName
        );
        if (!entity) {
          throw new Error(
            `Entity with name ${o.entityName} not found`
          );
        }
        const newObservations = o.contents.filter(
          (content) =>
            !entity.observations.includes(content)
        );
        entity.observations.push(...newObservations);
        return {
          entityName: o.entityName,
          addedObservations: newObservations,
        };
      });
      await this.saveGraph(siteId, graph);
      return results;
    }

    async deleteEntities(
      siteId: string,
      entityNames: string[]
    ): Promise<void> {
      const graph = await this.loadGraph(siteId);
      graph.entities = graph.entities.filter(
        (e) => !entityNames.includes(e.name)
      );
      graph.relations = graph.relations.filter(
        (r) =>
          !entityNames.includes(r.from) &&
          !entityNames.includes(r.to)
      );
      await this.saveGraph(siteId, graph);
    }

    async deleteObservations(
      siteId: string,
      deletions: {
        entityName: string;
        observations: string[];
      }[]
    ): Promise<void> {
      const graph = await this.loadGraph(siteId);
      deletions.forEach((d) => {
        const entity = graph.entities.find(
          (e) => e.name === d.entityName
        );
        if (entity) {
          entity.observations = entity.observations.filter(
            (o) => !d.observations.includes(o)
          );
        }
      });
      await this.saveGraph(siteId, graph);
    }

    async deleteRelations(
      siteId: string,
      relations: Relation[]
    ): Promise<void> {
      const graph = await this.loadGraph(siteId);
      graph.relations = graph.relations.filter(
        (r) =>
          !relations.some(
            (delRelation) =>
              r.from === delRelation.from &&
              r.to === delRelation.to &&
              r.relationType === delRelation.relationType
          )
      );
      await this.saveGraph(siteId, graph);
    }

    async readGraph(
      siteId: string
    ): Promise<KnowledgeGraph> {
      return this.loadGraph(siteId);
    }

    // Very basic search function
    async searchNodes(
      siteId: string,
      query: string
    ): Promise<KnowledgeGraph> {
      const graph = await this.loadGraph(siteId);

      // Filter entities
      const filteredEntities = graph.entities.filter(
        (e) =>
          e.name
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          e.entityType
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          e.observations.some((o) =>
            o.toLowerCase().includes(query.toLowerCase())
          )
      );

      // Create a Set of filtered entity names for quick lookup
      const filteredEntityNames = new Set(
        filteredEntities.map((e) => e.name)
      );

      // Filter relations to only include those between filtered entities
      const filteredRelations = graph.relations.filter(
        (r) =>
          filteredEntityNames.has(r.from) &&
          filteredEntityNames.has(r.to)
      );

      const filteredGraph: KnowledgeGraph = {
        entities: filteredEntities,
        relations: filteredRelations,
      };

      return filteredGraph;
    }

    async openNodes(
      siteId: string,
      names: string[]
    ): Promise<KnowledgeGraph> {
      const graph = await this.loadGraph(siteId);

      // Filter entities
      const filteredEntities = graph.entities.filter((e) =>
        names.includes(e.name)
      );

      // Create a Set of filtered entity names for quick lookup
      const filteredEntityNames = new Set(
        filteredEntities.map((e) => e.name)
      );

      // Filter relations to only include those between filtered entities
      const filteredRelations = graph.relations.filter(
        (r) =>
          filteredEntityNames.has(r.from) &&
          filteredEntityNames.has(r.to)
      );

      const filteredGraph: KnowledgeGraph = {
        entities: filteredEntities,
        relations: filteredRelations,
      };

      return filteredGraph;
    }
  }

  const knowledgeGraphManager = new KnowledgeGraphManager();
  server.tool(
    "create_entities",
    withCommonDesignerRules(
      "Create new entities in the knowledge graph to represent key concepts, elements, pages, styles, assets, user preferences, or important context related to the current Webflow project, the ongoing task, or general user instructions. Use this proactively to structure information discovered or provided. ALWAYS consider creating an entity (e.g., 'UserPreferences', 'SessionInfo', 'TaskContext') when the user provides instructions or context using phrases like 'remember this', 'keep this in mind', 'for this task'."
    ),
    {
      siteId: z
        .string()
        .describe("The site ID to create the entities for"),
      entities: z.array(
        z.object({
          name: z
            .string()
            .describe("The name of the entity"),
          entityType: z
            .string()
            .describe("The type of the entity"),
          observations: z
            .array(z.string())
            .describe(
              "An array of observation contents associated with the entity"
            ),
        })
      ),
    },
    async ({ siteId, entities }) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.createEntities(
                siteId,
                entities as Entity[]
              ),
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "create_relations",
    withCommonDesignerRules(
      "Create new relations between entities in the knowledge graph to represent connections and relationships (e.g., 'element HAS_STYLE style', 'page CONTAINS element', 'user PREFERS setting'). Relations should typically be in active voice. Use this to link site elements, styles, pages, user preferences, task steps, or other stored entities. Ensure relations accurately reflect the connections within the Webflow site, the task context, or user-provided information."
    ),
    {
      siteId: z
        .string()
        .describe(
          "The site ID to create the relations for"
        ),
      relations: z.array(
        z.object({
          from: z
            .string()
            .describe(
              "The name of the entity where the relation starts"
            ),
          to: z
            .string()
            .describe(
              "The name of the entity where the relation ends"
            ),
          relationType: z
            .string()
            .describe("The type of the relation"),
        })
      ),
    },
    async ({ siteId, relations }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await knowledgeGraphManager.createRelations(
              siteId,
              relations as Relation[]
            ),
            null,
            2
          ),
        },
      ],
    })
  );

  server.tool(
    "add_observations",
    withCommonDesignerRules(
      "Add specific details, facts, or instructions as observations to existing entities. Observations can be site-specific data (e.g., element ID 'abc', style property 'color: red'), task progress notes ('Step 1 complete'), or general user instructions/preferences ('always use button class'). Actively use this to enrich entities with relevant information as it arises or is discovered. If the user asks to 'remember' something that relates to an existing concept/entity, add it as an observation to that entity."
    ),
    {
      siteId: z
        .string()
        .describe(
          "The site ID to add the observations for"
        ),
      observations: z.array(
        z.object({
          entityName: z
            .string()
            .describe(
              "The name of the entity to add the observations to"
            ),
          contents: z
            .array(z.string())
            .describe(
              "An array of observation contents to add"
            ),
        })
      ),
    },
    async ({ siteId, observations }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await knowledgeGraphManager.addObservations(
              siteId,
              observations as {
                entityName: string;
                contents: string[];
              }[]
            ),
            null,
            2
          ),
        },
      ],
    })
  );

  server.tool(
    "delete_entities",
    withCommonDesignerRules(
      "Delete entities and their associated relations from the knowledge graph when they are no longer relevant, outdated, confirmed to be incorrect, or explicitly requested for removal. This helps keep the graph focused and accurate regarding the current state of the Webflow site, task, or known instructions."
    ),
    {
      siteId: z
        .string()
        .describe("The site ID to delete the entities for"),
      entityNames: z
        .array(z.string())
        .describe("An array of entity names to delete"),
    },
    async ({ siteId, entityNames }) => {
      await knowledgeGraphManager.deleteEntities(
        siteId,
        entityNames as string[]
      );
      return {
        content: [
          {
            type: "text",
            text: "Entities deleted successfully",
          },
        ],
      };
    }
  );

  server.tool(
    "delete_observations",
    withCommonDesignerRules(
      "Delete specific observations from entities when the information is incorrect, superseded, no longer needed, or explicitly requested for removal. Use this to maintain the accuracy and relevance of the details stored within the knowledge graph entities."
    ),
    {
      siteId: z
        .string()
        .describe(
          "The site ID to delete the observations for"
        ),
      deletions: z.array(
        z.object({
          entityName: z
            .string()
            .describe(
              "The name of the entity containing the observations"
            ),
          observations: z
            .array(z.string())
            .describe("An array of observations to delete"),
        })
      ),
    },
    async ({ siteId, deletions }) => {
      await knowledgeGraphManager.deleteObservations(
        siteId,
        deletions as {
          entityName: string;
          observations: string[];
        }[]
      );
      return {
        content: [
          {
            type: "text",
            text: "Observations deleted successfully",
          },
        ],
      };
    }
  );

  server.tool(
    "delete_relations",
    withCommonDesignerRules(
      "Delete relations between entities when the connection is no longer valid, has changed, is found to be incorrect, or needs to be removed. This ensures the relationships within the graph accurately reflect the current context or understanding."
    ),
    {
      siteId: z
        .string()
        .describe(
          "The site ID to delete the relations for"
        ),
      relations: z
        .array(
          z.object({
            from: z
              .string()
              .describe(
                "The name of the entity where the relation starts"
              ),
            to: z
              .string()
              .describe(
                "The name of the entity where the relation ends"
              ),
            relationType: z
              .string()
              .describe("The type of the relation"),
          })
        )
        .describe("An array of relations to delete"),
    },
    async ({ siteId, relations }) => {
      await knowledgeGraphManager.deleteRelations(
        siteId,
        relations as Relation[]
      );
      return {
        content: [
          {
            type: "text",
            text: "Relations deleted successfully",
          },
        ],
      };
    }
  );
  server.tool(
    "read_graph",
    withCommonDesignerRules(
      " Read the entire knowledge graph to get a complete overview of all stored entities, relations, and observations. Use this proactively at the start of complex tasks, when needing to recall previously stored user instructions or preferences, or when needing to refresh context about the site structure or task history. This is key to leveraging remembered information effectively."
    ),
    {
      siteId: z
        .string()
        .describe("The site ID to read the graph for"),
    },
    async ({ siteId }) => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.readGraph(siteId),
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "search_nodes",
    withCommonDesignerRules(
      "Search for nodes (entities) in the knowledge graph based on a query. Use this proactively to find relevant stored information before taking action or answering questions. Search not only for site elements (names, types) but also for stored user preferences, instructions, task context, or specific observations using relevant keywords (e.g., search for 'button preference', 'user instructions', 'task details', or specific style properties). This is crucial for recalling previously stored context or instructions. The query should target information related to the Webflow project, task, or stored preferences."
    ),
    {
      siteId: z
        .string()
        .describe("The site ID to search the graph for"),
      query: z
        .string()
        .describe(
          "The search query to match against entity names, types, and observation content"
        ),
    },
    async ({ siteId, query }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await knowledgeGraphManager.searchNodes(
              siteId,
              query as string
            ),
            null,
            2
          ),
        },
      ],
    })
  );

  server.tool(
    "open_nodes",
    withCommonDesignerRules(
      "Retrieve and display the full details (including observations and relations) of specific nodes in the knowledge graph using their exact names. Use this after identifying relevant nodes (e.g., via search_nodes or prior knowledge) to get complete context. This is essential for accessing the specific details of stored site elements, styles, pages, task steps, or user preferences/instructions (e.g., open 'UserPreferences' if it exists). Ensure the requested node names exist in the graph and are relevant to the current Webflow context or task."
    ),
    {
      siteId: z
        .string()
        .describe("The site ID to open the nodes for"),
      names: z
        .array(z.string())
        .describe("An array of entity names to retrieve"),
    },
    async ({ siteId, names }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await knowledgeGraphManager.openNodes(
              siteId,
              names as string[]
            ),
            null,
            2
          ),
        },
      ],
    })
  );
};
