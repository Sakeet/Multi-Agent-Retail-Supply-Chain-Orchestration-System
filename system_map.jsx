// ================ SYSTEM ARCHITECTURE ================
function SystemMap({ onSelectNode }) {
  const nodes = {
    ext1: { x: 30, y: 50, w: 170, h: 58, kind: 'ext', label: 'DATA SOURCE', name: 'AIS Vessel Feed', sub: 'port calls · positions', category: 'external', emoji: '🛰️' },
    ext2: { x: 30, y: 130, w: 170, h: 58, kind: 'ext', label: 'DATA SOURCE', name: 'Carrier APIs', sub: 'ETA · EDI', category: 'external', emoji: '📦' },
    ext3: { x: 30, y: 210, w: 170, h: 58, kind: 'ext', label: 'DATA SOURCE', name: 'NOAA + News', sub: 'weather · advisories', category: 'external', emoji: '🌦️' },
    ext4: { x: 30, y: 290, w: 170, h: 58, kind: 'ext', label: 'DATA SOURCE', name: 'Supplier Catalog', sub: 'Ariba · 12.4k SKUs', category: 'external', emoji: '📚' },
    ext5: { x: 30, y: 370, w: 170, h: 58, kind: 'ext', label: 'CONTRACT DB', name: 'Contract Registry', sub: 'price bands', category: 'external', emoji: '📄' },

    pubsub: { x: 260, y: 175, w: 160, h: 170, kind: 'pubsub', label: 'GCP MESSAGE BUS', name: 'Pub/Sub', sub: 'at-least-once · CMEK', category: 'bus', emoji: '📬' },

    orch: { x: 480, y: 185, w: 200, h: 120, kind: 'orch', label: 'ORCHESTRATOR', name: 'Coordinator Agent', sub: 'Vertex AI · frontier LLM', category: 'orchestrator', emoji: '🎼' },

    ag1: { x: 760, y: 50, w: 190, h: 68, kind: 'sub', accent: '#4aa8ff', label: 'AGENT A', name: 'Signal Watcher', sub: 'SW-01 · observation', category: 'agent', agentId: 'A', emoji: '📡' },
    ag2: { x: 760, y: 135, w: 190, h: 68, kind: 'sub', accent: '#a78bfa', label: 'AGENT B', name: 'Sourcing Strategist', sub: 'SS-02 · negotiation', category: 'agent', agentId: 'B', emoji: '🤝' },
    ag3: { x: 760, y: 220, w: 190, h: 68, kind: 'sub', accent: '#34d39c', label: 'AGENT C', name: 'Logistics Optimizer', sub: 'LO-03 · routing', category: 'agent', agentId: 'C', emoji: '🚚' },

    guardrail: { x: 760, y: 400, w: 190, h: 80, kind: 'guardrail', accent: '#f5b44a', label: 'AGENT D', name: 'Governance Guardrail', sub: 'GG-04 · policy gate', category: 'guardrail', agentId: 'D', emoji: '🛡️' },
    erp: { x: 1020, y: 410, w: 180, h: 62, kind: 'erp', label: 'SYSTEM OF RECORD', name: 'ERP (SAP S/4)', sub: 'signed writes only', category: 'erp', emoji: '🏢' },

    audit: { x: 1020, y: 50, w: 180, h: 58, kind: 'ext', label: 'AUDIT', name: 'WORM Log Sink', sub: 'tamper-evident · 7y', category: 'audit', emoji: '📜' },
    hil:   { x: 1020, y: 135, w: 180, h: 58, kind: 'ext', label: 'HUMAN-IN-LOOP', name: 'Ops Console', sub: '> $250k · new vendors', category: 'hil', emoji: '👤' },
    vault: { x: 1020, y: 220, w: 180, h: 58, kind: 'ext', label: 'SECRETS', name: 'Key Vault + Tokens', sub: 'HSM · KEKs rotated', category: 'vault', emoji: '🔐' },
  };

  const [active, setActive] = useState('loop');
  const [selected, setSelected] = useState(null);

  const flows = {
    loop:  { label: 'Disruption loop (port delay → approved PO)',
             active: ['e1','e2','e3','e6','e7','e8','e9','e10','e11','e12','e13'],
             explain: 'Data flows left-to-right. A port delay alert enters via Pub/Sub, the orchestrator wakes three specialists in parallel, their proposals converge on the Guardrail, and an approved PO lands in the ERP.' },
    audit: { label: 'Audit path (every decision → WORM log)',
             active: ['e13','e14','e15'],
             explain: 'Every decision the Guardrail makes gets written to an append-only (WORM) log and secrets are rotated via the vault. This is the evidence trail used during compliance audits.' },
    block: { label: 'Blocked path (policy violation → HIL)',
             active: ['e16'],
             explain: 'When a proposal violates policy (price outside band, unknown vendor, PII leak), the Guardrail rejects it and routes to a human-in-the-loop for review.' },
    sourcing: { label: 'Sourcing only (catalog → Agent B → Guardrail)',
                active: ['e4','e6','e8','e11','e13'],
                explain: 'When only pricing or supplier changes are in play, only the Sourcing Strategist wakes. This shows the minimum-path version of the same architecture.' },
    signals: { label: 'Signals only (telemetry → Agent A)',
               active: ['e1','e2','e3','e6','e7'],
               explain: 'The observation-only path. Signal Watcher is always listening; other agents only activate when a signal crosses confidence thresholds.' },
  };

  const flow = flows[active];

  return (
    <div className="mapwrap" data-screen-label="System Architecture">
      <div className="mapstage">
        <div className="map-canvas" style={{height: 540}}>
          <Perimeter />
          <EdgeLayer nodes={nodes} activeEdges={flow.active} />
          {Object.entries(nodes).map(([k, n]) => (
            <MapNode key={k} n={n}
              selected={selected === k}
              onClick={() => { setSelected(k); onSelectNode(n); }}
            />
          ))}
        </div>
      </div>
      <div className="map-legend" style={{overflow:'auto'}}>
        <h3>System Architecture</h3>
        <div className="explain">
          <span className="lbl">In plain English</span><br/>
          External data (weather, shipping, supplier catalogs) enters through Google Cloud Pub/Sub. The orchestrator decides which specialists to wake. Their outputs <b>must</b> pass through the Governance Guardrail before any ERP write.
        </div>

        <div style={{marginBottom: 14}}>
          <div style={{fontFamily:'var(--mono)', fontSize: 9.5, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom: 6}}>Highlight flow</div>
          <div style={{display:'flex', flexDirection:'column', gap: 6}}>
            {Object.entries(flows).map(([k, v]) => (
              <button key={k} onClick={() => setActive(k)}
                style={{
                  textAlign:'left', cursor:'pointer', font:'inherit',
                  background: active===k ? 'var(--panel-2)' : 'var(--panel)',
                  border: `1px solid ${active===k ? 'var(--brand)' : 'var(--line)'}`,
                  color: active===k ? 'var(--fg-0)' : 'var(--fg-1)',
                  padding: '7px 10px', borderRadius: 6, fontSize: 11,
                }}>
                <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background: active===k?'var(--brand-2)':'var(--fg-3)', marginRight:8}}></span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{fontSize: 11, color:'var(--fg-2)', lineHeight: 1.55, padding: '10px 0', borderTop:'1px dashed var(--line)'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:9.5, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--fg-3)', marginBottom: 6}}>About this flow</div>
          {flow.explain}
        </div>

        <div style={{fontSize: 11, color:'var(--fg-2)', lineHeight: 1.55, padding: '10px 0', borderTop:'1px dashed var(--line)'}}>
          <div style={{fontFamily:'var(--mono)', fontSize:9.5, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--fg-3)', marginBottom: 6}}>Tip</div>
          Click any node in the diagram to open its config panel — see the agent's model, edit its role, view runtime metrics.
        </div>
      </div>
    </div>
  );
}

function MapNode({ n, selected, onClick }) {
  const style = { left: n.x, top: n.y, width: n.w, height: n.h, ...(n.accent ? {'--accent': n.accent} : {}) };
  const cls = ['node', n.kind, selected ? 'selected' : ''].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style} onClick={onClick}>
      {n.kind === 'sub' && <div className="accent-bar"></div>}
      <div className="label">{n.label}</div>
      <div className="name">{n.emoji} {n.name}</div>
      <div className="sub">{n.sub}</div>
      {n.kind === 'pubsub' && (
        <div style={{marginTop: 8, fontFamily:'var(--mono)', fontSize: 9.5, color:'var(--fg-3)', lineHeight: 1.6}}>
          <div>supply.signals</div>
          <div>supply.proposals</div>
          <div>supply.decisions</div>
        </div>
      )}
      {n.kind === 'orch' && (
        <div style={{marginTop: 8, fontFamily:'var(--mono)', fontSize: 9.5, color:'var(--fg-3)'}}>
          plan → decompose → route<br/>max-steps 8 · timeout 30s
          <div style={{display:'flex', gap: 4, marginTop: 5}}>
            <span style={{padding:'1px 5px', background:'rgba(58,123,255,0.15)', color:'var(--brand-2)', borderRadius:3}}>reAct</span>
            <span style={{padding:'1px 5px', background:'rgba(167,139,250,0.12)', color:'var(--violet)', borderRadius:3}}>critic</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Perimeter() {
  return (
    <div className="perimeter" style={{left: 740, top: 380, width: 480, height: 160}}>
      <div className="perim-label">🔒 Security Perimeter · All ERP Writes</div>
    </div>
  );
}

function EdgeLayer({ nodes, activeEdges }) {
  const cy = (n, frac=0.5) => n.y + n.h * frac;
  const curve = (x1, y1, x2, y2) => { const mx = (x1+x2)/2; return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`; };

  const edges = [
    { id: 'e1', from: [nodes.ext1.x + nodes.ext1.w, cy(nodes.ext1)], to: [nodes.pubsub.x, cy(nodes.pubsub, 0.15)] },
    { id: 'e2', from: [nodes.ext2.x + nodes.ext2.w, cy(nodes.ext2)], to: [nodes.pubsub.x, cy(nodes.pubsub, 0.3)] },
    { id: 'e3', from: [nodes.ext3.x + nodes.ext3.w, cy(nodes.ext3)], to: [nodes.pubsub.x, cy(nodes.pubsub, 0.45)] },
    { id: 'e4', from: [nodes.ext4.x + nodes.ext4.w, cy(nodes.ext4)], to: [nodes.pubsub.x, cy(nodes.pubsub, 0.65)] },
    { id: 'e5', from: [nodes.ext5.x + nodes.ext5.w, cy(nodes.ext5)], to: [nodes.pubsub.x, cy(nodes.pubsub, 0.85)] },
    { id: 'e6', from: [nodes.pubsub.x + nodes.pubsub.w, cy(nodes.pubsub)], to: [nodes.orch.x, cy(nodes.orch)], label: 'signals' },
    { id: 'e7', from: [nodes.orch.x + nodes.orch.w, cy(nodes.orch, 0.3)], to: [nodes.ag1.x, cy(nodes.ag1)] },
    { id: 'e8', from: [nodes.orch.x + nodes.orch.w, cy(nodes.orch, 0.55)], to: [nodes.ag2.x, cy(nodes.ag2)] },
    { id: 'e9', from: [nodes.orch.x + nodes.orch.w, cy(nodes.orch, 0.8)], to: [nodes.ag3.x, cy(nodes.ag3)] },
    { id: 'e10', from: [nodes.ag1.x + nodes.ag1.w/2, nodes.ag1.y + nodes.ag1.h], to: [nodes.guardrail.x + nodes.guardrail.w/2, nodes.guardrail.y], vertical: true },
    { id: 'e11', from: [nodes.ag2.x + nodes.ag2.w/2, nodes.ag2.y + nodes.ag2.h], to: [nodes.guardrail.x + nodes.guardrail.w/2 - 10, nodes.guardrail.y], vertical: true },
    { id: 'e12', from: [nodes.ag3.x + nodes.ag3.w/2, nodes.ag3.y + nodes.ag3.h], to: [nodes.guardrail.x + nodes.guardrail.w/2 + 10, nodes.guardrail.y], vertical: true },
    { id: 'e13', from: [nodes.guardrail.x + nodes.guardrail.w, cy(nodes.guardrail)], to: [nodes.erp.x, cy(nodes.erp)], label: 'signed writes' },
    { id: 'e14', from: [nodes.guardrail.x + nodes.guardrail.w - 30, nodes.guardrail.y], to: [nodes.audit.x, nodes.audit.y + nodes.audit.h], label: 'append' },
    { id: 'e15', from: [nodes.guardrail.x + nodes.guardrail.w - 10, nodes.guardrail.y], to: [nodes.vault.x, cy(nodes.vault)] },
    { id: 'e16', from: [nodes.guardrail.x + nodes.guardrail.w - 50, nodes.guardrail.y], to: [nodes.hil.x, nodes.hil.y + nodes.hil.h], warn: true, label: 'blocked' },
  ];

  return (
    <svg width="1240" height="560" style={{position:'absolute', top:0, left:0, pointerEvents:'none', overflow:'visible'}}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--line-2)"/></marker>
        <marker id="arrowActive" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--brand-2)"/></marker>
        <marker id="arrowWarn" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--warn)"/></marker>
      </defs>
      {edges.map(e => {
        const isActive = activeEdges.includes(e.id);
        const path = e.vertical
          ? `M ${e.from[0]} ${e.from[1]} L ${e.from[0]} ${(e.from[1]+e.to[1])/2} L ${e.to[0]} ${(e.from[1]+e.to[1])/2} L ${e.to[0]} ${e.to[1]}`
          : curve(e.from[0], e.from[1], e.to[0], e.to[1]);
        const cls = e.warn ? 'wire warn' : isActive ? 'wire active' : 'wire';
        const marker = e.warn ? 'url(#arrowWarn)' : isActive ? 'url(#arrowActive)' : 'url(#arrow)';
        return (
          <g key={e.id}>
            <path d={path} className={cls} markerEnd={marker} />
            {e.label && <text className="wire-label" x={(e.from[0]+e.to[0])/2} y={(e.from[1]+e.to[1])/2 - 6} textAnchor="middle">{e.label}</text>}
            {isActive && !e.vertical && <circle r="3" className="flow-dot"><animateMotion dur="2.8s" repeatCount="indefinite" path={path}/></circle>}
          </g>
        );
      })}
    </svg>
  );
}

function NodeDrawer({ node, onClose, onModelChange, onNameEdit }) {
  if (!node) return null;
  const agent = node.agentId ? window.AGENTS.find(a => a.id === node.agentId) : null;
  const [nameDraft, setNameDraft] = useState(node.name);
  useEffect(() => setNameDraft(node.name), [node]);

  return (
    <React.Fragment>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className="node-drawer">
        <div className="nd-head">
          <div className="emoji">{node.emoji}</div>
          <div style={{flex:1}}>
            <h2>{node.name}</h2>
            <span className="sub">{node.label}</span>
          </div>
          <button onClick={onClose} style={{background:'transparent', border:'1px solid var(--line-2)', color:'var(--fg-1)', width:28, height:28, borderRadius:6, cursor:'pointer', fontSize:14}}>×</button>
        </div>
        <div className="nd-body">
          <div className="explain">
            <span className="lbl">What this does</span><br/>
            {explainNode(node, agent)}
          </div>

          {agent && (
            <>
              <h3>GCP Model</h3>
              <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                <div className="model-select" style={{padding:'6px 10px'}}>
                  <select value={agent.model} onChange={e=>onModelChange(agent.id, e.target.value)} style={{fontSize:11}}>
                    {window.GCP_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                {(() => {
                  const m = window.GCP_MODELS.find(x => x.id === agent.model);
                  return m && <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--fg-2)'}}>ctx {m.ctx} · {m.cost}</span>;
                })()}
              </div>

              <h3>Runtime</h3>
              <div className="plain">
                <div>Status: <b>{agent.statusLabel}</b></div>
                <div>Latency p95: <b>{agent.compute.latency}ms</b></div>
                <div>Calls/24h: <b>{agent.calls24h.toLocaleString()}</b></div>
                <div>Uptime: <b>{agent.uptime}</b></div>
              </div>

              <h3>Current task</h3>
              <p className="plain">{agent.currentTask}</p>
            </>
          )}

          <h3>Display name (editable)</h3>
          <input className="edit" value={nameDraft} onChange={e=>setNameDraft(e.target.value)} onBlur={()=>onNameEdit(node, nameDraft)} />
          <div style={{fontSize:10, color:'var(--fg-3)', marginTop:4, fontFamily:'var(--mono)'}}>Press Tab or click away to save</div>

          {!agent && (
            <>
              <h3>Runtime</h3>
              <p className="plain">This node is not an agent — its config lives in the cloud infrastructure layer (Pub/Sub topics, ERP adapter, vault policy). Edits here update the display label only.</p>
            </>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

function explainNode(node, agent) {
  if (agent) return agent.laymen;
  const map = {
    external: 'An external data source feeding the system. Read-only; outside the trust boundary.',
    bus: 'Google Cloud Pub/Sub — the message bus. All signals and decisions flow through here with at-least-once delivery and encryption at rest (CMEK).',
    orchestrator: 'The coordinator. Receives signals, plans the work, and routes tasks to the right specialist agents. Runs on Vertex AI.',
    erp: 'The enterprise system of record (SAP S/4HANA). Only the Governance Guardrail can write to it, via a cryptographically signed adapter.',
    audit: 'Tamper-evident log store. Every decision is appended here and kept for 7 years. Used during compliance audits.',
    hil: 'Human-in-the-loop approval queue. Anything above $250k, involving new vendors, or blocked by policy waits here for a person.',
    vault: 'Google Cloud HSM-backed key vault. Holds signing keys, KEKs, and tokenized PII. Keys rotate automatically.',
  };
  return map[node.category] || '';
}

window.SystemMap = SystemMap;
window.NodeDrawer = NodeDrawer;
