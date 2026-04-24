# Multi-Agent-Retail-Supply-Chain-Orchestration-System

> A live multi-agent system that detects retail supply chain disruptions and resolves them autonomously — from signal to ERP write — in under 7 seconds.

---

## What It Does

Orchestra MAS orchestrates five specialized AI agents to handle real-world supply chain disruptions — port delays, hurricanes, demand surges, and labor strikes — without human intervention in the common case.

| Agent | Role |
|---|---|
| **Signal Watcher (SW-01)** | Monitors AIS feeds, carrier APIs, and weather. Emits typed disruption signals. |
| **Sourcing Strategist (SS-02)** | Multi-round supplier negotiation and PO drafting within policy limits. |
| **Logistics Optimizer (LO-03)** | Solves vehicle routing via OR-Tools. Selects carrier/mode mix. |
| **Governance Guardrail (GG-04)** | Final-mile policy gate before every ERP write — injection scan, PII redaction, budget enforcement. |
| **Orchestrator (OC-00)** | Routes signals, manages parallel fan-out, closes decisions into ERP. |

## Run Locally

No `npm install`. No build step. React, ReactDOM, and Babel load from CDN at runtime.

> **Why you need a local server:** The project loads JSX files via `<script type="text/babel" src="...">`. Browsers block these requests under CORS when opening from `file://`. A local server fixes that.

---

### Option 1 — Python (simplest)

```bash
# Python 3
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

### Option 2 — Node

```bash
npx serve .
```

Or:

```bash
npx http-server -p 8000
```

---

### Option 3 — VS Code Live Server

1. Install the **Live Server** extension
2. Right-click `index.html` → **"Open with Live Server"**

---

### Option 4 — Standalone HTML (simplest of all)

Download `Orchestra-MAS-Standalone.html` directly from this repo and open it in any browser — no server needed. Everything is bundled into a single self-contained file.

> See also: [Legacy Codebase Modernizer](https://github.com/VikramAdityaTheKing/Legacy-Codebase-Modernizer) for a similar standalone approach.

---

## Deploy to GitHub Pages

1. Push the folder to a **public** GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from `main` branch, root (`/`)**
4. Your live link becomes:

```
https://<your-username>.github.io/<repo-name>/
```

---

## Scenarios

The system ships with four pre-loaded disruption scenarios you can run from the UI:

- 🚢 **Port Delay** — Long Beach (USLGB), ETA +72h
- 🌀 **Hurricane** — Gulf Coast carrier disruption
- 📈 **Demand Surge** — SKU-level inventory spike
- ✊ **Labor Strike** — Regional DC shutdown

---

## Security & Compliance

- Prompt injection scanning (blocks score > 0.3)
- PII redaction across 7 data classes
- Price band enforcement (±5% hard limit)
- Human-in-the-loop trigger at $250k spend
- Approved vendor allowlist + tool-scope RBAC
- Aligned to: SOC 2 Type II · GDPR Art. 22 · CCPA/CPRA · NIST AI RMF 1.0 · OWASP LLM Top 10

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Babel (CDN) · Custom orchestration layer |
| LLM Provider | Google Cloud Vertex AI (Gemini 1.5 Pro / Flash, Gemini 2.0 Flash) |
| Routing Solver | Google OR-Tools (deterministic VRP) |
| Security | Cryptographic decision signing · Append-only audit log |

---

## Author

**[Sakeet Kopparapu]** 
