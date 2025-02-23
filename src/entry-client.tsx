// @refresh reload

import { StartClient, mount } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: Entry point
mount(() => <StartClient />, document.getElementById("app")!);
