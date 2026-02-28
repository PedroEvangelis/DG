# DG Technical Test - Backend AI Agents Manual

## 1. Technologies & Libraries
- **Runtime & Tooling:** Bun
- **Framework:** ElysiaJS (`elysia`)
- **Language:** TypeScript
- **Database:** **PostgreSQL**
- **ORM:** **Drizzle ORM** (Use this for all database schemas, migrations, and queries)
- **Authentication:** **Better Auth** (Configured specifically for Email and Password authentication)
- **Validation:** **Zod** & **Elysia TypeBox** (`t`)
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

**External Integrations:**
- Implement robust service classes for **ViaCEP** (addresses) and **ReceitaWS** (company data) with proper error handling, caching, and fallback mechanisms. The backend mediates these to avoid CORS on the frontend.

**Error Handling & Logging:**
- Never throw unhandled exceptions to the client. Use Elysia's error hooks to catch exceptions and return structured JSON error responses with appropriate HTTP status codes (400, 401, 403, 404, 500).
- Use structured logging (e.g., `console.error`) to aid debugging, especially for external API failures or validation errors.

**Documentation:**
- Expose an OpenAPI (Swagger) endpoint at `/api/docs` (using `@elysiajs/swagger`).

---

## 4. Controller & Authorization Best Practices (Strict Rules)

**Strict Typing & DTOs (No `any` or `t.Any()`):**
- **NEVER** use `any` or `t.Any()` in your schemas or controller definitions. 
- All endpoints MUST define strict input (`body`, `params`, `query`) and output (`response`) schemas using Elysia's `t` (TypeBox).
- **Return Types (DTOs):** Define dedicated **DTOs (Data Transfer Objects)** in your schema files (e.g., `address.schema.ts`, `user.schema.ts`). These DTOs must strictly type the successful response payloads. This is mandatory for two reasons:
  1. It feeds the OpenAPI (Swagger) documentation natively.
  2. It generates precise TypeScript types for the frontend via Elysia Eden, avoiding `any` or `unknown` on the client side.
- Responses must always follow a consistent structure. Map each HTTP status code explicitly in the `response` definition (e.g., `{ 200: t.Object({ success: t.Literal(true), data: AddressDTO }), 400: t.Object({ success: t.Literal(false), message: t.String() }) }`).

**Authentication & Role-Based / Ownership-Based Access Control:**
- Use **Better Auth** for session management.
- Ensure endpoints mutating data (POST, PUT, PATCH, DELETE) or accessing sensitive data (GET /:id) enforce **Ownership Rules**:
  - **Admin Users:** Can view, create, edit, or delete ANY resource across the system.
  - **Simple Users:** Can ONLY view, create, edit, or delete resources that **belong strictly to them** (i.e., `resource.userId === session.user.id`).
- **Validation Flow for Edits/Deletions/Reads:**
  1. Retrieve the existing resource from the database via the Service layer.
  2. If the resource does not exist, return `404 Not Found`.
  3. Validate Ownership: If `session?.user.role !== 'admin'` AND `resource.userId !== session?.user.id`, immediately return a `403 Forbidden` response.
  4. Only proceed to return or mutate the data if the ownership/admin check passes.

**Controller Assembly Pattern:**
- Controllers should strictly act as the HTTP transport layer. They must:
  - Parse and validate inputs (via `body`, `params`, etc.).
  - Verify authorization (ownership & roles) dynamically inside the route handler or a specific hook.
  - Delegate the actual business logic to the `Service` layer.
  - Format the final output matching the strict `response` schema DTO.