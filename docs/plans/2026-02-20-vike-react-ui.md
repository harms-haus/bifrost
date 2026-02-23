# Vike/React UI Implementation Plan

**Goal:** Build a modern React UI with Vike SSR that proxies to the existing Go server for data operations.

**Architecture:** Vike server (Node.js) hosts React SPA with SSR, provides REST API that proxies authenticated requests to Go server. Go server remains unchanged - Vike handles auth translation (JWT -> PAT).

**Tech Stack:** Vike, React 18, TypeScript, Tailwind CSS, React Router, React Query

---

## Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Browser    │────▶│  Vike/React │────▶│  Go Server  │
│  (React)    │     │  (SSR/API)  │     │  (port 8080)│
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    JWT auth -> PAT
                    Cookie handling
                    Realm selection
```

### Key Decisions

1. **Authentication Flow**: User submits PAT -> Vike validates with Go server -> Vike issues JWT (30-day expiry, includes PAT ID for revocation check)
2. **API Proxy**: Vike REST server (`/api/*`) forwards requests to Go server with PAT header
3. **RBAC**: Inherited from Go server responses, UI adapts based on user role
4. **Styling**: Tailwind CSS, dark mode by default, no rounded corners, clean lines

---

## Task 1: Initialize Vike + React Project

**Files:**
- Create: `admin-ui/package.json`
- Create: `admin-ui/vite.config.ts`
- Create: `admin-ui/tsconfig.json`
- Create: `admin-ui/tailwind.config.js`
- Create: `admin-ui/postcss.config.js`

**Step 1: Create project directory and initialize**

```bash
mkdir -p admin-ui && cd admin-ui
npm create vike@latest . -- --template react-ts
```

**Step 2: Install dependencies**

```bash
npm install @tanstack/react-query react-router-dom jose
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind**

In `admin-ui/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./renderer/_default.page.client.tsx",
    "./renderer/_default.page.server.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
      },
    },
  },
  plugins: [],
}
```

**Step 4: Create base CSS**

Create `admin-ui/renderer/styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Dark mode by default */
html {
  @apply dark bg-zinc-900 text-zinc-100;
}

/* Custom styles */
.btn {
  @apply px-4 py-2 font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

.btn-secondary {
  @apply bg-zinc-700 hover:bg-zinc-600 text-zinc-100;
}

.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white;
}

/* Skeleton loading animation */
.skeleton {
  @apply animate-pulse bg-zinc-700 rounded;
}
```

**Step 5: Commit**

```bash
git add admin-ui/
git commit -m "feat(ui): initialize Vike + React + Tailwind project"
```

---

## Task 2: Define TypeScript Types

**Files:**
- Create: `admin-ui/types/index.ts`

**Step 1: Create type definitions**

```typescript
// admin-ui/types/index.ts

export interface RuneSummary {
  id: string;
  title: string;
  status: RuneStatus;
  priority: number;
  claimant?: string;
  parent_id?: string;
  branch?: string;
  created_at: string;
  updated_at: string;
}

export interface RuneDetail extends RuneSummary {
  description?: string;
  dependencies: DependencyRef[];
  notes: NoteEntry[];
}

export interface DependencyRef {
  target_id: string;
  relationship: string;
}

export interface NoteEntry {
  text: string;
  created_at: string;
}

export type RuneStatus = 'draft' | 'open' | 'claimed' | 'fulfilled' | 'sealed' | 'shattered';

export interface Realm {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export interface Account {
  account_id: string;
  username: string;
  status: 'active' | 'suspended';
  realms: string[];
  roles: Record<string, Role>;
  pat_count: number;
  created_at: string;
}

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export interface PATInfo {
  pat_id: string;
  label: string;
  created_at: string;
  revoked: boolean;
}

export interface User {
  account_id: string;
  username: string;
  roles: Record<string, Role>;
  is_system_admin: boolean;
}

export interface AuthState {
  user: User | null;
  current_realm: string | null;
  token: string | null;
  isLoading: boolean;
}
```

**Step 2: Commit**

```bash
git add admin-ui/types/
git commit -m "feat(ui): add TypeScript type definitions"
```

---

## Task 3: Create Vike Server with API Proxy

**Files:**
- Create: `admin-ui/server/index.ts`
- Create: `admin-ui/server/api-client.ts`
- Create: `admin-ui/server/auth.ts`

**Step 1: Create API client for Go server**

Create `admin-ui/server/api-client.ts`:

```typescript
// admin-ui/server/api-client.ts

const GO_SERVER_URL = process.env.GO_SERVER_URL || 'http://localhost:8080';

export interface GoServerOptions {
  pat?: string;
  realm?: string;
}

export async function goServerFetch(
  path: string,
  options: GoServerOptions = {},
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);

  if (options.pat) {
    headers.set('Authorization', `Bearer ${options.pat}`);
  }
  if (options.realm) {
    headers.set('X-Bifrost-Realm', options.realm);
  }

  const response = await fetch(`${GO_SERVER_URL}${path}`, {
    ...init,
    headers,
  });

  return response;
}

export async function goServerJson<T>(
  path: string,
  options: GoServerOptions = {},
  init: RequestInit = {}
): Promise<T> {
  const response = await goServerFetch(path, options, init);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Go server error: ${response.status} - ${error}`);
  }

  return response.json();
}
```

**Step 2: Create JWT auth utilities**

Create `admin-ui/server/auth.ts`:

```typescript
// admin-ui/server/auth.ts

import { SignJWT, jwtVerify } from 'jose';
import { goServerFetch } from './api-client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
);
const JWT_EXPIRY = '30d';

export interface JWTPayload {
  account_id: string;
  pat_id: string;
  username: string;
  roles: Record<string, string>;
}

export async function createJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function validatePAT(pat: string): Promise<JWTPayload | null> {
  // Validate PAT against Go server
  const response = await goServerFetch('/runes', { pat, realm: '_admin' });

  if (!response.ok) {
    return null;
  }

  // PAT is valid - in production, we'd get account info from Go server
  // For now, return a minimal payload
  return {
    account_id: 'temp',
    pat_id: 'temp-pat-id',
    username: 'user',
    roles: { '_admin': 'admin' },
  };
}
```

**Step 3: Create Express server with Vike integration**

Create `admin-ui/server/index.ts`:

```typescript
// admin-ui/server/index.ts

import express from 'express';
import { renderPage } from 'vike/server';
import { createJWT, verifyJWT, validatePAT } from './auth';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

app.use(express.json());

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const { pat } = req.body;

  if (!pat) {
    return res.status(400).json({ error: 'PAT is required' });
  }

  const payload = await validatePAT(pat);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid PAT' });
  }

  const token = await createJWT(payload);

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict',
  });

  res.json({ user: payload });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ user: payload });
});

// Vike middleware - handles all other routes
app.get('*', async (req, res) => {
  const pageContextInit = {
    urlOriginal: req.originalUrl,
  };

  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;

  if (!httpResponse) {
    return res.status(500).send('Internal Server Error');
  }

  httpResponse.headers.forEach(([name, value]) => res.setHeader(name, value));
  res.status(httpResponse.statusCode);
  httpResponse.pipe(res);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

**Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "vite build",
    "preview": "NODE_ENV=production tsx server/index.ts"
  }
}
```

**Step 5: Commit**

```bash
git add admin-ui/server/ admin-ui/package.json
git commit -m "feat(ui): add Vike server with JWT auth"
```

---

## Task 4: Create Auth Context and Hooks

**Files:**
- Create: `admin-ui/context/AuthContext.tsx`
- Create: `admin-ui/hooks/useAuth.ts`

**Step 1: Create Auth Context**

```tsx
// admin-ui/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextValue extends AuthState {
  login: (pat: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentRealm: (realmId: string) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    current_realm: null,
    token: null,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setState(prev => ({
            ...prev,
            user: data.user,
            current_realm: Object.keys(data.user.roles)[0] || null,
            isLoading: false,
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      })
      .catch(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      });
  }, []);

  const login = async (pat: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pat }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setState(prev => ({
        ...prev,
        user: data.user,
        current_realm: Object.keys(data.user.roles)[0] || null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setState({
      user: null,
      current_realm: null,
      token: null,
      isLoading: false,
    });
  };

  const setCurrentRealm = (realmId: string) => {
    setState(prev => ({ ...prev, current_realm: realmId }));
  };

  return (
    <AuthContext.Provider value={{ ...state, error, login, logout, setCurrentRealm }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Step 2: Export from hooks**

```typescript
// admin-ui/hooks/useAuth.ts
export { useAuth } from '../context/AuthContext';
```

**Step 3: Commit**

```bash
git add admin-ui/context/ admin-ui/hooks/
git commit -m "feat(ui): add auth context and hooks"
```

---

## Task 5: Create Layout Components

**Files:**
- Create: `admin-ui/components/layout/Navbar.tsx`
- Create: `admin-ui/components/layout/Sidebar.tsx`
- Create: `admin-ui/components/layout/Layout.tsx`
- Create: `admin-ui/components/common/Skeleton.tsx`

**Step 1: Create Skeleton component**

```tsx
// admin-ui/components/common/Skeleton.tsx

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function RuneSkeleton() {
  return (
    <div className="p-4 border border-zinc-700 space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Create Navbar**

```tsx
// admin-ui/components/layout/Navbar.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, current_realm, setCurrentRealm, logout } = useAuth();

  const realmOptions = user?.roles
    ? Object.keys(user.roles).filter(r => r !== '_admin')
    : [];

  return (
    <nav className="h-14 border-b border-zinc-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-lg hover:text-blue-400">
          Bifrost
        </Link>
        <div className="flex gap-4">
          <Link to="/runes" className="hover:text-blue-400">Runes</Link>
          {user?.is_system_admin && (
            <>
              <Link to="/admin/realms" className="hover:text-blue-400">Realms</Link>
              <Link to="/admin/accounts" className="hover:text-blue-400">Accounts</Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {realmOptions.length > 0 && (
          <select
            value={current_realm || ''}
            onChange={(e) => setCurrentRealm(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 px-2 py-1 text-sm"
          >
            {realmOptions.map(realm => (
              <option key={realm} value={realm}>{realm}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">{user?.username}</span>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
```

**Step 3: Create Layout wrapper**

```tsx
// admin-ui/components/layout/Layout.tsx

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar';

export function Layout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add admin-ui/components/
git commit -m "feat(ui): add layout components (Navbar, Skeleton)"
```

---

## Task 6: Create Login Page

**Files:**
- Create: `admin-ui/pages/login/+Page.tsx`
- Create: `admin-ui/pages/login/+data.ts`

**Step 1: Create Login page**

```tsx
// admin-ui/pages/login/+Page.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [pat, setPat] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(pat);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-zinc-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Bifrost Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Personal Access Token</label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your PAT"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add admin-ui/pages/login/
git commit -m "feat(ui): add login page"
```

---

## Task 7: Create Dashboard Page

**Files:**
- Create: `admin-ui/pages/index/+Page.tsx`
- Create: `admin-ui/pages/index/+data.ts`

**Step 1: Create Dashboard page**

```tsx
// admin-ui/pages/index/+Page.tsx

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RuneSkeleton, TableSkeleton } from '../../components/common/Skeleton';

async function fetchDashboard(realm: string) {
  const res = await fetch(`/api/runes?realm=${realm}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export default function DashboardPage() {
  const { current_realm, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', current_realm],
    queryFn: () => fetchDashboard(current_realm!),
    enabled: !!current_realm,
  });

  if (!current_realm) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl mb-4">No Realm Selected</h2>
        <p className="text-zinc-400">Please select a realm to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard - {current_realm}</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-zinc-700">
              <RuneSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Draft" value={data?.statusCounts?.draft || 0} color="zinc" />
          <StatCard label="Open" value={data?.statusCounts?.open || 0} color="blue" />
          <StatCard label="Claimed" value={data?.statusCounts?.claimed || 0} color="yellow" />
          <StatCard label="Fulfilled" value={data?.statusCounts?.fulfilled || 0} color="green" />
        </div>
      )}

      <div className="border border-zinc-700">
        <div className="p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold">Recent Runes</h2>
        </div>
        {isLoading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : (
          <div className="divide-y divide-zinc-700">
            {data?.recentRunes?.slice(0, 5).map((rune: any) => (
              <Link
                key={rune.id}
                to={`/runes/${rune.id}`}
                className="flex justify-between p-4 hover:bg-zinc-800"
              >
                <span>{rune.title}</span>
                <span className="text-zinc-400">{rune.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    zinc: 'bg-zinc-700',
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    green: 'bg-green-600',
  };

  return (
    <div className="p-4 border border-zinc-700">
      <div className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses]} px-2 py-1 inline-block`}>
        {value}
      </div>
      <div className="text-zinc-400 mt-2">{label}</div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add admin-ui/pages/index/
git commit -m "feat(ui): add dashboard page"
```

---

## Task 8: Create Runes List Page

**Files:**
- Create: `admin-ui/pages/runes/index/+Page.tsx`
- Create: `admin-ui/components/runes/RuneList.tsx`
- Create: `admin-ui/components/runes/RuneFilters.tsx`

**Step 1: Create RuneFilters component**

```tsx
// admin-ui/components/runes/RuneFilters.tsx

interface RuneFiltersProps {
  status: string;
  priority: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
}

export function RuneFilters({ status, priority, onStatusChange, onPriorityChange }: RuneFiltersProps) {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-600 px-3 py-2"
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="open">Open</option>
        <option value="claimed">Claimed</option>
        <option value="fulfilled">Fulfilled</option>
        <option value="sealed">Sealed</option>
        <option value="shattered">Shattered</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-600 px-3 py-2"
      >
        <option value="">All Priorities</option>
        <option value="0">None (0)</option>
        <option value="1">Low (1)</option>
        <option value="2">Medium (2)</option>
        <option value="3">High (3)</option>
        <option value="4">Urgent (4)</option>
      </select>
    </div>
  );
}
```

**Step 2: Create RuneList component**

```tsx
// admin-ui/components/runes/RuneList.tsx

import { Link } from 'react-router-dom';
import type { RuneSummary, RuneStatus } from '../../types';

interface RuneListProps {
  runes: RuneSummary[];
  isLoading: boolean;
}

const statusColors: Record<RuneStatus, string> = {
  draft: 'bg-zinc-600',
  open: 'bg-blue-600',
  claimed: 'bg-yellow-600',
  fulfilled: 'bg-green-600',
  sealed: 'bg-purple-600',
  shattered: 'bg-red-600',
};

export function RuneList({ runes, isLoading }: RuneListProps) {
  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>;
  }

  if (runes.length === 0) {
    return <p className="text-zinc-400 text-center py-8">No runes found</p>;
  }

  return (
    <div className="border border-zinc-700 divide-y divide-zinc-700">
      {runes.map(rune => (
        <Link
          key={rune.id}
          to={`/runes/${rune.id}`}
          className="flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors"
        >
          <div className="flex-1">
            <h3 className="font-medium">{rune.title}</h3>
            <div className="flex gap-2 mt-1 text-sm text-zinc-400">
              <span>{rune.id}</span>
              {rune.branch && <span>· {rune.branch}</span>}
              {rune.claimant && <span>· claimed by {rune.claimant}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-medium ${statusColors[rune.status]}`}>
              {rune.status}
            </span>
            <span className="text-zinc-400">P{rune.priority}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

**Step 3: Create Runes List page**

```tsx
// admin-ui/pages/runes/index/+Page.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RuneList } from '../../components/runes/RuneList';
import { RuneFilters } from '../../components/runes/RuneFilters';

async function fetchRunes(realm: string, status: string, priority: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);

  const res = await fetch(`/api/runes?realm=${realm}&${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch runes');
  return res.json();
}

export default function RunesListPage() {
  const { current_realm, user } = useAuth();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['runes', current_realm, status, priority],
    queryFn: () => fetchRunes(current_realm!, status, priority),
    enabled: !!current_realm,
  });

  const canCreate = user?.roles?.[current_realm || ''] &&
    ['owner', 'admin', 'member'].includes(user.roles[current_realm || '']);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Runes</h1>
        {canCreate && (
          <Link to="/runes/new" className="btn btn-primary">
            Create Rune
          </Link>
        )}
      </div>

      <RuneFilters
        status={status}
        priority={priority}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
      />

      <RuneList runes={data?.runes || []} isLoading={isLoading} />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add admin-ui/pages/runes/ admin-ui/components/runes/
git commit -m "feat(ui): add runes list page with filters"
```

---

## Task 9: Create Rune Detail Page

**Files:**
- Create: `admin-ui/pages/runes/@id/+Page.tsx`
- Create: `admin-ui/components/runes/RuneActions.tsx`

**Step 1: Create RuneActions component**

```tsx
// admin-ui/components/runes/RuneActions.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import type { RuneDetail, RuneStatus } from '../../types';

interface RuneActionsProps {
  rune: RuneDetail;
}

async function runeAction(runeId: string, action: string, realm: string) {
  const res = await fetch(`/api/runes/${runeId}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ realm }),
  });
  if (!res.ok) throw new Error(`Failed to ${action} rune`);
  return res.json();
}

export function RuneActions({ rune }: RuneActionsProps) {
  const { current_realm, user } = useAuth();
  const queryClient = useQueryClient();

  const canAct = user?.roles?.[current_realm || ''] &&
    ['owner', 'admin', 'member'].includes(user.roles[current_realm || '']);

  const mutation = useMutation({
    mutationFn: (action: string) => runeAction(rune.id, action, current_realm!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rune', rune.id] });
    },
  });

  if (!canAct) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {rune.status === 'draft' && (
        <button
          onClick={() => mutation.mutate('forge')}
          disabled={mutation.isPending}
          className="btn btn-secondary"
        >
          Forge
        </button>
      )}

      {rune.status === 'open' && (
        <button
          onClick={() => mutation.mutate('claim')}
          disabled={mutation.isPending}
          className="btn btn-primary"
        >
          Claim
        </button>
      )}

      {rune.status === 'claimed' && (
        <>
          <button
            onClick={() => mutation.mutate('fulfill')}
            disabled={mutation.isPending}
            className="btn btn-primary"
          >
            Fulfill
          </button>
          <button
            onClick={() => mutation.mutate('unclaim')}
            disabled={mutation.isPending}
            className="btn btn-secondary"
          >
            Unclaim
          </button>
        </>
      )}

      {!['sealed', 'shattered'].includes(rune.status) && (
        <button
          onClick={() => mutation.mutate('seal')}
          disabled={mutation.isPending}
          className="btn btn-secondary"
        >
          Seal
        </button>
      )}

      {['fulfilled', 'sealed'].includes(rune.status) && (
        <button
          onClick={() => {
            if (confirm('Are you sure? This is irreversible.')) {
              mutation.mutate('shatter');
            }
          }}
          disabled={mutation.isPending}
          className="btn btn-danger"
        >
          Shatter
        </button>
      )}
    </div>
  );
}
```

**Step 2: Create Rune Detail page**

```tsx
// admin-ui/pages/runes/@id/+Page.tsx

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RuneActions } from '../../components/runes/RuneActions';
import { RuneSkeleton } from '../../components/common/Skeleton';

async function fetchRune(id: string, realm: string) {
  const res = await fetch(`/api/runes/${id}?realm=${realm}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch rune');
  return res.json();
}

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-600',
  open: 'bg-blue-600',
  claimed: 'bg-yellow-600',
  fulfilled: 'bg-green-600',
  sealed: 'bg-purple-600',
  shattered: 'bg-red-600',
};

export default function RuneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { current_realm } = useAuth();

  const { data: rune, isLoading } = useQuery({
    queryKey: ['rune', id],
    queryFn: () => fetchRune(id!, current_realm!),
    enabled: !!id && !!current_realm,
  });

  if (isLoading) {
    return <div className="max-w-3xl"><RuneSkeleton /></div>;
  }

  if (!rune) {
    return <p className="text-zinc-400">Rune not found</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{rune.title}</h1>
          <p className="text-zinc-400 text-sm mt-1">{rune.id}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium ${statusColors[rune.status]}`}>
          {rune.status}
        </span>
      </div>

      <div className="border border-zinc-700 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-400">Priority:</span> P{rune.priority}
          </div>
          {rune.claimant && (
            <div>
              <span className="text-zinc-400">Claimant:</span> {rune.claimant}
            </div>
          )}
          {rune.branch && (
            <div>
              <span className="text-zinc-400">Branch:</span> {rune.branch}
            </div>
          )}
          <div>
            <span className="text-zinc-400">Updated:</span>{' '}
            {new Date(rune.updated_at).toLocaleString()}
          </div>
        </div>

        {rune.description && (
          <div className="pt-4 border-t border-zinc-700">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-zinc-300 whitespace-pre-wrap">{rune.description}</p>
          </div>
        )}
      </div>

      <RuneActions rune={rune} />

      {rune.notes?.length > 0 && (
        <div className="border border-zinc-700">
          <div className="p-4 border-b border-zinc-700">
            <h3 className="font-medium">Notes</h3>
          </div>
          <div className="divide-y divide-zinc-700">
            {rune.notes.map((note: any, i: number) => (
              <div key={i} className="p-4">
                <p className="text-zinc-300">{note.text}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {rune.dependencies?.length > 0 && (
        <div className="border border-zinc-700">
          <div className="p-4 border-b border-zinc-700">
            <h3 className="font-medium">Dependencies</h3>
          </div>
          <div className="divide-y divide-zinc-700">
            {rune.dependencies.map((dep: any, i: number) => (
              <div key={i} className="p-4 flex justify-between">
                <a href={`/runes/${dep.target_id}`} className="text-blue-400 hover:underline">
                  {dep.target_id}
                </a>
                <span className="text-zinc-400">{dep.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add admin-ui/pages/runes/@id/ admin-ui/components/runes/RuneActions.tsx
git commit -m "feat(ui): add rune detail page with actions"
```

---

## Task 10: Create Admin Pages (Realms & Accounts)

**Files:**
- Create: `admin-ui/pages/admin/realms/+Page.tsx`
- Create: `admin-ui/pages/admin/accounts/+Page.tsx`
- Create: `admin-ui/pages/admin/accounts/@id/+Page.tsx`

**Step 1: Create Realms List page**

```tsx
// admin-ui/pages/admin/realms/+Page.tsx

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TableSkeleton } from '../../../components/common/Skeleton';

async function fetchRealms() {
  const res = await fetch('/api/admin/realms', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch realms');
  return res.json();
}

export default function RealmsListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['realms'],
    queryFn: fetchRealms,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Realms</h1>

      <div className="border border-zinc-700">
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-zinc-700 text-sm text-zinc-400">
          <div>ID</div>
          <div>Name</div>
          <div>Status</div>
          <div>Created</div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          data?.realms?.map((realm: any) => (
            <Link
              key={realm.id}
              to={`/admin/realms/${realm.id}`}
              className="grid grid-cols-4 gap-4 p-4 border-b border-zinc-700 last:border-b-0 hover:bg-zinc-800"
            >
              <div className="font-mono text-sm">{realm.id}</div>
              <div>{realm.name}</div>
              <div>
                <span className={`px-2 py-0.5 text-xs ${realm.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}>
                  {realm.status}
                </span>
              </div>
              <div className="text-zinc-400 text-sm">
                {new Date(realm.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create Accounts List page**

```tsx
// admin-ui/pages/admin/accounts/+Page.tsx

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TableSkeleton } from '../../../components/common/Skeleton';

async function fetchAccounts() {
  const res = await fetch('/api/admin/accounts', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return res.json();
}

export default function AccountsListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Accounts</h1>

      <div className="border border-zinc-700">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-zinc-700 text-sm text-zinc-400">
          <div>Username</div>
          <div>Status</div>
          <div>Realms</div>
          <div>PATs</div>
          <div>Created</div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          data?.accounts?.map((account: any) => (
            <Link
              key={account.account_id}
              to={`/admin/accounts/${account.account_id}`}
              className="grid grid-cols-5 gap-4 p-4 border-b border-zinc-700 last:border-b-0 hover:bg-zinc-800"
            >
              <div>{account.username}</div>
              <div>
                <span className={`px-2 py-0.5 text-xs ${account.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}>
                  {account.status}
                </span>
              </div>
              <div className="text-zinc-400">{account.realms?.length || 0}</div>
              <div className="text-zinc-400">{account.pat_count}</div>
              <div className="text-zinc-400 text-sm">
                {new Date(account.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add admin-ui/pages/admin/
git commit -m "feat(ui): add admin pages for realms and accounts"
```

---

## Task 11: Set Up Vike Routing

**Files:**
- Create: `admin-ui/renderer/_default.page.client.tsx`
- Create: `admin-ui/renderer/_default.page.server.tsx`
- Create: `admin-ui/renderer/_default.page.route.ts`

**Step 1: Create client renderer**

```tsx
// admin-ui/renderer/_default.page.client.tsx

import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PageShell } from './PageShell';
import type { PageContextClient } from 'vike/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

export function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;

  hydrateRoot(
    document.getElementById('root')!,
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <PageShell pageContext={pageContext}>
            <Page {...pageProps} />
          </PageShell>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

**Step 2: Create PageShell component**

```tsx
// admin-ui/renderer/PageShell.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import type { PageContext } from 'vike/types';

// Import pages
import LoginPage from './pages/login/+Page';
import DashboardPage from './pages/index/+Page';
import RunesListPage from './pages/runes/index/+Page';
import RuneDetailPage from './pages/runes/@id/+Page';
import RealmsListPage from './pages/admin/realms/+Page';
import AccountsListPage from './pages/admin/accounts/+Page';

interface PageShellProps {
  pageContext: PageContext;
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/runes" element={<RunesListPage />} />
        <Route path="/runes/:id" element={<RuneDetailPage />} />
        <Route path="/admin/realms" element={<RealmsListPage />} />
        <Route path="/admin/accounts" element={<AccountsListPage />} />
        <Route path="/admin/accounts/:id" element={<AccountsListPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**Step 3: Commit**

```bash
git add admin-ui/renderer/
git commit -m "feat(ui): set up Vike routing with React Router"
```

---

## Task 12: Add API Proxy Endpoints to Server

**Files:**
- Modify: `admin-ui/server/index.ts`

**Step 1: Add proxy endpoints**

Add to `admin-ui/server/index.ts` before the Vike middleware:

```typescript
// Proxy API requests to Go server
app.use('/api', async (req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Get PAT for this user (in production, fetch from secure storage)
  // For now, we'd need to store PAT mapping or re-authenticate
  const pat = req.headers['x-pat'] as string || process.env.DEFAULT_PAT;

  const realm = req.query.realm || req.body?.realm || payload.roles[0];

  try {
    const response = await goServerFetch(
      req.path.replace('/api', ''),
      { pat, realm },
      {
        method: req.method,
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});
```

**Step 2: Commit**

```bash
git add admin-ui/server/index.ts
git commit -m "feat(ui): add API proxy endpoints to Vike server"
```

---

## Execution Order

1. Task 1: Initialize Vike + React Project
2. Task 2: Define TypeScript Types
3. Task 3: Create Vike Server with API Proxy
4. Task 4: Create Auth Context and Hooks
5. Task 5: Create Layout Components
6. Task 6: Create Login Page
7. Task 7: Create Dashboard Page
8. Task 8: Create Runes List Page
9. Task 9: Create Rune Detail Page
10. Task 10: Create Admin Pages
11. Task 11: Set Up Vike Routing
12. Task 12: Add API Proxy Endpoints

---

## Notes

- The Go server remains completely unchanged
- Vike server handles JWT auth and translates to PAT for Go server
- All realm/role logic is inherited from Go server responses
- Dark theme by default, no rounded corners, clean lines
- Skeleton loading states for all data fetching
