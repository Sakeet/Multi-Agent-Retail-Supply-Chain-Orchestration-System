// ================ AGENT CARD ================
function AgentCard({ agent, onClick, onModelChange }) {
  const style = {
    '--accent': agent.accent, '--accent-2': agent.accent2,
    '--accent-bg': agent.accentBg, '--accent-border': agent.accentBorder,
  };
  return (
    <div className="agent-card" style={style} onClick={onClick}>
      <div className="accent"></div>
      <div className="head">
        <div className="agent-ident">
          <div className="agent-icon">{agent.initial}</div>
          <div>
            <div className="agent-name">
              {agent.emoji} {agent.name}
              <span className="sub">{agent.code} · {agent.role}</span>
            </div>
          </div>
        </div>
        <span className={`status-pill ${agent.status}`}><span className="d"></span>{agent.statusLabel}</span>
      </div>
      <div className="agent-field"><div className="k">Task</div><div className="v">{agent.currentTask}</div></div>
      <div className="agent-field"><div className="k">Plain</div><div className="v" style={{color:'var(--fg-2)', fontSize: 10.5, lineHeight: 1.45}}>{agent.laymen}</div></div>
      <div className="agent-field"><div className="k">Last</div><div className="v mono">{agent.lastDecision}</div></div>
      <div className="agent-field">
        <div className="k">Compute</div>
        <div className="v">
          <div className="health-row">
            <div className="health-bar"><div className="fill" style={{width: agent.compute.cpu+'%'}}></div></div>
            <div className="health-num">{agent.compute.cpu}%</div>
          </div>
        </div>
      </div>
      <div className="model-footer" onClick={e=>e.stopPropagation()}>
        <span className="lbl">GCP Model</span>
        <div className="model-select">
          <select value={agent.model} onChange={e=>onModelChange(agent.id, e.target.value)}>
            {window.GCP_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
window.AgentCard = AgentCard;
