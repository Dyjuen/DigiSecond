# Shared React Components

Reusable React components for the web application.

## Structure

```
components/
├── ui/                  # Generic UI components (Button, Input, Modal)
├── listings/            # Listing-specific components
├── transactions/        # Transaction-specific components
└── layout/              # Header, Footer, Sidebar
```

## Guidelines

- Export all components via `index.ts` barrel files
- Use `forwardRef` for components that need ref forwarding
- Include TypeScript interfaces for props
- Follow accessibility checklist (see SKILL.md)

## Owner

**Frontend Web Developer** - See `.agent/skills/frontend-web/SKILL.md`
