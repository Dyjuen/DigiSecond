---
name: Shared Design Tokens
description: Color palette and design tokens shared between web and mobile frontends
---

# Shared Design Tokens

> **IMPORTANT**: Both Frontend Web and Frontend Mobile MUST use these exact values to ensure visual consistency across platforms.

## Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#22c55e` | Primary buttons, success states, prices |
| `brand-primary-dark` | `#16a34a` | Hover states, active states |
| `brand-secondary` | `#3b82f6` | Links, secondary actions |
| `brand-secondary-dark` | `#2563eb` | Hover states |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22c55e` | Success messages, confirmations |
| `warning` | `#f59e0b` | Warnings, pending states |
| `error` | `#ef4444` | Errors, destructive actions |
| `info` | `#3b82f6` | Information, links |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#fafafa` | Background light |
| `neutral-100` | `#f5f5f5` | Card backgrounds |
| `neutral-200` | `#e5e5e5` | Borders, dividers |
| `neutral-300` | `#d4d4d4` | Disabled states |
| `neutral-500` | `#737373` | Placeholder text |
| `neutral-700` | `#404040` | Secondary text |
| `neutral-900` | `#171717` | Primary text |

### Dark Mode

| Token | Light | Dark |
|-------|-------|------|
| Background | `#ffffff` | `#171717` |
| Surface | `#fafafa` | `#262626` |
| Text primary | `#171717` | `#fafafa` |
| Text secondary | `#737373` | `#a3a3a3` |
| Border | `#e5e5e5` | `#404040` |

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `font-family` | `Inter, system-ui, sans-serif` | All text |
| `font-size-xs` | `12px` / `0.75rem` | Captions |
| `font-size-sm` | `14px` / `0.875rem` | Body small |
| `font-size-base` | `16px` / `1rem` | Body |
| `font-size-lg` | `18px` / `1.125rem` | Subheadings |
| `font-size-xl` | `20px` / `1.25rem` | Headings |
| `font-size-2xl` | `24px` / `1.5rem` | Page titles |
| `font-size-3xl` | `30px` / `1.875rem` | Hero text |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Tight spacing |
| `space-2` | `8px` | Default gap |
| `space-3` | `12px` | Component padding |
| `space-4` | `16px` | Section padding |
| `space-6` | `24px` | Card padding |
| `space-8` | `32px` | Section margins |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `4px` | Small buttons |
| `radius-md` | `8px` | Cards, inputs |
| `radius-lg` | `12px` | Modals |
| `radius-full` | `9999px` | Pills, avatars |

---

## Implementation

### Tailwind (Web)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#22c55e",
          "primary-dark": "#16a34a",
          secondary: "#3b82f6",
          "secondary-dark": "#2563eb",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
```

### React Native Paper (Mobile)

```typescript
// mobile/src/lib/theme.ts
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

const sharedColors = {
  primary: "#22c55e",
  primaryContainer: "#16a34a",
  secondary: "#3b82f6",
  secondaryContainer: "#2563eb",
  error: "#ef4444",
  errorContainer: "#fecaca",
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...sharedColors,
    background: "#ffffff",
    surface: "#fafafa",
    onSurface: "#171717",
    onSurfaceVariant: "#737373",
    outline: "#e5e5e5",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...sharedColors,
    background: "#171717",
    surface: "#262626",
    onSurface: "#fafafa",
    onSurfaceVariant: "#a3a3a3",
    outline: "#404040",
  },
};
```

---

## Price Formatting

Always display prices consistently:

```typescript
// Shared utility
export function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// Usage
formatPrice(500000) // "Rp 500.000"
```
