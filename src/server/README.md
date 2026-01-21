# Server Directory

Backend server code including tRPC routers, authentication, and database client.

## Structure

```
server/
├── api/
│   ├── routers/         # tRPC routers by domain
│   ├── root.ts          # Root router (merges all routers)
│   └── trpc.ts          # tRPC initialization and context
├── auth.ts              # NextAuth.js configuration
└── db.ts                # Prisma client instance
```

## Owner

**Backend Developer** - See `.agent/skills/backend/SKILL.md`
