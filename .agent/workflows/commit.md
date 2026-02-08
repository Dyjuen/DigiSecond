---
description: Commit code with Angular conventions after testing and code review
---

# Commit Workflow

## 1. Run Tests First

// turbo
```bash
pnpm test
```

All tests MUST pass before committing. If tests fail, fix them first.

## 2. Type Check

// turbo
```bash
pnpm tsc --noEmit
```

## 3. Lint

// turbo
```bash
pnpm lint
```

## 4. Code Review

```bash
git diff --staged
```

Or for all changes:

```bash
git diff
```

Review each file:
- [ ] No debug code left (`console.log`, `debugger`)
- [ ] No commented-out code
- [ ] No hardcoded secrets or API keys
- [ ] Changes match intended scope

## 5. Stage Changes

```bash
git add -p  # Interactive staging (recommended)
# OR
git add .   # Stage all
```

## 6. Commit with Angular Convention

```bash
git commit -m "<type>(<scope>): <subject>"
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or fixing tests |
| `chore` | Build, config, dependencies |

### Scope Examples

- `auth`, `listing`, `transaction`, `payment`, `dispute`, `user`, `chat`
- `web`, `mobile`, `api`, `db`

### Examples

```bash
git commit -m "feat(listing): add photo upload to create form"
git commit -m "fix(payment): handle Xendit webhook timeout"
git commit -m "test(auth): add login rate limiting tests"
git commit -m "refactor(api): extract validation to shared schemas"
git commit -m "docs(spec): add auction feature specification"
```

### Multi-line Commit (for detailed descriptions)

```bash
git commit
```

Then in editor:

```
feat(transaction): implement escrow fund release

- Add 24-hour verification countdown
- Auto-release funds on timer expiry
- Manual release button for buyer
- Calculate platform fee on release

Closes #42
```

## 7. Push

```bash
git push origin <branch-name>
```

## Quick Reference

```bash
# One-liner for confident changes
pnpm test && pnpm tsc --noEmit && git add . && git commit -m "feat(scope): message"
```
