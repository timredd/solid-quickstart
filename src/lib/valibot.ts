import * as v from "valibot";

export const QueryParamNumberSchema = v.union([
  v.number(),
  v.pipe(v.string(), v.transform(Number), v.number()),
]);
