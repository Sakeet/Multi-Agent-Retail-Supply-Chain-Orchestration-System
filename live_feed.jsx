// ================ LIVE FEED ================
function LiveFeed({ items }) {
  const agentMeta = (code) => {
    if (code === 'O') return { tag: 'ORCH', color: '#4aa8ff', bg: 'rgba(74,168,255,0.12)', border: 'rgba(74,168,255,0.32)' };
    const a = window.AGENTS.find(x => x.id === code);
    if (!a) return null;
    return { tag: `AGT ${a.id}`, color: a.accent, bg: a.accentBg, border: a.accentBorder };
  };
  if (!items || items.length === 0) {
    return (
      <div className="empty">
        <div style={{fontSize: 28, marginBottom: 10}}>⚡</div>
        <div style={{color:'var(--fg-1)', fontSize: 13, fontWeight: 500, marginBottom: 4}}>Pipeline idle</div>
        <div style={{color:'var(--fg-2)', fontSize: 11}}>Pick a scenario or write your own, then press <b style={{color:'var(--brand-2)'}}>Initialize Pipeline</b>.</div>
      </div>
    );
  }
  return (
    <div className="feed">
      {items.filter(Boolean).map(ev => {
        const m = agentMeta(ev.agent);
        const style = m ? { '--accent': m.color, '--accent-bg': m.bg, '--accent-border': m.border } : {};
        return (
          <div key={ev.id} className={`feed-item ${ev.sev==='crit'?'crit':ev.sev==='ok'?'ok':''}`} style={style}>
            <span className="time">{ev.t}</span>
            {m && <span className="agent-tag">{m.tag}</span>}
            <span className="msg">{ev.msg}</span>
            {ev.caption && <span className="caption">{ev.caption}</span>}
            {ev.payload && <div className="payload">{ev.payload}</div>}
          </div>
        );
      })}
    </div>
  );
}
window.LiveFeed = LiveFeed;
