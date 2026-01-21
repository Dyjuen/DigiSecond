---
description: Start a new feature from spec to implementation
---

# New Feature Workflow

## 1. Check spec.md

// turbo
```bash
cat docs/spec.md | grep -A 20 "[feature_name]"
```

Ensure the feature is documented with:
- User story
- Acceptance criteria
- API contracts

If not documented, update spec.md first and get team approval.

## 2. Switch to your role branch

> **IMPORTANT**: We use role-based branches, NOT feature branches.

| Role | Branch | Files You Can Modify |
|------|--------|---------------------|
| Backend | `backend` | `src/server/**`, `prisma/**` |
| Frontend Web | `frontend-web` | `src/app/**`, `src/components/**` |
| Frontend Mobile | `mobile` | `mobile/src/**` |

```bash
# Backend developer
git checkout backend
git pull origin backend

# Frontend Web developer
git checkout frontend-web
git pull origin frontend-web

# Frontend Mobile developer
git checkout mobile
git pull origin mobile
```

## 3. Backend: Write tests first

```bash
# Create test file
touch src/server/api/routers/__tests__/[router].test.ts

# Write failing tests for the new procedure
# Run tests to confirm they fail
pnpm test src/server/api/routers/__tests__/[router].test.ts
```

## 4. Backend: Implement procedure

1. Add Zod schema
2. Add tRPC procedure
3. Run tests until green

// turbo
```bash
pnpm test src/server/api/routers/__tests__/[router].test.ts
```

## 5. Frontend Web: Implement UI

```bash
# Create page/component
mkdir -p src/app/[route]
touch src/app/[route]/page.tsx
```

## 6. Frontend Mobile: Implement screen

```bash
cd mobile
mkdir -p src/screens/[screen]
touch src/screens/[screen]/index.tsx
```

## 7. Test end-to-end

```bash
# Start dev servers
pnpm dev          # Web
cd mobile && npx expo start  # Mobile
```

## 8. Commit to your role branch

```bash
git add .
git commit -m "feat([scope]): [description]"
git push origin [your-role-branch]
```

## 9. Create PR to main

When feature is complete, create a Pull Request from your role branch to `main`.
Team lead reviews and merges.
