# Assets Directory

This directory contains static assets for the DigiSecond application.

## Structure

```
assets/
├── images/      # Logos, hero images, backgrounds
│   ├── logo.svg
│   ├── logo-dark.svg
│   └── hero-bg.png
└── icons/       # Custom SVG icons
    └── ...
```

## Usage

```tsx
import logo from "@/assets/images/logo.svg";

<Image src={logo} alt="DigiSecond" />
```

## Guidelines

- Use **SVG** for logos and icons (scalable, small file size)
- Use **WebP** for photos (better compression than PNG/JPG)
- Keep file names lowercase with hyphens: `logo-dark.svg`
