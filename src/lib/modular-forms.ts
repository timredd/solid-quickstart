import * as v from "valibot";

export const createFieldErrorSchema = <T extends v.ObjectEntries>(
  keys: v.ObjectSchema<T, undefined>,
) => {
  return v.object({
    field: v.keyof(keys),
    message: v.string(),
  });
};

export const createFormErrorSchema = <T extends v.ObjectEntries>(
  keys: v.ObjectSchema<T, undefined>,
) => {
  return v.object({
    errors: v.array(createFieldErrorSchema(keys)),
  });
};

export type FormErrorResponse<T extends v.ObjectEntries> = v.InferInput<
  ReturnType<typeof createFormErrorSchema<T>>
>;

export function extractFormErrors<T extends Record<string, any>>(
  keys: T,
  errors: FormErrorResponse<T>,
) {
  const formErrorSchema = createFormErrorSchema(keys);
  const parsed = v.parse(formErrorSchema, errors);
  return parsed.errors;
}
