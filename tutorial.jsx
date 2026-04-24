// ================ TUTORIAL ================
const TUTORIAL_STEPS = [
  {
    step: 'Step 1 of 5',
    title: 'Welcome to Orchestra MAS',
    body: (
      <>
        <p>This is a <b>multi-agent orchestration system</b> for retail supply chains. Four specialized AI agents collaborate under a central orchestrator — watching for problems, finding solutions, shipping goods, and keeping everything safe.</p>
        <p>This tour takes <b>60 seconds</b>. Press <span className="kbd">→</span> to advance, <span className="kbd">Esc</span> to skip.</p>
      </>
    ),
  },
  {
    step: 'Step 2 of 5',
    title: 'Command Center — the main console',
    body: (
      <>
        <p>Three panes, left to right:</p>
        <ul>
          <li><b>Specialized Agents</b> — four cards. Click any one to see its reasoning, tool manifest, and editable system prompt. Change its GCP model from the dropdown on each card.</li>
          <li><b>Live Agent Feed</b> — streams what the agents are doing, with plain-English captions underneath each technical line.</li>
          <li><b>Decision Log</b> — every collaborative decision, with verdict (approved / pending / blocked).</li>
        </ul>
      </>
    ),
  },
  {
    step: 'Step 3 of 5',
    title: 'Run a scenario',
    body: (
      <>
        <p>At the top of the Command Center you'll find the <b>pipeline input</b>. You can:</p>
        <ul>
          <li>Pick one of the preset retail scenarios (port delay, hurricane, demand spike, strike)</li>
          <li>Type your own scenario into the box</li>
          <li>Upload a text or JSON file with scenario data</li>
        </ul>
        <p>Press <b style={{color:'var(--brand-2)'}}>Initialize Pipeline</b> to kick off the agents. Watch the feed stream back.</p>
      </>
    ),
  },
  {
    step: 'Step 4 of 5',
    title: 'System Architecture',
    body: (
      <>
        <p>The <b>System Architecture</b> tab shows how data flows:</p>
        <p>External sources → Pub/Sub bus → Orchestrator (on Vertex AI) → specialized sub-agents → Governance Guardrail → ERP.</p>
        <p>Click any node to see its model, role, and editable config. Toggle the flow filters in the sidebar to highlight the disruption loop, audit path, or blocked path.</p>
      </>
    ),
  },
  {
    step: 'Step 5 of 5',
    title: 'Safety & evaluation',
    body: (
      <>
        <p><b>Security &amp; Compliance</b> — see every time the guardrail blocked something, redacted personal info, or caught a prompt-injection attempt. All 8 policies are live-toggleable.</p>
        <p><b>Evaluate</b> — how well the system performs on benchmarks, how it compares to other models, and our compliance posture (SOC 2, GDPR, EU AI Act, NIST AI RMF).</p>
        <p>After a run, click <b style={{color:'var(--brand-2)'}}>Technical Report</b> in the top bar to generate a plain-English summary of everything that happened.</p>
      </>
    ),
  },
];

function Tutorial({ onClose }) {
  const [i, setI] = useState(0);
  const step = TUTORIAL_STEPS[i];
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI(v => Math.min(v+1, TUTORIAL_STEPS.length-1));
      if (e.key === 'ArrowLeft') setI(v => Math.max(v-1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="tutorial-back" onClick={onClose}>
      <div className="tutorial-card" onClick={e=>e.stopPropagation()}>
        <div className="tutorial-head">
          <div className="step">{step.step}</div>
          <h2>{step.title}</h2>
        </div>
        <div className="tutorial-body">{step.body}</div>
        <div className="tutorial-foot">
          <div className="tut-progress">
            {TUTORIAL_STEPS.map((_, idx) => <div key={idx} className={`tut-dot ${idx===i?'active':''}`}></div>)}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="topbtn" onClick={()=>setI(v=>Math.max(v-1,0))} disabled={i===0}>Back</button>
            {i < TUTORIAL_STEPS.length - 1
              ? <button className="topbtn primary" onClick={()=>setI(v=>v+1)}>Next →</button>
              : <button className="topbtn primary" onClick={onClose}>Start exploring</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
window.Tutorial = Tutorial;
