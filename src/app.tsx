import { ThemeProvider } from "@/components/core/theme";
import { Toaster } from "@/components/ui/sonner";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import AppErrorBoundary from "@/components/core/error-boundary";

import "./app.css";

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <Router root={(props) => <Suspense>{props.children}</Suspense>}>
          <FileRoutes />
        </Router>
        <Toaster />
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
