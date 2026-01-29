# Schema & API Implementation Status

> **Date**: 2026-01-29
> **Status**: Work In Progress
> **Ref**: `docs/spec.md` vs Current Codebase

---

## 1. Database Schema Changes

The current `prisma/schema.prisma` has evolved from the original `docs/spec.md`. Below are the key differences and additions.

### New/Modified Entities

| Entity | Change | Description |
|--------|--------|-------------|
| **User** | `tier` added | Enum `UserTier` (FREE, PRO, ENTERPRISE) to support subscriptions. |
| **User** | `id_card_url` added | For KYC verification. |
| **Category** | Expanded | Added `slug`, `icon_url`, and self-referential `parent_id` for hierarchy. |
| **Listing** | `view_count` added | Track listing popularity. |
| **Listing** | `auction_status` added | Explicit status for auctions (INACTIVE, ACTIVE, ENDED). |
| **Transaction** | `verification_deadline` added | For 24hr auto-release logic. |
| **Transaction** | `item_transferred_at` added | Timestamp when seller marks item as sent. |

### Enums

- **UserTier**: `FREE`, `PRO`, `ENTERPRISE` (New)
- **UserRole**: `BUYER`, `SELLER`, `ADMIN` (Matches Spec)
- **ListingType**: `FIXED`, `AUCTION` (Matches Spec)

---

## 2. API Endpoint Status (tRPC)

Comparison of planned endpoints in `docs/spec.md` vs actual implementation in `src/server/api/routers/*.ts`.

### ✅ Implemented

| Router | Procedure | Status | Notes |
|--------|-----------|--------|-------|
| **Auth** | `register` | ✅ Done | Basic email/password, hashing included. |
| **Auth** | `getSession` | ✅ Done | |
| **Auth** | `getMe` | ✅ Done | |
| **Auth** | `updateProfile` | ✅ Done | |
| **User** | `getById` | ✅ Done | Public profile view. |
| **User** | `update` | ✅ Done | Updates KYC data (phone, ID card). |
| **User** | `upgradeTier` | ✅ Done | **New**: Handle subscription upgrades. |
| **Listing** | `create` | ✅ Done | Includes KYC check guard. |
| **Listing** | `getById` | ✅ Done | |
| **Listing** | `getAll` | ✅ Done | Search, filter, pagination implemented. |
| **Listing** | `placeBid` | ✅ Done | Basic bidding logic (needs constraints refinement). |
| **Transaction**| `create` | ✅ Done | Creates transaction & mock payment. |
| **Admin** | `getDashboardStats`| ✅ Done | **New**: Aggregated stats for admin dashboard. |
| **Admin** | `getUsers` | ✅ Done | List users with fitlers. |
| **Admin** | `getDisputes` | ✅ Done | View all disputes. |
| **Admin** | `resolveDispute` | ✅ Done | Admin resolution logic. |
| **Admin** | `approveListing` | ✅ Done | |
| **Admin** | `rejectListing` | ✅ Done | |

### ⚠️ Missing / Not Yet Implemented

These routers/procedures were defined in the spec but **do not exist** in the current `src/server/api/routers/` directory.

| Router | Procedure | Impact |
|--------|-----------|--------|
| **Transaction**| `markTransferred` | 🔴 **High** | Seller cannot complete order. |
| **Transaction**| `confirmReceived` | 🔴 **High** | Buyer cannot release funds. |
| **Transaction**| `getActive` | 🟡 Medium | Users cannot see their active orders easily. |
| **Dispute** | `create` | 🔴 **High** | Buyers cannot open disputes. |
| **Payment** | `webhook` | 🔴 **High** | No real payment processing (currently mocking creation). |
| **Message** | `send` | 🟡 Medium | No chat functionality. |
| **Message** | `getByTransaction`| 🟡 Medium | No chat history. |
| **Review** | `create` | 🟢 Low | Reputation system incomplete. |

---

## 3. Next Steps Recommendation

Based on the missing critical paths, the following priority is recommended:

1.  **Transaction Flow Completion**: Implement `markTransferred` and `confirmReceived` in `transaction.ts`.
2.  **Dispute Logic**: Create `dispute.ts` router to allow users to `create` disputes.
3.  **Messaging**: Create `message.ts` to enable buyer-seller communication during transaction.
