import { authSchema } from "./auth";

import type { ExtractTablesWithRelations } from "drizzle-orm";

export const schema = {
  ...authSchema,
};

export type Schema = typeof schema;
export type SchemaWithRelations = ExtractTablesWithRelations<Schema>;
