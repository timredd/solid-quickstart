import { useTheme } from "@/components/core/theme";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-solid";

export function ThemeToggle() {
  const { toggle } = useTheme();

  return (
    <Button
      type="button"
      class="relative flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground focus:outline-none"
      size="icon"
      onClick={toggle}
    >
      <SunIcon class="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
      <MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  );
}
