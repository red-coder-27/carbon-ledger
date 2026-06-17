# Security Policy — Carbon Ledger

## Overview

Carbon Ledger is a fully client-side, static web application. It has no backend, no server, no database, and no network requests. All data is stored locally in the user's own browser via `localStorage`. This architecture minimizes the attack surface significantly.

---

## Security Design Choices

### 1. Input Validation via Zod

All user-supplied input is validated at the point of entry using [Zod](https://zod.dev/) schemas before it is stored or used in any calculation.

- Numeric fields enforce minimum (0) and maximum (sensible domain bounds, e.g. distance ≤ 1000 km/day) constraints
- Enum fields (transport mode, diet type, waste level) are validated against a strict allow-list
- Date fields are validated as ISO date strings
- Any value failing validation is rejected with a clear, user-friendly inline error message — no raw exceptions are surfaced to the UI

### 2. No Unsafe HTML Injection

The codebase contains zero use of:
- `dangerouslySetInnerHTML`
- `eval()`
- `new Function()`
- `innerHTML` set from user-controlled data

All dynamic content is rendered via React's standard JSX rendering pipeline, which escapes values by default.

### 3. Resilient localStorage Wrapper

All reads from `localStorage` are wrapped in a typed module (`src/storage/localStorage.ts`) that:
- Catches `JSON.parse` errors from corrupted or tampered data
- Falls back to a safe empty state instead of throwing to the UI
- Validates the shape of retrieved data against expected TypeScript types before use

This means a user manually editing their browser storage (or a browser extension corrupting it) cannot crash the application.

### 4. No Secrets or Credentials

Carbon Ledger requires no API keys, authentication tokens, third-party service credentials, or environment variables. None exist in the codebase. The application is entirely self-contained.

### 5. Dependency Hygiene

All dependencies are pinned and sourced from the npm registry. The project uses only well-maintained, widely-used packages (React, Vite, Tailwind, Recharts, Zod, Vitest). Run `npm audit` at any time to check for known vulnerabilities.

---

## Data Privacy

All user data (activity logs, badge state) is stored **exclusively in the user's own browser** via `localStorage`. No data is transmitted to any server, third party, or analytics service. Clearing browser data removes all stored information.

---

## Reporting Issues

This is a hackathon project. If you find a security concern, please open a GitHub Issue describing the problem.