import { drizzle } from "drizzle-orm/d1";
import { siteAuth, userAuth } from "./schema";

export const getDB = (env: Env) => {
  const dbInstance = drizzle(env.DB, {
    schema: {
      siteAuth,
      userAuth,
    },
  });

  return dbInstance;
};

export type DBType = ReturnType<typeof getDB>;
