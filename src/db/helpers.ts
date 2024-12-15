import { asc, desc } from "drizzle-orm";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import * as v from "valibot";

export const OrderBySchema = v.picklist(["asc", "desc"]);

export type OrderBy = v.InferOutput<typeof OrderBySchema>;

export const SortBySchema = v.picklist(["id", "created", "updated"]);

export type SortBy = v.InferOutput<typeof SortBySchema>;

export const PageSchema = v.object({
  data: v.array(v.unknown()),
  total: v.number(),
  hasMore: v.boolean(),
});

export interface Page<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface Paging {
  page: number;
  pageSize: number;
}

export const PaginationSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1)), 10),
  search: v.optional(v.string()),
  order: v.optional(OrderBySchema, "asc"),
  sort: v.optional(SortBySchema, "id"),
});

export type Pagination = v.InferInput<typeof PaginationSchema>;

const withOrder = <T>(
  table: SQLiteTableWithColumns<any>,
  orderBy?: OrderBy,
  sortBy?: SortBy,
) => {
  if (!orderBy || !sortBy) {
    return undefined;
  }

  if (orderBy === "asc") {
    return [asc(table[sortBy])];
  }
  return [desc(table[sortBy])];
};

// type findFirst<
//   TSelection extends Omit<
//     DBQueryConfig<"many", true, TSchema, TFields>,
//     "limit"
//   >,
// > = KnownKeysOnly<
//   TSelection,
//   Omit<DBQueryConfig<"many", true, TSchema, TFields>, "limit">
// >;
// // : SQLiteRelationalQueryKind<TMode, BuildQueryResult<TSchema, TFields, TSelection> | undefined>;
//
// export interface Config<T> extends KnownKeysOnly<SQLiteSelect, Database> {
//   criteria?: Partial<T>;
//   order?: OrderBy;
//   paging?: Paging;
//   limit?: number;
//   offset?: number;
//   with?: Record<string, any>;
// }
//
// export interface IRepository<
//   TSchema extends TablesRelationalConfig,
//   TFields extends TableRelationalConfig,
// > {
//   findFirst(
//     criteria: Partial<T>,
//     config?: DBQueryConfig<"one", true, TSchema, TFields>,
//   ): Promise<T>;
//   findMany(config?: Config<T>): Promise<T[]>;
//   findPage(config?: Config<T>): Promise<Page<T>>;
//   create(createWith: TI): Promise<T>;
//   update(id: string, updateWith: TI): Promise<T>;
//   delete(id: string): Promise<T>;
// }
//
// class Repository<
//   TSchema extends TablesRelationalConfig,
//   TFields extends TableRelationalConfig,
//   T,
//   TI,
// > implements IRepository<TSchema, TFields>
// {
//   #db: Database;
//
//   constructor(db: Database, tableName: ExtractTablesWithRelations<TSchema>) {
//     this.#db = db;
//     this.table = tableName;
//   }
//
//   async findFirst(
//     criteria: Partial<T>,
//     config?: DBQueryConfig<"one", true, TSchema, TFields>,
//   ): Promise<T> {
//     return this.#db.query[this.table].findFirst({
//       where: criteria,
//       ...config,
//     });
//   }
//
//   async findMany(config?: Config<T>): Promise<T[]> {
//     return this.db.query[this.table].findMany(config);
//   }
//
//   async findPage(config?: Config<T>): Promise<Page<T>> {
//     const { paging } = config;
//     const limit = paging?.pageSize || 10;
//     const offset = (paging?.page || 1) * limit - limit;
//
//     const data = await this.findMany({
//       ...config,
//       limit,
//       offset,
//     });
//
//     const total = await this.db.query[this.table].count({
//       where: config.criteria,
//     });
//
//     return {
//       data,
//       total,
//       hasMore: data.length < total,
//     };
//   }
//
//   async create(createWith: TI): Promise<T> {
//     return this.db.query[this.table].insertOne(createWith);
//   }
//
//   async update(id: string, updateWith: TI): Promise<T> {
//     return this.db.query[this.table].updateOne({
//       where: { id },
//       data: updateWith,
//     });
//   }
//
//   async delete(id: string): Promise<T> {
//     return this.db.query[this.table].deleteOne({
//       where: { id },
//     });
//   }
// }
