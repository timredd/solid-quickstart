import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  type SelectContentProps,
  SelectErrorMessage,
  SelectHiddenSelect,
  type SelectHiddenSelectProps,
  SelectItem,
  SelectLabel,
  type SelectProps,
  SelectTrigger,
  type SelectTriggerProps,
  SelectValue,
} from "@/components/ui/select";
import { Show, createEffect, createSignal, on, splitProps } from "solid-js";

import type { SelectMultipleSelectionOptions } from "@kobalte/core/select";
import type { SplitProps } from ".";

type Option = {
  label: string;
  value: string;
};

type SelectRootSingleProps<TOption extends Option> = Exclude<
  SelectProps<TOption>,
  SelectMultipleSelectionOptions<TOption>
>;

export type FormSelectProps<TOption extends Option> =
  SelectRootSingleProps<TOption> & {
    options: TOption[];
  } & SelectHiddenSelectProps &
    SelectTriggerProps &
    SelectContentProps & {
      label?: string | undefined;
      error: string;
    };

export function FormSelect<TOption extends Option>(
  props: FormSelectProps<TOption>,
) {
  const [rootProps, selectProps, triggerProps, contentProps, rest] = splitProps(
    props as FormSelectProps<TOption>,
    // Root
    ["name", "placeholder", "options", "required", "disabled"] as SplitProps<
      SelectRootSingleProps<TOption>
    >,
    // Select
    [
      "ref",
      "placeholder",
      "onInput",
      "onChange",
      "onBlur",
    ] as SplitProps<SelectHiddenSelectProps>,
    // Trigger
    ["disabled"] as SplitProps<SelectTriggerProps>,
    // Content
    [
      "onCloseAutoFocus",
      "onInteractOutside",
      "onPointerDownOutside",
      "onFocusOutside",
    ] as SplitProps<SelectContentProps>,
  );

  const [getValue, setValue] = createSignal<TOption>();

  createEffect(
    on(
      () => props.value,
      (newValue) => {
        return setValue(() => {
          return props.options.find((option) => option.value === newValue);
        });
      },
    ),
    props.value,
    { name: "FormSelect" },
  );

  return (
    <Select<TOption>
      {...rootProps}
      multiple={false}
      value={getValue()}
      onChange={setValue}
      optionValue="value"
      optionTextValue="label"
      // optionTextValue={(option) => toTitlecase(option?.label)}
      itemComponent={(props) => (
        <SelectItem {...props}>{props.item.textValue}</SelectItem>
      )}
      validationState={rest.error ? "invalid" : "valid"}
    >
      <Show when={rest.label}>
        <SelectLabel as={Label}>{rest.label}</SelectLabel>
      </Show>
      <SelectHiddenSelect {...selectProps} />
      <SelectTrigger {...triggerProps}>
        <SelectValue<TOption>>
          {(state) => state.selectedOption().label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent {...contentProps} />
      <SelectErrorMessage>{props.error}</SelectErrorMessage>
    </Select>
  );
}
