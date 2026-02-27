# DG Technical Test - AI Agents Instruction Manual (Root)

## 1. Context & Project Overview
This project is a technical test for a full-stack engineering role, focusing on a robust **User Management System (CRUD)** featuring Authentication and Role-Based Access Control (RBAC: Admin vs. Simple users).

**Key Business Rules:**
- Users are divided into *Pessoa Física* (PF) requiring Name, DOB, CPF, Gender and *Pessoa Jurídica* (PJ) requiring Corporate Name, Trade Name, CNPJ.
- Strict validation rules apply (unique CPF, CNPJ, Email).
- Features include soft-delete and password reset mechanisms.
- The backend must mediate integrations with public APIs (**ViaCEP** for addresses and **ReceitaWS** for company data) to prevent CORS issues.

**Project Structure:**
- **Monorepo** managed with **Bun** (`bun.lock`, workspaces).
- Code quality (formatting and linting) is strictly enforced by **Biome** (`biome.json`).
- `frontend/`: React 19 + Vite + TanStack Router (See `frontend/AGENTS.md` for specific rules).
- `backend/`: ElysiaJS + Bun (See `backend/AGENTS.md` for specific rules).

---

## 2. Global Commands (Monorepo)

Execute these from the root directory:
- **Install dependencies:** `bun install`
- **Run dev servers (Front & Back concurrently):** `bun run dev`
- **Format Code:** `bun run format` (Runs Biome formatter)
- **Lint Code:** `bun run lint` (Runs Biome linter)
- **Check Code:** `bun run check` (Runs Biome check)

---

## 3. Global Code Style & Agent Guidelines

**Formatting & Linting (Biome):**
- **Indentation:** Tab characters (`indentStyle: "tab"`).
- **Quotes:** Double quotes (`quoteStyle: "double"`).
- Always run `bun run format` before finalizing code changes. Let Biome organize your imports (`organizeImports: "on"`).

**Typing (TypeScript):**
- **Strict Typing:** Avoid `any` at all costs. Use `unknown` if truly dynamic, but prefer strict interfaces and types.
- **Nullability:** Handle potentially undefined/null data gracefully using optional chaining (`?.`) and nullish coalescing (`??`).

**Naming Conventions:**
- **Variables/Functions:** `camelCase` (e.g., `validateCpf`, `getUserRole`).
- **Components/Classes:** `PascalCase` (e.g., `UserForm`, `AuthService`).
- **Constants/Enums:** `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`).

**AI Agent Workflow Guidelines:**
1. **Analyze First:** Always use `read` or `glob` to check existing patterns before creating new files or modifying logic.
2. **Atomic Changes:** Keep edits small and verify them.
3. **Workspace Awareness:** Ensure new dependencies are installed inside the correct workspace (`bun -F frontend add <pkg>` or `bun -F backend add <pkg>`).
