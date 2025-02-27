import { useTheme } from "@/components/core/theme";
import {
  Toaster as Sonner,
  type ToastT as ToasterProps,
  toast as sonner,
} from "solid-sonner";

export const toast = sonner;

export const Toaster = (props?: Partial<ToasterProps>) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme()}
      position="top-right"
      duration={3500}
      richColors={true}
      class="toaster group"
      toastOptions={{
        classes: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};
