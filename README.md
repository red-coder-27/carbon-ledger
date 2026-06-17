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
- **Energy** — electricity (kWh) and LPG cylinder usage
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

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Validation | Zod |
| Persistence | localStorage (typed, validated wrapper) |
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

# Run tests with coverage report
npm run test:coverage

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

## 📁 Project Structure

```
carbon-ledger/
├── src/
│   ├── components/        # React UI components
│   │   ├── Dashboard/
│   │   ├── LogActivity/
│   │   ├── Insights/
│   │   ├── History/
│   │   └── Achievements/
│   ├── utils/
│   │   ├── calculations.ts   # Pure emission calculation functions
│   │   └── insights.ts       # Rules-based recommendation engine
│   ├── data/
│   │   └── emissionFactors.ts  # Documented emission constants
│   ├── hooks/
│   │   └── useActivityLog.ts   # State management hook
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── storage/
│       └── localStorage.ts     # Type-safe, validated storage wrapper
├── tests/                  # Vitest test suites
├── public/
├── README.md
├── SECURITY.md
└── vite.config.ts
```

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

## 🔒 Security

See [`SECURITY.md`](./SECURITY.md) for full details. Key choices:

- **Input validation** — all user input validated via Zod schemas before storage or calculation. Out-of-range and malformed values are rejected with friendly UI feedback.
- **No unsafe HTML** — zero use of `dangerouslySetInnerHTML`, `eval`, or dynamic `Function()` anywhere in the codebase.
- **Resilient storage** — the localStorage wrapper catches and handles JSON parse errors and corrupted data gracefully, falling back to an empty state without crashing the UI.
- **No secrets** — the app is fully client-side with no API keys, tokens, or backend credentials of any kind.

---

## 🌐 Deployment

Carbon Ledger produces a fully static build (`npm run build`) compatible with:

- **Vercel** — connect the GitHub repo, it auto-detects Vite and deploys
- **Netlify** — drag-and-drop the `dist/` folder or connect via Git
- **GitHub Pages** — set the publish directory to `dist/`

No server, no database, no environment variables required.

---

## 📜 License

MIT — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

Built for **PromptWars: Virtual Challenge 3 — Carbon Footprint Awareness Platform** by Hack2Skill × Google for Developers.

Emission factors derived from publicly available sources including CEA (Central Electricity Authority of India) grid emission data and peer-reviewed dietary footprint research.