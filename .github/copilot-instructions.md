# Copilot instructions for OrganizaDev

Purpose: Help Copilot-based agents understand how to build, test and work in this repository.

Build / Test / Lint commands

- Root (monorepo) uses pnpm (pnpm@10+) as package manager. Use `pnpm install` at the repo root to install all packages.
- Backend (Nest + TypeScript + Prisma)
  - Install: pnpm install (in repo root)
  - Build: pnpm --filter backend run build
  - Dev: pnpm --filter backend run start:dev
  - Start (production): pnpm --filter backend run start:prod
  - Lint: pnpm --filter backend run lint
  - Test (full): pnpm --filter backend run test
  - Test (watch): pnpm --filter backend run test:watch
  - Single test file (run one vitest file): pnpm --filter backend run vitest -- test/path/to/file.spec.ts
  - Type-check: pnpm --filter backend run type-check
  - Prisma: pnpm --filter backend run prisma generate (used in Dockerfile)

- Frontend (React + Vite + TypeScript)
  - Dev: pnpm --filter frontend run dev
  - Build: pnpm --filter frontend run build
  - Preview: pnpm --filter frontend run preview
  - Lint: pnpm --filter frontend run lint
  - Test: pnpm --filter frontend run test
  - Single test file (run one vitest file): pnpm --filter frontend run vitest -- test/path/to/file.spec.ts
  - Type-check: pnpm --filter frontend run type-check

Docker / Compose

- Dockerfiles exist in backend/ and frontend/ for building production images. Backend expects Prisma client generated and dist built before runtime.
- docker-compose.yml present at repo root (used for local multi-service dev); run `docker-compose up --build`.

High-level architecture

- Monorepo with at least two packages: backend and frontend. Root package.json delegates to pnpm workspace.
- Backend: NestJS (v11) application using TypeScript. Uses Prisma as ORM with a generated client at `backend/src/generated/prisma` and PostgreSQL as the datasource. Fastify adapter is included. Authentication integrations and external project syncs are modeled (Integrations, BoardIntegration). Key domain models: Users, Boards, Columns, Cards, Labels, Comments, Attachments.
- Frontend: React + Vite TypeScript app built into a static site served by Nginx in production Dockerfile.
- Database: PostgreSQL (Supabase values present in backend/.env). Prisma migrations live under backend/prisma/migrations.
- Testing: Vitest configured for backend with swc plugin; jest used for e2e test script (legacy config available).

Key conventions and repo-specific notes

- pnpm workspace: workspace uses pnpm; Dockerfiles install pnpm globally and run `pnpm install --frozen-lockfile`.
- Prisma: Generated client output is configured to `backend/src/generated/prisma`. Always run `prisma generate` after installing dependencies or when schema changes.
- TypeScript build: Frontend run `tsc -b` before vite build. Backend uses `tsc --noEmit` as a type-check step during build.
- Tests: Unit tests run via Vitest. For a single file, run vitest directly with node path or via the package script using `pnpm --filter <pkg> run vitest -- path/to/file`.
- Linting/formatting: Prettier and ESLint are configured; run `pnpm --filter <pkg> run format` or `lint` in package scripts.
- Environment: Sensitive keys live under backend/.env (do not commit these in other repos). Dockerfile copies prisma and dist into final image and runs as non-root `node` user.

AI assistant helper hints

- When running tests or builds in CI, ensure `pnpm install --frozen-lockfile` is used and `pnpm --filter backend run prisma generate` is executed before `pnpm --filter backend run build`.
- For code navigation, focus on backend/src for domain logic and prisma folder for schema and migrations.
- When modifying Prisma schema, run `pnpm --filter backend run prisma generate` and create a migration.

If you want, Copilot can also configure MCP servers relevant to this repo (for example, Playwright or other test runners). Please say which servers to add.

---

Created by Copilot CLI helper.