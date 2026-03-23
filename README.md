# Zapier Clone — Frontend

A full-featured workflow automation builder inspired by Zapier, built with Next.js 15, React Flow, Supabase, and Zustand. Users can visually create, configure, and manage automated workflows ("Zaps") by connecting triggers and actions on an interactive canvas.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [Architecture](#architecture)
  - [State Management (Zustand)](#state-management-zustand)
  - [Data Fetching (React Query)](#data-fetching-react-query)
  - [React Flow Canvas](#react-flow-canvas)
  - [Supabase Integration](#supabase-integration)
- [Component Reference](#component-reference)
- [Utility Reference](#utility-reference)
- [Custom Hooks](#custom-hooks)
- [API Layer](#api-layer)
- [Authentication Flow](#authentication-flow)
- [Zap Creation Flow](#zap-creation-flow)
- [Zap Editing Flow](#zap-editing-flow)
- [Known Limitations & TODOs](#known-limitations--todos)

---

## Overview

This application is a front-end clone of Zapier — an automation platform that connects apps and services. Users can:

- Sign up and log in with JWT-based authentication
- View all their saved Zaps from a dashboard
- Create new Zaps by visually connecting trigger and action nodes on an interactive flow canvas
- Edit existing Zaps, swap out actions, and delete individual steps
- Select from a list of available apps/actions stored in Supabase

The backend is a separate REST API (URL configured via environment variable). The frontend communicates with it via `axios` and also queries Supabase directly for some data (available actions, action records).

---

## Tech Stack

| Technology                     | Purpose                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Next.js 15**                 | React framework with App Router, server components, file-based routing          |
| **React 19**                   | UI rendering                                                                    |
| **TypeScript**                 | Static typing throughout                                                        |
| **Tailwind CSS v4**            | Utility-first styling                                                           |
| **@xyflow/react (React Flow)** | Interactive node-based canvas for building Zap workflows                        |
| **Zustand**                    | Global client-side state management                                             |
| **@tanstack/react-query**      | Server state management, caching, and background refetching                     |
| **Supabase**                   | Database (PostgreSQL) accessed directly from the client for action/trigger data |
| **Axios**                      | HTTP client for backend REST API calls                                          |
| **Lucide React**               | Icon library                                                                    |
| **shadcn/ui**                  | Component primitives (configured, available for extension)                      |

---

## Project Structure

```
.
├── components/               # Reusable UI components
│   ├── ActionList.tsx        # Main React Flow canvas for editing existing Zaps
│   ├── ActionSideBar.tsx     # Context menu for deleting a node from the canvas
│   ├── AppBar.tsx            # Top navigation bar with user menu and popup
│   ├── CheckFeature.tsx      # Feature check item (used on marketing/auth pages)
│   ├── Feature.tsx           # Feature highlight row
│   ├── Hero.tsx              # Landing page hero section
│   ├── heroVideo.tsx         # Hero video component
│   ├── Input.tsx             # Reusable controlled input field
│   ├── SideBar.tsx           # Action configuration sidebar (edit Zap page)
│   ├── ZapCell.tsx           # Legacy zap cell card (simple list display)
│   ├── ZapModal.tsx          # Modal for selecting a trigger/action app
│   └── ZapNodeLable.tsx      # Custom label rendered inside each React Flow node
│
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── dashboard/        # /dashboard — lists all saved Zaps
│   │   ├── login/            # /login — login form
│   │   ├── signup/           # /signup — registration form
│   │   ├── zap/
│   │   │   ├── [id]/         # /zap/:id — edit an existing Zap
│   │   │   └── create/       # /zap/create — create a new Zap
│   │   ├── globals.css       # Global styles + Tailwind imports
│   │   ├── layout.tsx        # Root layout with fonts and React Query provider
│   │   └── page.tsx          # / — landing page
│   │
│   └── lib/
│       ├── api.tsx           # Supabase + backend API functions and React Query hooks
│       ├── CustomHook.tsx    # useAddNode hook for the edit-Zap canvas
│       ├── CustomHookZapCreate.tsx  # useAddNode hook for the create-Zap canvas
│       ├── providers.tsx     # React Query client + session storage persister
│       ├── reactFlow.tsx     # Shared React Flow helpers (icon, generateInitialNodes)
│       ├── type.tsx          # All shared TypeScript types
│       └── utils.ts          # cn(), createZap(), addTrailingPlusNode()
│
├── store.tsx                 # Zustand global store (all client state)
│
└── utils/
    ├── Authentication.tsx    # Client component: redirects to / if not logged in
    ├── ClientRedirect.tsx    # Client component: redirects to /dashboard if logged in
    ├── CustomEdge.tsx        # Custom React Flow edge with "+" add-step button
    ├── HelperFunctions.tsx   # Login, logout, zap create/update, sidebar visibility
    └── supabase.js           # Supabase client singleton
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.18.0
- **npm** (or yarn/pnpm/bun)
- A running backend API (see environment variables)
- A Supabase project with the following tables:
  - `AvailableActions` — list of supported apps/integrations (id, name, image)
  - `Action` — records of actions belonging to each Zap (zapId, actionId, sortingOrder, metadata)

### Environment Variables

Create a `.env.local` file in the project root:

```env
# URL of your backend REST API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Supabase project credentials (for client-side queries)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** The Supabase variables are consumed by `@supabase/auth-helpers-nextjs` automatically when prefixed with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Installation

```bash
npm install
```

### Running the App

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build
npm run start

# Build + start in one command
npm run prod

# Lint
npm run lint
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

---

## Features

### Authentication

- **Sign up** with name, email, and password (POST to `/api/v1/user/signup`)
- **Log in** with email and password (POST to `/api/v1/user/signin`)
- JWT token stored in `localStorage` under the key `token`
- User name and email also stored in `localStorage`
- Auto-redirect to `/dashboard` if already logged in
- Auto-redirect to `/` if attempting to access protected pages without a token
- Keyboard shortcut: `Ctrl/Cmd + Enter` submits the login form
- Log out clears `localStorage` and redirects to `/login`

### Dashboard

- Displays a table of all Zaps belonging to the authenticated user
- Each Zap row shows its action app icons, creation date, and owner avatar
- "Create" button navigates to the Zap creation flow
- Clicking a Zap name navigates to its edit page

### Zap Creation (`/zap/create`)

- Interactive React Flow canvas with an initial Trigger node and one Action node
- Clicking a node opens a **ZapModal** to select an app
- Once a trigger AND at least one action are selected, the Zap is automatically POSTed to the backend and the user is redirected to the new Zap's edit page
- Clicking the **"+"** button on any edge inserts a new blank Action node between two steps

### Zap Editing (`/zap/:id`)

- Loads the Zap's existing actions from Supabase
- Loads available actions from Supabase (`AvailableActions` table)
- Existing apps are shown with their logo and name on the node
- Clicking a node that already has an app assigned opens the **Sidebar** for reconfiguration
- Clicking a node with no app opens the **ZapModal** for selection
- Adding steps, deleting steps, and swapping apps all persist to the backend automatically
- The three-dot menu on each node opens the **ActionSideBar** with a Delete option (the trigger node at index 0 cannot be deleted)

### ZapModal (App Selector)

- Displays all available apps from Supabase in a searchable modal
- Also shows a static list of "popular built-in tools" (AI, Filter, Formatter, Paths, Delay, Webhooks, Code)
- Clicking an app sets it as the `selectedAction` in the store, which triggers the canvas to update

---

## Pages & Routes

| Route         | Component                     | Description                               |
| ------------- | ----------------------------- | ----------------------------------------- |
| `/`           | `src/app/page.tsx`            | Landing page with hero section and video  |
| `/login`      | `src/app/login/page.tsx`      | Login form                                |
| `/signup`     | `src/app/signup/page.tsx`     | Registration form                         |
| `/dashboard`  | `src/app/dashboard/page.tsx`  | Authenticated user's Zap list             |
| `/zap/create` | `src/app/zap/create/page.tsx` | Create a new Zap on an interactive canvas |
| `/zap/:id`    | `src/app/zap/[id]/page.tsx`   | Edit an existing Zap                      |

---

## Architecture

### State Management (Zustand)

All shared client state lives in `store.tsx`. The store is a single flat Zustand store:

```typescript
// Key state slices
(email, password); // Login form values
selectedNode; // The currently clicked React Flow node
selectedAction; // The app the user just picked from ZapModal
selectedActions; // Array of all chosen apps indexed by node position
actions; // Actions fetched from Supabase for the current Zap
AvailableActions; // All available apps fetched from Supabase
filterNodes; // Mirrors node list, used to sync canvas after edits
showZapModal; // Controls ZapModal visibility
zapTrigger; // The selected trigger action
```

Key design decisions:

- `setSelectedActions` is a smart setter — it upserts by `sortingOrder` (it updates if the order already exists, appends if new)
- `selectedActions` and `actions` are kept in sync manually via `useEffect` chains in `ActionList.tsx`
- The store is **not persisted** to localStorage — it is in-memory only for the session

### Data Fetching (React Query)

Two React Query hooks power the data layer:

**`useZaps()`** — fetches all Zaps for the current user from the backend REST API. Configured with a 2-minute `staleTime` and one automatic retry.

**`fetchActions(zapId)`** — fetches Action records from Supabase for a given Zap ID. Used with `useQuery` inside `ActionList.tsx`.

**`fetchAvailableActions()`** — fetches all rows from the `AvailableActions` Supabase table. Cached for 1 hour (`staleTime: 1000 * 60 * 60`).

The React Query client is wrapped in `PersistQueryClientProvider` (in `src/lib/providers.tsx`) which persists cached queries to `sessionStorage`. This means data survives page refreshes within the same browser tab but is cleared when the tab is closed.

### React Flow Canvas

The canvas is built with `@xyflow/react`. There are two separate canvas implementations:

1. **`/zap/create/page.tsx`** — self-contained canvas for new Zap creation. Simpler logic; after both a trigger and at least one non-placeholder action are selected, it auto-creates the Zap via the backend API and redirects.

2. **`components/ActionList.tsx`** — canvas for editing an existing Zap. More complex; syncs with Supabase data, handles node deletions, and persists changes on every action selection.

**Node structure:**

Each node's `data.label` is a JSX element (not a string) containing:

- A pill-shaped badge showing either the app logo + name (if configured) or a generic "Trigger"/"Action" badge
- A description line showing the step number and role

**Edge structure:**

All edges use a custom type (`CustomEdge`) defined in `utils/CustomEdge.tsx`. This edge renders a floating "+" button at the midpoint. Clicking it dispatches a custom DOM event `add-node` with the edge ID, which is caught by the `useAddNode` hook to insert a new node.

**Dummy node:**

A hidden "dummy" node is always appended at the bottom of the node list. This gives the last real node's trailing edge somewhere to point, which makes the "+" button appear after the last step. The dummy node has `opacity: 0` and `pointerEvents: none`.

**Scroll behavior:**

Zoom-on-scroll is disabled (`zoomOnScroll={false}`). A custom `PanWrapper` component inside the `ReactFlow` tree intercepts `wheel` events and converts them to viewport pan operations, so the canvas scrolls instead of zooms.

### Supabase Integration

Supabase is used as the database for:

- **`AvailableActions`** table — master list of apps/integrations
- **`Action`** table — per-Zap action records

The client is initialized with `createClientComponentClient()` from `@supabase/auth-helpers-nextjs`. A shared instance is exported from `utils/supabase.js`.

> **Note:** Authentication is handled by the custom backend (JWT), not by Supabase Auth.

---

## Component Reference

### `<ActionList />`

The main canvas component for the `/zap/:id` edit page.

- Fetches actions and available actions via React Query
- Rebuilds node labels whenever `actions`, `AvailableActions`, or `selectedActions` change
- Calls `updateZap()` to persist changes whenever `selectedActions` changes
- Renders `<ZapModal>` or `<Sidebar>` based on which node is selected and whether it already has an app assigned

### `<ZapModal />`

A full-screen overlay modal for selecting an app.

- Displays `AvailableActions` from the Zustand store
- Also shows hardcoded "popular built-in tools"
- Clicking an app calls `setSelectedAction()` and closes the modal
- Closes on outside click or when `selectedNode` becomes null

### `<Sidebar />`

A right-side panel shown when clicking a node that already has an app assigned (edit Zap page only).

- Displays the app's logo and name
- Placeholder fields for "Action Event" and "Account" configuration
- A "Change" button that opens `ZapModal` for swapping the app

### `<ActionSideBar />`

A small floating popup triggered by the three-dot icon on each node.

- Contains a single "Delete" action
- Calls `updateActionsAfterDelete()` which removes the node from the canvas, re-indexes remaining nodes/actions, and calls `updateZap()` to persist
- The trigger node (index 0) shows the delete button as disabled (`cursor-not-allowed`)

### `<ZapNodeLabel />`

The JSX rendered inside each React Flow node.

Props:

- `match` — the matched `AvailableAction` object (app logo + name), or undefined if unset
- `index` — the node's position in the flow (0 = trigger)
- `type` — `"trigger"` or `"action"`
- `reactFlowParentWrapper` — ref to the canvas container, passed to `ActionSideBar` for outside-click detection

### `<AppBar />`

The top navigation bar.

- Shows "Zapier Clone" branding
- On the dashboard: shows an "Upgrade" button and a user avatar that opens a popup with email, name, Settings (placeholder), and Log out
- On other pages: shows Login and Signup buttons

### `<CustomEdge />`

A custom React Flow edge type.

- Renders a "+" floating button at the midpoint of every edge
- On click: dispatches `window.dispatchEvent(new CustomEvent("add-node", { detail: { edgeId } }))`
- Includes a tooltip that reads "Add step"

---

## Utility Reference

### `utils/HelperFunctions.tsx`

| Function                                       | Description                                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `handleLogin(email, password, router)`         | POSTs credentials to backend, stores token/email/name in localStorage, redirects to `/dashboard`   |
| `handleLogout()`                               | Removes all auth keys from localStorage                                                            |
| `useLogin(email, password, router)`            | Custom hook that binds `Ctrl/Cmd + Enter` to `handleLogin`                                         |
| `handleZapCreate(trigger, actions)`            | POSTs a new Zap to the backend, returns the new Zap ID                                             |
| `updateZap(id, actions)`                       | POSTs updated action list to the backend for an existing Zap                                       |
| `inActionTable(selectedNode, setShowZapModal)` | Returns true (and opens ZapModal) if the selected node has no app assigned                         |
| `useShowSideBar(selectedNode)`                 | Returns true if the selected node has an app assigned (used to decide between Sidebar vs ZapModal) |

### `src/lib/utils.ts`

| Function                                                  | Description                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `cn(...inputs)`                                           | Merges Tailwind class names using `clsx` + `tailwind-merge`                                |
| `createZap({ selectedTrigger, selectedActions, router })` | Returns an async function that POSTs a new Zap and redirects to `/dashboard`               |
| `addTrailingPlusNode(nodeList, edgeList)`                 | Appends a hidden dummy node and a trailing edge to the node/edge arrays (mutates in place) |

### `src/lib/reactFlow.tsx`

| Export                        | Description                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `icon`                        | The SVG bolt icon used in unassigned node badges                                                    |
| `generateInitialNodes(count)` | Generates `count` default nodes (first is Trigger, rest are Actions) with correct labels and styles |

---

## Custom Hooks

### `useAddNode` (two versions)

Both versions listen for the custom `"add-node"` DOM event dispatched by `<CustomEdge>`.

**`src/lib/CustomHook.tsx`** — used on the edit Zap page. After inserting the new node:

- Re-indexes all existing actions
- Calls `updateZap()` to persist the new blank action to the backend
- Calls `refetchActions()` to sync Supabase data

**`src/lib/CustomHookZapCreate.tsx`** — used on the create Zap page. Simpler version; only updates local canvas state without backend persistence (the Zap doesn't exist yet).

Both hooks use `window.addEventListener("add-node", listener)` inside a `useEffect` and clean up on unmount.

---

## API Layer

### `src/lib/api.tsx`

**`fetchActions(zapId)`**

- Queries Supabase: `SELECT * FROM Action WHERE zapId = ?`
- Returns action records for the given Zap

**`fetchAvailableActions()`**

- Queries Supabase: `SELECT * FROM AvailableActions`
- Returns all available app/integration options

**`fetchZaps()`**

- GET `/api/v1/zap` with `Authorization: <token>` header
- Returns the user's list of Zaps from the backend

**`useZaps()`**

- React Query wrapper around `fetchZaps()`
- Only enabled on the client (`enabled: typeof window !== "undefined"`)

---

## Authentication Flow

```
User visits /login
    → Enters email + password → handleLogin()
        → POST /api/v1/user/signin
        → Stores token, email, name in localStorage
        → router.push("/dashboard")

Any protected page renders <Authentication />
    → useEffect checks localStorage for token
    → No token → router.push("/")

Landing page / login page renders <ClientRedirect />
    → useEffect checks localStorage for token
    → Token exists → router.push("/dashboard")
```

---

## Zap Creation Flow

```
User visits /zap/create
    → Canvas renders with 2 nodes: Trigger + Action (+ dummy)
    → User clicks Trigger node → ZapModal opens
        → User selects an app → setSelectedAction() + setSelectedActions()
        → Canvas updates node label with app logo
    → User clicks Action node → ZapModal opens
        → User selects an app → setSelectedActions()
        → Canvas updates node label with app logo
    → useEffect detects selectedActions has both trigger + action
        → handleZapCreate(trigger, actions) → POST /api/v1/zap
        → Returns zapId → router.push("/zap/:zapId")
```

---

## Zap Editing Flow

```
User visits /zap/:id
    → fetchActions() loads saved actions from Supabase
    → fetchAvailableActions() loads all available apps
    → Canvas renders nodes with existing app logos
    → User clicks a node with no app → ZapModal opens → user picks app
        → setSelectedActions() → useEffect → updateZap() persists change
    → User clicks a node with an app → Sidebar opens
        → "Change" button → ZapModal opens → user picks new app → same persistence flow
    → User clicks "⋯" on a node → ActionSideBar shows "Delete"
        → updateActionsAfterDelete() → removes node, re-indexes, updateZap()
    → User clicks "+" on an edge → new blank Action node inserted
        → updateActionsAfterInsert() → re-indexes, updateZap(), refetchActions()
```

---

## Known Limitations & TODOs

- **Zap name** is hardcoded as "zap name" in the dashboard table — the backend response does not currently include a user-defined name field
- **Action Event and Account fields** in the Sidebar are UI placeholders only — no functionality is wired up yet
- **Search in ZapModal** has a styled input but no filtering logic implemented
- **"Contact Sales"** and **"Settings"** links are visual-only with no action
- **`@supabase/auth-helpers-nextjs`** is deprecated — the package recommends migrating to `@supabase/ssr`
- **`//@ts-ignore` and `//@ts-expect-error`** comments appear in several files, indicating some type safety gaps that should be resolved
- **Zap publishing** — the "Publish" / "Edit zap" button in the top bar has no backend action wired up
- **Scroll on canvas** only pans (intentionally), but `zoomOnScroll={false}` also disables pinch-to-zoom on touch devices
- **No loading skeleton** — the canvas shows a plain "Loading..." text string while data is being fetched
- **React Query session storage persistence** uses `window.sessionStorage` which is not available in SSR — the `typeof window !== "undefined"` guard prevents crashes but means the persister is undefined on the server

---

## License

This project is private and does not include a public license.
