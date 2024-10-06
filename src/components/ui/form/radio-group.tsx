import {
  RadioGroup,
  RadioGroupErrorMessage,
  RadioGroupItem,
  RadioGroupItemControl,
  type RadioGroupItemControlProps,
  RadioGroupItemInput,
  type RadioGroupItemInputProps,
  RadioGroupItemLabel,
  type RadioGroupItemLabelProps,
  RadioGroupLabel,
  type RadioGroupProps,
} from "@/components/ui/radio-group";
import { For, Show, splitProps } from "solid-js";
import type { SplitProps } from ".";

type Option = {
  label: string;
  value: string;
};

export type FormRadioGroupProps = RadioGroupProps & {
  options: Option[];
} & RadioGroupItemInputProps &
  RadioGroupItemControlProps &
  RadioGroupItemLabelProps & {
    // validation props
    error: string;
    // label props
    label?: string | undefined;
  };

export function FormRadioGroup(props: FormRadioGroupProps) {
  const [rootProps, itemInputProps, itemControlProps, itemLabelProps, rest] =
    splitProps(
      props as FormRadioGroupProps,
      // Root
      ["name", "value", "required", "disabled"] as SplitProps<RadioGroupProps>,
      // Item input
      [
        "ref",
        "onInput",
        "onChange",
        "onBlur",
      ] as SplitProps<RadioGroupItemInputProps>,
      // Item control
      ["id", "onClick", "onKeyDown"] as SplitProps<RadioGroupItemControlProps>,
      // Item label
      ["id", "ref"] as SplitProps<RadioGroupItemLabelProps>,
    );

  return (
    <RadioGroup
      {...rootProps}
      validationState={rest.error ? "invalid" : "valid"}
    >
      <Show when={rest.label}>
        <RadioGroupLabel>{rest.label}</RadioGroupLabel>
      </Show>
      <div>
        <For each={rest.options}>
          {(option) => (
            <RadioGroupItem value={option.value}>
              <RadioGroupItemInput {...itemInputProps} />
              <RadioGroupItemControl {...itemControlProps} />
              <RadioGroupItemLabel {...itemLabelProps}>
                {option.label}
              </RadioGroupItemLabel>
            </RadioGroupItem>
          )}
        </For>
      </div>
      <RadioGroupErrorMessage>{rest.error}</RadioGroupErrorMessage>
    </RadioGroup>
  );
}
