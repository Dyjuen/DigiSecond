---
name: Shared Design Tokens
description: Color palette and design tokens shared between web and mobile frontends
---

# Shared Design Tokens

> **IMPORTANT**: Both Frontend Web and Frontend Mobile MUST use these exact values to ensure visual consistency across platforms.

## Color Palette

> **Design Direction**: Professional & Trust-focused, optimized for 3D element integration.

### Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `brand-primary` | `#6366f1` | `99, 102, 241` | Primary buttons, CTAs, prices |
| `brand-primary-light` | `#818cf8` | `129, 140, 248` | Hover states, highlights |
| `brand-primary-dark` | `#4f46e5` | `79, 70, 229` | Active/pressed states |
| `brand-primary-subtle` | `#e0e7ff` | `224, 231, 255` | Light backgrounds, badges |
| `brand-secondary` | `#06b6d4` | `6, 182, 212` | Links, info states |
| `brand-secondary-dark` | `#0891b2` | `8, 145, 178` | Hover states |

### Accent Colors (Premium)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-gold` | `#f59e0b` | Featured badges, premium sellers |
| `accent-gold-light` | `#fbbf24` | Hover states |
| `accent-gold-dark` | `#d97706` | Active states |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22c55e` | Success messages, confirmations |
| `warning` | `#f59e0b` | Warnings, pending states |
| `error` | `#ef4444` | Errors, destructive actions |
| `error-light` | `#fecaca` | Error backgrounds |
| `info` | `#0ea5e9` | Information, links |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#fafafa` | Background light |
| `neutral-100` | `#f4f4f5` | Card backgrounds |
| `neutral-200` | `#e4e4e7` | Borders, dividers |
| `neutral-300` | `#d4d4d8` | Disabled states |
| `neutral-400` | `#a1a1aa` | Subtle icons |
| `neutral-500` | `#71717a` | Placeholder text |
| `neutral-600` | `#52525b` | Muted text |
| `neutral-700` | `#3f3f46` | Secondary text |
| `neutral-800` | `#27272a` | Dark surface |
| `neutral-900` | `#18181b` | Primary text |

### Gradients (for 3D Elements & Backgrounds)

| Token | Value | Usage |
|-------|-------|-------|
| `gradient-primary` | `linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)` | Primary CTAs, hero elements |
| `gradient-surface` | `linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)` | Card surfaces (light) |
| `gradient-dark` | `linear-gradient(180deg, #27272a 0%, #18181b 100%)` | Card surfaces (dark) |
| `gradient-glass` | `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)` | Glassmorphism overlay |
| `gradient-hero` | `linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)` | Hero sections |

### 3D Element Support

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-3d` | `0 20px 40px rgba(99, 102, 241, 0.15)` | 3D element shadows |
| `shadow-3d-hover` | `0 30px 60px rgba(99, 102, 241, 0.25)` | 3D hover lift |
| `shadow-card` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | Card elevation |
| `shadow-card-hover` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Card hover |

### Dark Mode

| Token | Light | Dark |
|-------|-------|------|
| Background | `#ffffff` | `#18181b` |
| Surface | `#fafafa` | `#27272a` |
| Surface elevated | `#f4f4f5` | `#3f3f46` |
| Text primary | `#18181b` | `#fafafa` |
| Text secondary | `#71717a` | `#a1a1aa` |
| Border | `#e4e4e7` | `#3f3f46` |

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `font-family` | `-apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, system-ui, sans-serif` | All text |
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
          primary: "#6366f1",
          "primary-light": "#818cf8",
          "primary-dark": "#4f46e5",
          "primary-subtle": "#e0e7ff",
          secondary: "#06b6d4",
          "secondary-dark": "#0891b2",
        },
        accent: {
          gold: "#f59e0b",
          "gold-light": "#fbbf24",
          "gold-dark": "#d97706",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        "error-light": "#fecaca",
        info: "#06b6d4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        "gradient-hero": "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        "3d": "0 20px 40px rgba(99, 102, 241, 0.15)",
        "3d-hover": "0 30px 60px rgba(99, 102, 241, 0.25)",
        "card": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
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
  primary: "#10b981",
  primaryContainer: "#d1fae5",
  secondary: "#0ea5e9",
  secondaryContainer: "#e0f2fe",
  tertiary: "#f59e0b", // accent gold
  tertiaryContainer: "#fef3c7",
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
    surfaceVariant: "#f4f4f5",
    onSurface: "#18181b",
    onSurfaceVariant: "#71717a",
    outline: "#e4e4e7",
    outlineVariant: "#d4d4d8",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...sharedColors,
    background: "#18181b",
    surface: "#27272a",
    surfaceVariant: "#3f3f46",
    onSurface: "#fafafa",
    onSurfaceVariant: "#a1a1aa",
    outline: "#3f3f46",
    outlineVariant: "#52525b",
  },
};

// Custom shadows for 3D elements (use with StyleSheet)
export const shadows = {
  shadow3d: {
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 10,
  },
  shadowCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
