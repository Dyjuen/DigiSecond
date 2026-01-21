# React Native Mobile Application

Expo-based React Native app for iOS and Android.

## Structure

```
mobile/
├── src/
│   ├── screens/         # Screen components
│   │   └── __tests__/   # Screen tests
│   ├── components/      # Reusable components
│   ├── navigation/      # Stack/Tab navigators
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand state stores
│   └── lib/             # Utilities, API client
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Development

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Owner

**Frontend Mobile Developer** - See `.agent/skills/frontend-mobile/SKILL.md`
