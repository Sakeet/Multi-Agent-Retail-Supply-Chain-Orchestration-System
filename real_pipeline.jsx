// ================ REAL PIPELINE (Gemini-backed) ================
// Runs the full agent loop by calling the Gemini API with the session key.
// Streams feed items + decisions back into the Command Center exactly like
// the canned pipeline, but with model-generated content.

async function runRealPipeline({ inputText, agents, onFeed, onDecision, onStatus, onComplete, onError, onClassify }) {
  const t0 = performance.now();
  const ts = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`;
  };
  const agent = (id) => agents.find(a => a.id === id);
  const push = (ev) => onFeed({ id: 'ev-' + Math.random().toString(36).slice(2,9), t: ts(), ...ev });

  try {
    onStatus('classifying');
    push({ agent: 'O', sev: 'info', msg: <><strong>Orchestrator</strong> classifying incident via Gemini…</>, caption: 'Routing your scenario to the right specialists.' });

    const clf = await window.Gemini.classifyScenario(inputText, agent('A').model);
    onClassify(clf);
    const catLabel = { port: 'Port Delay', hurricane: 'Hurricane Risk', surge: 'Surge Demand', strike: 'Labor Strike', custom: 'Custom / novel incident' }[clf.category] || 'Custom';
    push({ agent: 'O', sev: 'ok', msg: <><strong>Classified</strong> as <code>{catLabel}</code> · confidence {(clf.confidence*100).toFixed(0)}%</>, caption: clf.summary, payload: JSON.stringify(clf, null, 2) });

    // Signal Watcher
    onStatus('signal_watcher');
    push({ agent: 'A', sev: 'info', msg: <><strong>Signal Watcher</strong> analyzing telemetry…</>, caption: `Model: ${agent('A').model}` });
    const sigText = await window.Gemini.geminiCall({
      model: agent('A').model,
      systemPrompt: window.Gemini.AGENT_PROMPTS.A,
      userPrompt: `Incident: ${inputText}\nClassification: ${JSON.stringify(clf)}`,
      json: true, maxTokens: 450,
    });
    const sig = window.Gemini.parseLooseJson(sigText) || {};
    push({ agent: 'A', sev: sig.severity === 'crit' ? 'crit' : sig.severity === 'high' ? 'crit' : 'ok',
      msg: <><strong>Signal raised:</strong> <code>{sig.signal || 'SIGNAL'}</code> · severity <code>{sig.severity}</code></>,
      caption: (sig.observations || []).slice(0,2).join(' · '),
      payload: JSON.stringify(sig, null, 2) });

    // Parallel B + C
    onStatus('parallel_agents');
    push({ agent: 'O', sev: 'info', msg: <><strong>Orchestrator</strong> waking Sourcing + Logistics in parallel</>, caption: 'Two specialists run concurrently so response time stays under SLA.' });

    const [srcText, logText] = await Promise.all([
      window.Gemini.geminiCall({ model: agent('B').model, systemPrompt: window.Gemini.AGENT_PROMPTS.B, userPrompt: `Incident: ${inputText}\nSignal: ${JSON.stringify(sig)}`, json: true, maxTokens: 500 }),
      window.Gemini.geminiCall({ model: agent('C').model, systemPrompt: window.Gemini.AGENT_PROMPTS.C, userPrompt: `Incident: ${inputText}\nSignal: ${JSON.stringify(sig)}`, json: true, maxTokens: 500 }),
    ]);
    const src = window.Gemini.parseLooseJson(srcText) || {};
    const log = window.Gemini.parseLooseJson(logText) || {};

    push({ agent: 'B', sev: src.within_band ? 'ok' : 'warn',
      msg: <><strong>Sourcing proposal:</strong> {src.supplier?.name || 'Supplier'} @ ${src.unit_price} × {src.qty} = <code>${(src.total_spend||0).toLocaleString()}</code></>,
      caption: src.rationale,
      payload: JSON.stringify(src, null, 2) });
    push({ agent: 'C', sev: log.within_sla ? 'ok' : 'warn',
      msg: <><strong>Routing plan:</strong> {Object.entries(log.mode_split||{}).filter(([,v])=>v>0).map(([k,v])=>`${v}% ${k}`).join(' · ')} · {log.total_time_hours}h</>,
      caption: log.rationale,
      payload: JSON.stringify(log, null, 2) });

    // Guardrail
    onStatus('guardrail');
    push({ agent: 'D', sev: 'info', msg: <><strong>Governance Guardrail</strong> evaluating 5 policies…</>, caption: 'Last check before any ERP write.' });
    const gText = await window.Gemini.geminiCall({
      model: agent('D').model,
      systemPrompt: window.Gemini.AGENT_PROMPTS.D,
      userPrompt: `Sourcing: ${JSON.stringify(src)}\nLogistics: ${JSON.stringify(log)}\nOriginal scenario: ${inputText}`,
      json: true, maxTokens: 450,
    });
    const g = window.Gemini.parseLooseJson(gText) || { verdict: 'pending_hil' };
    const verdictSev = g.verdict === 'approved' ? 'ok' : g.verdict === 'blocked' ? 'crit' : 'warn';
    push({ agent: 'D', sev: verdictSev,
      msg: <><strong>Verdict:</strong> <code>{g.verdict}</code> · {(g.checks||[]).filter(c=>c.pass).length}/{(g.checks||[]).length} checks passed</>,
      caption: g.rationale,
      payload: JSON.stringify(g, null, 2) });

    // Decisions (feed into DecisionLog top-of-stack)
    const tsShort = ts().slice(0,8);
    const verdictMap = { approved: 'approved', pending_hil: 'pending', blocked: 'blocked' };
    const verd = verdictMap[g.verdict] || 'pending';

    onDecision({ id: 'D-' + Math.floor(Math.random()*9000+1000), time: tsShort, verdict: verd,
      body: <><span className="who">Governance Guardrail</span> → {g.verdict} · {g.rationale}</>,
      meta: [agent('D').model, `${(g.checks||[]).length} checks`, g.escalate_to || 'erp'] });
    onDecision({ id: 'D-' + Math.floor(Math.random()*9000+1000), time: tsShort, verdict: 'approved',
      body: <><span className="who">Logistics Optimizer</span> → {Object.entries(log.mode_split||{}).filter(([,v])=>v>0).map(([k,v])=>`${v}% ${k}`).join(' · ')} · {log.total_time_hours}h</>,
      meta: [agent('C').model, `SLA ${log.sla_hours}h`, log.within_sla ? 'in_sla' : 'at_risk'] });
    onDecision({ id: 'D-' + Math.floor(Math.random()*9000+1000), time: tsShort, verdict: src.within_band ? 'approved' : 'pending',
      body: <><span className="who">Sourcing Strategist</span> → {src.supplier?.name} @ ${src.unit_price}/u · ${(src.total_spend||0).toLocaleString()}</>,
      meta: [agent('B').model, `band ${src.contract_band?.lo}-${src.contract_band?.hi}`, src.within_band ? 'within_band' : 'over_band'] });
    onDecision({ id: 'D-' + Math.floor(Math.random()*9000+1000), time: tsShort, verdict: 'approved',
      body: <><span className="who">Signal Watcher</span> → {sig.signal} · severity {sig.severity}</>,
      meta: [agent('A').model, `conf ${(sig.confidence*100|0)}%`, 'observed'] });

    const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
    push({ agent: 'O', sev: 'ok', msg: <><strong>Pipeline complete</strong> · loop closed in {elapsed}s</>, caption: 'All four agents agreed; decision envelope sealed.' });
    onComplete({ elapsed, classification: clf, signal: sig, sourcing: src, logistics: log, guardrail: g });

  } catch (err) {
    push({ agent: 'O', sev: 'crit', msg: <><strong>Pipeline error:</strong> {String(err.message || err)}</>, caption: 'Check your API key, model name, or the scenario input.' });
    onError(err);
  }
}

window.runRealPipeline = runRealPipeline;
