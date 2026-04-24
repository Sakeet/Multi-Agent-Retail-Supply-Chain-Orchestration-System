// ================ APP ================
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function App() {
  const [tab, setTab] = useState(() => localStorage.getItem('orc.tab') || 'cc');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem('orc.tut.seen') !== '1');
  const [showReport, setShowReport] = useState(false);
  const [toast, setToast] = useState(null);
  const [keyOn, setKeyOn] = useState(() => !!window.Gemini.getKey());

  const [scenarioId, setScenarioId] = useState('port');
  const [baseAgents, setBaseAgents] = useState(() => window.AGENTS.map(a => ({...a})));
  const agents = useMemo(() => {
    const ov = (window.SCENARIO_AGENTS && window.SCENARIO_AGENTS[scenarioId]) || {};
    const cots = (window.SCENARIO_COT && window.SCENARIO_COT[scenarioId]) || {};
    return baseAgents.map(a => ({ ...a, ...(ov[a.id] || {}), cot: (cots && cots[a.id]) ? cots[a.id] : a.cot }));
  }, [baseAgents, scenarioId]);
  useEffect(() => { window.AGENTS = agents; }, [agents]);

  const [runs, setRuns] = useState(() => Number(localStorage.getItem('orc.runs') || 0));
  const [pipeState, setPipeState] = useState('idle');
  const [inputText, setInputText] = useState(window.SCENARIOS[0].text);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [policies, setPolicies] = useState(() => window.POLICIES_BASE.map(p => ({...p})));
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => { localStorage.setItem('orc.tab', tab); }, [tab]);
  useEffect(() => { localStorage.setItem('orc.runs', String(runs)); }, [runs]);

  // Wipe API key on tab close (belt-and-suspenders; sessionStorage already does this on browser close, but some users navigate away)
  useEffect(() => {
    const wipe = () => { try { sessionStorage.removeItem('orc.gapi'); } catch {} };
    window.addEventListener('pagehide', wipe);
    return () => window.removeEventListener('pagehide', wipe);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setSelectedAgent(null); setSelectedNode(null); setShowReport(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const onModelChange = (agentId, model) => {
    setBaseAgents(prev => prev.map(a => a.id === agentId ? {...a, model} : a));
    const m = window.GCP_MODELS.find(x => x.id === model);
    showToast(`Model updated → ${m ? m.label : model}`);
  };
  const onPromptEdit = (agentId, systemPrompt) => {
    setBaseAgents(prev => prev.map(a => a.id === agentId ? {...a, systemPrompt} : a));
    showToast('System prompt saved');
  };
  const onNameEdit = (node, name) => { if (node.agentId) setBaseAgents(prev => prev.map(a => a.id === node.agentId ? {...a, name} : a)); };

  const timers = useRef([]);
  const clearTimers = () => { timers.current.forEach(t => clearTimeout(t)); timers.current = []; };

  const initialize = async () => {
    if (pipeState === 'running') return;
    clearTimers();
    setFeedItems([]);
    setDecisions([]);
    setPipeState('running');

    const hasKey = !!window.Gemini.getKey();
    setKeyOn(hasKey);

    if (hasKey) {
      // REAL pipeline — call Gemini API
      showToast('Running real pipeline via Gemini API…');
      await window.runRealPipeline({
        inputText,
        agents,
        onFeed: (ev) => setFeedItems(prev => [...prev, ev]),
        onDecision: (d) => setDecisions(prev => [d, ...prev]),
        onStatus: () => {},
        onClassify: (clf) => {
          // auto-filter scenario chip to match classification
          if (clf && clf.category && ['port','hurricane','surge','strike','custom'].includes(clf.category)) {
            setScenarioId(clf.category);
          }
        },
        onComplete: (result) => {
          setPipeState('complete');
          setRuns(r => r + 1);
          setLastRun(result);
          showToast(`Pipeline complete · ${result.elapsed}s`);
        },
        onError: (err) => {
          setPipeState('idle');
          showToast('Error: ' + (err.message || 'pipeline failed'));
        },
      });
      return;
    }

    // FALLBACK — preloaded canned stream
    const feed = (window.SCENARIO_FEEDS && window.SCENARIO_FEEDS[scenarioId]) || (window.SCENARIO_FEEDS && window.SCENARIO_FEEDS.custom) || window.FEED_BASE || [];
    const decs = (window.SCENARIO_DECISIONS && window.SCENARIO_DECISIONS[scenarioId]) || (window.SCENARIO_DECISIONS && window.SCENARIO_DECISIONS.custom) || window.DECISIONS_BASE || [];
    feed.forEach((ev, i) => timers.current.push(setTimeout(() => setFeedItems(prev => [...prev, ev]), 300 + i * 700)));
    [...decs].reverse().forEach((d, i) => timers.current.push(setTimeout(() => setDecisions(prev => [d, ...prev]), 1200 + i * 900)));
    timers.current.push(setTimeout(() => {
      setPipeState('complete');
      setRuns(r => r + 1);
      showToast('Pipeline complete (offline mode · add API key for real inference)');
    }, 300 + feed.length * 700 + 500));
  };

  const clear = () => {
    clearTimers();
    setInputText('');
    setUploadedFile(null);
    setFeedItems([]);
    setDecisions([]);
    setPipeState('idle');
    setLastRun(null);
  };

  const togglePolicy = (id) => {
    setPolicies(prev => prev.map(p => p.id === id ? {...p, on: !p.on} : p));
    const p = policies.find(x => x.id === id);
    if (p) showToast(`Policy ${p.on ? 'disabled' : 'enabled'}: ${p.name}`);
  };

  const onShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); showToast('Demo link copied'); }
    catch { showToast('Share link: ' + window.location.href); }
  };
  const onReport = () => {
    if (pipeState !== 'complete') { showToast('Run the pipeline first'); return; }
    setShowReport(true);
  };
  const onKeyChange = (v) => {
    setKeyOn(!!v);
    if (v) showToast('Session API key set. Agents will use Gemini on next run.');
    else showToast('API key cleared. Offline mode active.');
  };
  const closeTutorial = () => { setShowTutorial(false); localStorage.setItem('orc.tut.seen', '1'); };

  useEffect(() => () => clearTimers(), []);

  const scenarioLabel = (window.SCENARIOS.find(s => s.id === scenarioId) || {}).label;

  return (
    <div className="app">
      <TopBar
        tab={tab} onTab={setTab}
        onTutorial={() => setShowTutorial(true)}
        onShare={onShare}
        onReport={onReport}
        pipeOk={pipeState === 'complete'}
        onKeyChange={onKeyChange}
      />
      <div className="content">
        {tab === 'cc' && (
          <CommandCenter
            openAgent={setSelectedAgent}
            onModelChange={onModelChange}
            state={{ runs, pipeState, scenarioId, inputText, uploadedFile, feedItems, decisions }}
            actions={{ initialize, clear, setScenarioId, setInputText, setUploadedFile }}
          />
        )}
        {tab === 'map' && <SystemMap onSelectNode={setSelectedNode} />}
        {tab === 'sec' && <SecurityTab policies={policies} togglePolicy={togglePolicy} />}
        {tab === 'eval' && <EvaluateTab />}
      </div>
      <StatusBar runs={runs} pipeState={pipeState} keyOn={keyOn} />
      {selectedAgent && <AgentDrawer agent={agents.find(a => a.id === selectedAgent.id) || selectedAgent} onClose={() => setSelectedAgent(null)} onModelChange={onModelChange} onPromptEdit={onPromptEdit} />}
      {selectedNode && <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} onModelChange={onModelChange} onNameEdit={onNameEdit} />}
      {showTutorial && <Tutorial onClose={closeTutorial} />}
      {showReport && <Report onClose={() => setShowReport(false)} scenarioLabel={scenarioLabel} runs={runs} inputText={inputText} lastRun={lastRun} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
