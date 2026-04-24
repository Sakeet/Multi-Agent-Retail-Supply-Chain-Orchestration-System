// ================ SCENARIO-SPECIFIC AGENT OVERRIDES ================
// Each scenario rewrites each agent's currentTask, lastDecision, status, cot steps.

const SCENARIO_AGENTS = {
  port: {
    A: { status:'crit', statusLabel:'Alert',
         currentTask:'Correlating ETA slippage across 14 carriers at Long Beach',
         lastDecision:'Raised PORT_DELAY signal for Long Beach (USLGB)' },
    B: { status:'warn', statusLabel:'Negotiating',
         currentTask:'Rebalancing 3,200-unit reorder across 4 suppliers',
         lastDecision:'Proposed Supplier X (Ensenada) @ $14.20 · 1,800u' },
    C: { status:'ok', statusLabel:'Running',
         currentTask:'Solving VRP for 1,800u ENS → DFW via land bridge',
         lastDecision:'Split: 60% rail · 40% expedited truck · p95 92h' },
    D: { status:'ok', statusLabel:'Guarding',
         currentTask:'Gating 2 proposals · policy + PII scan',
         lastDecision:'Approved · signed guardrail-key-v3' },
  },
  weather: {
    A: { status:'crit', statusLabel:'Alert',
         currentTask:'Tracking Hurricane Alma (Cat 3) · cone of uncertainty around Savannah',
         lastDecision:'Raised WEATHER_SEVERE signal for KSAV · 48h to landfall' },
    B: { status:'warn', statusLabel:'Sourcing',
         currentTask:'Securing reefer-capable backup carriers for cold-chain overflow',
         lastDecision:'Booked Maersk Cold + Lineage reefer lanes (+600u capacity)' },
    C: { status:'ok', statusLabel:'Rerouting',
         currentTask:'Diverting 1,400u cold-chain KSAV → Charlotte DC (KCLT)',
         lastDecision:'Reroute KSAV→KCLT · distance +186mi · reefer_hrs +4.2' },
    D: { status:'ok', statusLabel:'Guarding',
         currentTask:'Verifying cold-chain SLA + insurance bond on new route',
         lastDecision:'Approved · cold-chain window preserved (4.2h margin)' },
  },
  promo: {
    A: { status:'crit', statusLabel:'Alert',
         currentTask:'Monitoring TikTok + POS velocity for SKU-7741 sell-through',
         lastDecision:'Raised DEMAND_SURGE signal · 4.1x baseline, west-coast stores' },
    B: { status:'warn', statusLabel:'Negotiating',
         currentTask:'Activating 3 secondary suppliers for emergency allocation',
         lastDecision:'Supplier K secured 6,200u in 72h @ $9.85 (+3.7% band)' },
    C: { status:'ok', statusLabel:'Routing',
         currentTask:'Opening air lanes LAX↔OAK + pull-forward from Dallas DC',
         lastDecision:'2 air lanes booked · 1,800u pulled from Dallas T+2 cover' },
    D: { status:'ok', statusLabel:'Guarding',
         currentTask:'Enforcing surge-pricing cap + margin floor on plan',
         lastDecision:'Approved · margin preserved at 38.2%' },
  },
  strike: {
    A: { status:'crit', statusLabel:'Alert',
         currentTask:'Tracking ILWU strike vote + port-slot availability at Tacoma',
         lastDecision:'Raised LABOR_ACTION signal · 72h strike in 7d, conf 0.78' },
    B: { status:'warn', statusLabel:'Renegotiating',
         currentTask:'Renegotiating 3 carrier contracts before strike-premium window',
         lastDecision:'Locked YVR + OAK + air-lift carriers · total $248.4k' },
    C: { status:'ok', statusLabel:'Shifting',
         currentTask:'Shifting 11,000u across Vancouver BC / Oakland / LAX air-lift',
         lastDecision:'Split: 55% YVR · 35% OAK · 10% air-lift LAX' },
    D: { status:'ok', statusLabel:'Guarding',
         currentTask:'Budget attestation + new-carrier allowlist checks',
         lastDecision:'Approved at $248.4k · 0.6% margin under HIL ceiling' },
  },
  custom: {
    A: { status:'warn', statusLabel:'Classifying',
         currentTask:'Classifying custom input · extracting entities and disruption type',
         lastDecision:'Materialized CUSTOM_USER signal · conf 0.72' },
    B: { status:'ok', statusLabel:'Drafting',
         currentTask:'Drafting 2 backup supplier quotes within ±5% band',
         lastDecision:'2 candidate POs drafted · band ✓' },
    C: { status:'ok', statusLabel:'Routing',
         currentTask:'Single-lane truck route · novelty-aware conservative plan',
         lastDecision:'Truck route chosen · p95 ETA 78h · risk 0.22' },
    D: { status:'warn', statusLabel:'HIL Gate',
         currentTask:'Novelty 0.34 → extra human review before ERP write',
         lastDecision:'Pending HIL · novelty_gate engaged' },
  },
};

// Scenario-specific chain-of-thought (drawer content) per agent.
const SCENARIO_COT = {
  port: {
    A: [
      { t:'obs', text:'Poll AIS + carrier API → 9 of 12 scheduled calls at Long Beach slipped >24h in a 6h window.' },
      { t:'thk', text:'Delta exceeds baseline (σ=2.3h). Cross-ref NOAA: fog + labor advisory overlap. Likelihood 0.81.' },
      { t:'act', text:'Materialize signal {type: PORT_DELAY, node: USLGB, impact_h: 72, conf: 0.81}.' },
      { t:'out', text:'Notify Orchestrator. No action proposal — outside this role.' },
    ],
    B: [
      { t:'obs', text:'Received Signal{PORT_DELAY, USLGB}. Exposure: 3,214u on 2 vessels.' },
      { t:'thk', text:'Candidates: (a) hold+air (+22%), (b) Supplier X Ensenada land-bridge, (c) pull-forward Supplier K.' },
      { t:'act', text:'negotiate(X, 1800, target=13.80) → settle 14.20 within +3.5% band.' },
      { t:'out', text:'Emit Proposal{X, 1800, 14.20, MX-LAND}.' },
    ],
    C: [
      { t:'obs', text:'Proposal lands at ENS. Target DC = DFW. Horizon 96h.' },
      { t:'thk', text:'VRP solver evaluates 4 mixes; 60/40 rail+truck wins on cost·SLA trade.' },
      { t:'act', text:'Commit plan {rail:1080u, truck:720u, p95:92h, $0.71/u}.' },
      { t:'out', text:'Forward to Guardrail with signed route envelope.' },
    ],
    D: [
      { t:'obs', text:'2 proposals in queue: sourcing + logistics.' },
      { t:'thk', text:'Run 6 policy checks in parallel. 1 PII hit (email) → tokenize.' },
      { t:'act', text:'All clear. Sign with guardrail-key-v3; append WORM log.' },
      { t:'out', text:'Release approved envelope to ERP adapter.' },
    ],
  },
  weather: {
    A: [
      { t:'obs', text:'NOAA + 3 marine-advisory feeds: Cat 3 landfall forecast near KSAV in 48h.' },
      { t:'thk', text:'1,400 cold-chain units already inbound. Reefer_hrs budget 8.2, window tight.' },
      { t:'act', text:'Materialize signal {type: WEATHER_SEVERE, node: KSAV, impact_h: 120, conf: 0.93}.' },
      { t:'out', text:'Priority-0 escalation. Notify Orchestrator immediately.' },
    ],
    B: [
      { t:'obs', text:'Logistics pulled new DC = KCLT. Secondary reefer capacity needed.' },
      { t:'thk', text:'Primary carrier may not absorb overflow; price_band stable on reefer spot.' },
      { t:'act', text:'Book Maersk Cold + Lineage reefer windows (600u extra).' },
      { t:'out', text:'Emit carrier-secure proposal to Guardrail.' },
    ],
    C: [
      { t:'obs', text:'Candidates within cold-chain window: KCLT, KBNA, KJAX, KMEM.' },
      { t:'thk', text:'KJAX still inside cone of uncertainty — drop. KCLT has reefer 2,100u free.' },
      { t:'act', text:'Reroute 1,400u KSAV→KCLT. Distance +186mi, reefer_hrs +4.2.' },
      { t:'out', text:'Signed reroute envelope forwarded to Guardrail.' },
    ],
    D: [
      { t:'obs', text:'Reroute + 2 carrier adds queued.' },
      { t:'thk', text:'Special checks: temp_band, carrier_bonded, insurance coverage.' },
      { t:'act', text:'All 5 checks pass. Cold-chain margin = 4.2h.' },
      { t:'out', text:'Approve. Stamp WORM log with insurance-policy reference.' },
    ],
  },
  promo: {
    A: [
      { t:'obs', text:'SKU-7741 POS velocity west-coast stores = 4.1x 7-day baseline.' },
      { t:'thk', text:'Cross-ref social (TikTok creator reach, 12M views). Not bot inflation.' },
      { t:'act', text:'Materialize signal {type: DEMAND_SURGE, sku: SKU-7741, region: USW, mult: 4.1x}.' },
      { t:'out', text:'Emit to Orchestrator. Fulfillment risk critical.' },
    ],
    B: [
      { t:'obs', text:'Primary supplier lead-time 14d; coverage 6d. Gap 8d.' },
      { t:'thk', text:'Candidates: Supplier K (72h, +3.7%), Supplier Q (new, 96h). Margin floor 35%.' },
      { t:'act', text:'Secure K: 6,200u @ $9.85. Request HIL for Q (new vendor).' },
      { t:'out', text:'Emit proposal + HIL request to Guardrail.' },
    ],
    C: [
      { t:'obs', text:'West-coast store cluster needs T+2 cover.' },
      { t:'thk', text:'Pull 1,800u from Dallas DC (safe stock) + air LAX↔OAK to bridge.' },
      { t:'act', text:'Book 2 air lanes; stage cross-dock. Margin check ok.' },
      { t:'out', text:'Forward integrated plan to Guardrail.' },
    ],
    D: [
      { t:'obs', text:'Joint sourcing+logistics plan, 1 new-vendor HIL attached.' },
      { t:'thk', text:'Run surge-pricing-cap + margin-floor + consumer-protection check.' },
      { t:'act', text:'Blocked +8% surge-price draft; approved $9.85 plan. Margin 38.2%.' },
      { t:'out', text:'Approved portion released; HIL portion queued.' },
    ],
  },
  strike: {
    A: [
      { t:'obs', text:'ILWU authorization vote passed 84% in favor. 72h strike probable.' },
      { t:'thk', text:'11,000u inbound Tacoma window over next 7-10d. Capacity shift needed.' },
      { t:'act', text:'Materialize signal {type: LABOR_ACTION, node: USTIW, impact_h: 72, conf: 0.78}.' },
      { t:'out', text:'Escalate to Orchestrator. Fan-out all specialists.' },
    ],
    B: [
      { t:'obs', text:'Pre-strike carrier premium window opens; 3 contracts due to expire.' },
      { t:'thk', text:'Lock rates now; carrier Z cheaper but not allowlisted → HIL.' },
      { t:'act', text:'Renegotiate 3 contracts. Total spend $248.4k (0.6% under ceiling).' },
      { t:'out', text:'Emit contract set + 1 HIL request to Guardrail.' },
    ],
    C: [
      { t:'obs', text:'Alt ports: YVR (capacity 6,500u), OAK (capacity 4,000u), LAX air-lift.' },
      { t:'thk', text:'Split 55/35/10 minimizes cost while meeting p95 104h SLA.' },
      { t:'act', text:'Execute shift: 6,050u YVR · 3,850u OAK · 1,100u air LAX.' },
      { t:'out', text:'Signed route envelope → Guardrail.' },
    ],
    D: [
      { t:'obs', text:'3 amended POs + 3 carrier contracts, 1 new-carrier HIL.' },
      { t:'thk', text:'Stress-test budget attestation. 0.6% margin is thin but legal.' },
      { t:'act', text:'Stamp attestation; sign approved portion; HIL for carrier Z.' },
      { t:'out', text:'Release approved portion. Audit log appended.' },
    ],
  },
  custom: [], // falls back to built-in agent cot
};

// Shallow merge helper applied by app.
window.SCENARIO_AGENTS = SCENARIO_AGENTS;
window.SCENARIO_COT = SCENARIO_COT;
