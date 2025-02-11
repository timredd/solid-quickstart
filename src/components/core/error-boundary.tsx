import { HttpStatusCode } from "@solidjs/start";
import { ErrorBoundary, Show, getRequestEvent, isServer } from "solid-js/web";

import type { FlowProps } from "solid-js";

const captureException = (error: Error) => {
  "use server";

  const event = getRequestEvent();
  if (!event) {
    return;
  }

  console.error(error);
};

interface ErrorBoundaryProps extends FlowProps {}

export default function AppErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      {...props}
      fallback={(error) => {
        if (import.meta.env.DEV) {
          throw error;
        }

        console.error(error);
        captureException(error);

        return (
          <>
            <div class="flex flex-1 items-center justify-center text-xl">
              <Show
                when={!isServer}
                fallback={
                  <>
                    Internal Server Error
                    <HttpStatusCode code={500} />
                  </>
                }
              >
                Uncaught Client Exception
                <HttpStatusCode code={400} />
              </Show>
            </div>
          </>
        );
      }}
    />
  );
}
