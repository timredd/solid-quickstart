import { db } from "@/db/client";
import { upper } from "@/lib/drizzle";
import { fn } from "@/lib/utils";
import { QueryParamNumberSchema } from "@/lib/valibot";
import { and, eq, isNotNull, like, or } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";
import { fooTable } from "./foo.sql";

export namespace Foo {
  export const table = fooTable;

  // Schemas
  export const New = createInsertSchema(fooTable);
  export type New = v.InferOutput<typeof New>;
  export const Detail = createSelectSchema(fooTable);
  export type Detail = v.InferOutput<typeof Detail>;

  export const ScopedSchema = v.any();
  export type Scoped = v.InferOutput<typeof ScopedSchema>;

  // Queries

  export const ListParams = v.looseObject({
    search: v.undefinedable(v.string(), ""),
    offset: v.undefinedable(QueryParamNumberSchema, 1),
    limit: v.undefinedable(QueryParamNumberSchema, 10),
  });

  export type ListParams = v.InferOutput<typeof ListParams>;

  export const list = fn(ListParams, (params) => {
    return db.transaction(async (tx) => {
      return tx
        .select() // or .selectDistinct()
        .from(table)
        .where((table) =>
          and(
            isNotNull(table.id),
            or(
              like(table.key, `%${params.search}%`),
              like(table.value, `%${params.search}%`),
            ),
          ),
        )
        .limit(params.limit)
        .offset(params.offset)
        .then((rows) => rows.map(serialize));
    });
  });

  export const ByIdParams = v.pick(Detail, ["id"]);

  export const byId = fn(ByIdParams, (params) => {
    return db.transaction(async (tx) => {
      return tx
        .select() // or .selectDistinct()
        .from(table)
        .where((table) => eq(upper(table.id), params.id.toUpperCase()))
        .then((rows) => rows.map(serialize).at(0));
    });
  });

  export function serialize(row: typeof table.$inferSelect): Detail {
    return {
      id: row.id,
      // ...
    };
  }
}
