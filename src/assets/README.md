# Assets Directory

This directory contains all static assets for the DigiSecond application.

## Structure

```
assets/
├── images/       # All image assets (logos, partners, games, etc.)
│   ├── Game Logos (Mobile Legends, Free Fire, PUBG, Genshin, Valorant, Roblox)
│   ├── Payment Partners (BCA, Mandiri, BNI, BRI, BSI, GoPay, OVO, Dana, etc.)
│   └── Other brand images
└── icons/        # Application icons
    ├── logotrans.png
    └── logotrans1.png
```

## Usage

```tsx
import logo from "@/assets/images/logo.svg";
import bcaLogo from "@/assets/images/bank-central-asia-(bca)-logo.svg";

<Image src={logo} alt="DigiSecond" />
```

## Guidelines

- Use **SVG** for logos and icons when possible (scalable, small file size)
- Use **PNG** with transparency for complex logos
- Use **WebP** for photos (better compression than PNG/JPG)
- All assets should be in `src/assets` (NOT in `public/`) for Next.js optimization
- Keep file names descriptive with the brand name
