import * as v from "valibot";

export const OrderBySchema = v.picklist(["asc", "desc"]);
export type OrderBy = v.InferOutput<typeof OrderBySchema>;

export const SortBySchema = v.picklist(["id", "created", "updated"]);
export type SortBy = v.InferOutput<typeof SortBySchema>;

export const createPageSchema = <T extends v.GenericSchema>(schema: T) =>
  v.object({
    data: v.array(schema),
    total: v.number(),
    hasMore: v.boolean(),
  });
export type Page<T extends v.GenericSchema> = v.InferInput<
  ReturnType<typeof createPageSchema<T>>
>;

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
