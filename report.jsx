// ================ REPORT ================
function Report({ onClose, scenarioLabel, runs, inputText }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h2>📄 Technical Report · Run #{String(runs).padStart(3,'0')}</h2>
          <span className="badge">Pipeline complete</span>
          <button className="close" style={{background:'transparent', border:'1px solid var(--line-2)', color:'var(--fg-1)', width:28, height:28, borderRadius:6, cursor:'pointer'}} onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="explain">
            <span className="lbl">What happened, in one sentence</span><br/>
            The system detected a supply-chain disruption from the input scenario, four specialized AI agents collaborated to find a mitigation, safety checks passed, and an approved purchase order was written to the ERP system in <b>6.8 seconds</b>.
          </div>

          <h3>Scenario</h3>
          <p><span className="laymen">input</span>{scenarioLabel || 'Custom'} — "<span style={{fontFamily:'var(--mono)', fontSize: 11, color:'var(--fg-2)'}}>{(inputText || '').slice(0, 160)}{inputText && inputText.length > 160 ? '…' : ''}</span>"</p>

          <h3>Key metrics</h3>
          <div className="report-grid">
            <div className="report-metric"><div className="ml">loop time</div><div className="mv">6.8<span style={{fontSize:12, color:'var(--fg-2)'}}>s</span></div><div className="me">Signal detected → ERP write committed. SLO is 10s.</div></div>
            <div className="report-metric"><div className="ml">agents engaged</div><div className="mv">4 / 4</div><div className="me">All specialists ran; no fallbacks were triggered.</div></div>
            <div className="report-metric"><div className="ml">safety checks</div><div className="mv">6 / 6</div><div className="me">Injection, PII, price band, budget, vendor, jailbreak — all clear.</div></div>
            <div className="report-metric"><div className="ml">cost of this run</div><div className="mv">$0.12</div><div className="me">Token + compute. A human analyst would cost ~$62 to triage this.</div></div>
          </div>

          <h3>What each agent did (plain English)</h3>
          {window.AGENTS.map(a => (
            <p key={a.id}><span className="laymen">{a.name}</span>{a.laymen}</p>
          ))}

          <h3>Decisions taken (plain English)</h3>
          <p><span className="laymen">routing</span>Goods will now travel from Ensenada, Mexico — a land bridge that avoids the blocked Long Beach port. 60% by rail, 40% by expedited truck. Total delivery time: 92 hours (under our 96-hour promise).</p>
          <p><span className="laymen">pricing</span>We agreed to pay $14.20 per unit, which is 2.9% above our contract band — within the allowed ±5%. Total spend: $25,560 (well under our $250k human-approval threshold).</p>
          <p><span className="laymen">safety</span>One email address in the supplier's contact record was automatically masked before the AI saw it. A jailbreak attempt embedded in a supplier-description field was detected and stripped. No policy violations reached the ERP.</p>

          <h3>Why this architecture</h3>
          <p><span className="laymen">specialization</span>One giant "do everything" AI is brittle and hard to audit. Four focused agents — each with a frozen role, a narrow tool manifest, and its own model — are easier to test, tune, and lock down.</p>
          <p><span className="laymen">defense in depth</span>The Governance Guardrail is the last step before anything touches the ERP. Even if a specialist agent goes off-script, the Guardrail blocks policy violations and redacts sensitive data. It is enforced by code, not by prompt instructions.</p>
          <p><span className="laymen">human-in-the-loop</span>Decisions above $250k or involving new vendors always wait for a human. The AI cannot bypass this — the budget is cryptographically signed into the decision envelope.</p>

          <h3>Model choices per agent</h3>
          {window.AGENTS.map(a => {
            const m = window.GCP_MODELS.find(x => x.id === a.model);
            return <p key={a.id} style={{fontSize:11.5}}><b style={{color:'var(--fg-0)'}}>{a.name}</b> → {m ? m.label : a.model} <span style={{color:'var(--fg-2)'}}>· {m ? `${m.ctx} context · ${m.cost}` : ''}</span></p>;
          })}

          <h3>Next steps</h3>
          <p style={{color:'var(--fg-2)'}}>Download this report as PDF · share the demo link · push this HTML to a public GitHub repo and host it via GitHub Pages or any static host. The system is browser-native (no backend required for the demo shell).</p>

          <div style={{display:'flex', gap:8, marginTop: 20}}>
            <button className="topbtn primary" onClick={() => window.print()}><Icon name="download" size={12}/>Save as PDF</button>
            <button className="topbtn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Report = Report;
