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

---

## Phase 2, Step 2.3: Auth API — POST /api/auth/register

**Prompt:**
> Implement POST /api/auth/register with TDD. Validate email, hash passwords, handle duplicate user errors, return JWT token and user profile.

**Phase:** Phase 2 — Database Connection & User Authentication (Backend TDD)

**Technical Objective:**
- Create `POST /api/auth/register` endpoint with full validation.
- Return 201 with `{ success, data: { user, token } }` on success.
- Return 400 for missing fields or invalid email format.
- Return 409 for duplicate email registration.
- Exclude password from response body.
- Default role to `"user"`.

**TDD Cycle:**
1. 🔴 RED — Wrote `auth-register.test.ts` with 9 integration tests. All returned 404 (route not implemented).
2. 🟢 GREEN — Created `controllers/authController.ts`, `routes/authRoutes.ts`, wired into `app.ts`. All 28 tests pass.
3. 🔄 REFACTOR — Clean controller with early-return validation pattern, email regex validation, proper HTTP status codes.

**Files Modified:**
- `backend/src/__tests__/auth-register.test.ts` — [NEW] Register endpoint test suite (9 tests)
- `backend/src/controllers/authController.ts` — [NEW] Auth controller with register handler
- `backend/src/routes/authRoutes.ts` — [NEW] Auth routes with POST /register
- `backend/src/app.ts` — [MODIFIED] Wired auth routes at /api/auth

---

## Phase 2, Step 2.4: Auth API — POST /api/auth/login

**Prompt:**
> Implement POST /api/auth/login with TDD. Validate credentials, return JWT and user profile including role.

**Phase:** Phase 2 — Database Connection & User Authentication (Backend TDD)

**Technical Objective:**
- Create `POST /api/auth/login` endpoint.
- Return 200 with `{ success, data: { user, token } }` on valid credentials.
- Return 401 for incorrect password or non-existent email (same message to prevent enumeration).
- Return 400 for missing email or password fields.
- Include user `role` ("admin" | "user") in response.
- Exclude password from response body.

**TDD Cycle:**
1. 🔴 RED — Wrote `auth-login.test.ts` with 8 integration tests. All returned 404.
2. 🟢 GREEN — Added `login` handler to `authController.ts`, added route to `authRoutes.ts`. All 36 tests pass.
3. 🔄 REFACTOR — Consistent error message for invalid credentials (prevents user enumeration).

**Files Modified:**
- `backend/src/__tests__/auth-login.test.ts` — [NEW] Login endpoint test suite (8 tests)
- `backend/src/controllers/authController.ts` — [MODIFIED] Added login handler
- `backend/src/routes/authRoutes.ts` — [MODIFIED] Added POST /login route

---

## Phase 2, Step 2.5: Authentication & Authorization Middleware

**Prompt:**
> Implement authMiddleware (JWT validation, user attachment) and adminOnlyMiddleware (role-based access control) with TDD.

**Phase:** Phase 2 — Database Connection & User Authentication (Backend TDD)

**Technical Objective:**
- Create `authMiddleware` that validates Bearer JWT tokens, looks up user, and attaches to `req.user`.
- Create `adminOnlyMiddleware` that checks `req.user.role === 'admin'`, returns 403 otherwise.
- Handle missing token (401), invalid token (401), expired token (401), malformed header (401).
- Exclude password from the attached user object.

**TDD Cycle:**
1. 🔴 RED — Wrote `auth-middleware.test.ts` with 8 tests using a test Express app with `/protected` and `/admin` routes. Failed with `Cannot find module '../middleware/authMiddleware'`.
2. 🟢 GREEN — Implemented `middleware/authMiddleware.ts` with both middleware functions. All 44 tests pass.
3. 🔄 REFACTOR — Clean separation: authMiddleware handles authentication, adminOnlyMiddleware handles authorization.

**Files Modified:**
- `backend/src/__tests__/auth-middleware.test.ts` — [NEW] Middleware test suite (8 tests)
- `backend/src/middleware/authMiddleware.ts` — [NEW] Auth + Admin middleware

---

### ✅ PHASE 2 COMPLETE — 44 tests, 7 test suites, all GREEN

---

## Phase 3, Step 3.1: Vehicle Model

**Prompt:**
> Step 3.1: Vehicle Model (`src/models/Vehicle.ts`)
> - Fields: `make` (string, req), `model` (string, req), `category` (string, req, e.g. Sedan, SUV, Truck, Electric), `price` (number, req, min 0), `quantity` (number, req, min 0, default 1), `year` (number, req), `description` (string).
> - Add unit tests verifying schema validations and defaults.

**Phase:** Phase 3 — Vehicle & Inventory Management (Backend TDD)

**Technical Objective:**
- Create `Vehicle` Mongoose model matching the exact schema requirements.
- Add validations for min values (price >= 0, quantity >= 0).
- Test required fields, defaults (quantity 1), and trim options.

**TDD Cycle:**
1. 🔴 RED — Wrote `vehicle-model.test.ts` with 14 tests. Failed with `Cannot find module '../models/Vehicle'`.
2. 🟢 GREEN — Implemented `Vehicle` model in `models/Vehicle.ts`. Fixed a TS conflict where interface shouldn't extend `Document` to avoid `model` property clash. All 14 tests pass.
3. 🔄 REFACTOR — Verified model constraints.

**Files Modified:**
- `backend/src/__tests__/vehicle-model.test.ts` — [NEW] Vehicle model test suite (14 tests)
- `backend/src/models/Vehicle.ts` — [NEW] Vehicle Mongoose model
