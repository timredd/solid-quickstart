import {
  type Accessor,
  type ParentProps,
  type Setter,
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { getRequestEvent } from "solid-js/web";

export type Theme = "dark" | "light";

const setDarkStyle = () => {
  document.documentElement.style.colorScheme = "dark";
  document.documentElement.setAttribute("data-mode", "dark");
};

const setLightStyle = () => {
  document.documentElement.style.colorScheme = "light";
  document.documentElement.removeAttribute("data-mode");
};

export const setDark = () => {
  if (window?.localStorage) {
    window.localStorage.theme = "dark";
  }

  setDarkStyle();
};

export const setLight = () => {
  if (window?.localStorage) {
    window.localStorage.theme = "light";
  }

  setLightStyle();
};

export const setSystem = () => {
  window?.localStorage.removeItem("theme");

  if (window?.matchMedia("(prefers-color-scheme: dark)")?.matches) {
    setDarkStyle();
  } else {
    setLightStyle();
  }
};

const current = (): Theme => {
  if (typeof window === "undefined") {
    return "dark";
  }

  if (
    window.localStorage?.theme === "dark" ||
    (!window.localStorage?.theme &&
      matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    return "dark";
  }

  return "light";
};

const themeHeaderScript = `const d = document.documentElement;
const t = localStorage?.theme;
if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) {
  d.style.colorScheme = "dark";
  d.setAttribute("data-mode", "dark");
} else {
  d.style.colorScheme = "light";
  d.removeAttribute("data-mode");
}`;

export const ThemeHeaderScript = () => {
  // @ts-expect-error
  const nonce = getRequestEvent()?.nonce;

  return (
    <script
      nonce={nonce}
      // eslint-disable-next-line solid/no-innerhtml
      innerHTML={themeHeaderScript}
    />
  );
};

interface ThemeContextValue {
  theme: Accessor<Theme>;
  setTheme: Setter<Theme>;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: () => "dark" as const,
  setTheme: () => {},
  toggle: () => {},
});

interface ThemeProviderProps
  extends ParentProps<{
    defaultTheme?: Theme;
  }> {}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const [theme, setTheme] = createSignal<Theme>(current());

  createEffect(() => (theme() === "dark" ? setDark() : setLight()));

  const toggle = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
