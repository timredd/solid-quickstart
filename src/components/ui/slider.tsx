import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@kobalte/core/slider";
import { splitProps } from "solid-js";

import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { JSX, ValidComponent } from "solid-js";

export type SliderProps<T extends ValidComponent = "div"> =
  SliderPrimitive.SliderRootProps<T> & {
    class?: string;
  };

export const Slider = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SliderProps<T>>,
) => {
  const [local, others] = splitProps(props as SliderProps, ["class"]);

  return (
    <SliderPrimitive.Root
      class={cn(
        "relative flex w-full touch-none select-none flex-col items-center",
        local.class,
      )}
      {...others}
    />
  );
};

export type SliderTrackProps<T extends ValidComponent = "div"> =
  SliderPrimitive.SliderTrackProps<T> & {
    class?: string;
  };

export const SliderTrack = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SliderTrackProps<T>>,
) => {
  const [local, others] = splitProps(props as SliderTrackProps, ["class"]);

  return (
    <SliderPrimitive.Track
      class={cn(
        "relative h-2 w-full grow rounded-full bg-secondary",
        local.class,
      )}
      {...others}
    />
  );
};

export type SliderFillProps<T extends ValidComponent = "div"> =
  SliderPrimitive.SliderFillProps<T> & {
    class?: string;
  };

export const SliderFill = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SliderFillProps<T>>,
) => {
  const [local, others] = splitProps(props as SliderFillProps, ["class"]);

  return (
    <SliderPrimitive.Fill
      class={cn("absolute h-full rounded-full bg-primary", local.class)}
      {...others}
    />
  );
};

export type SliderThumbProps<T extends ValidComponent = "span"> =
  SliderPrimitive.SliderThumbProps<T> & {
    class?: string;
    children?: JSX.Element;
  };

export const SliderThumb = <T extends ValidComponent = "span">(
  props: PolymorphicProps<T, SliderThumbProps<T>>,
) => {
  const [local, others] = splitProps(props as SliderThumbProps, [
    "class",
    "children",
  ]);

  return (
    <SliderPrimitive.Thumb
      class={cn(
        "top-[-6px] block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        local.class,
      )}
      {...others}
    >
      <SliderPrimitive.Input />
    </SliderPrimitive.Thumb>
  );
};

export const SliderLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, SliderPrimitive.SliderLabelProps<T>>,
) => {
  return <SliderPrimitive.Label as={Label} {...props} />;
};

export const SliderValueLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, SliderPrimitive.SliderValueLabelProps<T>>,
) => {
  return <SliderPrimitive.ValueLabel as={Label} {...props} />;
};
