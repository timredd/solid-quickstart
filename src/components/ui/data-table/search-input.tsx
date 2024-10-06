import { TextField } from "@/components/ui/textfield";
import { cn } from "@/lib/utils";
import { createMemo, splitProps } from "solid-js";

import type { TextFieldInputProps } from "@/components/ui/textfield";
import type { Table } from "@tanstack/solid-table";
import type { ValidComponent } from "solid-js";

export type DataTableSearchInputProps<
  TData,
  T extends ValidComponent = "input",
> = TextFieldInputProps<T> & {
  table: Table<TData>;
};

export const DataTableSearchInput = <TData, T extends ValidComponent = "input">(
  props: DataTableSearchInputProps<TData, T>,
) => {
  const [local, rest] = splitProps(props as DataTableSearchInputProps<TData>, [
    "class",
    "table",
  ]);

  const table = createMemo(() => local.table);

  return (
    <TextField
      type="text"
      class={cn("h-8", local.class)}
      value={(table().getColumn("title")?.getFilterValue() as string) ?? ""}
      onInput={(e) =>
        table().getColumn("title")?.setFilterValue(e.currentTarget.value)
      }
      {...rest}
    />
  );
};
