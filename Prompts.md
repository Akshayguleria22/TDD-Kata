# PROMPTS.md — AI Prompt History Log

---

## Phase 2, Step 2.1: Database Connection Setup

**Prompt:**
> Hey Claude, let's start Phase 2. We need to set up the Mongoose database connection in `src/config/database.ts`. Can you write a `connectDB` function that reads from `process.env.MONGODB_URI`, and a `disconnectDB` function for graceful shutdowns?
>
> We are strictly following TDD, so please write the Jest test suite first. Also, provide the `.env` and `.gitignore` setup so we don't accidentally leak credentials. Give me the failing tests first, then the implementation.

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
> Next step (2.2). Let's build the User Mongoose model and our JWT helpers. The User schema needs `name`, `email`, `password`, and a `role` enum ('user' or 'admin'). Add a Mongoose pre-save hook to hash the password using bcryptjs.
> 
> For the JWT side, create a utility file with `generateToken` and `verifyToken`. Write the unit tests for both the model validations and the JWT helpers first so we can watch them fail, then write the implementation to make them pass.

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
> Moving to 2.3. Let's create the `POST /api/auth/register` endpoint. I need strict validation (valid email format, missing fields) and it should return a 409 if the email is already in use. 
>
> On success, it must return a 201 status with the user profile (ensure the password is NOT returned in the JSON) and a JWT token. Give me the Supertest cases first, then build the controller and Express route.

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
> Step 2.4. Now for the login route at `POST /api/auth/login`. It needs to verify the email and password, and return the JWT and user profile (including their role). 
>
> Security detail: if the password or email is incorrect, return a generic 401 "Invalid credentials" message so we don't leak which emails exist in our database. Write the tests first, covering both valid and invalid login attempts.

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
> To finish Phase 2 (Step 2.5), we need our Express middleware to protect routes. 
> 1. `authMiddleware`: Extracts the Bearer token, verifies it, fetches the user from the DB (excluding the password), and attaches it to `req.user`. 
> 2. `adminOnlyMiddleware`: Checks if `req.user.role === 'admin'`. If not, return a 403.
>
> Write tests that mock the Express request/response objects to ensure these handle missing tokens, expired tokens, and unauthorized roles correctly. 

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
> Phase 2 is green! Let's kick off Phase 3. First up is the Vehicle Mongoose model (Step 3.1). 
> The schema needs: make, model, category (all required strings), price (required number, min 0), quantity (required number, min 0, default 1), year, and an optional description string. 
> Write the schema validations and the corresponding unit tests to verify things like default quantity and the minimum price constraints.

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

---

## Phase 3, Step 3.2: Vehicle Creation & Listing

**Prompt:**
> Step 3.2: Let's build the API to create and list vehicles. I need a protected `GET /api/vehicles` for all logged-in users, and an admin-only `POST /api/vehicles` to add new inventory. 
> Give me the integration tests for these using Supertest. Specifically test the RBAC (Role-Based Access Control) to ensure standard users get a 403 Forbidden if they try to hit the POST route. Test first, then implement.

**Phase:** Phase 3 — Vehicle & Inventory Management (Backend TDD)

**Technical Objective:**
- Implement `POST /api/vehicles` accessible only to admins.
- Implement `GET /api/vehicles` accessible to all authenticated users.
- Add robust tests validating role restrictions, input requirements, and successful list retrieval.

**TDD Cycle:**
1. 🔴 RED — Wrote `vehicle-api.test.ts` with 6 integration tests. All failed with 404.
2. 🟢 GREEN — Implemented `createVehicle` and `getVehicles` in `vehicleController.ts`, mapped in `vehicleRoutes.ts`, wired in `app.ts`. All 6 tests pass.
3. 🔄 REFACTOR — Kept controller logic clean by delegating to Mongoose validation and existing role middlewares.

**Files Modified:**
- `backend/src/__tests__/vehicle-api.test.ts` — [NEW] Vehicle API test suite (6 tests)
- `backend/src/controllers/vehicleController.ts` — [NEW] Controller for vehicle logic
- `backend/src/routes/vehicleRoutes.ts` — [NEW] Routes for vehicle API
- `backend/src/app.ts` — [MODIFIED] Wired vehicle routes

---

## Phase 3, Step 3.3: Vehicle Search & Filtering

**Prompt:**
> Step 3.3: Let's make the inventory searchable. Create a `GET /api/vehicles/search` endpoint that accepts query params: make, model, category, minPrice, and maxPrice. 
> It needs to support partial case-insensitive string matching (using regex) for the text fields and proper `$gte`/`$lte` operators for the price. Write tests checking various combinations of these filters.

**Phase:** Phase 3 — Vehicle & Inventory Management (Backend TDD)

**Technical Objective:**
- Implement `GET /api/vehicles/search` with dynamic MongoDB queries.
- Support `$regex` with `$options: 'i'` for string partial matches.
- Support `$gte` and `$lte` for price ranges.
- Validate the search is accessible to authenticated users only.

**TDD Cycle:**
1. 🔴 RED — Wrote `vehicle-search.test.ts` with 10 integration tests testing various combinations of query params. All failed with 404.
2. 🟢 GREEN — Implemented `searchVehicles` controller, parsing query params and applying MongoDB filters. Mapped to `/api/vehicles/search`. All 10 tests pass.
3. 🔄 REFACTOR — Kept controller clean with dynamic filter object construction.

**Files Modified:**
- `backend/src/__tests__/vehicle-search.test.ts` — [NEW] Vehicle search test suite (10 tests)
- `backend/src/controllers/vehicleController.ts` — [MODIFIED] Added searchVehicles handler
- `backend/src/routes/vehicleRoutes.ts` — [MODIFIED] Added GET /search route

---

## Phase 3, Step 3.4: Vehicle CRUD (Update & Delete)

**Prompt:**
> Step 3.4: Time to complete the vehicle CRUD. Add `PUT /api/vehicles/:id` and `DELETE /api/vehicles/:id`. Both of these must be protected by the admin middleware. 
> Important edge case: Make sure to validate that `req.params.id` is a valid MongoDB ObjectId before querying. If it's invalid or the vehicle doesn't exist, return a clean 404 instead of throwing a 500 cast error. Let's see the failing tests first.

**Phase:** Phase 3 — Vehicle & Inventory Management (Backend TDD)

**Technical Objective:**
- Implement `PUT /api/vehicles/:id` for admins only, supporting partial updates.
- Implement `DELETE /api/vehicles/:id` for admins only.
- Validate `id` format to prevent unhandled cast errors.
- Return 404 appropriately.

**TDD Cycle:**
1. 🔴 RED — Wrote `vehicle-crud.test.ts` with 10 tests for update and delete including auth, 404, and invalid ID scenarios. All failed with 404.
2. 🟢 GREEN — Added `updateVehicle` and `deleteVehicle` to `vehicleController.ts` and wired to routes. Fixed TS typing errors for ID validation. All 10 tests pass.
3. 🔄 REFACTOR — Replaced deprecated `new: true` option in Mongoose with `returnDocument: 'after'`.

**Files Modified:**
- `backend/src/__tests__/vehicle-crud.test.ts` — [NEW] Vehicle update and delete test suite (10 tests)
- `backend/src/controllers/vehicleController.ts` — [MODIFIED] Added update and delete handlers
- `backend/src/routes/vehicleRoutes.ts` — [MODIFIED] Mapped PUT and DELETE endpoints

---

## Phase 3, Step 3.5: Inventory Purchasing & Restocking

**Prompt:**
> Final backend step (3.5)! We need the core inventory business logic. Create `POST /api/vehicles/:id/purchase` for standard users to buy a car (decreases quantity by 1) and `POST /api/vehicles/:id/restock` for admins to add inventory. 
> 
> Crucial requirement: The purchase operation MUST be atomic. Use MongoDB's `$inc` and ensure we never drop below 0 stock if there are concurrent requests. Return a 400 "Out of Stock" if quantity is 0. Write a test that simulates a race condition to prove it works safely.

**Phase:** Phase 3 — Vehicle & Inventory Management (Backend TDD)

**Technical Objective:**
- Implement atomic decrement for purchase using `findOneAndUpdate` with condition `{ quantity: { $gt: 0 } }`.
- Validate concurrent requests do not cause negative stock.
- Implement atomic increment for restock with input validation for `quantityToAdd`.
- Differentiate between 404 (Not Found) and 400 (Out of Stock).

**TDD Cycle:**
1. 🔴 RED — Wrote `vehicle-inventory.test.ts` with 10 strict integration tests, including a concurrent purchase simulation. All failed.
2. 🟢 GREEN — Implemented `purchaseVehicle` and `restockVehicle` using MongoDB `$inc` operator for atomicity. All 10 tests pass.
3. 🔄 REFACTOR — Extracted ObjectId validation to avoid casting errors, returned appropriate error codes.

**Files Modified:**
- `backend/src/__tests__/vehicle-inventory.test.ts` — [NEW] Inventory test suite (10 tests)
- `backend/src/controllers/vehicleController.ts` — [MODIFIED] Added purchase and restock handlers
- `backend/src/routes/vehicleRoutes.ts` — [MODIFIED] Mapped POST /purchase and POST /restock endpoints

---

---

## Phase 4, Step 4.1: Architecture, Routing & Auth State

**Prompt:**
> Step 4.1: Architecture, Routing & Auth State
> - Set up `react-router-dom` with routes: `/` (Dashboard), `/login`, `/register`, and `/admin` (Protected).
> - Create an `AuthContext` to store the JWT token, user object (with `role`), and a `logout` function. Persist the token in `localStorage`.
> - Create an Axios instance (`src/api/axios.ts`) with a request interceptor that automatically attaches the `Bearer ${token}` to all requests.

**Phase:** Phase 4 — Frontend Implementation (React + Tailwind)

**Technical Objective:**
- Initialize React Router with basic components (`Dashboard`, `Login`, `Register`, `Admin`).
- Create `AuthContext` to manage authentication state globally.
- Configure Axios with an interceptor to append JWT tokens from `localStorage`.
- Create a `ProtectedRoute` component to secure routes against unauthorized access and role-based access.

**Execution Cycle:**
1. Created `frontend/src/api/axios.ts` to configure Axios base URL and interceptors.
2. Implemented `frontend/src/context/AuthContext.tsx` to handle login, logout, and token persistence in localStorage.
3. Created `ProtectedRoute` component to handle routing logic for guests and admins.
4. Set up `App.tsx` with all the necessary routes wrapped in context providers.

**Files Modified:**
- `frontend/src/api/axios.ts` — [NEW] Axios setup
- `frontend/src/context/AuthContext.tsx` — [NEW] Global auth state
- `frontend/src/components/ProtectedRoute.tsx` — [NEW] Route guard
- `frontend/src/pages/(Dashboard|Login|Register|Admin).tsx` — [NEW] Route placeholders
- `frontend/src/App.tsx` — [MODIFIED] Registered routes and AuthProvider

---

## Phase 4, Step 4.2: Authentication Views

**Prompt:**
> Step 4.2: Authentication Views
> - Build `Login.tsx` and `Register.tsx` pages.
> - Implement forms with Tailwind styling, loading states, and error handling (displaying API errors gracefully).
> - On successful login/register, update `AuthContext` and redirect to the Dashboard.

**Phase:** Phase 4 — Frontend Implementation (React + Tailwind)

**Technical Objective:**
- Create fully styled login and registration forms using Tailwind CSS and `lucide-react` icons.
- Add client-side state for form inputs, loading statuses, and server error messages.
- Connect forms to the backend using the `/api/auth/login` and `/api/auth/register` endpoints.
- Update global `AuthContext` and redirect users upon successful authentication.

**Execution Cycle:**
1. Implemented `Login.tsx` with email/password inputs, error display, and a submit handler integrating with `AuthContext`.
2. Implemented `Register.tsx` with name/email/password inputs, loading spinner (`Loader2`), and error catching.
3. Added proxy configuration to `vite.config.ts` to forward `/api` requests to `localhost:5000`.

**Files Modified:**
- `frontend/vite.config.ts` — [MODIFIED] Added API proxy
- `frontend/src/pages/Login.tsx` — [MODIFIED] Full implementation
- `frontend/src/pages/Register.tsx` — [MODIFIED] Full implementation

---

## Phase 4, Steps 4.3 & 4.4: Dashboard, Search, and Purchase Flow

**Prompt:**
> Step 4.3: Dashboard & Search (Vehicle Catalog)
> - Build a responsive Dashboard layout with a sticky Navbar showing the logged-in user's name and role.
> - Implement a Search/Filter bar (Make, Model, Category, Price Range) that calls `GET /api/vehicles/search`.
> - Build a reusable `VehicleCard` component to display vehicle details and a stock badge (e.g., Green for In Stock, Red for Out of Stock).
>
> Step 4.4: The Purchase Flow
> - Add a "Purchase" button to the `VehicleCard`. 
> - It must be `disabled` if `quantity === 0`.
> - On click, call `POST /api/vehicles/:id/purchase`. If successful, show a success toast and instantly update the specific vehicle's stock in the UI without refreshing the whole page.

**Phase:** Phase 4 — Frontend Implementation (React + Tailwind)

**Technical Objective:**
- Build a responsive layout with a `Navbar` component displaying the user state.
- Create a `VehicleCard` component that handles its own purchase logic, disables on 0 stock, and updates its local state upon a successful API call.
- Implement the `Dashboard` page to fetch `/api/vehicles/search` and pass dynamic filters as query parameters.
- Provide optimistic or immediate UI updates upon successful purchase.

**Execution Cycle:**
1. Created `frontend/src/components/Navbar.tsx` with user state and conditional admin navigation.
2. Created `frontend/src/components/VehicleCard.tsx` with a responsive design, dynamic stock badges, and a purchase handler that hits `/api/vehicles/:id/purchase`.
3. Updated `frontend/src/pages/Dashboard.tsx` to include the search bar, manage filter states, and re-fetch from the API automatically when filters change using `useEffect` and `useCallback`.
4. Handled purchase success by updating the `Dashboard`'s vehicle state array in place to reflect the new stock.

**Files Modified:**
- `frontend/src/components/Navbar.tsx` — [NEW] Top navigation bar
- `frontend/src/components/VehicleCard.tsx` — [NEW] Individual vehicle display and purchase button
- `frontend/src/pages/Dashboard.tsx` — [MODIFIED] Added search UI, grid layout, and API integration

---

## Phase 4, Step 4.5: Admin Dashboard

**Prompt:**
> Step 4.5: Admin Dashboard
> - Build a protected `/admin` route (redirect non-admins).
> - Display a table view of all inventory.
> - Implement forms/modals to **Add**, **Update**, and **Delete** vehicles.
> - Add a "Restock" button/input for admins to call `POST /api/vehicles/:id/restock`.

**Phase:** Phase 4 — Frontend Implementation (React + Tailwind)

**Technical Objective:**
- Secure the Admin route (completed in Step 4.1 via `ProtectedRoute adminOnly`).
- Build a management table with all vehicles fetched from the backend.
- Create an Add/Edit modal form that submits to `POST /api/vehicles` and `PUT /api/vehicles/:id`.
- Handle deletion via `DELETE /api/vehicles/:id`.
- Implement inline restock functionality that submits to `POST /api/vehicles/:id/restock`.

**Execution Cycle:**
1. Built a responsive table in `Admin.tsx` to list all inventory items and display stock health.
2. Created an Add/Edit modal using conditional rendering, managing state with `currentVehicle`.
3. Implemented a delete confirmation handler.
4. Created an inline restock input field that toggles visible when the admin clicks the restock icon, and makes a targeted API update.

**Files Modified:**
- `frontend/src/pages/Admin.tsx` — [MODIFIED] Full implementation of admin features

---

### ✅ PHASE 4 COMPLETE — Frontend SPA Implementation fully built and connected!

---

## Phase 4.5: UI/UX Overhaul — Playful Geometric Design System

**Prompt:**
> Completely redesign the frontend of the Car Dealership Inventory System using a Playful Geometric (Neo-Brutalist / Memphis-style) design system. Transform the basic UI into a premium, tactile, and energetic experience.
>
> **Design System Tokens:**
> - Colors: Warm Cream (#FFFDF5), Slate 800 (#1E293B), Vivid Violet (#8B5CF6), Hot Pink (#F472B6), Amber (#FBBF24)
> - Typography: Outfit (headings), Plus Jakarta Sans (body)
> - Hard "Pop" Shadows with no blur: `4px_4px_0px_0px_#1E293B`
> - Chunky borders: `border-2 border-foreground`
> - Tactile interactions: hover lift + active press on all buttons
> - Lucide React icons with strokeWidth 2.5

**Phase:** Phase 4.5 — UI/UX Overhaul (Playful Geometric Design)

**Technical Objective:**
- Define the complete design system via Tailwind CSS v4 `@theme` directives (colors, fonts, shadows).
- Import Google Fonts (Outfit 700/800, Plus Jakarta Sans 400/500/600/700).
- Apply the "Candy Button" pattern to all interactive elements (hard shadow, hover lift, active press).
- Apply geometric input styling with accent-colored focus shadows.
- Transform Vehicle Cards into "Sticker Cards" with rotation and scale hover effects.
- Redesign auth pages with polka-dot backgrounds and massive sticker form cards.
- Overhaul admin table with chunky borders, icon action buttons, and sticker modal.
- Update Navbar with bold Outfit logo, thick bottom border, and pill-style nav links.

**Design Decisions:**
- **Tailwind v4:** Project uses `@tailwindcss/vite` v4.3.3, so all theme config lives in `@theme` blocks in `index.css` rather than `tailwind.config.js`.
- **No shared component abstractions:** Button/input styles applied inline to match existing code pattern.
- **Polka-dot CSS pattern:** Defined as a utility class `.bg-polka-dots` in `index.css` for the auth page backgrounds.

**Execution Cycle:**
1. **Step 1 (Core Config):** Updated `index.html` with Google Fonts links. Rewrote `index.css` with `@theme` block defining custom colors, fonts, and shadow tokens. Cleared `App.css` scaffold boilerplate. Updated `App.tsx` root wrapper to use design system classes.
2. **Step 2 (Candy Buttons & Inputs):** Applied inline within Steps 3–4. All buttons use: chunky border, pop shadow, hover lift (`-translate-y-0.5`), active press (`translate-y-0.5`). All inputs use: `border-2`, `rounded-xl`, accent focus shadow.
3. **Step 3 (Sticker Vehicle Cards):** Overhauled `VehicleCard.tsx` with hard shadow card, hover rotation/scale, Outfit title, tertiary category pill badge, accent price, stock indicator with bordered dot, pop-shadow purchase button.
4. **Step 4 (Layouts & Dashboard):** Overhauled `Navbar.tsx` (thick border, Outfit logo, secondary admin pill, circular logout), `Login.tsx` & `Register.tsx` (polka-dot background, sticker form card, geometric inputs, candy submit), `Dashboard.tsx` (sticker filter bar, geometric inputs, playful empty state), `Admin.tsx` (sticker table, chunky icon action buttons, sticker modal with accent/ghost candy buttons).

**Files Modified:**
- `frontend/index.html` — [MODIFIED] Google Fonts preconnect + stylesheet, updated title
- `frontend/src/index.css` — [MODIFIED] Complete rewrite with Tailwind v4 @theme design tokens
- `frontend/src/App.css` — [MODIFIED] Cleared Vite scaffold boilerplate
- `frontend/src/App.tsx` — [MODIFIED] Root wrapper uses design system classes
- `frontend/src/components/Navbar.tsx` — [MODIFIED] Neo-Brutalist navbar with Outfit logo, pop-shadow buttons
- `frontend/src/components/VehicleCard.tsx` — [MODIFIED] Sticker card with hover rotation, candy purchase button
- `frontend/src/pages/Login.tsx` — [MODIFIED] Polka-dot background, sticker form card, geometric inputs
- `frontend/src/pages/Register.tsx` — [MODIFIED] Consistent with Login, secondary accent color
- `frontend/src/pages/Dashboard.tsx` — [MODIFIED] Sticker filter bar, geometric inputs, playful empty state
- `frontend/src/pages/Admin.tsx` — [MODIFIED] Sticker table, chunky action buttons, sticker modal

---

## Phase 4.6: Feature Completion — Landing Page, Routing & Navigation

**Prompt:**
> Finalize the UI to meet all JD requirements. Add a public Landing Page, restructure routing (/ = landing, /inventory = vehicle browsing, /admin = CRUD dashboard), make the Navbar dynamic based on auth state, and add purchase success/error toasts to VehicleCard.

**Phase:** Phase 4.6 — Feature Completion

**Technical Objective:**
- Create a premium public Landing Page with hero section, features grid, tech stack strip, and footer.
- Restructure routing: `/` = LandingPage (public), `/inventory` = Dashboard (public), `/admin` = Admin (protected).
- Make Navbar dynamic: unauthenticated shows Home/Inventory/Login/Register; authenticated shows Home/Inventory/Logout; admin adds Admin Panel.
- Add success toast to VehicleCard on purchase, login redirect for unauthenticated users.
- Update Login/Register to redirect to `/inventory` after auth.

**Execution Cycle:**
1. **Step 1 (Landing Page):** Created `LandingPage.tsx` with hero (massive heading, floating decorative shapes, preview vehicle card, dual CTAs), features section (3-column grid with colored icon circles), tech stack pill strip, and dark footer.
2. **Step 2 (Admin Dashboard):** Already fully implemented in Phase 4, Step 4.5 — includes table, Add/Edit modal, Delete with confirm, inline Restock.
3. **Step 3 (Inventory Polish):** Added success toast (green) and error toast (red) to VehicleCard. Added auth-aware purchase button ("Purchase" vs "Login to Buy"). Unauthenticated clicks redirect to `/login`.
4. **Step 4 (Navigation):** Rewrote Navbar with dynamic links based on auth state, active route highlighting, Login/Register candy buttons for guests, and circular logout button for authenticated users.

**Routing Changes:**
| Route | Before | After |
|-------|--------|-------|
| `/` | Protected Dashboard | Public Landing Page |
| `/inventory` | _(didn't exist)_ | Public Dashboard (vehicle browsing) |
| `/login` | Redirected to `/` on auth | Redirects to `/inventory` on auth |
| `/register` | Redirected to `/` on auth | Redirects to `/inventory` on auth |
| `/admin` | Protected Admin | Protected Admin (unchanged) |

**Files Modified:**
- `frontend/src/pages/LandingPage.tsx` — [NEW] Public landing page with hero, features, tech stack, footer
- `frontend/src/App.tsx` — [MODIFIED] New route structure with LandingPage at /
- `frontend/src/components/Navbar.tsx` — [MODIFIED] Dynamic auth-aware navigation
- `frontend/src/components/VehicleCard.tsx` — [MODIFIED] Success toast, auth-aware purchase button
- `frontend/src/pages/Login.tsx` — [MODIFIED] Redirect to /inventory after login
- `frontend/src/pages/Register.tsx` — [MODIFIED] Redirect to /inventory after registration

---

## Phase 5: Final Submission & Documentation

**Prompt:**
> Continue finalizing the UI to strictly meet all Job Description (JD) requirements. Ensure the README is comprehensive, contains the "My AI Usage" section, setup instructions, and the test report.

**Phase:** Phase 5 — Final Submission & Review

**Technical Objective:**
- Verify all JD requirements (Backend API with auth/vehicles/inventory, frontend React/Tailwind SPA, TDD workflow, AI transparency).
- Run full backend test coverage.
- Generate the root `README.md` containing project details, local setup steps, AI usage policy declaration, and the Jest test report.
- Push the final code and `Prompts.md` documentation to GitHub.

**Execution Cycle:**
1. **Audit:** Confirmed the backend API, MongoDB integration, JWT Auth, and protected routes were built in Phases 1-3. Confirmed the TDD workflow was strictly followed. Confirmed the frontend SPA with routing and Tailwind UI was built in Phase 4.
2. **Testing:** Ran `npm test -- --coverage` in the backend. 
   - Result: `Test Suites: 12 passed, 12 total | Tests: 94 passed, 94 total | Coverage: ~91%`.
3. **Documentation:** Created a comprehensive `README.md` at the project root with the required deliverables (Project explanation, setup instructions, My AI Usage, and Test Report).
4. **Finalization:** Logged the final step in `Prompts.md` and committed changes with the AI co-author tag.

**Files Modified:**
- `README.md` — [NEW] Comprehensive project documentation and deliverables.
- `Prompts.md` — [MODIFIED] Finalized the chat history log.

---
### 🎉 PROJECT COMPLETE! All JD Requirements Met. 🎉

---

## Phase 4.7: Next-Level Polish & Real-Time Setup

**Prompt:**
> Implement high-impact features to elevate the application:
> **Step 1: Advanced Animations (Framer Motion)**
> - Install `framer-motion`.
> - Wrap the `VehicleCard` grid in a staggered entrance animation so cards cascade into view on load.
> - Implement `AnimatePresence` and `layout` props so when the search filters are applied, the remaining cards smoothly glide into their new grid positions.

**Phase:** Phase 4.7 — Next-Level Polish (Step 1)

**Technical Objective:**
- Install `framer-motion`.
- Update `Dashboard.tsx` to wrap the vehicle grid in `<AnimatePresence mode="popLayout">` and use `<motion.div>` for staggered entrances and smooth layout reflows when filtering.

**Execution Cycle:**
1. Installed `framer-motion` package in the frontend.
2. Modified `Dashboard.tsx` to animate vehicle cards gracefully when rendering or filtering.

**Files Modified:**
- `frontend/package.json` — [MODIFIED] Added framer-motion dependency
- `frontend/src/pages/Dashboard.tsx` — [MODIFIED] Applied motion grid and layout animations

---

## Phase 4.7: Next-Level Polish & Real-Time Setup (Steps 2 & 3)

**Prompt:**
> add it.....it still looks so basic...you are an advanced ui ux designer...design world class craft so that it stand out in 1000 persons.....unleash your creativity to max creativity. do whatever you can...add anything that makes it wonderful. use any technology and framework that can do it

**Phase:** Phase 4.7 — Maximum Wow Factor (Steps 2 & 3)

**Technical Objective:**
- Install and configure `socket.io` on the backend to emit real-time inventory changes.
- Install `socket.io-client` on the frontend, wrap the application in a `SocketProvider`, and listen for real-time changes in the User Dashboard and Admin Dashboard.
- Implement world-class micro-interactions: explosive confetti on purchase, neo-brutalist shimmering skeletons on loading, infinite marquee banners, and a subtle SVG noise overlay for a physical tactile feel.

**Execution Cycle:**
1. Created `backend/src/socket.ts` and attached it to the HTTP server in `server.ts`.
2. Emitted `inventory_updated` and `inventory_deleted` events across all CRUD actions in `vehicleController.ts`.
3. Created `SocketContext.tsx` on the frontend and wrapped `App.tsx`.
4. Attached global SVG noise overlay to `App.tsx` via data URI.
5. Implemented `react-fast-marquee` on `LandingPage.tsx`.
6. Created a highly stylized `VehicleCardSkeleton.tsx` with neo-brutalist pulses and gradients.
7. Added `react-confetti` to `VehicleCard.tsx` that triggers specifically on a successful purchase.
8. Updated `Dashboard.tsx` and `Admin.tsx` with `useEffect` socket listeners to instantly update React state on inventory changes without a page refresh.

**Files Modified:**
- `backend/src/server.ts`, `backend/src/socket.ts`, `backend/src/controllers/vehicleController.ts` — [NEW & MODIFIED] Real-time engine.
- `frontend/src/context/SocketContext.tsx`, `frontend/src/App.tsx` — [NEW & MODIFIED] WebSockets & Noise Overlay.
- `frontend/src/components/VehicleCardSkeleton.tsx` — [NEW] Polished skeletons.
- `frontend/src/components/VehicleCard.tsx` — [MODIFIED] Confetti micro-interaction.
- `frontend/src/pages/LandingPage.tsx` — [MODIFIED] Infinite Marquee.
- `frontend/src/pages/Dashboard.tsx`, `frontend/src/pages/Admin.tsx` — [MODIFIED] Socket listeners and optimistic UI.

---

## Phase 4.8: The "Hire Me" Features (Step 1)

**Prompt:**
> You are an award-winning Principal UI/UX Engineer. We need to elevate this application to be the absolute #1 submission out of 150 candidates. The design is great, but we need to replace static elements with dynamic, high-engineering features. 
> ... Please begin immediately with Step 1: Fix the Landing Page Data.

**Phase:** Phase 4.8 — The "Hire Me" Features (Step 1)

**Technical Objective:**
- Remove the hardcoded dummy vehicle card on the Landing Page.
- Fetch the most recently added vehicle from the `GET /api/vehicles` endpoint and pass it to a real `VehicleCard` component on the Landing Page.
- Ensure the "Purchase Now" button on the Landing Page is fully functional and triggers the atomic purchase API.

**Execution Cycle:**
1. Modified `LandingPage.tsx` to include `useEffect` and fetch the vehicle list on component mount.
2. Extracted the last vehicle from the response payload and set it into state (`latestVehicle`).
3. Replaced the static HTML markup on the right side of the hero section with a true `<VehicleCard />` instance.
4. Bound the purchase action so clicking "Purchase" from the landing page uses the active authentication state, buys the vehicle, triggers confetti, and updates the local stock instantly.

**Files Modified:**
- `frontend/src/pages/LandingPage.tsx` — [MODIFIED] Replaced static dummy data with dynamic API data.

---

## Phase 4.8: The "Hire Me" Features (Step 2)

**Prompt:**
> yes proceed with step 2 but fix this SyntaxError: The requested module '/src/components/VehicleCard.tsx?t=1785323006978' does not provide an export named 'Vehicle' (at LandingPage.tsx:4:23)

**Phase:** Phase 4.8 — The "Hire Me" Features (Step 2)

**Technical Objective:**
- Fix the TypeScript `SyntaxError` caused by importing an interface as a value in Vite.
- Remove the static tech stack footer on the Landing Page.
- Create a `LiveActivityTicker` component that dynamically pulls the active database inventory.
- Implement the ticker at the bottom of the screen.

**Execution Cycle:**
1. Fixed the import in `LandingPage.tsx` by explicitly using `import type { Vehicle }`.
2. Created `LiveActivityTicker.tsx` which fetches the top 5 vehicles from the API.
3. Built a pure CSS marquee inside the new ticker displaying dynamic stock deals ("HOT DEAL: [Vehicle Name] for $[Price]!").
4. Replaced the static tech stack and footer in `LandingPage.tsx` with the new dynamic `<LiveActivityTicker />`.

**Files Modified:**
- `frontend/src/components/LiveActivityTicker.tsx` — [NEW] Live scrolling inventory feed.
- `frontend/src/pages/LandingPage.tsx` — [MODIFIED] Fixed types and added dynamic ticker.

---

## Phase 4.9: Elite Engineering Features

**Prompt:**
> You are a Principal Full-Stack Engineer and AI Architect. Our goal is to make this Car Dealership Inventory System the absolute best submission out of 150 candidates. We are moving beyond basic CRUD and adding elite, production-grade features.

**Phase:** Phase 4.9 — Elite Engineering Features (All 4 Steps)

**Technical Objectives:**
1. Enhance WebSocket stock badge with CSS flash animation when quantity changes live.
2. Build an AI-Powered NLP Smart Search engine (`POST /api/vehicles/smart-search`) that parses natural language into structured MongoDB queries.
3. Build a System Health & Architecture Dashboard (`GET /api/health/metrics`) with API latency tracking, DB ping, memory gauges, and collection stats.
4. (Already completed in Phase 4.7) Framer Motion layout animations with `AnimatePresence`.

**Execution Cycle:**
1. Added `useRef`-based quantity change detection to `VehicleCard.tsx` — when `vehicle.quantity` changes (via WebSocket), the stock badge pulses with a `stockFlash` CSS animation and the dot pings.
2. Created `smartSearchController.ts` with a lightweight NLP parser that extracts `make`, `category`, `year`, `minPrice`, `maxPrice` from natural language strings using regex and keyword dictionaries.
3. Added `POST /api/vehicles/smart-search` route to `vehicleRoutes.ts`.
4. Built the AI Smart Search UI on `Dashboard.tsx` with a sparkle icon, gradient border, and "AI Parsed" filter pill display.
5. Created `healthController.ts` with real DB ping, API latency percentile tracking (avg/p95/max), Node.js heap stats, system RAM, and collection counts.
6. Created `healthRoutes.ts` (admin-only) and registered it in `app.ts`.
7. Added a global API latency tracking middleware in `app.ts` that measures every request's response time.
8. Created `SystemHealth.tsx` frontend component with live-polling (10s), CSS progress bars, color-coded latency indicators, and collection stats.
9. Added a tabbed interface to `Admin.tsx` with "Inventory" and "System Health" tabs.

**Files Created:**
- `backend/src/controllers/smartSearchController.ts` — [NEW] NLP search engine.
- `backend/src/controllers/healthController.ts` — [NEW] System metrics endpoint.
- `backend/src/routes/healthRoutes.ts` — [NEW] Admin-only health routes.
- `frontend/src/components/SystemHealth.tsx` — [NEW] Health dashboard UI.

**Files Modified:**
- `backend/src/app.ts` — [MODIFIED] Added health routes and latency middleware.
- `backend/src/routes/vehicleRoutes.ts` — [MODIFIED] Added smart-search route.
- `frontend/src/components/VehicleCard.tsx` — [MODIFIED] Flash animation on live stock changes.
- `frontend/src/pages/Dashboard.tsx` — [MODIFIED] Added AI Smart Search bar.
- `frontend/src/pages/Admin.tsx` — [MODIFIED] Added tabbed interface with System Health tab.
- `frontend/src/index.css` — [MODIFIED] Added stockFlash and fadeIn keyframes.

---