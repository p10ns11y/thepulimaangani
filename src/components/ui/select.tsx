"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "#/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-[color,box-shadow,background-color,border-color] outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
        /* Real (light): card lift + lagoon focus — matches .luxe-prosody-card / luxe-select-content */
        "border-[color-mix(in_oklab,var(--rim)_90%,var(--lagoon)_6%)] bg-[color-mix(in_oklab,var(--card)_88%,var(--diamond-ice)_12%)] text-foreground shadow-sm",
        "hover:bg-[color-mix(in_oklab,var(--surface-2)_78%,var(--card)_22%)] hover:border-[color-mix(in_oklab,var(--rim)_75%,var(--lagoon)_14%)]",
        "focus-visible:border-[var(--lagoon)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--lagoon)_30%,transparent)]",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "redpill:border-[var(--line)] redpill:bg-input/35 redpill:text-[var(--sea-ink)] redpill:shadow-none redpill:hover:bg-input/55 redpill:focus-visible:border-[color-mix(in_oklab,var(--gem-yellow-sapphire)_55%,var(--rim)_45%)] redpill:focus-visible:ring-2 redpill:focus-visible:ring-[color-mix(in_oklab,var(--gem-diamond)_40%,var(--lagoon)_30%)] redpill:aria-invalid:border-destructive/50 redpill:aria-invalid:ring-destructive/50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 text-[var(--sea-ink-soft)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "luxe-select-content",
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg text-popover-foreground duration-100",
          "data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
            position === "popper" && ""
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-1.5 py-1 text-xs font-semibold tracking-wide text-[var(--kicker)]",
        className,
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none",
        "text-popover-foreground",
        /* Real: lagoon wash; redpill: dark gem wash */
        "data-[state=checked]:bg-[color-mix(in_oklab,var(--lagoon)_12%,var(--diamond-ice)_88%)] data-[state=checked]:text-foreground",
        "redpill:data-[state=checked]:bg-[color:color-mix(in_oklab,var(--gem-diamond)_26%,oklch(0.3_0.06_24)_74%)]",
        "redpill:data-[state=checked]:text-[var(--sea-ink)]",
        "data-[highlighted]:bg-[color-mix(in_oklab,var(--lagoon)_20%,var(--diamond-ice)_80%)] data-[highlighted]:text-foreground",
        "data-[highlighted]:ring-1 data-[highlighted]:ring-inset data-[highlighted]:ring-[color-mix(in_oklab,var(--lagoon)_32%,var(--rim)_68%)]",
        "redpill:data-[highlighted]:bg-[color:color-mix(in_oklab,var(--lagoon)_42%,oklch(0.3_0.06_25)_58%)]",
        "redpill:data-[highlighted]:ring-[var(--gem-yellow-sapphire)]/90",
        "redpill:data-[highlighted]:text-[var(--sea-ink)]",
        "data-[highlighted][data-state=checked]:bg-[color-mix(in_oklab,var(--lagoon)_24%,var(--diamond-ice)_76%)]",
        "redpill:data-[highlighted][data-state=checked]:bg-[color:color-mix(in_oklab,var(--lagoon)_50%,oklch(0.32_0.07_25)_50%)]",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none size-4 text-[var(--lagoon-deep)] redpill:text-[var(--gem-yellow-sapphire)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "luxe-select-scroll-edge z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "luxe-select-scroll-edge z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
