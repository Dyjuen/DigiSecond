# Known Issues

## Mobile Testing - React Version Mismatch

**Status**: Deferred - Ignore  
**Severity**: Minor (does not affect production or development)  
**Date Identified**: 2026-01-28

> [!NOTE]
> This issue only affects automated unit tests. The app runs correctly in production and development (Expo Go, device builds). Safe to ignore during MVP phase. Will resolve naturally when upgrading to Next.js 15 + React 19.

### Description

Mobile unit tests fail with `Invalid hook call` errors due to multiple copies of React in the dependency tree.

### Root Cause

- **Web (Next.js 14)**: Uses React 18.2
- **Mobile (Expo SDK 54)**: Uses React 19.1
- **react-native-paper**: Installs its own nested React copy

When `jest` runs, the test renderer uses a different React instance than `react-native-paper`, causing hook conflicts.

### Workarounds

1. **Manual Testing**: Use Expo Go or device builds to verify functionality
2. **Skip Tests**: Run `pnpm test --passWithNoTests` for CI if needed

### Resolution Options

| Option | Effort | Risk |
|--------|--------|------|
| Upgrade web to Next.js 15 + React 19 | Medium | Medium (breaking changes) |
| Mock `PaperProvider` in tests | Low | Low |
| Wait for dependency updates | None | None |

### Affected Files

- `mobile/src/screens/ListingCreate/__tests__/ListingCreateScreen.test.tsx`
- `mobile/src/screens/Auth/__tests__/LoginScreen.test.tsx`
