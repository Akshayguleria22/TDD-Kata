# PROMPTS.md — AI Prompt History Log

---

## Phase 2, Step 2.1: Database Connection Setup

**Prompt:**
> Set up Database Connection (Mongoose) with environment variable support (`.env`). Write tests first following strict TDD (Red-Green-Refactor).

**Phase:** Phase 2 — Database Connection & User Authentication (Backend TDD)

**Technical Objective:**
- Create a `connectDB` function using Mongoose that reads `MONGODB_URI` from environment variables.
- Create a `disconnectDB` function for graceful shutdown.
- Validate that missing `MONGODB_URI` throws a descriptive error.
- Set up `.env` and `.env.example` files with `PORT`, `MONGODB_URI`, and `JWT_SECRET`.
- Integrate database connection into the server startup flow.

**TDD Cycle:**
1. 🔴 RED — Wrote `database.test.ts` with 4 tests: successful connection, env variable usage, missing URI error, and disconnect. Tests failed with `Cannot find module '../config/database'`.
2. 🟢 GREEN — Implemented `config/database.ts` with `connectDB` and `disconnectDB`. All 5 tests pass (4 database + 1 health).
3. 🔄 REFACTOR — Clean separation: `database.ts` in `config/`, `.env` excluded via `.gitignore`, server.ts updated to connect before listening.

**Files Modified:**
- `backend/src/__tests__/database.test.ts` — [NEW] Database connection test suite
- `backend/src/config/database.ts` — [NEW] Mongoose connection module
- `backend/src/server.ts` — [MODIFIED] Integrated `connectDB` into startup
- `backend/.env` — [NEW] Environment variables (git-ignored)
- `backend/.env.example` — [NEW] Example env template (committed)
- `backend/.gitignore` — [NEW] Excludes node_modules, dist, .env, coverage
- `backend/package.json` — [MODIFIED] Added `mongodb-memory-server`, fixed TypeScript version

---

## Phase 2, Step 2.2: User Model & JWT Auth Helpers

**Prompt:**
> Create User Model with password hashing and JWT auth helper functions (token generation and verification). Write tests first following strict TDD.

**Phase:** Phase 2 — Database Connection & User Authentication (Backend TDD)

**Technical Objective:**
- Create a `User` Mongoose model with `name`, `email`, `password`, `role` fields.
- Implement bcrypt password hashing via a `pre('save')` hook.
- Add `comparePassword` instance method for credential verification.
- Enforce unique email constraint and role enum (`admin` | `user`) validation.
- Create `generateToken(userId, role, expiresIn)` JWT helper.
- Create `verifyToken(token)` that returns decoded payload or null.
- Validate that missing `JWT_SECRET` throws a descriptive error.

**TDD Cycle:**
1. 🔴 RED — Wrote `user-model.test.ts` (8 tests) and `auth-helpers.test.ts` (6 tests). Tests failed with `Cannot find module '../models/User'` and `Cannot find module '../utils/auth'`.
2. 🟢 GREEN — Implemented `models/User.ts` and `utils/auth.ts`. Fixed Mongoose 9 pre-save hook (async, no `next()`) and JWT `SignOptions` type casting. All 19 tests pass.
3. 🔄 REFACTOR — Clean interfaces (`IUser`, `TokenPayload`), proper separation of concerns.

**Files Modified:**
- `backend/src/__tests__/user-model.test.ts` — [NEW] User model test suite (8 tests)
- `backend/src/__tests__/auth-helpers.test.ts` — [NEW] JWT auth helpers test suite (6 tests)
- `backend/src/models/User.ts` — [NEW] Mongoose User model with bcrypt hashing
- `backend/src/utils/auth.ts` — [NEW] JWT generateToken/verifyToken helpers
