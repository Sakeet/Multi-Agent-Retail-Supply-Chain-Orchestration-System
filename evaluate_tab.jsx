// ================ EVALUATE TAB ================
function EvaluateTab() {
  return (
    <div className="evaltab" data-screen-label="Evaluate">
      <div className="eval-grid">
        <div className="eval-card">
          <div className="eval-head">
            <span className="t"><Icon name="chart" size={13}/>Live Evaluation Metrics</span>
            <span className="m">rolling 7-day · n=2,840</span>
          </div>
          <div style={{padding:14}}>
            <div className="explain" style={{marginBottom:14}}>
              <span className="lbl">How we measure</span><br/>
              Every decision is replayed weekly against a human-expert panel and a red-team adversarial set. We also run automated graders (Vertex AI AutoSxS) on every 50th production decision.
            </div>
            <div className="metric-grid">
              {window.EVAL_METRICS.map((m, i) => (
                <div key={i} className="metric-card">
                  <div className="ml">{m.name}</div>
                  <div className="mv" style={{color: m.tone === 'ok' ? 'var(--ok)' : 'var(--warn)'}}>
                    {m.score}<span className="mu">{m.unit}</span>
                  </div>
                  <div className="md" dangerouslySetInnerHTML={{__html: m.desc}}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="eval-card">
          <div className="eval-head">
            <span className="t"><Icon name="chart" size={13}/>Model comparison · supply-chain benchmark</span>
            <span className="m">420 expert-labeled incidents</span>
          </div>
          <div style={{padding:14}}>
            <div className="bench-table">
              <div className="bh" style={{display:'grid', gridTemplateColumns:'1.4fr 0.8fr 0.7fr 0.8fr', gap:10, padding:'8px 10px', fontSize:10, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'.08em', borderBottom:'1px solid var(--line)'}}>
                <span>Model</span><span>Accuracy</span><span>Latency</span><span>$/1k tok</span>
              </div>
              {window.BENCHMARKS.map((b, i) => (
                <div key={i} style={{display:'grid', gridTemplateColumns:'1.4fr 0.8fr 0.7fr 0.8fr', gap:10, padding:'10px', borderBottom: i<window.BENCHMARKS.length-1 ? '1px dashed var(--line)' : 0, alignItems:'center', fontSize:11.5}}>
                  <span style={{color:'var(--fg-0)', fontWeight: 500}}>{b.name}</span>
                  <span>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{flex:1, height:6, background:'var(--line)', borderRadius:3, overflow:'hidden'}}>
                        <div style={{width: b.acc+'%', height:'100%', background: b.acc > 90 ? 'var(--ok)' : b.acc > 85 ? 'var(--brand-2)' : 'var(--warn)'}}></div>
                      </div>
                      <span style={{fontFamily:'var(--mono)', color:'var(--fg-1)', fontSize:10.5, minWidth: 42, textAlign:'right'}}>{b.acc}%</span>
                    </div>
                  </span>
                  <span style={{fontFamily:'var(--mono)', color:'var(--fg-1)', fontSize:10.5}}>{b.lat}ms</span>
                  <span style={{fontFamily:'var(--mono)', color:'var(--fg-2)', fontSize:10.5}}>${b.cost}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:14, fontSize:11, color:'var(--fg-2)', lineHeight:1.55}}>
              <b style={{color:'var(--fg-0)'}}>What this means:</b> Our multi-agent system beats any single-agent baseline by <b style={{color:'var(--ok)'}}>+9.6 pts</b> on decision accuracy, at <b style={{color:'var(--ok)'}}>~35% of the cost</b>. Gemini 2.0 Flash gives the best overall balance; Claude 3.5 Sonnet wins on raw accuracy when latency isn't critical.
            </div>
          </div>
        </div>

        <div className="eval-card">
          <div className="eval-head">
            <span className="t"><Icon name="check" size={13}/>Compliance posture</span>
            <span className="m">quarterly audit · Q1 2026</span>
          </div>
          <div style={{padding:'6px 14px 14px'}}>
            <div className="compliance-list">
              {window.COMPLIANCE.map((c, i) => (
                <div key={i} className="compliance-row">
                  <div className={`compliance-dot ${c.status}`}>{c.status === 'pass' ? '✓' : '!'}</div>
                  <div className="compliance-body">
                    <div className="n">{c.name}</div>
                    <div className="d">{c.desc}</div>
                  </div>
                  <div className="compliance-val">{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.EvaluateTab = EvaluateTab;
