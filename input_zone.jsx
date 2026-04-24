// ================ INPUT ZONE ================
function InputZone({ onInitialize, onClear, runs, pipeState, scenarioId, setScenarioId, inputText, setInputText, uploadedFile, setUploadedFile }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploadedFile({ name: f.name, size: f.size });
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').slice(0, 2000);
      setInputText(text);
      setScenarioId('custom');
    };
    reader.readAsText(f);
  };

  const pickScenario = (s) => {
    setScenarioId(s.id);
    if (s.id !== 'custom') setInputText(s.text);
  };

  return (
    <div className="input-zone">
      <div className="input-left">
        <div className="hdr">
          <span className="tag">PIPELINE INPUT</span>
          <span className="hint">Pick a retail scenario · or paste your own / upload a file</span>
        </div>
        <div className="scenario-row">
          {window.SCENARIOS.map(s => (
            <button key={s.id} className={`scenario-chip ${scenarioId===s.id?'active':''}`} onClick={()=>pickScenario(s)}>{s.label}</button>
          ))}
        </div>
        <textarea
          className="input-box"
          placeholder="Describe the retail supply-chain situation. E.g. a port delay, a demand spike, a weather event, a supplier issue…"
          value={inputText}
          onChange={e=>{ setInputText(e.target.value); setScenarioId('custom'); }}
          disabled={pipeState === 'running'}
        />
        {uploadedFile && (
          <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--fg-2)'}}>
            📎 {uploadedFile.name} · {(uploadedFile.size/1024).toFixed(1)}kb loaded
          </div>
        )}
      </div>
      <div className="input-actions">
        <button className="init-btn" onClick={onInitialize} disabled={pipeState === 'running' || !inputText.trim()}>
          {pipeState === 'running' ? (<><span className="pulse-ring"></span>Running…</>)
            : pipeState === 'complete' ? (<><Icon name="play" size={12}/>Run Again</>)
            : (<><Icon name="play" size={12}/>Initialize Pipeline</>)}
        </button>
        <div className="sub-actions">
          <button onClick={()=>fileRef.current && fileRef.current.click()} title="Upload scenario file (.txt)">
            <span className="file-label"><Icon name="file" size={11}/>Upload</span>
          </button>
          <button onClick={onClear} title="Clear text and reset"><span className="file-label"><Icon name="broom" size={11}/>Clear</span></button>
        </div>
        <input ref={fileRef} type="file" accept=".txt,.md,.json,.csv" onChange={handleFile} />
        <div className="run-counter">
          <span>runs this session</span>
          <span className="runs">{String(runs).padStart(3,'0')}</span>
        </div>
        <PipeStatus state={pipeState} />
      </div>
    </div>
  );
}

function PipeStatus({ state }) {
  if (state === 'running') return <div className="pipe-status run"><span className="spin"></span>Orchestrator executing…</div>;
  if (state === 'complete') return <div className="pipe-status ok">✓ Pipeline complete · loop closed</div>;
  return <div className="pipe-status idle">Idle · waiting for input</div>;
}

window.InputZone = InputZone;
