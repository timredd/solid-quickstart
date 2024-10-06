import { Button, type ButtonProps } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-solid";
import { Show, splitProps } from "solid-js";

import type { FieldValues, FormStore } from "@modular-forms/solid";
import type { ComponentProps } from "solid-js";
import type { SplitProps } from ".";

export type FormSubmitButtonProps<TFieldValues extends FieldValues> =
  ComponentProps<"div"> &
    ButtonProps & {
      form?: FormStore<TFieldValues>;
      // validation props
      error: string;
      // label props
      label?: string;
    };

export const FormSubmitButton = <TFieldValues extends FieldValues>(
  props: FormSubmitButtonProps<TFieldValues>,
) => {
  const [rootProps, buttonProps, rest] = splitProps(
    props as FormSubmitButtonProps<TFieldValues>,
    // Root
    ["class"] as SplitProps<ComponentProps<"div">>,
    // Button
    [
      "name",
      "value",
      "required",
      "disabled",
      "type",
      "variant",
      "size",
    ] as SplitProps<ButtonProps>,
  );

  return (
    <div {...rootProps}>
      <Show when={rest.label}>
        <Label>{rest.label}</Label>
      </Show>
      <Button
        {...buttonProps}
        disabled={buttonProps.disabled || rest.form?.submitting}
        validationState={rest.error ? "invalid" : "valid"}
      >
        <span classList={{ "opacity-0": props.form?.submitting }}>
          {props.children}
        </span>
        <Show when={props.form?.submitting}>
          <div class="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
            <Loader2Icon class="h-4 w-4 animate-spin" />
          </div>
        </Show>
      </Button>
      <Show when={props.form?.invalid}>
        <Label>{rest.error}</Label>
      </Show>
    </div>
  );
};
