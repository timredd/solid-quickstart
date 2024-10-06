import {
  Checkbox,
  CheckboxControl,
  type CheckboxControlProps,
  type CheckboxInputProps,
  CheckboxLabel,
  type CheckboxLabelProps,
  type CheckboxProps,
} from "@/components/ui/checkbox";
import { splitProps } from "solid-js";
import type { SplitProps } from ".";

export type FormCheckboxProps = CheckboxProps &
  CheckboxInputProps &
  CheckboxControlProps &
  CheckboxLabelProps & {
    // validation props
    error: string;
    // label props
    label: string;
  };

export function FormCheckbox(props: FormCheckboxProps) {
  const [rootProps, inputProps, controlProps, labelProps, rest] = splitProps(
    props as FormCheckboxProps,
    // Root
    [
      "name",
      "value",
      "checked",
      "required",
      "disabled",
    ] as SplitProps<CheckboxProps>,
    // Input
    ["ref", "onInput", "onChange", "onBlur"] as SplitProps<CheckboxInputProps>,
    // Control
    ["id", "onClick", "onKeyDown"] as SplitProps<CheckboxControlProps>,
    // Label
    ["id", "ref"] as SplitProps<CheckboxLabelProps>,
  );

  return (
    <Checkbox {...rootProps} validationState={rest.error ? "invalid" : "valid"}>
      <CheckboxControl {...inputProps} {...controlProps} />
      <CheckboxLabel {...labelProps}>{rest.label}</CheckboxLabel>
    </Checkbox>
  );
}
