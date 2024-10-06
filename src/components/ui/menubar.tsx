import { cn } from "@/lib/utils";
import * as MenubarPrimitive from "@kobalte/core/menubar";
import { mergeProps, splitProps } from "solid-js";

import { Polymorphic, type PolymorphicProps } from "@kobalte/core/polymorphic";
import type { ComponentProps, ParentProps, ValidComponent } from "solid-js";

export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

export type MenubarProps<T extends ValidComponent = "div"> =
  MenubarPrimitive.MenubarRootProps<T> & {
    class?: string;
  };

export const Menubar = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarProps, ["class"]);

  return (
    <MenubarPrimitive.Root
      class={cn(
        "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
        local.class,
      )}
      {...rest}
    />
  );
};

export const MenubarMenu = (props: MenubarPrimitive.MenubarMenuProps) => {
  const merge = mergeProps<MenubarPrimitive.MenubarMenuProps[]>(
    { gutter: 8, shift: -4 },
    props,
  );

  return <MenubarPrimitive.Menu {...merge} />;
};

export type MenubarTriggerProps<T extends ValidComponent = "button"> =
  MenubarPrimitive.MenubarTriggerProps<T> & {
    class?: string;
  };

export const MenubarTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, MenubarTriggerProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarTriggerProps, ["class"]);

  return (
    <MenubarPrimitive.Trigger
      class={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1 font-medium text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[expanded]:bg-accent data-[expanded]:text-accent-foreground",
        local.class,
      )}
      {...rest}
    />
  );
};

export type MenubarSubTriggerProps<T extends ValidComponent = "button"> =
  ParentProps<
    MenubarPrimitive.MenubarSubTriggerProps<T> & {
      class?: string;
      inset?: boolean;
    }
  >;

export const MenubarSubTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, MenubarSubTriggerProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarSubTriggerProps, [
    "class",
    "children",
    "inset",
  ]);

  return (
    <MenubarPrimitive.SubTrigger
      class={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[expanded]:bg-accent data-[expanded]:text-accent-foreground",
        local.inset && "pl-8",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        class="ml-auto h-4 w-4"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m9 6l6 6l-6 6"
        />
        <title>Arrow</title>
      </svg>
    </MenubarPrimitive.SubTrigger>
  );
};

export type MenubarSubContentProps<T extends ValidComponent = "div"> =
  ParentProps<
    MenubarPrimitive.MenubarSubContentProps<T> & {
      class?: string;
    }
  >;

export const MenubarSubContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarSubContentProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarSubContentProps, [
    "class",
    "children",
  ]);

  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        class={cn(
          "data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 z-50 min-w-[8rem] origin-[--kb-menu-content-transform-origin] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-[closed]:animate-out data-[expanded]:animate-in",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </MenubarPrimitive.SubContent>
    </MenubarPrimitive.Portal>
  );
};

export type MenubarContentProps<T extends ValidComponent = "div"> = ParentProps<
  MenubarPrimitive.MenubarContentProps<T> & {
    class?: string;
  }
>;

export const MenubarContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarContentProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarContentProps, [
    "class",
    "children",
  ]);

  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        class={cn(
          "data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 z-50 min-w-[12rem] origin-[--kb-menu-content-transform-origin] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[expanded]:animate-in",
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </MenubarPrimitive.Content>
    </MenubarPrimitive.Portal>
  );
};

export type MenubarItemProps<T extends ValidComponent = "div"> =
  MenubarPrimitive.MenubarItemProps<T> & {
    class?: string;
    inset?: boolean;
  };

export const MenubarItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarItemProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarItemProps, [
    "class",
    "inset",
  ]);

  return (
    <MenubarPrimitive.Item
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        local.inset && "pl-8",
        local.class,
      )}
      {...rest}
    />
  );
};

export type MenubarItemLabelProps<T extends ValidComponent = "div"> =
  MenubarPrimitive.MenubarItemLabelProps<T> & {
    class?: string;
    inset?: boolean;
  };

export const MenubarItemLabel = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarItemLabelProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarItemLabelProps, [
    "class",
    "inset",
  ]);

  return (
    <MenubarPrimitive.ItemLabel
      class={cn(
        "px-2 py-1.5 font-semibold text-sm",
        local.inset && "pl-8",
        local.class,
      )}
      {...rest}
    />
  );
};

export type MenubarSeparatorProps<T extends ValidComponent = "hr"> =
  MenubarPrimitive.MenubarSeparatorProps<T> & {
    class?: string;
  };

export const MenubarSeparator = <T extends ValidComponent = "hr">(
  props: PolymorphicProps<T, MenubarSeparatorProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarSeparatorProps, ["class"]);

  return (
    <MenubarPrimitive.Separator
      class={cn("-mx-1 my-1 h-px bg-muted", local.class)}
      {...rest}
    />
  );
};

export type MenubarCheckboxItemProps<T extends ValidComponent = "div"> =
  ParentProps<
    MenubarPrimitive.MenubarCheckboxItemProps<T> & {
      class?: string;
    }
  >;

export const MenubarCheckboxItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarCheckboxItemProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarCheckboxItemProps, [
    "class",
    "children",
  ]);

  return (
    <MenubarPrimitive.CheckboxItem
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        local.class,
      )}
      {...rest}
    >
      <MenubarPrimitive.ItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="h-4 w-4"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m5 12l5 5L20 7"
          />
          <title>Checkbox</title>
        </svg>
      </MenubarPrimitive.ItemIndicator>
      {local.children}
    </MenubarPrimitive.CheckboxItem>
  );
};

export type MenubarRadioItemProps<T extends ValidComponent = "div"> =
  ParentProps<
    MenubarPrimitive.MenubarRadioItemProps<T> & {
      class?: string;
    }
  >;

export const MenubarRadioItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, MenubarRadioItemProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarRadioItemProps, [
    "class",
    "children",
  ]);

  return (
    <MenubarPrimitive.RadioItem
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        local.class,
      )}
      {...rest}
    >
      <MenubarPrimitive.ItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="h-2 w-2"
        >
          <g
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M0 0h24v24H0z" />
            <path
              fill="currentColor"
              d="M7 3.34a10 10 0 1 1-4.995 8.984L2 12l.005-.324A10 10 0 0 1 7 3.34"
            />
          </g>
          <title>Radio</title>
        </svg>
      </MenubarPrimitive.ItemIndicator>
      {local.children}
    </MenubarPrimitive.RadioItem>
  );
};

export type MenubarShortcutProps<T extends ValidComponent = "span"> =
  ComponentProps<T>;

export const MenubarShortcut = <T extends ValidComponent = "span">(
  props: PolymorphicProps<T, MenubarShortcutProps<T>>,
) => {
  const [local, rest] = splitProps(props as MenubarShortcutProps, ["class"]);

  return (
    <Polymorphic
      as="span"
      class={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest",
        local.class,
      )}
      {...rest}
    />
  );
};
