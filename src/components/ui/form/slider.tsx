import {
  Slider,
  SliderFill,
  type SliderFillProps,
  SliderLabel,
  type SliderProps,
  SliderThumb,
  type SliderThumbProps,
  SliderTrack,
  type SliderTrackProps,
  SliderValueLabel,
} from "@/components/ui/slider";
import { For, Show, splitProps } from "solid-js";
import type { SplitProps } from ".";

export type FormSliderProps = SliderProps &
  SliderFillProps &
  SliderTrackProps &
  SliderThumbProps & {
    // validation props
    error: string;
    // label props
    label: string;
  };

export function FormSlider(props: FormSliderProps) {
  const [rootProps, trackProps, thumbProps, rest] = splitProps(
    props as FormSliderProps,
    // Root
    [
      "name",
      "value",
      "required",
      "disabled",
      "class",
    ] as SplitProps<SliderProps>,
    // Track
    [
      "onPointerUp",
      "onPointerDown",
      "onPointerMove",
    ] as SplitProps<SliderTrackProps>,
    // Thumb
    ["onBlur", "onFocus", "onKeyDown"] as SplitProps<SliderThumbProps>,
  );

  return (
    <Slider {...rootProps} validationState={rest.error ? "invalid" : "valid"}>
      <Show when={rest.label}>
        <SliderLabel>{rest.label}</SliderLabel>
      </Show>
      <SliderTrack {...trackProps}>
        <SliderFill />
        <For each={props.value}>
          {(value) => <SliderThumb value={value} {...thumbProps} />}
        </For>
      </SliderTrack>
      <SliderValueLabel>{props.value}</SliderValueLabel>
    </Slider>
  );
}
