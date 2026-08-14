# PLAN — OrganizaDev (Kanban)

This file is the step-by-step plan to continue the project without getting lost.
Rule: do one phase at a time. Don’t start the next phase until DoD is true.

---

## 0) Project sanity / “don’t build on sand”

### Goal
Make sure the repo is runnable and you can iterate safely.

### Tasks
- [ ] Install deps at repo root:
  - `pnpm install`
- [ ] Run backend checks:
  - `pnpm --filter backend run test`
  - `pnpm --filter backend run type-check`
  - `pnpm --filter backend run lint`
- [ ] Run frontend checks:
  - `pnpm --filter frontend run type-check`
  - `pnpm --filter frontend run lint`
  - `pnpm --filter frontend run test`

### Notes / Known risk to verify
- Auth tests might not reflect current implementation (check that tests match real guard logic).
  - If you recently moved from `supabase.auth.getUser()` to `jose.jwtVerify()`, ensure specs test the current behavior.

### DoD
- All commands above run (or you understand exactly which failure is pre-existing vs caused by you).

---

## 1) Auth correctness (Backend) — close the last missing spec

### Goal
WS auth is as reliable as HTTP auth and covered by tests.

### Tasks
- [ ] Add a `AuthWSGuard` spec (Vitest) that covers:
  - missing token in `handshake.auth.token` → Unauthorized
  - invalid token / jwtVerify throws → Unauthorized
  - valid token → attaches user to socket context (or whatever your guard does)
- [ ] Ensure `AuthGuard` spec tests the *actual implementation* (jwtVerify + issuer/audience).
- [ ] Decide WS token-expiry behavior for MVP:
  - Option A (simple): validate only on connect; client reconnects when Supabase refreshes token
  - Option B (strict): disconnect socket at token exp and force reconnect

### DoD
- `pnpm --filter backend run test` passes including the new WS guard spec.

---

## 2) Auth flow (Frontend) — make login/signup real

### Goal
A user can sign up, confirm email, sign in, and reach `/dashboard`.

### Tasks
- [ ] Implement pages:
  - [ ] `src/pages/Login.tsx`
  - [ ] `src/pages/Signup.tsx`
  - [ ] `src/pages/CheckEmail.tsx`
- [ ] Add router paths:
  - `/login`, `/signup`, `/check-email`, `/dashboard`
- [ ] Decide token/session strategy (recommended for MVP):
  - Let Supabase persist/refresh session (default)
  - Read access token when needed for backend calls / socket handshake

### DoD
- You can:
  - sign up → redirected to `/check-email`
  - confirm email → can sign in
  - sign in → redirected to `/dashboard`

---

## 3) Frontend auth state (choose one) — stop the chaos early

### Goal
Any part of the app can reliably know: loading / logged in / logged out + access token.

### Option A (recommended): AuthBootstrap + Zustand authStore
- [ ] Add a global listener using `supabase.auth.onAuthStateChange`
- [ ] Store `status`, `user`, `session`, `accessToken`
- [ ] Route protection (`RequireAuth`) for `/dashboard`

### Option B: React Context Provider
Same idea, different implementation style.

### DoD
- Refreshing the page does NOT randomly bounce between `/login` and `/dashboard`
- Navbar / UI reacts immediately to login/logout without manual refresh

---

## 4) Backend API integration (Frontend) — one clean fetch wrapper

### Goal
All calls to NestJS automatically include `Authorization: Bearer <supabase_jwt>`.

### Tasks
- [ ] Add `VITE_API_URL` (example: `http://localhost:3000`)
- [ ] Create `apiFetch(path, options)` wrapper that:
  - reads current access token (from store OR from `supabase.auth.getSession()`)
  - attaches Authorization header
  - throws a clear error if token is missing (unauthenticated)
  - parses JSON + handles non-2xx errors consistently

### DoD
- You can call a protected backend endpoint from the dashboard and see real data.

---

## 5) Types first (Frontend) — stop guessing payloads

### Goal
Frontend types match backend responses/events so state is predictable.

### Tasks
- [ ] Create `src/types/board.types.ts` with at least:
  - `Board`, `Column`, `Card`, `Label`
  - event payloads for socket: `{ boardId, userId, data }`
- [ ] Add a `types` section for reorder:
  - `OrderItem { id: string; order: number }`

### DoD
- You can type your store/actions without `any` and without fighting TS.

---

## 6) Dashboard skeleton (Frontend) — layout before features

### Goal
You can see the dashboard layout even before full Kanban logic.

### Tasks
- [ ] Create layout components:
  - Sidebar (board list placeholder)
  - TopBar (board title placeholder)
  - Main area (kanban placeholder)
- [ ] Add “loading / empty states”:
  - no boards yet
  - boards loading
  - error fetching boards

### DoD
- Dashboard looks like the planned component tree (even with dummy data).

---

## 7) boardStore + uiStore (Zustand) — minimal but correct

### Goal
A clean state model you can update via REST + sockets without spaghetti.

### Tasks
- [ ] `boardStore` minimal:
  - `boards[]`, `activeBoardId`
  - normalized maps: `columnsById`, `cardsById`
  - derived selectors to render columns in order, cards by column
- [ ] `uiStore` minimal:
  - `sidebarOpen`, `activeFilter`, `isLoading`, `error`

### DoD
- You can fetch board data once and render it without duplicating state across components.

---

## 8) useSocket + real-time updates (Frontend)

### Goal
Sockets update Zustand state for other clients, and you ignore your own events.

### Tasks
- [ ] Create `useSocket()` hook:
  - connects only when authenticated
  - sends token in `handshake.auth.token`
  - joins room for active board
- [ ] Add listeners:
  - `card:created`, `card:updated`, `card:deleted`, `card:reordered`
  - `column:*`, `label:*`
- [ ] Ignore events where `payload.userId === currentUserId`

### DoD
- Open 2 browsers:
  - create card in one → other updates live
  - same client doesn’t “double apply” the change

---

## 9) DnD reorder (Frontend) + reconciliation (don’t lie to the user)

### Goal
Drag and drop feels instant but stays consistent with server truth.

### Tasks
- [ ] Implement `@dnd-kit` for columns and cards
- [ ] On drop:
  - do optimistic update in store
  - call reorder endpoint
  - if request fails: rollback or refetch
- [ ] Handle “concurrent reorder” strategy for MVP:
  - simplest: server is source of truth → refetch board on conflict/error

### DoD
- Reordering works and survives refresh.
- Failure doesn’t leave the UI corrupted.

---

## 10) MVP “release checklist”

### Goal
Minimum product that is stable enough to show.

### Checklist
- [ ] Auth works reliably (refresh, logout, login)
- [ ] Boards CRUD works
- [ ] Columns CRUD works + reorder works
- [ ] Cards CRUD works + reorder works
- [ ] Real-time sync works for at least card create/update/reorder
- [ ] Basic error UI (401, 403, 404)
- [ ] No secrets leaked to frontend env
- [ ] Docker compose dev flow works

### DoD
- You can demo: create board → create columns → create cards → drag reorder → open second tab and see sync.

---

## Working agreements (keep you sane)
- If you can’t explain a behavior: stop and write a 5-line note in this file.
- Every new feature must have:
  - a clear API contract (request/response shape)
  - a failure mode story (what user sees when it fails)
- Don’t scale early:
  - no multi-instance sockets until MVP is stable.

---

## Next action (pick ONE)
- If you want fastest progress: do Phase 2 (Frontend auth pages) then Phase 4 (apiFetch) then Phase 6 (dashboard skeleton).
- If you want safest backend confidence: do Phase 1 first.
