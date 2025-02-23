import {
  DEFAULT_SIZE as DEFAULT_NANOID_SIZE,
  nanoid as createNanoid,
} from "@/lib/nanoid";
import { customType } from "drizzle-orm/sqlite-core";

export * from "drizzle-orm/sqlite-core";

export const nanoid = customType<{ data: string; notNull: true }>({
  dataType: () => `varchar(${DEFAULT_NANOID_SIZE})`,
  toDriver: () => createNanoid(DEFAULT_NANOID_SIZE),
});

export const nanoidNullable = customType<{ data: string; notNull: false }>({
  dataType: () => `varchar(${DEFAULT_NANOID_SIZE})`,
  toDriver: () => createNanoid(DEFAULT_NANOID_SIZE),
});

export const boolean = customType<{
  data: boolean;
}>({
  dataType: () => "boolean",
  fromDriver: (value) => (typeof value === "boolean" ? value : value === 1),
  toDriver: (value) => (value ? 1 : 0),
});

export const datetime = customType<{
  data: Date;
  driverData: string;
}>({
  dataType: () => "timestamp",
  fromDriver: (value) => new Date(value),
  // toDriver: (value) => value.toISOString(),
});

export const timestamp = customType<{ data: Date; driverData: string }>({
  dataType: () => "timestamp",
  fromDriver: (value) => new Date(value),
  // toDriver: (value) => value.toISOString(),
});

export const array = customType<{ data: string[]; driverData: string }>({
  dataType: () => "array",
  fromDriver: (value) => value.replace(/{|}/g, "").split(","),
  toDriver: (value) => `{${value.join(",")}}`,
});

export const json = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType: () => "json",
    fromDriver: (value: string) => JSON.parse(value),
    toDriver: (value: TData) => JSON.stringify(value),
  })(name);
