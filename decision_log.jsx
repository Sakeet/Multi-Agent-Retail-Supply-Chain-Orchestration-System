// ================ DECISION LOG ================
function DecisionLog({ items }) {
  if (!items || items.length === 0) {
    return <div className="empty" style={{padding:24, fontSize:11}}>Decisions will appear here once the pipeline runs.</div>;
  }
  return (
    <div className="decisions">
      {items.map(d => (
        <div key={d.id} className="decision">
          <div className="hdr">
            <span className="id">{d.id} · {d.time}</span>
            <span className={`verdict ${d.verdict}`}>{d.verdict}</span>
          </div>
          <div className="body">{d.body}</div>
          <div className="meta">{d.meta.map((m,i)=><span key={i}>{m}</span>)}</div>
        </div>
      ))}
    </div>
  );
}
window.DecisionLog = DecisionLog;
