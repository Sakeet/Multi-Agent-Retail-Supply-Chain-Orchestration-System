// ================ SECURITY TAB ================
function SecurityTab({ policies, togglePolicy }) {
  return (
    <div className="sectab" data-screen-label="Security & Compliance">
      <div className="sec-grid">
        <div className="sec-card">
          <div className="sec-head">
            <span className="t"><Icon name="shield" size={13} /> Active Policies &amp; Guardrails</span>
            <span className="m">8 policies · {policies.filter(p=>p.on).length} enabled</span>
          </div>
          <div className="sec-body" style={{padding: 12}}>
            <div className="explain">
              <span className="lbl">What is a policy?</span><br/>
              A rule the Governance Guardrail enforces before any agent decision reaches the ERP. Toggle any off to see how the system degrades — but all defaults are on in production.
            </div>
            <div className="policies">
              {policies.map(p => (
                <div key={p.id} className="policy">
                  <label className="toggle" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={p.on} onChange={() => togglePolicy(p.id)} />
                    <span className="slider"></span>
                  </label>
                  <div className="policy-meta">
                    <div className="n">{p.name}</div>
                    <div className="d">{p.desc}</div>
                    <div className="d" style={{color:'var(--fg-2)', marginTop:4, fontStyle:'italic'}}>{p.laymen}</div>
                    <div className="tags">{p.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sec-card">
          <div className="sec-head">
            <span className="t"><Icon name="chart" size={13} /> Security Events (last 24h)</span>
            <span className="m">WORM · 2,118 events</span>
          </div>
          <div className="sec-body" style={{padding: 12}}>
            <div className="sec-events">
              {window.SEC_LOGS.map((l, i) => (
                <div key={i} className="ev">
                  <div className="ev-head">
                    <span className="t">{l.t}</span>
                    <span className="agent">{l.agent}</span>
                    <span className="evt">{l.event}</span>
                    <span className={`sev-chip ${l.sev}`}>{l.sev}</span>
                  </div>
                  <div className="ev-detail">{l.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.SecurityTab = SecurityTab;
