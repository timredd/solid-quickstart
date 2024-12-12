import * as v from "valibot";

import type { InsertUserSchema, SelectUserSchema } from "@/db/schemas/auth";

export type NewUser = v.InferOutput<typeof InsertUserSchema>;
export type User = v.InferOutput<typeof SelectUserSchema>;

export type SuccessResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? object : { data: T });

export type ErrorResponse = {
  success: false;
  error: string;
  isFormError?: boolean;
};

export type PaginatedResponse<T> = SuccessResponse<T> & {
  pagination: {
    page: number;
    totalPages: number;
  };
};

export const LoginSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(31),
    v.regex(/^[a-zA-Z0-9_]+$/),
  ),
  password: v.pipe(v.string(), v.minLength(3), v.maxLength(255)),
});

export const SortBySchema = v.picklist(["points", "recent"]);

export const OrderBySchema = v.picklist(["asc", "desc"]);

export const PaginationSchema = v.object({
  limit: v.pipe(v.unknown(), v.optional(v.number(), 10)),
  page: v.pipe(v.unknown(), v.optional(v.number(), 1)),
  sortBy: v.optional(SortBySchema, "points"),
  orderBy: v.optional(OrderBySchema, "desc"),
  author: v.optional(v.string()),
  site: v.optional(v.string()),
});
