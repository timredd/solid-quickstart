import { A } from "@solidjs/router";

import { Button } from "@/components/ui/button";
import { InlineCode } from "@/components/ui/typography";
import { ArrowLeftIcon } from "lucide-solid";
import { type ParentProps, Show, createMemo } from "solid-js";
import { type RequestEvent, getRequestEvent } from "solid-js/web";

export default function NotFoundPage() {
  const errorStatus = createMemo<
    Omit<RequestEvent["response"], "headers"> | undefined
  >(() => {
    const response = getRequestEvent()?.response;
    if (response) {
      const { status = 500, statusText = "Something went wrong" } = response;
      return status >= 400 && status < 600 ? { status, statusText } : undefined;
    }
  });

  return (
    <div class="flex h-full flex-col items-center justify-center space-y-6 p-4 text-center">
      <Show
        when={errorStatus()}
        fallback={
          <StatusText status="500">Something went wrong. Boop.</StatusText>
        }
      >
        {(error) => (
          <StatusText status={error().status?.toString() ?? "500"}>
            {error().statusText}
          </StatusText>
        )}
      </Show>
      <Button as={A} href="/" variant="default" class="mt-4">
        <ArrowLeftIcon class="mr-2 h-4 w-4" />
        Go to home
      </Button>
    </div>
  );
}

function StatusText(
  props: ParentProps<{
    status: string;
  }>,
) {
  return (
    <>
      <h1 class="font-bold text-4xl sm:text-6xl">{props.status}</h1>
      <Show when={props.children}>
        {(statusText) => (
          <InlineCode class="mx-auto max-w-xl text-muted-foreground">
            {JSON.stringify(statusText(), null, 2)}
          </InlineCode>
        )}
      </Show>
    </>
  );
}
