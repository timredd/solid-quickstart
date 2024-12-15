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

export const OrderBySchema = v.picklist(["asc", "desc"]);

export const SortBySchema = v.picklist(["id", "created", "updated"]);

export const PaginationSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1)), 10),
  search: v.optional(v.string()),
  order: v.optional(OrderBySchema, "asc"),
  sort: v.optional(SortBySchema, "id"),
});

export type Pagination = v.InferInput<typeof PaginationSchema>;
