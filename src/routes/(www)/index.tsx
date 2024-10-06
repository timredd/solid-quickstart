import type { FlowProps } from "solid-js";

export default function LandingPage(props: FlowProps) {
  return (
    <main class="relative mx-auto flex w-full max-w-screen-lg grow flex-col gap-8 px-6 py-8 md:gap-10 md:py-10 lg:gap-12 lg:px-8 lg:py-12">
      <div
        id="hero"
        class="flex w-full max-w-screen-md grow flex-col items-start justify-center gap-4 pt-12 text-left md:gap-8"
      >
        <h1 class="scroll-m-20 font-extrabold text-3xl tracking-tight">
          Solid(Start) Quickstart
        </h1>
        <h2 class="scroll-m-20 pb-2 font-medium text-2xl tracking-tight first:mt-0">
          Opinionated boilerplate for getting up and running with SolidStart.
        </h2>
      </div>
      {props.children}
    </main>
  );
}
