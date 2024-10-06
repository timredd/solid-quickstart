import { Label } from "@/components/ui/label";
import {
  TextField,
  TextFieldErrorMessage,
  type TextFieldInputProps,
  TextFieldLabel,
  type TextFieldProps,
  type TextFieldTextAreaProps,
} from "@/components/ui/textfield";
import { Show, type ValidComponent, splitProps } from "solid-js";
import type { SplitProps } from ".";
import { Input } from "../input";
import { TextArea } from "../textarea";

type DiscriminatedInputProps<T extends ValidComponent = "input"> =
  | (TextFieldInputProps<T> & {
      multiline?: false;
    })
  | (TextFieldTextAreaProps<T> & {
      multiline: true;
    });

export type FormTextFieldProps<T extends ValidComponent = "input"> =
  TextFieldProps &
    DiscriminatedInputProps<T> & {
      // validation props
      error: string;
      // label props
      label: string;
    };

export const FormTextField = <T extends ValidComponent = "input">(
  props: FormTextFieldProps<T>,
) => {
  const [rootProps, inputProps, rest] = splitProps(
    props as FormTextFieldProps,
    // Root
    [
      "name",
      "value",
      "required",
      "disabled",
      "class",
    ] as SplitProps<TextFieldProps>,
    // Input
    [
      "multiline",
      "placeholder",
      "ref",
      "onInput",
      "onChange",
      "onBlur",
    ] as SplitProps<DiscriminatedInputProps<T>>,
  );

  return (
    <TextField
      {...rootProps}
      validationState={rest.error ? "invalid" : "valid"}
    >
      <Show when={rest.label}>
        <TextFieldLabel as={Label}>{rest.label}</TextFieldLabel>
      </Show>
      <Show when={inputProps.multiline} fallback={<Input {...inputProps} />}>
        <TextArea {...inputProps} />
      </Show>
      <TextFieldErrorMessage>{rest.error}</TextFieldErrorMessage>
    </TextField>
  );
};
