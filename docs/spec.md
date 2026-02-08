# DigiSecond Marketplace - Technical Specification

> **Version**: 1.0.0 | **Last Updated**: 2026-01-20  
> **Status**: MVP Specification  
> **Timeline**: 2 weeks (intensive)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Concepts & Glossary](#2-core-concepts--glossary)
3. [System Architecture](#3-system-architecture)
4. [Data Models](#4-data-models)
5. [MVP Feature Specifications](#5-mvp-feature-specifications)
6. [API Contracts](#6-api-contracts)
7. [Security Specification](#7-security-specification)
8. [Test Strategy](#8-test-strategy)
9. [Post-MVP Features](#9-post-mvp-features)

---

## 1. Project Overview

### 1.1 Vision

DigiSecond is an Indonesian digital goods marketplace enabling secure peer-to-peer trading of game accounts, in-game items, skins, and virtual assets with built-in escrow and dispute resolution.

### 1.2 Target Users

| Persona | Description | Primary Needs |
|---------|-------------|---------------|
| **Seller (Penjual)** | Gamers monetizing unused digital assets | Quick listing, safe payment, minimal fees |
| **Buyer (Pembeli)** | Gamers seeking affordable digital goods | Verified sellers, secure transactions, item authenticity |
| **Admin** | Platform operators | Fraud detection, dispute resolution, user management |

### 1.3 Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Transaction completion rate | >90% |
| Average dispute rate | <5% |
| Payment success rate | >95% |
| Page load time | <2s |

---

## 2. Core Concepts & Glossary

| Term | Definition |
|------|------------|
| **Listing** | A digital item posted for sale (fixed price or auction) |
| **Escrow** | Funds held by platform until buyer confirms delivery |
| **Verification Period** | 24-hour window for buyer to confirm item receipt |
| **Auto-Release** | Automatic fund release to seller after verification period |
| **Dispute** | Formal complaint initiated during verification period |
| **Reserve Price** | Hidden minimum price seller accepts in auction |

---

## 3. System Architecture

### 3.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|--------|
| **Web Framework** | Next.js (App Router) | 14.x |
| **Mobile Framework** | React Native + Expo | SDK 50 |
| **API** | tRPC | 10.x |
| **Database** | PostgreSQL (Supabase) | 15.x |
| **ORM** | Prisma | 5.x |
| **Auth** | NextAuth.js | 4.x |
| **Styling (Web)** | Tailwind CSS | 3.x |
| **Styling (Mobile)** | React Native Paper | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **State** | Zustand + TanStack Query | 4.x / 5.x |
| **Payments** | Xendit Node SDK | 3.x |
| **Email** | MailerSend (SMTP) | - |
| **Cache/Queue** | Upstash Redis | - |
| **Real-time** | Supabase Realtime | - |

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 (Web)          │  React Native + Expo (Mobile)     │
│  - App Router               │  - iOS & Android                   │
│  - Tailwind CSS             │  - React Native Paper              │
│  - tRPC Client              │  - tRPC Client                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  tRPC Router                                                     │
│  - Type-safe procedures                                          │
│  - NextAuth.js sessions                                          │
│  - Zod validation                                                │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA & SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Supabase)     │  Supabase Storage (Files)          │
│  - Prisma ORM              │  - Listing photos                   │
│  - Migrations              │  - Evidence uploads                 │
├────────────────────────────┼────────────────────────────────────┤
│  Upstash Redis             │  Supabase Realtime                  │
│  - Session cache           │  - Chat messages                    │
│  - Rate limiting           │  - Bid updates                      │
├────────────────────────────┼────────────────────────────────────┤
│  Xendit (Payments)         │  MailerSend (SMTP)                  │
│  - VA, E-wallet, QRIS      │  - Transaction emails               │
│  - Webhooks                │  - Notifications                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Team Responsibilities

| Role | Scope | Primary Files |
|------|-------|---------------|
| **Backend** | tRPC routers, Prisma schema, Xendit integration, auth | `src/server/**`, `prisma/**` |
| **Frontend Web** | Next.js pages, components, Tailwind styling | `src/app/**`, `src/components/**` |
| **Frontend Mobile** | React Native screens, navigation, Paper components | `mobile/src/**` |

### 3.3 Repository Structure

```
DigiSecond/
├── docs/
│   └── spec.md                 # This file
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Shared React components
│   ├── server/
│   │   ├── api/
│   │   │   └── routers/        # tRPC routers
│   │   ├── auth.ts             # NextAuth config
│   │   └── db.ts               # Prisma client
│   ├── lib/                    # Utilities
│   └── types/                  # Shared TypeScript types
├── mobile/
│   ├── src/
│   │   ├── screens/            # React Native screens
│   │   ├── components/         # Mobile components
│   │   └── navigation/         # Stack/Tab navigators
│   └── app.json                # Expo config
└── .agent/
    ├── workflows/              # Development workflows
    └── skills/                 # Role-specific skills
```

---

## 4. Data Models

### 4.1 Entity Relationship Diagram (Conceptual)

```mermaid
erDiagram
    USER ||--o{ LISTING : creates
    USER ||--o{ BID : places
    USER ||--o{ TRANSACTION : "buys/sells"
    USER ||--o{ REVIEW : "gives/receives"
    USER ||--o{ MESSAGE : sends
    
    LISTING ||--o{ BID : has
    LISTING ||--o{ PHOTO : contains
    LISTING ||--|| CATEGORY : belongs_to
    LISTING ||--o| TRANSACTION : results_in
    
    TRANSACTION ||--o{ MESSAGE : has
    TRANSACTION ||--o| DISPUTE : may_have
    TRANSACTION ||--o{ PAYMENT : has
    
    DISPUTE ||--o{ EVIDENCE : contains
```

### 4.2 Core Entities

#### User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique, verified |
| phone | String? | Optional, for WA verification |
| name | String | Display name |
| avatar | String? | Profile photo URL |
| role | Enum | BUYER, SELLER, ADMIN |
| rating | Float | Average rating (0-5) |
| verified | Boolean | Email/phone verified |
| suspended | Boolean | Account status |
| createdAt | DateTime | Registration date |

#### Listing

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sellerId | UUID | FK to User |
| title | String | 5-100 chars |
| description | String | 20-5000 chars |
| price | Int | Price in IDR (min 1000) |
| categoryId | UUID | FK to Category |
| type | Enum | FIXED, AUCTION |
| status | Enum | DRAFT, ACTIVE, SOLD, CANCELLED |
| photos | String[] | URLs (max 5) |
| createdAt | DateTime | |

#### Auction (extends Listing where type=AUCTION)

| Field | Type | Description |
|-------|------|-------------|
| startingBid | Int | Minimum first bid |
| currentBid | Int? | Highest bid amount |
| reservePrice | Int? | Hidden minimum |
| bidIncrement | Int | Min increment (default 5000) |
| buyNowPrice | Int? | Instant purchase price |
| endsAt | DateTime | Auction end time |
| status | Enum | INACTIVE, ACTIVE, ENDED |

#### Transaction

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| listingId | UUID | FK to Listing |
| buyerId | UUID | FK to User |
| sellerId | UUID | FK to User |
| amount | Int | Final price in IDR |
| platformFee | Int | Platform cut |
| status | Enum | PENDING_PAYMENT, PAID, ITEM_TRANSFERRED, VERIFIED, COMPLETED, DISPUTED, REFUNDED |
| verificationDeadline | DateTime | Auto-release time |
| createdAt | DateTime | |

#### Payment

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| transactionId | UUID | FK to Transaction |
| xenditId | String | Xendit payment ID |
| method | Enum | VA, EWALLET, QRIS, CARD, RETAIL |
| amount | Int | Amount in IDR |
| status | Enum | PENDING, PAID, EXPIRED, REFUNDED |
| paidAt | DateTime? | |

#### Dispute

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| transactionId | UUID | FK to Transaction |
| initiatorId | UUID | FK to User (buyer) |
| category | Enum | NOT_AS_DESCRIBED, ACCESS_ISSUE, FRAUD, OTHER |
| description | String | Issue description |
| status | Enum | OPEN, UNDER_REVIEW, RESOLVED |
| resolution | Enum? | FULL_REFUND, PARTIAL_REFUND, NO_REFUND |
| resolvedAt | DateTime? | |

---

## 5. MVP Feature Specifications

> [!IMPORTANT]
> **MVP Scope**: 2-week timeline. Features marked ⭐ are critical path.

### 5.1 Listing Management

#### ⭐ Create Listing (Fixed Price Only)

**User Story**: As a seller, I want to create a listing so buyers can find and purchase my item.

**Acceptance Criteria**:
- [ ] User can create listing with title, description, price, category
- [ ] User can upload 1-5 photos
- [ ] Validation: title 5-100 chars, description 20-5000 chars, price 1000-999999999 IDR
- [ ] Listing status starts as DRAFT, changes to ACTIVE on publish
- [ ] XSS/SQL injection prevention on all text inputs

**Edge Cases**:
- Reject empty required fields with specific error messages
- Handle Unicode/emoji in text correctly
- Reject if user suspended/banned
- Photo upload partial failure: save successful uploads, retry failed only
- Account banned/deleted: remove all listings (soft delete)

**Security**:
- Authorization: only authenticated users
- Rate limit: 10 listings/hour

---

#### ⭐ View/Search Listings

**User Story**: As a buyer, I want to search listings so I can find items to purchase.

**Acceptance Criteria**:
- [ ] Keyword search on title and description
- [ ] Filter by category, price range
- [ ] Sort by: newest, price low-high, price high-low
- [ ] Pagination (24 per page)
- [ ] Response time <500ms

**Edge Cases**:
- Empty search returns all active listings
- Handle special characters in search
- Return empty array for no matches (not error)

---

#### Edit/Delete Listing

**User Story**: As a seller, I want to edit or remove my listings.

**Acceptance Criteria**:
- [ ] Edit all fields of own listing
- [ ] Soft delete (status → CANCELLED)
- [ ] Prevent delete if pending transaction exists

---

### 5.2 Transaction Flow

#### ⭐ Purchase Item (Fixed Price)

**User Story**: As a buyer, I want to purchase a listing and pay securely.

**Acceptance Criteria**:
- [ ] Click "Buy Now" creates Transaction in PENDING_PAYMENT
- [ ] Generate Xendit payment (VA, E-wallet, QRIS)
- [ ] 24-hour payment deadline
- [ ] On payment webhook: status → PAID, notify seller
- [ ] Listing status → SOLD

**Edge Cases**:
- Handle payment timeout (status → CANCELLED)
- Handle duplicate webhook (idempotency key)
- Price changed between view and purchase: warn buyer, require re-confirm
- Seller banned during pending payment: auto-refund buyer
- No partial payments supported

**Security**:
- Verify Xendit webhook signature
- HTTPS-only endpoints
- Log all payment events

---

#### ⭐ Item Transfer Confirmation

**User Story**: As a buyer, I want to confirm I received the item so funds are released.

**Acceptance Criteria**:
- [ ] After payment: seller notified to transfer item
- [ ] Seller marks "Item Transferred" with screenshot
- [ ] 24-hour verification countdown starts
- [ ] Buyer clicks "Confirm Received" → funds released to seller
- [ ] Auto-release if countdown expires without dispute

**Edge Cases**:
- Prevent confirm if dispute opened
- Buyer confirms then disputes: block dispute after confirmation
- Seller not transferring: auto-refund after 48hr of no action

---

#### ⭐ Fund Release

**User Story**: As a seller, I want to receive payment after buyer confirms.

**Acceptance Criteria**:
- [ ] Funds held in escrow until verification complete
- [ ] Platform fee deducted (5% default)
- [ ] Payout to seller's registered bank account
- [ ] Transaction status → COMPLETED

---

### 5.3 Dispute Resolution

#### ⭐ Open Dispute

**User Story**: As a buyer, I want to report issues if item not as described.

**Acceptance Criteria**:
- [ ] "Report Issue" button during verification period
- [ ] Select category + describe issue + upload evidence
- [ ] Pauses auto-release countdown
- [ ] Notifies seller and admin

**Edge Cases**:
- Prevent duplicate disputes on same transaction
- Reject if verification period (24hr) expired
- Dispute opened at last minute (23hr 59min): accept, pause countdown

---

#### Admin Resolve Dispute

**User Story**: As an admin, I want to review disputes and issue resolutions.

**Acceptance Criteria**:
- [ ] View dispute queue
- [ ] Review evidence from both parties
- [ ] Select resolution: full refund, partial refund, no refund
- [ ] Execute resolution (refund or release)
- [ ] Notify both parties

**Edge Cases**:
- Partial refund must be ≤ original transaction amount
- Dispute unresolved for 3 days: auto-escalate, SLA alert
- Conflicting evidence: admin discretion, document decision in audit log

---

### 5.4 User & Auth

#### ⭐ User Registration/Login

**User Story**: As a user, I want to create an account and log in securely.

**Acceptance Criteria**:
- [ ] Email/password registration
- [ ] Email verification (6-digit code)
- [ ] OAuth: Google login
- [ ] Session management via NextAuth.js
- [ ] Password: min 8 chars, 1 uppercase, 1 number

**Security**:
- bcrypt hashing (cost 12)
- Rate limit: 5 login attempts/15min
- Secure session cookies (httpOnly, secure, sameSite)

**Edge Cases**:
- Email already registered: return specific error
- Verification code rate limit: 1 per minute, block at 3 in 10min
- Password reset for unknown email: same success message (prevent enumeration)
- User banned mid-session: check ban status on each request
- Account deletion during active transaction: block entirely

---

#### User Profile

**User Story**: As a user, I want to view and edit my profile.

**Acceptance Criteria**:
- [ ] View own profile (name, avatar, rating, join date)
- [ ] Edit name, avatar
- [ ] View transaction history
- [ ] View given/received reviews

---

### 5.5 Communication

#### ⭐ Transaction Chat

**User Story**: As a buyer/seller, I want to communicate about a transaction.

**Acceptance Criteria**:
- [ ] Chat thread per transaction
- [ ] Real-time messages via Supabase Realtime
- [ ] Image attachment support (<5MB)
- [ ] Only transaction participants can chat

**Security**:
- Authorization check on every message
- XSS protection
- Rate limit: 20 messages/minute

**Edge Cases**:
- Off-platform contact (phone/email): warn "Sharing personal info is not safe"
- Message to completed transaction: allow for 7 days post-completion
- WebSocket disconnect: auto-reconnect, fetch missed messages

---

### 5.6 Rating & Reviews

#### Post-Transaction Review

**User Story**: As a user, I want to rate my transaction partner.

**Acceptance Criteria**:
- [ ] 1-5 star rating after COMPLETED transaction
- [ ] Optional text review (10-1000 chars)
- [ ] Both parties can rate each other
- [ ] Updates user's average rating

**Edge Cases**:
- Review only available if completed transaction with recipient
- Prevent duplicate reviews for same transaction
- Reviewer deletes account: keep review, show "Deleted user"
- Review text is whitespace-only: validate minimum meaningful content


---

### 5.7 Wishlist

#### ⭐ Manage Wishlist

**User Story**: As a buyer, I want to save listings to a wishlist so I can easily find them later.

**Acceptance Criteria**:
- [ ] Toggle button (heart icon) on listing card and detail view
- [ ] View list of wishlisted items
- [ ] Remove items from wishlist
- [ ] Persist wishlist across sessions (for logged-in users)

**Edge Cases**:
- Item in wishlist is sold/deleted: show as unavailable or remove automatically
- Guest user: prompt to login or store locally (MVP: require login)

---

## 6. API Contracts

### 6.1 tRPC Router Structure

```
src/server/api/routers/
├── auth.ts           # Authentication procedures
├── user.ts           # User profile procedures
├── listing.ts        # Listing CRUD procedures
├── transaction.ts    # Purchase/verification procedures
├── payment.ts        # Xendit integration procedures
├── dispute.ts        # Dispute procedures
├── message.ts        # Chat procedures
└── review.ts         # Rating procedures
```

### 6.2 Procedure Reference

#### Auth Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `auth.register` | mutation | Create new user account |
| `auth.verifyEmail` | mutation | Verify email with code |
| `auth.resendCode` | mutation | Resend verification code |

#### User Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `user.me` | query | Get current user profile |
| `user.getById` | query | Get public user profile |
| `user.update` | mutation | Update own profile |
| `user.getTransactions` | query | Get user's transaction history |

#### Listing Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `listing.create` | mutation | Create new listing |
| `listing.update` | mutation | Update own listing |
| `listing.delete` | mutation | Soft delete listing |
| `listing.getById` | query | Get single listing |
| `listing.search` | query | Search/filter listings |
| `listing.getByUser` | query | Get user's listings |
| `listing.uploadPhoto` | mutation | Upload listing photo |

#### Transaction Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `transaction.create` | mutation | Initiate purchase |
| `transaction.getById` | query | Get transaction details |
| `transaction.markTransferred` | mutation | Seller marks item sent |
| `transaction.confirmReceived` | mutation | Buyer confirms receipt |
| `transaction.getActive` | query | Get pending transactions |

#### Payment Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `payment.create` | mutation | Create Xendit payment |
| `payment.getStatus` | query | Check payment status |
| `payment.webhook` | mutation | Handle Xendit callback |

#### Dispute Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `dispute.create` | mutation | Open dispute |
| `dispute.getById` | query | Get dispute details |
| `dispute.addEvidence` | mutation | Upload evidence |
| `dispute.resolve` | mutation | Admin resolution (admin only) |
| `dispute.getQueue` | query | Get dispute queue (admin only) |

#### Message Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `message.send` | mutation | Send message in transaction |
| `message.getByTransaction` | query | Get chat history |
| `message.markRead` | mutation | Mark messages as read |

#### Review Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `review.create` | mutation | Submit review |
| `review.getByUser` | query | Get user's reviews |

#### Wishlist Router

| Procedure | Type | Description |
|-----------|------|-------------|
| `wishlist.toggle` | mutation | Add/remove listing from wishlist |
| `wishlist.getAll` | query | Get user's wishlist |
| `wishlist.check` | query | Check if listing is in wishlist |

---

## 7. Security Specification

### 7.1 Authentication

| Requirement | Implementation |
|-------------|----------------|
| Password hashing | bcrypt, cost factor 12 |
| Session tokens | NextAuth.js with JWT strategy |
| Cookie flags | httpOnly, secure, sameSite=strict |
| Session expiry | 30 days |
| Email verification | 6-digit code, 10-minute expiry |

### 7.2 Authorization

| Resource | Owner Access | Admin Access | Public Access |
|----------|--------------|--------------|---------------|
| Listing | CRUD | CRUD | Read |
| Transaction | Read own | Read all | None |
| User profile | Edit own | Edit all | Read public |
| Dispute | Create (buyer) | Resolve | None |
| Messages | Transaction participants | Read all | None |

### 7.3 Input Validation

- All inputs validated with Zod schemas
- SQL injection: Prisma parameterized queries
- XSS: HTML escaping on output, sanitize on input
- File uploads: validate MIME type, max size, scan for malware

### 7.4 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Login | 5/15min per IP |
| Register | 3/hour per IP |
| Listing create | 10/hour per user |
| Search | 60/min per IP |
| Message send | 20/min per user |
| Payment create | 10/hour per user |

---

## 8. Test Strategy

### 8.1 Test Pyramid

```
         /\
        /E2E\        5 tests (critical paths)
       /------\
      /Integration\ 20 tests (API + DB)
     /------------\
    /  Unit Tests  \ 50+ tests (business logic)
   /----------------\
```

### 8.2 MVP Critical Path Tests

#### E2E Tests (Playwright)

1. **Complete Purchase Flow**: Search → View → Buy → Pay → Confirm → Complete
2. **Seller Listing Flow**: Login → Create Listing → Publish → View Active
3. **Dispute Flow**: Purchase → Report Issue → Admin Resolve
4. **Auth Flow**: Register → Verify Email → Login → Logout
5. **Chat Flow**: Purchase → Send Message → Receive Reply

#### Integration Tests

| Domain | Key Tests |
|--------|-----------|
| Listing | Create with validation, search with filters |
| Transaction | Create payment, webhook handling, state transitions |
| Auth | Register, verify, login, session management |
| Dispute | Create, evidence upload, resolution |

#### Unit Tests

| Module | Coverage Target |
|--------|-----------------|
| Validation schemas | 100% |
| Business logic (fee calculation, status transitions) | 100% |
| Utility functions | 90% |

### 8.3 Security Tests

- [ ] SQL injection attempts on all inputs
- [ ] XSS attempts in text fields
- [ ] CSRF token validation
- [ ] Authorization bypass attempts
- [ ] Rate limiting verification

---

## 9. Post-MVP Features

> Features deferred from MVP, prioritized for future sprints.

### Phase 2 (Week 3-4): Auctions & Subscriptions

| Priority | Feature | Effort |
|----------|---------|--------|
| P1 | Auction system (bidding, auto-bid, extensions) | 5 days |
| P1 | Seller subscription tiers (Free/Bronze/Silver/Gold) | 3 days |
| P2 | Premium listing features (featured, urgent) | 2 days |

### Phase 3 (Week 5-6): Enhanced UX

| Priority | Feature | Effort |
|----------|---------|--------|
| P1 | Push notifications (Firebase) | 3 days |
| P1 | Email notifications (transactional) | 2 days |
| P2 | Wishlist with price alerts | 2 days |
| P2 | Saved searches | 1 day |

### Phase 4 (Week 7-8): Trust & Safety

| Priority | Feature | Effort |
|----------|---------|--------|
| P1 | 2FA (authenticator app) | 2 days |
| P1 | Phone verification (WhatsApp OTP) | 2 days |
| P2 | ID verification | 3 days |
| P2 | Fraud detection (velocity checks) | 3 days |

### Phase 5 (Week 9+): Growth

| Priority | Feature | Effort |
|----------|---------|--------|
| P2 | Video showcase for listings | 3 days |
| P2 | Social features (follow sellers) | 2 days |
| P3 | API for partners (Gold tier) | 5 days |
| P3 | Advanced analytics dashboard | 5 days |

---

## Appendix A: Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Xendit
XENDIT_SECRET_KEY=...
XENDIT_WEBHOOK_TOKEN=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email (MailerSend SMTP)
EMAIL_SERVER=smtp://user:password@smtp.mailersend.net:587
EMAIL_FROM=YourApp <noreply@yourdomain.com>
```

---

## Appendix B: Category Taxonomy

| Game/Platform | Item Types |
|--------------|------------|
| Mobile Legends | Accounts, Diamonds, Skins, Heroes |
| Free Fire | Accounts, Diamonds, Characters, Bundles |
| PUBG Mobile | Accounts, UC, Skins, Royal Pass |
| Genshin Impact | Accounts, Genesis Crystals, Characters |
| Valorant | Accounts, VP, Skins, Battlepasses |
| Roblox | Accounts, Robux, Limiteds |
| Steam | Accounts, Games, Items |
| PlayStation | Accounts, Gift Cards |
| Nintendo | Accounts, eShop Cards |
| Other | Custom category |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-20 | Antigravity | Initial MVP specification |
