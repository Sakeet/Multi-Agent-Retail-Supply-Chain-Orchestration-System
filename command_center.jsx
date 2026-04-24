// ================ COMMAND CENTER ================
function CommandCenter({ openAgent, onModelChange, state, actions }) {
  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', overflow:'hidden'}}>
      <InputZone
        onInitialize={actions.initialize}
        onClear={actions.clear}
        runs={state.runs}
        pipeState={state.pipeState}
        scenarioId={state.scenarioId}
        setScenarioId={actions.setScenarioId}
        inputText={state.inputText}
        setInputText={actions.setInputText}
        uploadedFile={state.uploadedFile}
        setUploadedFile={actions.setUploadedFile}
      />
      <div className="cc" style={{flex:1, minHeight:0}}>
        <div className="col" data-screen-label="Agents">
          <div className="col-head">
            <span className="title"><span className="square"></span>Specialized Agents</span>
            <span className="meta">editable · Vertex AI</span>
          </div>
          <div className="col-scroll">
            <div className="agent-grid">
              {window.AGENTS.map(a => (
                <AgentCard key={a.id} agent={a} onClick={() => openAgent(a)} onModelChange={onModelChange} />
              ))}
            </div>
            <div style={{padding:'4px 16px 18px', color:'var(--fg-3)', fontSize: 10.5, fontFamily:'var(--mono)', lineHeight:1.55}}>
              <div style={{color:'var(--fg-2)', marginBottom: 6, textTransform:'uppercase', letterSpacing:'.08em', fontSize: 9.5}}>click any agent →</div>
              Opens reasoning log, tool manifest, and editable system prompt. Change the GCP model from the footer of each card.
            </div>
          </div>
        </div>

        <div className="col" data-screen-label="Live Feed">
          <div className="col-head">
            <span className="title"><span className="square"></span>Live Agent Feed</span>
            <span className="meta">{state.pipeState === 'running' ? 'streaming…' : state.pipeState === 'complete' ? 'loop closed' : 'idle'}</span>
          </div>
          <div className="col-scroll">
            <LiveFeed items={state.feedItems} />
          </div>
        </div>

        <div className="col" data-screen-label="Decision Log">
          <div className="col-head">
            <span className="title"><span className="square"></span>Decision Log</span>
            <span className="meta">WORM · append-only</span>
          </div>
          <div className="col-scroll">
            <DecisionLog items={state.decisions} />
          </div>
        </div>
      </div>
    </div>
  );
}
window.CommandCenter = CommandCenter;
