import { cn } from "@/lib/utils";
import * as ToggleButtonPrimitive from "@kobalte/core/toggle-button";
import { cva } from "cva";
import { splitProps } from "solid-js";

import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "cva";
import type { ValidComponent } from "solid-js";

export const toggleVariants = cva({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-[box-shadow,color,background-color] hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-accent data-[pressed]:text-accent-foreground",
  variants: {
    variant: {
      default: "bg-transparent",
      outline:
        "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-9 px-3",
      sm: "h-8 px-2",
      lg: "h-10 px-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ToggleVariants = VariantProps<typeof toggleVariants>;

export type ToggleProps<T extends ValidComponent = "button"> =
  ToggleButtonPrimitive.ToggleButtonRootProps<T> &
    ToggleVariants & {
      class?: string;
    };

export const Toggle = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ToggleProps<T>>,
) => {
  const [local, rest] = splitProps(props as ToggleProps, [
    "class",
    "variant",
    "size",
  ]);

  return (
    <ToggleButtonPrimitive.Root
      class={cn(
        toggleVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      {...rest}
    />
  );
};
