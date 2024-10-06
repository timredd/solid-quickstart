import { cn } from "@/lib/utils";
import * as createCarousel from "embla-carousel-solid";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-solid";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import { Button, type ButtonProps } from "./button";

import { Polymorphic, type PolymorphicProps } from "@kobalte/core";
import type { CreateEmblaCarouselType } from "embla-carousel-solid";
import type {
  Accessor,
  ComponentProps,
  ParentProps,
  Setter,
  ValidComponent,
  VoidProps,
} from "solid-js";

type UseCarouselParameters = Parameters<typeof createCarousel>;
type CarouselOptions = ReturnType<NonNullable<UseCarouselParameters[0]>>;
type CarouselPlugin = ReturnType<NonNullable<UseCarouselParameters[1]>>;

type CarouselRef = NonNullable<ReturnType<CreateEmblaCarouselType[0]>>;
type CarouselApi = NonNullable<ReturnType<CreateEmblaCarouselType[1]>>;

type CarouselOrientation = "horizontal" | "vertical";

export type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  setApi?: Setter<CarouselApi>;
  orientation?: CarouselOrientation;
};

type CarouselContextProps = {
  ref: Setter<CarouselRef | undefined>;
  api: Accessor<CarouselApi | undefined>;
  canScrollPrev: Accessor<boolean>;
  canScrollNext: Accessor<boolean>;
  scrollPrev: () => void;
  scrollNext: () => void;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

export const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
};

export type CarouselProviderProps<T extends ValidComponent = "section"> =
  ParentProps<ComponentProps<T> & CarouselProps>;

export const Carousel = <T extends ValidComponent = "section">(
  props: CarouselProviderProps<T>,
) => {
  const merge = mergeProps({ orientation: "horizontal" }, props);

  const [local, carouselProps, rest] = splitProps(
    merge as CarouselProviderProps,
    // Local
    ["class", "children"],
    // Carousel
    ["orientation", "opts", "plugins", "setApi"],
  );

  const [ref, api] = createCarousel(
    () => ({
      ...carouselProps.opts,
      axis: carouselProps.orientation === "horizontal" ? "x" : "y",
    }),
    () => carouselProps.plugins ?? [],
  );

  const [canScrollPrev, setCanScrollPrev] = createSignal<boolean>(false);
  const [canScrollNext, setCanScrollNext] = createSignal<boolean>(false);

  const onSelect = (api: CarouselApi) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  };

  const scrollPrev = () => api()?.scrollPrev();
  const scrollNext = () => api()?.scrollNext();

  createEffect(
    on(api, function syncApi(api) {
      if (!api || !carouselProps.setApi) return;

      carouselProps.setApi(api);
    }),
  );

  createEffect(
    on(api, (api) => {
      if (api === undefined) return;

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      onCleanup(() => {
        api.off("select", onSelect);
      });
    }),
  );

  const value = createMemo(
    () =>
      ({
        ref,
        api,
        opts: carouselProps.opts,
        orientation:
          carouselProps.orientation ||
          (carouselProps.opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }) satisfies CarouselContextProps,
  );

  return (
    <CarouselContext.Provider value={value()}>
      <section
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollPrev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollNext();
          }
        }}
        class={cn("relative", local.class)}
        role="region"
        aria-roledescription="carousel"
        {...rest}
      >
        {local.children}
      </section>
    </CarouselContext.Provider>
  );
};

export const CarouselContent = (props: ComponentProps<"div">) => {
  const [local, rest] = splitProps(props, ["class"]);

  const carousel = useCarousel();

  return (
    <div ref={carousel.ref} class="overflow-hidden">
      <div
        class={cn(
          "flex",
          carousel.orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          local.class,
        )}
        {...rest}
      />
    </div>
  );
};

export type CarouselItemProps<T extends ValidComponent = "div"> =
  ComponentProps<T>;

export const CarouselItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, CarouselItemProps<T>>,
) => {
  const [local, rest] = splitProps(props as CarouselItemProps, ["class"]);

  const carousel = useCarousel();

  return (
    <Polymorphic
      as="div"
      role="group"
      aria-roledescription="slide"
      class={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        carousel.orientation === "horizontal" ? "pl-4" : "pt-4",
        local.class,
      )}
      {...rest}
    />
  );
};

export type CarouselPreviousButtonProps<T extends ValidComponent = "button"> =
  VoidProps<ButtonProps<T>>;

export const CarouselPrevious = <T extends ValidComponent = "button">(
  props: CarouselPreviousButtonProps<T>,
) => {
  const merge = mergeProps(
    { variant: "outline", size: "icon" } satisfies CarouselPreviousButtonProps,
    props,
  );
  const [local, rest] = splitProps(merge as CarouselPreviousButtonProps, [
    "class",
    "variant",
    "size",
  ]);

  const carousel = useCarousel();

  return (
    <Polymorphic
      as={Button}
      variant={local.variant}
      size={local.size}
      class={cn(
        "absolute h-8 w-8 touch-manipulation rounded-full",
        carousel.orientation === "horizontal"
          ? "-left-12 -translate-y-1/2 top-1/2"
          : "-top-12 -translate-x-1/2 left-1/2 rotate-90",
        local.class,
      )}
      disabled={!carousel.canScrollPrev()}
      onClick={carousel.scrollPrev}
      {...rest}
    >
      <ArrowLeftIcon class="size-4">
        <title>Previous</title>
      </ArrowLeftIcon>
    </Polymorphic>
  );
};

export type CarouselNextButtonProps<T extends ValidComponent = "button"> =
  VoidProps<ButtonProps<T>>;

export const CarouselNextButton = <T extends ValidComponent = "button">(
  props: CarouselNextButtonProps<T>,
) => {
  const merge = mergeProps(
    { variant: "outline", size: "icon" } satisfies CarouselNextButtonProps,
    props,
  );
  const [local, rest] = splitProps(merge as CarouselNextButtonProps, [
    "class",
    "variant",
    "size",
  ]);

  const carousel = useCarousel();

  return (
    <Polymorphic
      as={Button}
      variant={local.variant}
      size={local.size}
      class={cn(
        "absolute h-8 w-8 touch-manipulation rounded-full",
        carousel.orientation === "horizontal"
          ? "-right-12 -translate-y-1/2 top-1/2"
          : "-bottom-12 -translate-x-1/2 left-1/2 rotate-90",
        local.class,
      )}
      disabled={!carousel.canScrollNext()}
      onClick={carousel.scrollNext}
      {...rest}
    >
      <ArrowRightIcon class="size-4">
        <title>Next</title>
      </ArrowRightIcon>
    </Polymorphic>
  );
};
