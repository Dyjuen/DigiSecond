# DigiSecond Marketplace - System Specification

> **Version**: 1.1.0 | **Last Updated**: 2026-04-11  
> **Status**: Comprehensive System Reference  
> **Target Audience**: Developers, Architects, Stakeholders

---

## 1. Project Overview

### 1.1 Vision
DigiSecond is a secure Indonesian digital goods marketplace for peer-to-peer trading of game accounts, virtual items, skins, and other digital assets. The platform integrates escrow services, real-time auctions, and automated dispute resolution to ensure a safe trading environment.

### 1.2 Core Capabilities
- **Multi-Client Support**: Web (Next.js) and Mobile (React Native + Expo).
- **Flexible Trading**: Supports both fixed-price listings and time-bound auctions.
- **Secure Escrow**: Funds are held in escrow until the buyer verifies the delivery or the 24-hour verification window expires.
- **Integrated Payments**: Powered by Xendit for Virtual Accounts, E-wallets, and QRIS.
- **Real-time Interaction**: Instant chat and auction bid updates.

---

## 2. System Architecture

### 2.1 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend (Web)** | Next.js 14 (App Router), Tailwind CSS, TanStack Query |
| **Frontend (Mobile)** | React Native + Expo (SDK 50), React Native Paper |
| **Backend / API** | tRPC (Type-safe API), NextAuth.js (Authentication) |
| **Database** | PostgreSQL (Supabase), Prisma (ORM) |
| **Caching / Rate Limit** | Upstash Redis |
| **Real-time / Storage** | Supabase Realtime & Supabase Storage |
| **Payments** | Xendit Node SDK |
| **Communications** | MailerSend (Transactional Emails) |

### 2.2 Architectural Pattern
The system follows a strict separation of concerns using the **T3 Stack** pattern:
- **`src/server/api`**: "Backend Brain" containing business logic and tRPC router definitions.
- **`src/app/api/trpc/[trpc]`**: "HTTP Gateway" acting as the Next.js Route Handler adapter.
- **`src/trpc`**: "Client SDK" providing hooks and glue for frontend consumption.

---

## 3. Data Models (Prisma)

### 3.1 Core Entities

#### **User (`m_users`)**
Master table for all platform users.
- `user_id`: Primary Key (UUID)
- `email`: Unique identifier
- `role`: USER, ADMIN
- `tier`: FREE, PRO, ENTERPRISE
- `is_verified`, `is_suspended`: Account status flags
- `rating`: Average score from reviews

#### **Listing (`t_listings`)**
Digital items posted for sale.
- `listing_id`: Primary Key (UUID)
- `listing_type`: FIXED, AUCTION
- `status`: DRAFT, ACTIVE, SOLD, CANCELLED, PENDING
- `price`: For fixed-price sales
- `auction_fields`: `starting_bid`, `reserve_price`, `auction_ends_at`, `auction_status`
- `credentials`: `login_username`, `login_password` (Optional auto-delivery)

#### **Transaction (`t_transactions`)**
Central entity connecting buyer, seller, and listing.
- `transaction_id`: Primary Key (UUID)
- `status`: PENDING_PAYMENT, PAID, ITEM_TRANSFERRED, VERIFIED, COMPLETED, DISPUTED, REFUNDED
- `verification_deadline`: 24-hour window timestamp
- `payout_amount`: Calculated after platform fees

#### **Dispute (`t_disputes`)**
Formal complaints during the verification period.
- `dispute_category`: NOT_AS_DESCRIBED, ACCESS_ISSUE, FRAUD, OTHER
- `status`: OPEN, UNDER_REVIEW, RESOLVED
- `resolution`: FULL_REFUND, PARTIAL_REFUND, NO_REFUND

### 3.2 Supporting Entities
- **Bid**: Records all auction bid history.
- **Payment**: Tracks Xendit payment attempts and status.
- **Message**: Scoped transaction-level chat messages.
- **Review**: Post-transaction peer ratings.
- **Category**: Hierarchical taxonomy for listings.
- **AuditLog**: Immutable trail of critical system actions.

---

## 4. Business Flows

### 4.1 Transaction Lifecycle (Fixed Price)
1. **Purchase**: Buyer clicks "Buy Now" → Transaction `PENDING_PAYMENT` created.
2. **Payment**: Buyer pays via Xendit → Status updated to `PAID` via webhook.
3. **Transfer**: Seller marks item as transferred → Status `ITEM_TRANSFERRED` → 24hr timer starts.
4. **Verification**: 
   - Buyer confirms receipt → Status `COMPLETED` → Payout triggered.
   - Timer expires → Auto-release funds → Status `COMPLETED`.
   - Buyer disputes → Status `DISPUTED` → Timer paused.

### 4.2 Auction Flow
1. **Auction Active**: Users place bids higher than `current_bid` + `bid_increment`.
2. **End Time Reached**: 
   - Highest bid >= `reserve_price` → Transaction created for winner.
   - No bids or below reserve → Listing becomes `INACTIVE` or `CANCELLED`.

---

## 5. API Specification (tRPC)

The API is structured into domain-specific routers accessible via `api.<router>.<procedure>`.

| Router | Responsibility |
| :--- | :--- |
| **Auth** | Registration, session management, profile updates. |
| **User** | KYC data, public profiles, tier upgrades. |
| **Listing** | Search, filter, creation, and bidding logic. |
| **Transaction**| Order creation, state transitions (markTransferred, etc). |
| **Dispute** | Complaint initiation and evidence management. |
| **Admin** | Dashboard stats, dispute resolution, user/listing moderation. |

---

## 6. Security & Infrastructure

- **Authentication**: JWT and Session-based via NextAuth.js.
- **Authorization**: Role-Based Access Control (RBAC) integrated into tRPC procedures.
- **Data Protection**: `bcrypt` hashing for passwords; SSL/TLS for all traffic.
- **Rate Limiting**: Database-backed (`RateLimit` table) and Redis-based limiting.
- **KYC**: Seller verification required via ID card uploads for high-tier access.

---

## 7. Implementation Status (Real-world Delta)

While the specification defines the goal, the following deltas exist in the current implementation:
- **Real-time Chat**: UI components exist but backend tRPC procedures are pending.
- **Payment Webhooks**: Core logic for Xendit webhooks is being integrated; currently using mock completions.
- **Auto-Release Worker**: Cron jobs for 24-hour verification timeout are in the design phase.
- **Auction Engine**: Basic bidding is implemented; auto-bid and reserve price constraints need refinement.
