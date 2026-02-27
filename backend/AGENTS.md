# DG Technical Test - Backend AI Agents Manual

## 1. Technologies & Libraries
- **Runtime & Tooling:** Bun
- **Framework:** ElysiaJS (`elysia`)
- **Language:** TypeScript
- **Database:** **PostgreSQL**
- **ORM:** **Drizzle ORM** (Use this for all database schemas, migrations, and queries)
- **Authentication:** **Better Auth** (Configured specifically for Email and Password authentication)
- **Validation:** **Zod** (Use Zod schemas for strictly validating all incoming API requests and business logic)
- **Testing:** Bun Test

## 2. Backend Commands
Execute these inside the `backend/` directory or using `bun -F backend <command>` from root:
- **Dev Server:** `bun run dev`
- **Run all tests:** `bun test`
- **Run a single test:** `bun test src/path/to/service.test.ts`
- **Run specific test by name:** `bun test -t "Test Name"`
- **Watch mode:** `bun test --watch`

---

## 3. Design Patterns & Architecture

**Layered Architecture:**
- Separate routing from business logic. Implement a structured Controller/Service/Repository pattern to decouple DB interactions from API transport logic.

**Database & Drizzle ORM (PostgreSQL):**
- Choose **Drizzle ORM** for defining typed schemas and interacting with **PostgreSQL**.
- Ensure the Drizzle schema includes a `deletedAt` timestamp for the soft-delete requirement (users shouldn't be fully erased from DB).
- Map entity relationships carefully (distinguishing PF and PJ data).

**Authentication & Security (Better Auth):**
- Use **Better Auth** specifically for Email and Password authentication mechanisms (login, registration, password hashing/resets, session management).
- Integrate Better Auth with Drizzle ORM for robust session and user persistence.
- Implement strict RBAC checks via Elysia hooks/middleware. Admins only for creating/deleting users or changing roles.

**Validation (Zod):**
- Strictly validate all incoming data payloads (body, query, params) using **Zod** before they reach the service layer.
- Use Elysia integrations for Zod (e.g., `t` from Elysia TypeBox or an Elysia-Zod plugin) so errors are formatted natively.

**External Integrations:**
- Implement robust service classes for **ViaCEP** (addresses) and **ReceitaWS** (company data) with proper error handling, caching, and fallback mechanisms. The backend mediates these to avoid CORS on the frontend.

**Error Handling & Logging:**
- Never throw unhandled exceptions to the client. Use Elysia's error hooks to catch exceptions and return structured JSON error responses with appropriate HTTP status codes (400, 401, 403, 404, 500).
- Use structured logging (e.g., `console.error`) to aid debugging, especially for external API failures or validation errors.

**Documentation:**
- Expose an OpenAPI (Swagger) endpoint at `/api/docs` (using `@elysiajs/swagger`).
