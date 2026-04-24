// ================ CHROME ================
function ApiKeyBox({ onChange }) {
  const [key, setKeyState] = useState(() => (window.Gemini && window.Gemini.getKey()) || '');
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onStorage = () => setKeyState(window.Gemini.getKey());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const save = (v) => {
    setKeyState(v);
    window.Gemini.setKey(v);
    onChange && onChange(v);
  };
  const connected = !!key && key.length > 10;
  return (
    <div className="apikey-box" title={connected ? 'Session-only. Cleared on tab close.' : 'Paste your Google AI Studio / GCP API key'}>
      <span className={`dot ${connected ? 'ok' : 'off'}`}></span>
      <span className="lbl">GOOGLE API KEY</span>
      <input
        type={show ? 'text' : 'password'}
        value={key}
        onChange={e => save(e.target.value)}
        placeholder="AIza…  (session-only)"
        spellCheck={false}
        autoComplete="off"
      />
      <button className="mini" onClick={() => setShow(s=>!s)} title={show ? 'Hide' : 'Show'}>{show ? '🙈' : '👁'}</button>
      {connected && <button className="mini" onClick={() => save('')} title="Clear key">✕</button>}
    </div>
  );
}

function TopBar({ tab, onTab, onTutorial, onShare, onReport, pipeOk, onKeyChange }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark2"><div className="brand-dots"><span/><span/><span/><span/></div></div>
        <div className="brand-meta2">
          <span className="name">Orchestra MAS</span>
          <span className="sub">Retail Supply-Chain · v2.5</span>
        </div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==='cc'?'active':''}`} onClick={()=>onTab('cc')}><span className="dot"></span> Command Center</button>
        <button className={`tab ${tab==='map'?'active':''}`} onClick={()=>onTab('map')}><span className="dot"></span> System Architecture</button>
        <button className={`tab ${tab==='sec'?'active':''}`} onClick={()=>onTab('sec')}><span className="dot"></span> Security &amp; Compliance</button>
        <button className={`tab ${tab==='eval'?'active':''}`} onClick={()=>onTab('eval')}><span className="dot"></span> Evaluate</button>
      </div>
      <div className="spacer"></div>
      <ApiKeyBox onChange={onKeyChange} />
      <button className="topbtn" onClick={onTutorial} title="Tutorial"><Icon name="book" size={12}/>Tutorial</button>
      <button className="topbtn" onClick={onShare} title="Share demo link"><Icon name="share" size={12}/>Share</button>
      <button className="topbtn primary" onClick={onReport} disabled={!pipeOk}><Icon name="download" size={12}/>Report</button>
    </div>
  );
}

function StatusBar({ runs, pipeState, keyOn }) {
  const items = [
    ['orchestrator', pipeState === 'running' ? 'EXECUTING' : 'READY'],
    ['agents', '4 / 4'],
    ['mode', keyOn ? 'LIVE · Gemini API' : 'OFFLINE · canned'],
    ['runs session', String(runs)],
    ['temp', '0.5'],
    ['max tok', '512'],
  ];
  return (
    <div className="statusbar">
      {items.map(([k,v],i)=>(<div key={i} className="seg"><span className="k">{k}</span><span className="v" style={keyOn && k==='mode' ? {color:'var(--ok)'} : {}}>{v}</span></div>))}
      <div className="spacer"></div>
      <div className="seg"><span className="k">build</span><span className="v">d7f3a0c</span></div>
      <div className="seg"><span className="k">region</span><span className="v">us-central1</span></div>
      <div className="seg"><span className="k">uptime</span><span className="v">99.98%</span></div>
    </div>
  );
}
Object.assign(window, { TopBar, StatusBar });
