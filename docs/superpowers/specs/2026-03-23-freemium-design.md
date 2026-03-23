# Freemium Feature Design

**Date:** 2026-03-23
**Status:** Approved

---

## Overview

Add a Free / Pro billing tier to Devfluent using Stripe subscriptions. Free users access months 1–3 of the curriculum and up to 2 external courses. Pro users unlock all 12 months and unlimited courses. Billing is monthly ($9) or annual ($70). Plan state is stored in the database and kept in sync via Stripe webhooks.

---

## Plan Limits

| Feature | Free | Pro |
|---|---|---|
| Curriculum months | 1–3 | 1–12 |
| External courses | max 2 | unlimited |
| Roadmap tracking | all 8 | all 8 |
| XP / streaks / achievements | full | full |

Single source of truth in `lib/plans.ts`.

---

## Data Model

Five new fields on the `User` table (Prisma schema + migration):

```prisma
plan                 String    @default("free")  // "free" | "pro"
planExpiresAt        DateTime?                   // null = active; date = access ends (cancellations)
stripePeriodEnd      DateTime?                   // current billing period end — for renewal date display
stripeCustomerId     String?   @unique
stripeSubscriptionId String?   @unique
```

**`isPro(user)` helper:**
Returns `true` if `plan === "pro"` AND (`planExpiresAt` is null OR `planExpiresAt > now()`).
Used on every plan-gated code path; never repeated inline.

**Cancellation flow (graceful):** When a user cancels, Stripe sets `cancel_at_period_end=true` and fires `customer.subscription.updated`. The webhook stores the period-end date in `planExpiresAt` and leaves `plan = "pro"` — the user retains access until that date. When the billing period ends, Stripe fires `customer.subscription.deleted` (after the period ends, access has already lapsed). At that point `plan` is set to `"free"` and `planExpiresAt` cleared to `null`.

**Cancellation flow (immediate):** If a subscription is cancelled immediately (no `cancel_at_period_end`), `customer.subscription.deleted` fires right away with `planExpiresAt` never having been set. The handler's `plan=free, planExpiresAt=null` write is correct in both cases — no special handling needed for immediate vs. graceful cancellation.

**After adding fields:** Run `prisma generate` to regenerate the client. The TypeScript type returned by `getCurrentUser()` will automatically include the new fields — no changes to `lib/user.ts` are needed.

---

## New Files

### `lib/plans.ts`
- `PLAN_LIMITS` constant (free/pro limits)
- `isPro(user: User): boolean` helper
- `canAddCourse(user: User, currentCount: number): boolean`
- `canAccessMonth(user: User, month: number): boolean`

### `app/api/billing/checkout/route.ts`
`POST` — creates a Stripe Checkout session.

Request body: `{ interval: "month" | "year" }`

Note: this is an intentional exception to the codebase's action-based POST pattern — billing routes have single purposes and do not need action dispatch.

Required Stripe parameters:
- `mode: 'subscription'` — must be explicitly set; without it Stripe defaults to `payment` mode and the session will not create a subscription
- `line_items` with the correct price ID (`STRIPE_PRICE_MONTHLY_ID` or `STRIPE_PRICE_ANNUAL_ID`)
- `customer` — if user already has `stripeCustomerId`, pass it so they are not asked for their email twice
- `customer_email` — if user has no `stripeCustomerId`, pass their email
- `success_url = /settings?upgraded=1`
- `cancel_url = /settings`

Returns `{ url }` — client redirects to the Stripe-hosted checkout page.

### `app/api/billing/portal/route.ts`
`POST` — creates a Stripe Customer Portal session for an existing subscriber.

Note: also an intentional exception to the action-based POST pattern.

- Requires `stripeCustomerId` on user; returns 400 if missing (user has no Stripe record)
- `return_url = /settings`
- Returns `{ url }` — client redirects

### `app/api/billing/webhook/route.ts`
`POST` — receives and verifies Stripe webhook events.

**Raw body access in Next.js 16 App Router:** Route handlers receive a standard Web API `Request` object. There is no automatic JSON body parsing — the handler calls `req.json()` or `req.text()` itself. To get the raw body for Stripe signature verification, call `const rawBody = await req.text()` at the very top of the handler. Do NOT call `req.json()` anywhere in this route. The Pages Router pattern `export const config = { api: { bodyParser: false } }` has no effect in the App Router and must not be used.

**Signature verification:**
```typescript
const sig = req.headers.get('stripe-signature')!
const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
```
Return 400 if verification throws.

**User lookup:** There is no Supabase session in a webhook route; `getCurrentUser()` cannot be used. Look up the user by Stripe customer ID from the event:
```typescript
const customerId = event.data.object.customer as string
const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } })
if (!user) return new Response('OK', { status: 200 }) // user deleted; acknowledge silently
```
Use `prisma.user.update` directly — never `getCurrentUser()`.

**Idempotency:** Stripe delivers webhooks at least once and retries on non-2xx responses. The writes below are safe to repeat (upsert-style or idempotent updates), but implementers should be aware that any handled event may fire more than once.

**Event handling:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Set `plan=pro`, store `stripeCustomerId` and `stripeSubscriptionId` (from `session.subscription`), set `planExpiresAt=null`. Note: `session.subscription` is only populated when `mode='subscription'` — this is why `mode` must be explicitly set in the checkout route. |
| `customer.subscription.updated` | Always: `stripePeriodEnd = new Date(subscription.current_period_end * 1000)`. If `cancel_at_period_end=true`: also `planExpiresAt = stripePeriodEnd`. If `cancel_at_period_end=false` (active or reactivated): `planExpiresAt = null`. |
| `customer.subscription.deleted` | `plan=free`, `planExpiresAt=null`, `stripeSubscriptionId=null`. This event fires after the billing period ends, so access has already lapsed at this point. |
| `invoice.payment_failed` | No-op — Stripe retries automatically. Can add email notification in a future iteration. |

Always return `new Response('OK', { status: 200 })` for unhandled events (prevents unnecessary Stripe retries).

---

## Modified Files

### `prisma/schema.prisma`
Add the four new User fields. Apply migration via `supabase_apply_migration` MCP tool — do not use direct psql (per AGENTS.md; WSL cannot reach Supabase port 5432 directly).

### `app/api/progress/course/route.ts`
In the `create` action, after the auth check and before the `prisma.externalCourse.create`, wrap the count check and creation in a transaction to prevent concurrent requests bypassing the limit:

```typescript
const result = await prisma.$transaction(async (tx) => {
  const count = await tx.externalCourse.count({ where: { userId: user.id } })
  if (!canAddCourse(user, count)) return null
  return tx.externalCourse.create({ data: { ... } })
})
if (!result) return NextResponse.json({ error: "Upgrade to Pro to add more courses" }, { status: 402 })
```

### `app/api/progress/block/route.ts`
After `const block = getBlock(blockId)` succeeds and `month` is extracted from the regex match (line ~24), before the transaction begins:

```typescript
if (!canAccessMonth(user, month)) {
  return NextResponse.json({ error: "Upgrade to Pro to access this month" }, { status: 402 })
}
```

Follow the existing `NextResponse.json({ error: "..." }, { status: N })` pattern — not bare `return 402`.

### `app/api/progress/project/route.ts`
After `const monthData = CURRICULUM.find(...)` succeeds, before the action dispatch:

```typescript
if (!canAccessMonth(user, month)) {
  return NextResponse.json({ error: "Upgrade to Pro to access this month" }, { status: 402 })
}
```

### `app/(dashboard)/learning/page.tsx`
Pass `isPro(user)` to the month list render. Months 4–12 rendered with a lock overlay when `!isPro`. Clicking a locked month opens `<UpgradePrompt>` as a modal (client-side state).

### `app/(dashboard)/learning/[month]/page.tsx`
Server-side guard at the top of the page component:

```typescript
if (!canAccessMonth(user, month)) redirect('/learning')
```

Prevents direct URL navigation to locked months.

### `app/(dashboard)/training/page.tsx`
Pass `courseCount` and `isPro(user)` down to `TrainingClient`.

### `app/(dashboard)/training/training-client.tsx`
When `!isPro && courseCount >= 2`:
- Disable "Add course" button with a tooltip "Upgrade to Pro for unlimited courses"
- Show inline `<UpgradePrompt>` below the button

Also handle `402` response from the API with an upgrade prompt (belt-and-suspenders against the UI gate being bypassed).

### `app/(dashboard)/settings/page.tsx`
Pass `user.plan`, `user.planExpiresAt`, `user.stripePeriodEnd` to the settings client.

### `app/(dashboard)/settings/settings-client.tsx`
Add billing section below existing profile/account sections:

- **Free user:** Two pricing cards (Monthly $9 / Annual $70 "Save 35%") with "Upgrade to Pro" CTAs that POST to `/api/billing/checkout`
- **Pro user (active):** "Pro" badge, "Renews on [stripePeriodEnd date]", "Manage subscription" button → POST to `/api/billing/portal`
- **Pro user (cancelling):** "Pro" badge, "Cancels on [planExpiresAt date]", "Manage subscription" button
- **`?upgraded=1` query param:** Show a success banner "Welcome to Pro!". Plan status must be read from the database (via server component props), not inferred from the query param — the param is unverified and only controls the banner display.

### `components/ui/upgrade-prompt.tsx`
New reusable component. Props: `feature: string`, `onClose?: () => void`.

Displays:
- The feature being gated (e.g. "Month 4: React Fundamentals")
- Two pricing cards: Monthly ($9) and Annual ($70, "Save 35%")
- CTA buttons that POST to `/api/billing/checkout` with `{ interval }` then redirect to the returned `url`

Used in two contexts:
1. Modal overlay when a free user clicks a locked curriculum month
2. Inline banner on the training page when the course limit is hit

---

## Environment Variables

```
STRIPE_SECRET_KEY                  # server-only
STRIPE_WEBHOOK_SECRET              # server-only — from Stripe CLI (local) or Stripe dashboard (prod)
STRIPE_PRICE_MONTHLY_ID            # price_xxx — monthly subscription price
STRIPE_PRICE_ANNUAL_ID             # price_xxx — annual subscription price
```

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not needed — using Checkout redirects, not Stripe.js elements.

---

## Security Notes

- All plan checks are server-side in API routes. UI gates are UX-only and provide no security.
- Webhook signature verification is mandatory. Any request that fails verification returns 400 without processing.
- `stripeCustomerId` and `stripeSubscriptionId` are stored server-side only; never exposed to the client.
- `isPro(user)` re-evaluates `planExpiresAt` on every call against `new Date()` — no stale plan state is possible.
- The `?upgraded=1` success banner is driven by a URL param that is not cryptographically verified — any user can append it. Plan access is determined from database fields only; the param affects only the welcome banner.

---

## Out of Scope

- Email notifications for failed payments
- Streak freeze tokens (future Pro feature)
- Team / cohort licensing
- Affiliate link tracking
