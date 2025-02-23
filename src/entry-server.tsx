// @refresh reload

import { ThemeHeaderScript } from "@/components/core/theme";
import { nanoid } from "@/lib/nanoid";
import { StartServer, createHandler } from "@solidjs/start/server";

import NoScript from "@/components/core/noscript";

export default createHandler(
  () => (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html
          lang="en"
          class="scheme-light dark:scheme-dark h-full w-full"
          style={{ "color-scheme": "dark" }}
          data-mode="dark"
        >
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <link rel="icon" href="/favicon.ico" />
            <ThemeHeaderScript />
            {assets}
          </head>
          <body class="flex h-full min-h-svh w-full flex-col bg-background font-sans text-base antialiased">
            <NoScript />
            <div class="relative flex min-h-svh flex-1 flex-col" id="app">
              {children}
            </div>
            {scripts}
          </body>
        </html>
      )}
    />
  ),
  () => {
    const nonce = nanoid(36);
    return { nonce };
  },
);
