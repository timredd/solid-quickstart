// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: Required
mount(() => <StartClient />, document.getElementById("app")!);
