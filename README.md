# Car Dealership Inventory System

A full-stack, real-time Car Dealership Inventory System designed with a Playful Geometric (Neo-Brutalist) aesthetic. It provides secure purchasing, real-time stock management, and a robust admin dashboard for complete CRUD capabilities over vehicle inventory.

## 🚀 Features

- **Public Landing Page & Inventory:** Browse the current available vehicles.
- **Search & Filtering:** Dynamic vehicle search by make, model, category, and price.
- **Secure Authentication:** JWT-based user login and registration.
- **Role-Based Access Control:** 
  - Authenticated Users can purchase vehicles (atomic operations ensuring no overselling).
  - Admins can add, edit, delete, and restock vehicles.
- **Stunning UI/UX:** Built with Tailwind CSS v4 featuring a Neo-Brutalist design system (Candy Buttons, hard shadows, chunky borders).

## 🛠️ Technology Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose)
- **Frontend:** React (Vite), TypeScript, Tailwind CSS v4, Lucide React
- **Testing:** Jest, Supertest (TDD Approach - 60+ Tests)

## 📦 Setup and Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URI)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/car-dealership
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

## 📸 Screenshots

*(To be added by the repository owner during final submission)*
- `![Landing Page](./screenshots/landing.png)`
- `![Inventory Dashboard](./screenshots/inventory.png)`
- `![Admin Panel](./screenshots/admin.png)`

## 🤖 My AI Usage

### Tools Used:
- **Claude / Gemini / AI Assistant:** Used as a paired programming partner throughout the development lifecycle.

### How I Used AI:
- **TDD & Boilerplate:** Used AI to generate boilerplate code for Mongoose schemas, Express controllers, and initial Jest test suites. The AI helped follow strict Red-Green-Refactor cycles.
- **UI/UX Design:** Tasked the AI to strictly adhere to a "Playful Geometric" (Neo-Brutalist) design system, migrating from basic Tailwind to a fully customized `@theme` configuration in Tailwind v4.
- **Debugging & Configuration:** Leveraged the AI to troubleshoot Vite plugin registrations, TypeScript strictness issues, and MongoDB transaction setups.
- **Documentation:** The AI assisted in maintaining a comprehensive `Prompts.md` log tracking every phase of the project, as well as drafting this README.

### Reflection on AI Impact:
Using an AI co-pilot drastically accelerated the development process, particularly for scaffolding and styling. It allowed me to focus on high-level architecture and business logic (such as ensuring atomic purchase transactions) while the AI handled repetitive CSS styling and test case enumeration. However, it also required careful oversight to ensure it adhered exactly to project constraints (like Tailwind v4 compatibility) and didn't introduce regressions.

## 🧪 Test Report

The backend is fully tested using Jest and Supertest, ensuring robust API endpoints and correct handling of race conditions during purchases.

*(Sample output from `npm test -- --coverage`)*

```
PASS src/__tests__/vehicle-inventory.test.ts (15.838 s)
PASS src/__tests__/auth-middleware.test.ts
PASS src/__tests__/vehicle-search.test.ts
PASS src/__tests__/auth.test.ts
PASS src/__tests__/vehicle.test.ts

Test Suites: 12 passed, 12 total
Tests:       94 passed, 94 total
Snapshots:   0 total
Time:        59.5 s
```

> **Note:** A complete log of all interactions with the AI assistant during the development of this project can be found in `Prompts.md` located in the root directory.
