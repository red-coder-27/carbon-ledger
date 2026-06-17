# 🌿 Carbon Ledger — Field Journal

> *"We do not inherit the earth from our ancestors; we borrow it from our children."* — Indigene Proverb

A personal carbon footprint tracker and awareness platform built for **PromptWars: Virtual — Challenge 3** by Hack2Skill × Google for Developers.

Carbon Ledger helps individuals **understand, track, and reduce their carbon footprint** through simple daily activity logging and personalized, data-driven insights — presented as a naturalist's field journal.

---

## ✨ Features

### 📊 Dashboard
- **Carbon Rings** — a signature tree-ring circular visualization showing your footprint breakdown by category (Transport, Energy, Food, Waste) for the selected period
- **National Comparison** — your footprint benchmarked against India's estimated average (~1.9 tons CO₂e/month)
- **Dynamic summary sentence** — auto-generated insight based on your actual logged data
- Weekly / Monthly toggle

### 📝 Log Activity
- **Transport** — 9 travel modes (Petrol Car, Diesel Car, EV, Bus, Train/Metro, Two-Wheeler, Domestic Flight, International Flight, Bicycle, Walking) with distance in km
- **Energy** — electricity (kWh) and LPG cylinder usage (with built-in Household Size and AC Usage quick estimate assistants)
- **Diet** — 5 daily diet patterns (Vegan → Non-veg Heavy) with per-day emission factors
- **Waste** — volume level (Low/Medium/High) × segregation status (Yes/No)
- All inputs validated with Zod — friendly inline errors, never a crash

### 💡 Personal Insights
- Rules-based recommendation engine (deterministic TypeScript — fully unit-tested)
- Identifies your highest-impact category from real logged data
- 3–5 actionable recommendations ranked by estimated CO₂ savings (kg CO₂e/week)
- Recomputes dynamically with every new entry
- 4–5 rules per category covering all four activity types

### 📈 History & Trends
- Area/line chart (Recharts) showing daily emissions over time
- Per-category stacked view toggle
- Data ledger listing every logged entry with delete option
- Graceful empty state when no data exists yet

### 🏆 Field Badges & Milestones
| Badge | Condition |
|-------|-----------|
| 🌱 First Entry | Log your first activity |
| 🔥 Week Streak | Log activities 7 consecutive days |
| 🚴 Green Commuter | 5 zero/low-emission transport entries |
| 📉 Below Average | Weekly total under India's average baseline |
| ♻️ Waste Warrior | Segregate/recycle waste 5 times |

---

## 📁 Project Structure

```
carbon-ledger/
├── dist/                  # Built static production files
├── public/                # Static public assets
├── src/
│   ├── components/        # React UI components & forms
│   │   ├── AchievementsView.tsx  # Achievements view sub-screen
│   │   ├── DashboardView.tsx     # Main dashboard view
│   │   ├── EnergyForm.tsx        # Energy input form sub-component
│   │   ├── ErrorBoundary.tsx     # Render crash-safety wrapper
│   │   ├── FoodForm.tsx          # Food input form sub-component
│   │   ├── HistoryView.tsx       # Logs table and Recharts area chart
│   │   ├── InsightsView.tsx      # Ranked actionable recommendations
│   │   ├── LogActivityView.tsx   # Entry logging tab layout
│   │   ├── TransportForm.tsx     # Transport input form sub-component
│   │   ├── TreeRingChart.tsx     # SVG dynamic Concentric Tree Rings
│   │   └── WasteForm.tsx         # Waste input form sub-component
│   ├── data/
│   │   └── emissionFactors.ts    # Documented emission constants
│   ├── hooks/
│   │   └── useDebounce.ts        # Custom debounce utility hook
│   ├── test/                     # Vitest test files
│   │   ├── calculations.test.ts
│   │   ├── components.test.tsx
│   │   └── insights.test.ts
│   ├── types/
│   │   └── index.ts              # Global TypeScript models
│   ├── utils/
│   │   ├── achievements.ts       # Badge unlocking conditions
│   │   ├── calculations.ts       # Emission calculation pure formulas
│   │   ├── insights.ts           # Recommendation generation rules
│   │   ├── storage.ts            # Rate-limited local storage layer
│   │   └── validation.ts         # Zod schemas & sanitization
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── LICENSE                # MIT License
├── package.json
├── README.md
├── SECURITY.md
├── tailwind.config.js
└── vite.config.ts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Validation | Zod |
| Persistence | localStorage (with version matching and limit checks) |
| Testing | Vitest + React Testing Library |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/red-coder-27/carbon-ledger.git
cd carbon-ledger

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The `dist/` folder is a fully static site — deploy to Vercel, Netlify, or GitHub Pages with no server required.

### Preview Production Build Locally

```bash
npm run preview
```

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch
```

### What's Tested

- **`calculations.ts`** — unit tests for every emission calculation function (transport, energy, diet, waste, total aggregator), covering normal cases, zero/empty input, and boundary values
- **`insights.ts`** — unit tests for the recommendation engine: ranking by impact, per-category rule firing, edge cases with no data
- **Component tests** — ActivityLog form (valid submission + validation errors), Dashboard (correct totals from mock data), Insights panel (recommendations sorted by savings)

All tests must pass before submission — no skipped or failing tests in the build.

---

## 🌍 Emission Factor Assumptions

All factors are approximate and intended for **personal awareness only** — not regulatory reporting. Sourced from publicly available datasets for India.

### Transport (kg CO₂e per km)
| Mode | Factor |
|------|--------|
| Petrol Car | 0.192 |
| Diesel Car | 0.171 |
| Electric Car (India grid avg) | 0.085 |
| Two-Wheeler | 0.072 |
| Bus | 0.105 |
| Train / Metro | 0.041 |
| Domestic Flight | 0.255 |
| International Flight | 0.195 |
| Bicycle / Walking | 0.000 |

### Energy
| Source | Factor |
|--------|--------|
| Electricity (India grid avg) | 0.71 kg CO₂e / kWh |
| LPG cylinder (14.2 kg domestic) | 42 kg CO₂e / refill |

### Diet (kg CO₂e per day)
| Pattern | Factor |
|---------|--------|
| Vegan | 1.5 |
| Vegetarian | 1.7 |
| Eggetarian | 2.1 |
| Non-veg (moderate) | 3.3 |
| Non-veg (heavy) | 5.6 |

### Waste (kg CO₂e per day)
| Volume | Segregated | Mixed |
|--------|-----------|-------|
| Low | 0.5 | 0.9 |
| Medium | 1.0 | 1.8 |
| High | 1.6 | 2.9 |

**National Average Baseline:** ~1.9 tons CO₂e/month (~438 kg CO₂e/week) — estimated per capita for India. Cited visibly in the UI as an estimate.

> All emission factors are defined in `src/data/emissionFactors.ts` as a single documented constants module.

---

## ♿ Accessibility

Carbon Ledger is built to meet **WCAG 2.1 AA** standards:

- Semantic HTML throughout (`<nav>`, `<main>`, `<section>`, correct heading hierarchy)
- All form inputs have associated `<label>` elements — not just placeholders
- The tree-ring chart has a text/table alternative accessible via `aria-describedby`
- Visible focus states on every interactive element
- Color contrast checked for all palette combinations against the paper background
- Full keyboard navigation — every control reachable and operable without a mouse
- `prefers-reduced-motion` respected — no looping animations
- Skip-to-content link for the navigation rail
- Badge locked/earned status communicated via text ("Locked" / "Earned on [date]"), not color alone

---

## 🔒 Security & Quality Engineering

See [`SECURITY.md`](./SECURITY.md) for full details. Key safeguards in Attempt 2:

- **Input Sanitization & Coercion**: Built with Zod to intercept NaN/Infinity values, strip leading/trailing spaces, and enforce reasonable limits on all entries (e.g. max distance of 1000 km/day).
- **Secure Persistence Layer**:
  - **Storage Bounds**: Restricts storage usage to 4MB max to prevent Denial of Service (DoS) through disk filling.
  - **Data Schema Verification**: Automatically verifies the version of stored data (`1.0.0`) and sanitizes data against strict Zod parsing rules on both reads and writes.
  - **Rate Limiting**: Throws validation errors if users attempt to register more than 50 entries for a single date, preventing memory consumption attacks.
- **Render Crash Protection**: Wrap-around `<ErrorBoundary>` catches component lifecycle errors (such as Recharts size glitches) and mounts a fallback layout without stopping the host app.
- **Strict Content Security Policy (CSP)**: Includes standard CSP tags in `index.html` enforcing origin control on styles, scripts, fonts, and data connections.
- **Modular Refactoring**: All logging subforms are extracted into single-purpose components to improve code quality, readability, and testing boundaries.

---

## 📜 License

MIT — free to use, modify, and distribute. See the [LICENSE](./LICENSE) file for details.