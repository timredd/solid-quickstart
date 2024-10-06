import { cn } from "@/lib/utils";
import { type ComponentProps, splitProps } from "solid-js";

export default function RootLayout(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["children", "class"]);

  return (
    <div class={cn("flex min-h-dvh flex-col", local.class)} {...rest}>
      <div class="relative mx-auto flex w-full max-w-screen-lg grow flex-col gap-8 px-6 py-8 md:gap-10 md:py-10 lg:gap-12 lg:px-8 lg:py-12">
        {local.children}
      </div>
    </div>
  );
}
