import * as v from "valibot";

import { InsertAccountSchema } from "@/db/schema/auth";

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

export const UsernameSchema = v.pipe(
  v.string(),
  v.minLength(3, "Username must be at least 3 characters"),
  v.maxLength(31, "Username must be at most 31 characters"),
  v.regex(
    /^[a-zA-Z0-9_]+$/,
    "Username must only contain letters, numbers, and underscores",
  ),
);

export const EmailSchema = v.pipe(
  v.string(),
  v.transform((email) => email.toLowerCase()),
  v.email("Invalid email"),
);

export const UsernameLoginSchema = v.object({
  username: UsernameSchema,
  password: InsertAccountSchema.entries.passwordHash,
});

export const EmailLoginSchema = v.object({
  email: EmailSchema,
  password: InsertAccountSchema.entries.passwordHash,
});

export const LoginSchema = v.variant("type", [
  v.object({
    type: v.literal("username"),
    username: UsernameLoginSchema,
  }),
  v.object({
    type: v.literal("email"),
    email: EmailLoginSchema,
  }),
]);

export const OrderBySchema = v.picklist(["asc", "desc"]);
export type OrderBy = v.InferOutput<typeof OrderBySchema>;

export const SortBySchema = v.picklist(["id", "created", "updated", "deleted"]);
export type SortBy = v.InferOutput<typeof SortBySchema>;

export const PaginationSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1)), 10),
  search: v.optional(v.string()),
  order: v.optional(OrderBySchema, "asc"),
  sort: v.optional(SortBySchema, "id"),
});

export type Pagination = v.InferInput<typeof PaginationSchema>;
