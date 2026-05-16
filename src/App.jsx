import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an elite startup analyst and venture capitalist with 20 years of experience. Analyze startup ideas with sharp, data-driven insights.

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "verdict": "STRONG BET" | "WORTH EXPLORING" | "PROCEED WITH CAUTION" | "HARD PASS",
  "verdictScore": 85,
  "oneLiner": "One punchy sentence describing the opportunity",
  "marketSize": {
    "tam": "$4.2B",
    "sam": "$800M",
    "som": "$40M",
    "insight": "Brief market insight"
  },
  "problemStrength": {
    "score": 8,
    "analysis": "How real and painful is this problem?"
  },
  "competitors": [
    { "name": "Competitor Name", "weakness": "Their key weakness", "threat": "low|medium|high" }
  ],
  "moat": {
    "score": 7,
    "type": "Network Effects | Data Moat | Brand | Tech | Switching Costs | Regulatory",
    "explanation": "Why this is or isn't defensible"
  },
  "revenueModels": [
    { "model": "Model name", "fit": "high|medium|low", "rationale": "Why this fits" }
  ],
  "gtm": {
    "phase1": { "title": "Phase title", "tactics": ["tactic1", "tactic2", "tactic3"] },
    "phase2": { "title": "Phase title", "tactics": ["tactic1", "tactic2"] },
    "phase3": { "title": "Phase title", "tactics": ["tactic1", "tactic2"] }
  },
  "risks": [
    { "risk": "Risk description", "severity": "low|medium|high", "mitigation": "How to address it" }
  ],
  "investorTake": "A frank, 2-sentence VC perspective on fundability"
}`;

const VERDICT_CONFIG = {
  "STRONG BET": { color: "#00ff87", bg: "rgba(0,255,135,0.08)", border: "rgba(0,255,135,0.3)" },
  "WORTH EXPLORING": { color: "#60cfff", bg: "rgba(96,207,255,0.08)", border: "rgba(96,207,255,0.3)" },
  "PROCEED WITH CAUTION": { color: "#ffb830", bg: "rgba(255,184,48,0.08)", border: "rgba(255,184,48,0.3)" },
  "HARD PASS": { color: "#ff4f4f", bg: "rgba(255,79,79,0.08)", border: "rgba(255,79,79,0.3)" },
};

const THREAT_COLOR = { low: "#00ff87", medium: "#ffb830", high: "#ff4f4f" };
const FIT_COLOR = { high: "#00ff87", medium: "#ffb830", low: "#ff4f4f" };
const SEV_COLOR = { low: "#00ff87", medium: "#ffb830", high: "#ff4f4f" };

function ScoreBar({ score, max = 10, color = "#00ff87" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${(score / max) * 100}%`, height: "100%", background: color, borderRadius: 2, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 12, color, minWidth: 32, textAlign: "right" }}>{score}/{max}</span>
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

function Section({ title, children, accent = "#00ff87" }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

const EXAMPLES = [
  "An AI tool that generates personalized bedtime stories for kids based on their interests",
  "A marketplace connecting remote workers with co-working spaces for hourly bookings",
  "Fintech app that rounds up purchases and invests the difference in climate-positive assets",
  "B2B SaaS for restaurants to manage reservations, orders, and staff scheduling in one place",
];

export default function App() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [idea]);

  async function analyze() {
    if (!idea.trim() || loading) return;

    const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
    const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY ?? "").trim();
    const useDevProxy =
      import.meta.env.DEV || import.meta.env.VITE_GEMINI_USE_PROXY === "true";
    const proxyHasKey = !!import.meta.env.VITE_PROXY_HAS_GEMINI_KEY;

    if (useDevProxy && !proxyHasKey) {
      setError(
        "API key is not set for the dev proxy. In the project root, add GEMINI_API_KEY or VITE_GEMINI_API_KEY to your .env file, save it, then stop and restart npm run dev.",
      );
      return;
    }

    if (!useDevProxy && !apiKey) {
      setError(
        "Missing API key. Add VITE_GEMINI_API_KEY to your .env before building, or run npm run dev with a key so the Vite proxy can call Gemini (avoids CORS).",
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = useDevProxy
        ? `/api/gemini/v1beta/models/${model}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Analyze this startup idea: "${idea.trim()}"` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `API request failed (${res.status})`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No analysis returned. Try again.");
      }

      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["WORTH EXPLORING"] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8e4dc",
      padding: "0 0 80px",
    }}>
      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(0,255,135,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(96,96,255,0.05) 0%, transparent 70%)" }} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ paddingTop: 64, paddingBottom: 56, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28, background: "rgba(0,255,135,0.07)", border: "1px solid rgba(0,255,135,0.18)", borderRadius: 24, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff87", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00ff87", fontFamily: "monospace" }}>AI-Powered Analysis</span>
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", fontFamily: "'Georgia', serif" }}>
            Startup Idea
            <br />
            <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)", color: "transparent" }}>Validator</span>
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "rgba(232,228,220,0.5)", lineHeight: 1.6, maxWidth: 480, marginInline: "auto" }}>
            Paste your startup idea. Get a VC-grade breakdown in seconds — market size, competitors, moat, revenue models, GTM strategy.
          </p>
        </header>

        {/* Input */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12, fontFamily: "monospace" }}>
            Your Startup Idea
          </label>
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.metaKey || e.ctrlKey) && analyze()}
            placeholder="Describe your startup idea in 1–3 sentences..."
            rows={3}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e8e4dc",
              fontSize: 17,
              lineHeight: 1.65,
              fontFamily: "'Georgia', serif",
              resize: "none",
              boxSizing: "border-box",
              minHeight: 80,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>Ctrl / ⌘ + Enter to analyze</span>
            <button
              onClick={analyze}
              disabled={loading || !idea.trim()}
              style={{
                background: loading || !idea.trim() ? "rgba(255,255,255,0.06)" : "#00ff87",
                color: loading || !idea.trim() ? "rgba(255,255,255,0.3)" : "#080810",
                border: "none",
                borderRadius: 10,
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
                fontFamily: "monospace",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Analyzing…" : "Analyze →"}
            </button>
          </div>
        </div>

        {/* Examples */}
        {!result && !loading && (
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>Try an example</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setIdea(ex)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "rgba(232,228,220,0.55)", cursor: "pointer", textAlign: "left", fontFamily: "'Georgia', serif", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.07)"; e.target.style.color = "#e8e4dc"; }}
                  onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.color = "rgba(232,228,220,0.55)"; }}>
                  {ex.length > 60 ? ex.slice(0, 58) + "…" : ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div style={{ width: 48, height: 48, border: "2px solid rgba(0,255,135,0.15)", borderTopColor: "#00ff87", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 15, color: "rgba(255,255,255,0.7)" }}>Running analysis…</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>Market sizing · Competitor scan · GTM strategy</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,79,79,0.08)", border: "1px solid rgba(255,79,79,0.25)", borderRadius: 12, padding: 20, marginBottom: 24, color: "#ff4f4f", fontSize: 14 }}>{error}</div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef}>
            {/* Verdict Hero */}
            <div style={{ background: vc.bg, border: `1px solid ${vc.border}`, borderRadius: 16, padding: 28, marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: 10 }}>Verdict</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: vc.color, letterSpacing: "-0.01em", marginBottom: 12 }}>{result.verdict}</div>
              <div style={{ fontSize: 16, color: "rgba(232,228,220,0.7)", maxWidth: 500, marginInline: "auto", lineHeight: 1.6 }}>{result.oneLiner}</div>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>Confidence</span>
                  <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${result.verdictScore}%`, height: "100%", background: vc.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: vc.color, fontFamily: "monospace" }}>{result.verdictScore}%</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Market Size */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                <Section title="Market Size" accent="#60cfff">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[["TAM", result.marketSize.tam], ["SAM", result.marketSize.sam], ["SOM", result.marketSize.som]].map(([label, val]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#60cfff" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.6 }}>{result.marketSize.insight}</p>
                </Section>
              </div>

              {/* Problem Strength */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                <Section title="Problem Strength" accent="#ffb830">
                  <div style={{ marginBottom: 12 }}>
                    <ScoreBar score={result.problemStrength.score} color="#ffb830" />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.6 }}>{result.problemStrength.analysis}</p>
                </Section>

                <Section title="Defensibility" accent="#c87bff">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <Tag label={result.moat.type} color="#c87bff" />
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#c87bff" }}>{result.moat.score}/10</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.6 }}>{result.moat.explanation}</p>
                </Section>
              </div>
            </div>

            {/* Competitors */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <Section title="Competitor Landscape" accent="#ff6b6b">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.competitors.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                          <Tag label={`${c.threat} threat`} color={THREAT_COLOR[c.threat] || "#ffb830"} />
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.5)" }}>⚡ {c.weakness}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Revenue Models */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <Section title="Revenue Models" accent="#00ff87">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {result.revenueModels.map((rm, i) => (
                    <div key={i} style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${FIT_COLOR[rm.fit]}22` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{rm.model}</span>
                        <Tag label={rm.fit} color={FIT_COLOR[rm.fit] || "#ffb830"} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(232,228,220,0.5)", lineHeight: 1.5 }}>{rm.rationale}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* GTM */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <Section title="Go-To-Market Strategy" accent="#60cfff">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {[result.gtm.phase1, result.gtm.phase2, result.gtm.phase3].map((phase, idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: "rgba(96,207,255,0.5)", textTransform: "uppercase", marginBottom: 6 }}>Phase {idx + 1}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#60cfff" }}>{phase?.title}</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {(phase?.tactics || []).map((t, j) => (
                          <li key={j} style={{ fontSize: 12, color: "rgba(232,228,220,0.55)", lineHeight: 1.6, paddingLeft: 14, position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: "rgba(96,207,255,0.5)" }}>›</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Risks */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <Section title="Key Risks" accent="#ffb830">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.risks.map((r, i) => (
                    <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, borderLeft: `3px solid ${SEV_COLOR[r.severity] || "#ffb830"}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.risk}</span>
                        <Tag label={r.severity} color={SEV_COLOR[r.severity] || "#ffb830"} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(232,228,220,0.5)" }}>Mitigation: {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Investor Take */}
            <div style={{ background: "rgba(96,207,255,0.06)", border: "1px solid rgba(96,207,255,0.18)", borderRadius: 14, padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(96,207,255,0.5)", fontFamily: "monospace", marginBottom: 12 }}>VC Perspective</div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "rgba(232,228,220,0.85)", fontStyle: "italic" }}>"{result.investorTake}"</p>
            </div>

            {/* Re-analyze */}
            <div style={{ textAlign: "center" }}>
              <button onClick={() => { setResult(null); setIdea(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 28px", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.06em" }}>
                ← Analyze another idea
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing: border-box; }
        textarea::placeholder { color: rgba(232,228,220,0.2); }
        textarea { overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}