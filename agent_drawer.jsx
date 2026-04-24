// ================ AGENT DRAWER ================
function AgentDrawer({ agent, onClose, onModelChange, onPromptEdit }) {
  if (!agent) return null;
  const style = { '--accent': agent.accent, '--accent-bg': agent.accentBg, '--accent-border': agent.accentBorder };
  const [edit, setEdit] = useState(false);
  const [promptDraft, setPromptDraft] = useState(agent.systemPrompt);
  useEffect(()=>{ setPromptDraft(agent.systemPrompt); setEdit(false); }, [agent.id]);

  return (
    <React.Fragment>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className="drawer" style={style}>
        <div className="head">
          <div className="agent-icon">{agent.initial}</div>
          <div style={{flex: 1}}>
            <h2>{agent.emoji} {agent.name}</h2>
            <span className="role">{agent.code} · {agent.role}</span>
          </div>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="kpis">
          <div className="kpi"><div className="label">Status</div><div className="value small" style={{color: agent.accent}}>{agent.statusLabel.toUpperCase()}</div></div>
          <div className="kpi"><div className="label">Calls 24h</div><div className="value">{agent.calls24h.toLocaleString()}</div></div>
          <div className="kpi"><div className="label">Latency p95</div><div className="value">{agent.compute.latency}<span className="unit">ms</span></div></div>
          <div className="kpi"><div className="label">Tokens/hr</div><div className="value">{(agent.compute.tokens/1000).toFixed(1)}<span className="unit">k</span></div></div>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <div className="explain"><span className="lbl">What this agent does</span><br/>{agent.laymen}</div>
          </div>
          <div className="drawer-section">
            <h3>GCP Model (editable) <span className="num">vertex ai</span></h3>
            <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
              <div className="model-select" style={{padding:'6px 10px'}}>
                <select value={agent.model} onChange={e=>onModelChange(agent.id, e.target.value)} style={{fontSize: 11}}>
                  {window.GCP_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              {(() => {
                const m = window.GCP_MODELS.find(x => x.id === agent.model);
                if (!m) return null;
                return <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--fg-2)'}}>ctx {m.ctx} · {m.cost} · {m.use}</span>;
              })()}
            </div>
          </div>
          <div className="drawer-section">
            <h3>Chain of thought <span className="num">{agent.cot.length} steps</span></h3>
            <div className="cot">
              {agent.cot.map((s, i) => (
                <div key={i} className="cot-step">
                  <div className="n">{String(i+1).padStart(2,'0')}</div>
                  <div className={`tag ${s.t}`}>{s.t === 'obs' ? 'OBSERVE' : s.t === 'thk' ? 'REASON' : s.t === 'act' ? 'ACT' : 'EMIT'}</div>
                  <div className="content">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="drawer-section">
            <h3>System prompt <span className="num" style={{cursor:'pointer'}} onClick={()=>setEdit(!edit)}>{edit ? 'cancel' : '✎ edit'}</span></h3>
            {edit ? (
              <div>
                <textarea className="edit" value={promptDraft} onChange={e=>setPromptDraft(e.target.value)} style={{minHeight: 160}} />
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button className="topbtn primary" onClick={()=>{ onPromptEdit(agent.id, promptDraft); setEdit(false); }}>Save</button>
                  <button className="topbtn" onClick={()=>{ setPromptDraft(agent.systemPrompt); setEdit(false); }}>Discard</button>
                </div>
              </div>
            ) : (
              <div className="prompt-block">{renderPrompt(agent.systemPrompt)}</div>
            )}
          </div>
          <div className="drawer-section">
            <h3>Tool manifest <span className="num">scoped</span></h3>
            <ToolManifest agent={agent} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function renderPrompt(text) {
  return text.split('\n').map((line, i) => {
    const m = line.match(/^(ROLE|SCOPE|TOOLS|OUTPUT|CONSTRAINTS|HARD LIMITS|TONE|CHECKS|ON REJECT|NEVER):/);
    if (m) return <div key={i}><span className="kw">{m[0]}</span>{line.slice(m[0].length)}</div>;
    if (line.trim().startsWith('-')) return <div key={i}><span className="com">{line}</span></div>;
    return <div key={i}>{line || '\u00a0'}</div>;
  });
}

function ToolManifest({ agent }) {
  const m = {
    A: [['ais_feed','read','vessel positions'], ['carrier_eta_api','read','ETAs'], ['weather_api','read','forecasts'], ['news_rss','read','filtered feeds']],
    B: [['supplier_catalog','read','12.4k SKUs'], ['quote_engine','read','live quotes'], ['negotiate','write*','RFQ state'], ['po_draft','write*','draft only']],
    C: [['ortools_vrp','compute','VRP solver'], ['carrier_rates','read','live rates'], ['dc_calendar','read','receiving windows'], ['tms_simulate','compute','shadow-run']],
    D: [['policy_engine','compute','rules-based gate'], ['llm_judge','compute','second-pass LLM'], ['audit_log','append-only','WORM'], ['erp_signer','sign','signs or rejects']],
  };
  const list = m[agent.id] || [];
  return (
    <div style={{fontFamily:'var(--mono)', fontSize: 10.5}}>
      <div style={{display:'grid', gridTemplateColumns:'1.1fr 0.8fr 1.6fr', gap:10, padding:'6px 10px', color:'var(--fg-3)', fontSize: 9.5, textTransform:'uppercase', letterSpacing:'.08em', borderBottom:'1px solid var(--line)'}}>
        <span>tool</span><span>access</span><span>purpose</span>
      </div>
      {list.map(([tool, access, desc], i) => (
        <div key={i} style={{display:'grid', gridTemplateColumns:'1.1fr 0.8fr 1.6fr', gap:10, padding:'8px 10px', borderBottom: i===list.length-1?0:'1px dashed var(--line)'}}>
          <span style={{color:'var(--fg-0)'}}>{tool}</span>
          <span style={{color: access.startsWith('write') ? 'var(--warn)' : access === 'sign' ? 'var(--violet)' : 'var(--ok)'}}>{access}</span>
          <span style={{color:'var(--fg-2)'}}>{desc}</span>
        </div>
      ))}
    </div>
  );
}
window.AgentDrawer = AgentDrawer;
