// ================ GEMINI CLIENT ================
// Calls Google Generative Language API directly from the browser using the
// session API key. No server, no proxy. Key lives only in sessionStorage and
// is wiped on tab close / logout.

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_TEMP = 0.5;
const GEMINI_MAX_TOKENS = 512;

function getKey() {
  return sessionStorage.getItem('orc.gapi') || '';
}
function setKey(k) {
  if (!k) sessionStorage.removeItem('orc.gapi');
  else sessionStorage.setItem('orc.gapi', k);
}

async function geminiCall({ model, systemPrompt, userPrompt, maxTokens, temperature, json }) {
  const key = getKey();
  if (!key) throw new Error('NO_KEY');
  const body = {
    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: temperature ?? GEMINI_TEMP,
      maxOutputTokens: maxTokens ?? GEMINI_MAX_TOKENS,
      topP: 0.9,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };
  const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    let msg = `HTTP ${res.status}`;
    try { const j = JSON.parse(t); if (j.error && j.error.message) msg = j.error.message; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  const cand = data.candidates && data.candidates[0];
  if (!cand) throw new Error('Empty response from model');
  const parts = (cand.content && cand.content.parts) || [];
  return parts.map(p => p.text || '').join('');
}

// Parse JSON leniently (strips markdown fences)
function parseLooseJson(text) {
  if (!text) return null;
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  const m = t.match(/\{[\s\S]*\}/);
  if (m) t = m[0];
  try { return JSON.parse(t); } catch { return null; }
}

// ================ CLASSIFIER ================
async function classifyScenario(text, model) {
  const sys = `You are a supply-chain incident classifier. Given a user-submitted scenario, classify it into ONE of: port, hurricane, surge, strike, or custom.
Rules:
- port = port congestion, berth delay, container backlog, dock closure, vessel stuck
- hurricane = hurricane, cyclone, typhoon, tropical storm, severe weather, flood risk to shipping
- surge = demand spike, viral trend, stockout risk from unexpected demand, marketing-driven spike
- strike = labor action, walkout, union dispute, longshoremen strike, trucker strike, picket
- custom = anything else (supplier bankruptcy, cyberattack, recall, tariff, etc.)
Return STRICT JSON: {"category":"port|hurricane|surge|strike|custom","confidence":0-1,"entities":{"location":"string|null","sku":"string|null","magnitude":"string|null"},"summary":"one sentence"}`;
  const out = await geminiCall({
    model: model || 'gemini-2.5-flash-lite',
    systemPrompt: sys,
    userPrompt: text,
    maxTokens: 256,
    temperature: 0.1,
    json: true,
  });
  const parsed = parseLooseJson(out);
  if (!parsed || !parsed.category) return { category: 'custom', confidence: 0.5, entities: {}, summary: text.slice(0, 140) };
  return parsed;
}

// ================ AGENT PROMPTS ================
const AGENT_PROMPTS = {
  A: `You are the Signal Watcher — a retail supply-chain telemetry agent.
Analyze the incident and return STRICT JSON:
{"signal":"SHORT_CODE_LIKE_PORT_DELAY","severity":"low|med|high|crit","confidence":0-1,"affected":{"lanes":[],"skus_est":number,"dc":""},"observations":["bullet",...],"recommended_next":"wake sourcing|wake logistics|wake both|monitor"}
Keep observations concrete and numeric where possible. 3-5 bullets max.`,

  B: `You are the Sourcing Strategist — retail procurement & negotiation.
Given the incident, propose a sourcing response. Return STRICT JSON:
{"supplier":{"name":"","tier":"primary|backup|new","location":""},"unit_price":number,"contract_band":{"lo":number,"hi":number},"within_band":boolean,"qty":number,"total_spend":number,"lead_time_days":number,"rationale":"1-2 sentences","risks":["..."]}
Prices in USD. Be realistic for retail (electronics ~$80-400/u, apparel ~$8-40/u, groceries ~$1-8/u).`,

  C: `You are the Logistics Optimizer — routing, carrier mix, and DC windows.
Given the incident, propose a routing plan. Return STRICT JSON:
{"origin":"","destination":"","mode_split":{"rail":pct,"truck":pct,"air":pct,"ocean":pct},"total_time_hours":number,"sla_hours":number,"within_sla":boolean,"carriers":["..."],"cost_delta_pct":number,"rationale":"1-2 sentences"}
Percentages sum to 100. Mention realistic US/global lanes.`,

  D: `You are the Governance Guardrail — policy gate for retail supply-chain decisions.
Given Sourcing + Logistics proposals as JSON, evaluate against policies:
- price within contract band ±5%
- total_spend under $250k auto-approve threshold
- known vendor (tier != "new")
- no PII in free-text fields
- SLA promise is met
Return STRICT JSON: {"verdict":"approved|pending_hil|blocked","checks":[{"policy":"","pass":bool,"detail":""}],"blockers":["..."],"redactions":["..."],"rationale":"1 sentence","escalate_to":"none|human_ops|legal"}`,
};

// ================ FALLBACK CANNED RESPONSES ================
// When no API key is present, synthesize plausible outputs from the preloaded
// scenario flow so the demo still works offline.
function cannedAgentOutput(agentId, scenario, userText) {
  const cat = (scenario && scenario.id) || 'custom';
  const F = window.SCENARIO_FLOWS && window.SCENARIO_FLOWS[cat];
  const baseMap = {
    A: () => ({ signal: cat.toUpperCase() + '_DETECTED', severity: 'high', confidence: 0.88, affected: { lanes: ['LANE-A'], skus_est: 1800, dc: 'DC-41' }, observations: ['Preloaded fallback — add API key for real analysis'], recommended_next: 'wake both' }),
    B: () => ({ supplier: { name: 'Supplier-X', tier: 'backup', location: 'TBD' }, unit_price: 14.2, contract_band: { lo: 12.8, hi: 15.6 }, within_band: true, qty: 1800, total_spend: 25560, lead_time_days: 4, rationale: 'Fallback response (no API key).', risks: ['Lead time risk'] }),
    C: () => ({ origin: 'TBD', destination: 'DC-41', mode_split: { rail: 60, truck: 40, air: 0, ocean: 0 }, total_time_hours: 92, sla_hours: 96, within_sla: true, carriers: ['BNSF', 'XPO'], cost_delta_pct: 2.3, rationale: 'Fallback response (no API key).' }),
    D: () => ({ verdict: 'approved', checks: [{ policy: 'price_band', pass: true, detail: '' }, { policy: 'budget', pass: true, detail: '' }, { policy: 'vendor_known', pass: true, detail: '' }, { policy: 'pii', pass: true, detail: '' }, { policy: 'sla', pass: true, detail: '' }], blockers: [], redactions: [], rationale: 'Fallback — guardrail auto-passes in offline mode.', escalate_to: 'none' }),
  };
  return baseMap[agentId]();
}

window.Gemini = {
  getKey, setKey, geminiCall, classifyScenario, parseLooseJson,
  AGENT_PROMPTS, cannedAgentOutput,
};
