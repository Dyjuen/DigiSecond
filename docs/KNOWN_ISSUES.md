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

### Additional Test Failures (2026-01-29)

Beyond the React version mismatch, there are also test code bugs that would need fixing:

1. **Missing `useLocalSearchParams` mock** in `ListingCreateScreen.test.tsx`
   - Component added `useLocalSearchParams()` but tests only mock `useRouter`
   - Fix: Add to expo-router mock in jest setup

2. **Wrong query selector** in `LoginScreen.test.tsx`
   - Test uses `getByLabelText("Email")` but Paper's TextInput doesn't set `accessibilityLabel`
   - Fix: Use `getByTestId("text-input-outlined")` or add `accessibilityLabel` prop

| Fix | Effort | Worth It? |
|-----|--------|-----------|
| Mock `useLocalSearchParams` | ~5 min | No - React mismatch will still cause failures |
| Fix query selector | ~5 min | No - React mismatch will still cause failures |

**Recommendation**: Don't fix until React version mismatch is resolved—fixing these would just reveal the hook errors underneath.
---

## Mobile Lint Warnings (Remaining)

**Status**: Deferred - Acceptable  
**Severity**: Low (warnings only, no blocking errors)  
**Date Updated**: 2026-01-29

> [!NOTE]
> All blocking lint errors have been fixed. Remaining warnings are low priority and don't affect functionality.

### Summary

`npm run lint` now reports **2 errors, 6 warnings** (down from 10 errors, 23 warnings).

### Remaining Issues

| # | File | Issue | Status |
|---|------|-------|--------|
| 1-2 | `metro.config.js` | CJS `require()` | **Skip** - CJS is expected for Metro |
| 3-6 | Various | Missing `alt` props on Images | Low priority (RN doesn't render alt) |
| 7-8 | `useGoogleAuth.ts`, `ListingCreateScreen.tsx` | useEffect deps | Deferred (risk of infinite loops) |

### Fixed Issues (2026-01-29)

- ✅ All `no-explicit-any` errors (6 files)
- ✅ All unused imports/variables (10+ files)
- ✅ `@ts-ignore` → `@ts-expect-error`
- ✅ `let` → `const` fixes

---

## Mobile Authentication - Token Mismatch

**Status**: Blocking (mobile cannot use protected endpoints)  
**Severity**: High  
**Date Identified**: 2026-02-02  
**Estimated Fix Time**: 2-3 hours

> [!IMPORTANT]
> This blocks all authenticated mobile functionality. Protected tRPC endpoints return UNAUTHORIZED for mobile clients.

### Problem

Mobile app sends JWT tokens in `Authorization` header, but the backend expects NextAuth.js session cookies.

```
Mobile (Expo)                         Backend (Next.js)
─────────────────                     ─────────────────
stores JWT from auth ──────────────▶  expects NextAuth session cookie
sends Bearer token   ──────────────▶  ignores Authorization header
                                      ctx.session = null → UNAUTHORIZED
```

### Implementation Plan

#### Step 1: Create JWT Utility (30 min)

Create `src/lib/jwt.ts`:

```typescript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export interface JWTPayload {
  sub: string;      // user_id
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  tier: "FREE" | "PRO" | "ENTERPRISE";
  verified: boolean;
  suspended: boolean;
  iat: number;
  exp: number;
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
```

**Test**: Unit test with valid/invalid/expired tokens.

#### Step 2: Modify tRPC Context (30 min)

Edit `src/server/api/trpc.ts`, update `createTRPCContext`:

```typescript
import { verifyJWT } from "@/lib/jwt";

export async function createTRPCContext(opts: CreateNextContextOptions) {
  // 1. Try session cookie first (web)
  let session = await getServerSession(opts.req, opts.res, authOptions);
  
  // 2. Fallback: Check Authorization header (mobile)
  if (!session) {
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const decoded = verifyJWT(token);
      if (decoded && !decoded.suspended) {
        session = {
          user: {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            tier: decoded.tier,
            verified: decoded.verified,
            suspended: decoded.suspended,
          },
          expires: new Date(decoded.exp * 1000).toISOString(),
        };
      }
    }
  }
  
  return { db, session };
}
```

**Test**: Call protected endpoint with Bearer token header.

#### Step 3: Create Mobile Auth Endpoint (45 min)

Create `src/app/api/auth/mobile/login/route.ts`:

```typescript
import { db } from "@/server/db";
import { signJWT } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  
  const token = signJWT({
    sub: user.user_id,
    email: user.email,
    role: user.role,
    tier: user.tier,
    verified: user.is_verified,
    suspended: user.is_suspended,
  });
  
  return NextResponse.json({ 
    token, 
    user: {
      id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  });
}
```

#### Step 4: Update Mobile API Client (15 min)

Mobile already sends Bearer token correctly in `mobile/src/lib/api.ts` - verify this works.

#### Step 5: Write Integration Tests (30 min)

Add to backend tests:
- Test protected endpoint with valid Bearer token
- Test with expired token → UNAUTHORIZED
- Test with invalid token → UNAUTHORIZED
- Test suspended user token → FORBIDDEN

---

## Mobile Google OAuth - Expo Go Limitations

**Status**: Blocking in Expo Go (works in production builds)  
**Severity**: High (development only)  
**Date Identified**: 2026-02-02

> [!WARNING]
> Google OAuth fails in Expo Go with `disallowed_useragent` or `redirect_uri_mismatch`. This is Google security policy, not a bug.

### Root Cause

| Platform | OAuth Status | Why |
|----------|--------------|-----|
| Flutter | ✅ Works | Uses system browser |
| Native Kotlin | ✅ Works | Chrome Custom Tabs |
| Native Swift | ✅ Works | ASWebAuthenticationSession |
| Expo production | ✅ Works | Your SHA-1 fingerprint |
| **Expo Go** | ❌ Fails | Uses Expo's shared fingerprint |

### Solution Options

#### Option A: Magic Link Authentication (Recommended)

**Effort**: 2-3 hours | **Risk**: Low | **Works in**: Expo Go + Production

This is the cleanest workaround. Backend already has EmailProvider configured.

##### Step 1: Add Email Input to Mobile Login (30 min)

Edit `mobile/src/screens/Auth/LoginScreen.tsx`:

```typescript
const [email, setEmail] = useState("");
const [magicLinkSent, setMagicLinkSent] = useState(false);

const sendMagicLink = async () => {
  const res = await fetch(`${API_URL}/api/auth/signin/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (res.ok) setMagicLinkSent(true);
};
```

##### Step 2: Create Mobile Callback Page (45 min)

Create `src/app/auth/mobile-callback/page.tsx`:

```typescript
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { signJWT } from "@/lib/jwt";

export default async function MobileCallback() {
  const session = await getServerAuthSession();
  
  if (!session) {
    redirect("/login?error=no_session");
  }
  
  // Generate JWT for mobile
  const token = signJWT({
    sub: session.user.id,
    email: session.user.email!,
    role: session.user.role,
    tier: session.user.tier,
    verified: session.user.verified,
    suspended: session.user.suspended,
  });
  
  // Redirect to mobile app with token
  redirect(`digisecond://auth-callback?token=${token}`);
}
```

##### Step 3: Configure Deep Link (30 min)

Update `mobile/app.json`:

```json
{
  "expo": {
    "scheme": "digisecond",
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "autoVerify": true,
        "data": [{ "scheme": "digisecond", "host": "auth-callback" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

##### Step 4: Handle Deep Link in Mobile (45 min)

Create `mobile/src/hooks/useDeepLink.ts`:

```typescript
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useAuthStore } from "../stores/authStore";

export function useDeepLinkAuth() {
  const { setToken } = useAuthStore();
  
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url);
      if (queryParams?.token) {
        setToken(queryParams.token as string);
      }
    };
    
    const subscription = Linking.addEventListener("url", handleUrl);
    return () => subscription.remove();
  }, []);
}
```

##### Step 5: Modify Email Template (15 min)

Update callback URL in NextAuth to point to mobile-callback for mobile requests.

---

#### Option B: Development Build (Alternative)

**Effort**: 1-2 hours | **Risk**: Low | **Requires**: EAS account

If you need OAuth specifically:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Create development build
eas build --profile development --platform android

# 4. Install APK on device/emulator

# 5. Start dev server
npx expo start --dev-client
```

**Pros**: Real OAuth works, closer to production  
**Cons**: ~15 min build time, need physical device/emulator

---

#### Option C: Switch from Expo Go

**Question**: Is switching from Expo Go a big hassle?

| Target | Effort | Pros | Cons |
|--------|--------|------|------|
| **EAS Development Build** | Low (1h) | OAuth works, same codebase | Build time per change |
| **Bare React Native** | High (1-2 days) | Full control | Lose Expo managed workflow |
| **Flutter** | Very High (weeks) | Native feel, single codebase | Rewrite everything |
| **Native Kotlin/Swift** | Extreme (months) | Best performance | Two codebases |

**Recommendation**: Stay with Expo, use **EAS Development Build** or **Magic Link** for auth. Expo's benefits (OTA updates, easy config) outweigh the OAuth inconvenience.

---

## Mobile-Backend Compatibility Matrix

### ✅ Working Now

| Feature | Status |
|---------|--------|
| tRPC client setup | ✅ |
| Public endpoints (`listing.getAll`, `getById`) | ✅ |
| Token storage (Zustand + MMKV) | ✅ |

### ⚠️ Blocked - Needs JWT Fix

| Feature | Fix Required |
|---------|--------------|
| All `protectedProcedure` endpoints | JWT middleware |
| User profile, listings, transactions | JWT middleware |

### 📋 Not Yet Implemented

| Feature | Backend | Mobile |
|---------|---------|--------|
| Magic Link auth flow | ✅ | ❌ |
| Push notifications | ❌ | ❌ |
| Real-time messages | ❌ | ❌ |
| Payment integration | ❌ | ❌ |

---

## Configuration Issues

**Status**: Minor (may cause silent failures)  
**Severity**: Low  
**Date Identified**: 2026-02-02

### 1. Environment Variable Naming Mismatch

**Problem**: `.env.example` uses different names than the code expects.

| .env.example | Code Expects | Status |
|--------------|--------------|--------|
| `GOOGLE_ANDROID_CLIENT_ID` | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | ❌ Mismatch |
| `GOOGLE_CLIENT_ID` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | ❌ Mismatch |

**Fix**: Update `mobile/.env.example`:

```bash
# Correct format (EXPO_PUBLIC_ prefix required for client access)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

### 2. Type Import Path (Low Risk)

**Current**: Mobile imports backend types via relative path:
```typescript
// mobile/src/lib/api.ts
import type { AppRouter } from "../../../src/server/api/root";
```

**Risk**: Path breaks if file moves. Works because monorepo structure is stable.

**Optional Fix**: Create dedicated types package or use TypeScript path aliases.

### 3. Localhost URL on Physical Device

**Problem**: `EXPO_PUBLIC_API_URL=http://localhost:3000` won't work on physical device/emulator.

**Fix for development**:
- **Android Emulator**: Use `http://10.0.2.2:3000`
- **Physical device**: Use local IP like `http://192.168.1.x:3000`
- **ngrok tunnel**: `ngrok http 3000` → use tunnel URL

---

## Edge Cases to Test

### Authentication Edge Cases

| Scenario | Expected Behavior | Tested |
|----------|-------------------|--------|
| Token expires mid-session | Should prompt re-login | ❌ |
| User suspended while app open | Next request should fail with FORBIDDEN | ❌ |
| Network offline → online | Should resume without crash | ❌ |
| Token stored but user deleted | Should clear auth and redirect to login | ❌ |

### Data Edge Cases

| Scenario | Expected Behavior | Tested |
|----------|-------------------|--------|
| Very long listing title (edge of limit) | Should truncate or reject | ❌ |
| Large image upload (>10MB) | Should show appropriate error | ❌ |
| Currency formatting (IDR) | Should display with thousands separator | ❌ |
| Date/time display (timezone) | Should use local timezone | ❌ |
| Unicode/emoji in text fields | Should store and display correctly | ✅ (backend tested) |

### Performance Edge Cases

| Scenario | Risk | Mitigation |
|----------|------|------------|
| 100+ listings load | Slow render | Implement pagination/virtualization |
| Rapid bid refresh | API spam | Debounce/throttle |
| Image-heavy screens | Memory pressure | Use progressive loading |

---

## Summary: Priority Order for Fixes

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| **P0** | JWT Token Mismatch | 2-3h | Unblocks ALL protected features |
| **P1** | Magic Link for Expo Go | 2-3h | Enables auth without OAuth |
| **P2** | Env var naming fix | 5 min | Prevents config confusion |
| **P3** | Localhost URL docs | 15 min | Helps new developers |
| **P4** | Edge case testing | 2-4h | Production readiness |

