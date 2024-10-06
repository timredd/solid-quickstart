import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as v from "valibot";

export const ASSET_PATHS = {
  NAME: "FILEPATH",
} as const;

type Asset = keyof typeof ASSET_PATHS;

export const fetchAsset = <TSchema extends v.GenericSchema>(
  schema: TSchema,
  asset: Asset,
): v.InferOutput<TSchema> => {
  const assetPath = ASSET_PATHS[asset];
  const data = readFileSync(resolve(assetPath), "utf-8");

  return v.parse(schema, data) as v.InferOutput<typeof schema>;
};

export const fetchJsonAsset = <TSchema extends v.GenericSchema>(
  schema: TSchema,
  asset: Asset,
): v.InferOutput<TSchema> => {
  return fetchAsset(v.pipe(v.string(), v.transform(JSON.parse), schema), asset);
};
