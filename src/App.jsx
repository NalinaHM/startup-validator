import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an elite startup analyst, venture capitalist, and government financial scheme advisor with 20 years of experience in market research, location strategy, and business validation (especially in India and global markets). Analyze startup ideas with sharp, data-driven insights.

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
  "investorTake": "A frank, 2-sentence VC perspective on fundability",

  "locationAnalysis": {
    "suitabilityScore": 88,
    "recommendedRegions": ["Tier-1 Tech Hubs (e.g. Bangalore, Hyderabad)", "Industrial Clusters (e.g. Pune, NCR)"],
    "demographicFit": "Description of ideal demographic profile and customer density in target areas",
    "footTrafficAndSupplyChain": "Insights on foot traffic, logistics, location accessibility, or local distribution hubs",
    "regionalAdvantages": ["Proximity to raw materials", "Availability of skilled tech talent", "Lower operational cost in Tier-2/3 cities"]
  },

  "governmentSchemes": [
    {
      "name": "Pradhan Mantri Mudra Yojana (PMMY) - Tarun / Kishore",
      "type": "Mudra Loan",
      "maxFunding": "Up to ₹10 Lakhs (Collateral Free)",
      "eligibility": "Highly Eligible",
      "summary": "Non-corporate, non-farm small/micro business loan for purchasing machinery, working capital, or setup.",
      "documentsRequired": ["Mudra Application Form", "ID & Address Proof", "Business Registration / Udyam Certificate", "6 Months Bank Statement"],
      "applicationSteps": ["Register on JanSamarth portal or approach partner bank", "Submit project report & quotation", "Bank approval & loan disbursement"]
    },
    {
      "name": "Startup India Seed Fund Scheme (SISFS)",
      "type": "Grant / Convertible Debenture",
      "maxFunding": "Up to ₹20 Lakhs Grant / ₹50 Lakhs Debt",
      "eligibility": "Eligible if DPIIT recognized",
      "summary": "Financial assistance to startups for proof of concept, prototype development, product trials, and market entry.",
      "documentsRequired": ["DPIIT Recognition Certificate", "Pitch Deck", "Proof of Concept / Prototype Demo"],
      "applicationSteps": ["Apply via Startup India Portal", "Select approved incubator", "Present project to Incubator Seed Evaluation Committee"]
    }
  ],

  "marketingStrategy": {
    "targetAudiencePersona": "Specific description of primary ideal customer profile (age, profession, pain points)",
    "messagingHook": "Catchy headline / core campaign slogan for marketing",
    "channels": [
      { "channel": "Performance Marketing (Meta & Google Ads)", "strategy": "Target intent-based keywords and retarget landing page visitors" },
      { "channel": "Grassroots / Local Community Outreach", "strategy": "Conduct localized workshops and partner with regional trade associations" }
    ],
    "growthHacks": ["Double-sided referral bonus for initial 1,000 users", "Freemium tier to drive organic word-of-mouth"]
  }
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
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (score / max) * 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{score}/{max}</span>
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: `${color}18`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

function Section({ title, children, accent = "#00ff87" }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

const SECTORS = [
  "General / Multi-Sector",
  "Fintech & Banking",
  "Healthcare & MedTech",
  "Agritech & Rural Business",
  "E-Commerce & D2C",
  "AI & SaaS",
  "EdTech & Upskilling",
  "FoodTech & Quick Commerce",
  "CleanTech & EV",
];

const EXAMPLES = [
  "An AI-driven soil testing & micro-loan recommendation app for smallholder farmers in Karnataka",
  "A hyperlocal dark store network delivering organic groceries in Tier-2 Indian cities within 30 minutes",
  "Fintech app rounding up daily transactions to invest in solar mini-grids for rural electrification",
  "B2B SaaS for manufacturing SMEs to manage Mudra loan applications, GST compliance, and supplier invoices",
];

export default function App() {
  const [idea, setIdea] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [sector, setSector] = useState("General / Multi-Sector");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vc"); // 'vc' | 'location' | 'govt' | 'marketing'
  const [checkedDocs, setCheckedDocs] = useState({});

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
    const useDevProxy = import.meta.env.DEV || import.meta.env.VITE_GEMINI_USE_PROXY === "true";
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
    setCheckedDocs({});

    try {
      const url = useDevProxy
        ? `/api/gemini/v1beta/models/${model}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const promptText = `Analyze this startup idea:
Idea: "${idea.trim()}"
Industry Sector: "${sector}"
Target Location / Geography: "${targetLocation.trim() || "India (Tier 1/2 Cities) & Global"}"`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
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
      setActiveTab("vc");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const toggleDoc = (schemeIdx, docIdx) => {
    const key = `${schemeIdx}-${docIdx}`;
    setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const vc = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["WORTH EXPLORING"] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: "#e8e4dc",
      padding: "0 0 80px",
    }}>
      {/* Ambient background */}
      <div className="no-print" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(0,255,135,0.05) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(96,96,255,0.05) 0%, transparent 70%)" }} />
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header className="no-print" style={{ paddingTop: 60, paddingBottom: 48, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(0,255,135,0.07)", border: "1px solid rgba(0,255,135,0.18)", borderRadius: 24, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff87", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00ff87", fontFamily: "monospace", fontWeight: 700 }}>AI Startup Intelligence & Schemes Advisor</span>
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(34px, 5.5vw, 54px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Startup Idea <span style={{ color: "#00ff87" }}>Validator</span>
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "rgba(232,228,220,0.65)", lineHeight: 1.6, maxWidth: 580, marginInline: "auto" }}>
            Instant VC-grade idea validation, location market research, tailored marketing strategies, and personalized guidance for Mudra loans & government support programs.
          </p>
        </header>

        {/* Input Form */}
        <div className="no-print" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 24, marginBottom: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#00ff87", marginBottom: 8, fontFamily: "monospace", fontWeight: 700 }}>
              1. Your Startup Idea *
            </label>
            <textarea
              ref={textareaRef}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.metaKey || e.ctrlKey) && analyze()}
              placeholder="Describe your startup concept, core product/service, and targeted problem..."
              rows={3}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "14px 16px",
                outline: "none",
                color: "#e8e4dc",
                fontSize: 16,
                lineHeight: 1.6,
                resize: "none",
                boxSizing: "border-box",
                minHeight: 90,
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "monospace" }}>
                2. Target Location / Geography
              </label>
              <input
                type="text"
                value={targetLocation}
                onChange={e => setTargetLocation(e.target.value)}
                placeholder="e.g. Mysuru, Karnataka / Tier 2 Cities"
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#e8e4dc",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "monospace" }}>
                3. Industry Sector
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(15,15,25,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#e8e4dc",
                  fontSize: 14,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {SECTORS.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>Press ⌘ / Ctrl + Enter to analyze</span>
            <button
              onClick={analyze}
              disabled={loading || !idea.trim()}
              style={{
                background: loading || !idea.trim() ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #00ff87 0%, #60cfff 100%)",
                color: loading || !idea.trim() ? "rgba(255,255,255,0.3)" : "#080810",
                border: "none",
                borderRadius: 10,
                padding: "12px 30px",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
                fontFamily: "monospace",
                transition: "all 0.2s",
                boxShadow: loading || !idea.trim() ? "none" : "0 4px 20px rgba(0,255,135,0.3)",
              }}
            >
              {loading ? "Analyzing Startup..." : "Validate Idea →"}
            </button>
          </div>
        </div>

        {/* Examples */}
        {!result && !loading && (
          <div className="no-print" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>⚡ Try sample startup ideas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(ex)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "rgba(232,228,220,0.7)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#e8e4dc"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(232,228,220,0.7)"; }}
                >
                  <span>💡 {ex}</span>
                  <span style={{ fontSize: 11, color: "#00ff87", opacity: 0.7 }}>Use →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div style={{ width: 52, height: 52, border: "3px solid rgba(0,255,135,0.15)", borderTopColor: "#00ff87", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Running AI Deep Analysis...</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>Scanning VC metrics · Regional location fit · Mudra & Govt Schemes · Marketing Strategy</p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ background: "rgba(255,79,79,0.08)", border: "1px solid rgba(255,79,79,0.25)", borderRadius: 12, padding: 20, marginBottom: 24, color: "#ff4f4f", fontSize: 14 }}>{error}</div>
        )}

        {/* Validation Results */}
        {result && (
          <div ref={resultsRef}>
            {/* Action Bar / Export & Tabs Header */}
            <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => setActiveTab("vc")}
                  style={{
                    background: activeTab === "vc" ? "#00ff87" : "transparent",
                    color: activeTab === "vc" ? "#080810" : "rgba(255,255,255,0.6)",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  📊 VC Analysis
                </button>
                <button
                  onClick={() => setActiveTab("location")}
                  style={{
                    background: activeTab === "location" ? "#60cfff" : "transparent",
                    color: activeTab === "location" ? "#080810" : "rgba(255,255,255,0.6)",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  📍 Location & Market
                </button>
                <button
                  onClick={() => setActiveTab("govt")}
                  style={{
                    background: activeTab === "govt" ? "#ffb830" : "transparent",
                    color: activeTab === "govt" ? "#080810" : "rgba(255,255,255,0.6)",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  🏛️ Mudra & Schemes
                </button>
                <button
                  onClick={() => setActiveTab("marketing")}
                  style={{
                    background: activeTab === "marketing" ? "#c87bff" : "transparent",
                    color: activeTab === "marketing" ? "#080810" : "rgba(255,255,255,0.6)",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  📣 Marketing
                </button>
              </div>

              <button
                onClick={handlePrint}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "8px 18px",
                  color: "#e8e4dc",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🖨️ Export PDF / Print Report
              </button>
            </div>

            {/* Verdict Hero Card (Visible on all views & print) */}
            <div style={{ background: vc.bg, border: `1px solid ${vc.border}`, borderRadius: 16, padding: 28, marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: 10 }}>Investment Verdict</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: vc.color, letterSpacing: "-0.01em", marginBottom: 12 }}>{result.verdict}</div>
              <div style={{ fontSize: 16, color: "rgba(232,228,220,0.8)", maxWidth: 560, marginInline: "auto", lineHeight: 1.6 }}>{result.oneLiner}</div>
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>Confidence Score</span>
                  <div style={{ width: 140, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${result.verdictScore}%`, height: "100%", background: vc.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: vc.color, fontFamily: "monospace" }}>{result.verdictScore}%</span>
                </div>
              </div>
            </div>

            {/* TAB 1: VC & Market Feasibility */}
            {(activeTab === "vc" || window.matchMedia("print").matches) && (
              <div className="tab-section">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Market Size */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Market Sizing (TAM / SAM / SOM)" accent="#60cfff">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                        {[["TAM", result.marketSize?.tam], ["SAM", result.marketSize?.sam], ["SOM", result.marketSize?.som]].map(([label, val]) => (
                          <div key={label} style={{ textAlign: "center", background: "rgba(96,207,255,0.06)", padding: "10px 6px", borderRadius: 8 }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#60cfff" }}>{val || "N/A"}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.65)", lineHeight: 1.6 }}>{result.marketSize?.insight}</p>
                    </Section>
                  </div>

                  {/* Problem Strength & Moat */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Problem Pain Score" accent="#ffb830">
                      <div style={{ marginBottom: 12 }}>
                        <ScoreBar score={result.problemStrength?.score || 0} color="#ffb830" />
                      </div>
                      <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(232,228,220,0.65)", lineHeight: 1.6 }}>{result.problemStrength?.analysis}</p>
                    </Section>

                    <Section title="Defensibility & Moat" accent="#c87bff">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <Tag label={result.moat?.type || "General"} color="#c87bff" />
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#c87bff" }}>Moat Score: {result.moat?.score}/10</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.65)", lineHeight: 1.6 }}>{result.moat?.explanation}</p>
                    </Section>
                  </div>
                </div>

                {/* Competitors */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                  <Section title="Competitor Landscape" accent="#ff6b6b">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {result.competitors?.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                              <Tag label={`${c.threat} threat`} color={THREAT_COLOR[c.threat] || "#ffb830"} />
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.6)" }}>⚡ Key Vulnerability: {c.weakness}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>

                {/* Revenue Models & GTM */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Revenue Models */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Monetization Strategy" accent="#00ff87">
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {result.revenueModels?.map((rm, i) => (
                          <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, borderLeft: `3px solid ${FIT_COLOR[rm.fit] || "#ffb830"}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{rm.model}</span>
                              <Tag label={`${rm.fit} fit`} color={FIT_COLOR[rm.fit] || "#ffb830"} />
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(232,228,220,0.6)", lineHeight: 1.5 }}>{rm.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>

                  {/* Risks */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Key Risks & Mitigations" accent="#ffb830">
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {result.risks?.map((r, i) => (
                          <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: `3px solid ${SEV_COLOR[r.severity] || "#ffb830"}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.risk}</span>
                              <Tag label={r.severity} color={SEV_COLOR[r.severity] || "#ffb830"} />
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(232,228,220,0.55)" }}>🛡️ {r.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                </div>

                {/* VC Perspective */}
                <div style={{ background: "rgba(96,207,255,0.06)", border: "1px solid rgba(96,207,255,0.18)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(96,207,255,0.6)", fontFamily: "monospace", marginBottom: 10 }}>Investor Perspective</div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "rgba(232,228,220,0.85)", fontStyle: "italic" }}>"{result.investorTake}"</p>
                </div>
              </div>
            )}

            {/* TAB 2: Location & Regional Market Intelligence */}
            {(activeTab === "location" || window.matchMedia("print").matches) && (
              <div className="tab-section">
                {/* Location Suitability Header */}
                <div style={{ background: "rgba(96,207,255,0.05)", border: "1px solid rgba(96,207,255,0.2)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#60cfff", fontFamily: "monospace", fontWeight: 700 }}>Location Feasibility Score</div>
                      <h3 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#e8e4dc" }}>Geographic & Demand Fit</h3>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 32, fontWeight: 900, color: "#60cfff", fontFamily: "monospace" }}>{result.locationAnalysis?.suitabilityScore ?? 80}/100</span>
                    </div>
                  </div>
                  <ScoreBar score={result.locationAnalysis?.suitabilityScore ?? 80} max={100} color="#60cfff" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Recommended Hubs */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Recommended Launch Regions / Hubs" accent="#60cfff">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                        {result.locationAnalysis?.recommendedRegions?.map((reg, idx) => (
                          <span key={idx} style={{ background: "rgba(96,207,255,0.12)", color: "#60cfff", border: "1px solid rgba(96,207,255,0.3)", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 700 }}>
                            📍 {reg}
                          </span>
                        ))}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.65)", lineHeight: 1.6 }}>
                        <strong>Target Demographic Fit:</strong> {result.locationAnalysis?.demographicFit}
                      </p>
                    </Section>
                  </div>

                  {/* Operational / Foot Traffic & Advantages */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Foot Traffic & Supply Chain" accent="#00ff87">
                      <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(232,228,220,0.65)", lineHeight: 1.6 }}>
                        {result.locationAnalysis?.footTrafficAndSupplyChain}
                      </p>
                    </Section>

                    <Section title="Regional Strategic Advantages" accent="#ffb830">
                      <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(232,228,220,0.7)", fontSize: 13, lineHeight: 1.6 }}>
                        {result.locationAnalysis?.regionalAdvantages?.map((adv, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{adv}</li>
                        ))}
                      </ul>
                    </Section>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Government Support Schemes & Mudra Loans */}
            {(activeTab === "govt" || window.matchMedia("print").matches) && (
              <div className="tab-section">
                {/* Mudra Loan Tiers Overview Callout */}
                <div style={{ background: "rgba(255,184,48,0.06)", border: "1px solid rgba(255,184,48,0.25)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>🏛️</span>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#ffb830" }}>Pradhan Mantri Mudra Yojana (PMMY) & Govt Support Matrix</h3>
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(232,228,220,0.7)", lineHeight: 1.6 }}>
                    Government of India financial support schemes offer collateral-free credit, capital subsidies, and seed grants to launch and scale early-stage businesses.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 11, color: "#00ff87", fontWeight: 800 }}>Mudra SHISHU</div>
                      <div style={{ fontSize: 13, fontWeight: 700, margin: "2px 0" }}>Up to ₹50,000</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Micro seed capital for micro-vendors</div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 11, color: "#60cfff", fontWeight: 800 }}>Mudra KISHORE</div>
                      <div style={{ fontSize: 13, fontWeight: 700, margin: "2px 0" }}>₹50,000 to ₹5 Lakhs</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Equipment & working capital</div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: 11, color: "#ffb830", fontWeight: 800 }}>Mudra TARUN</div>
                      <div style={{ fontSize: 13, fontWeight: 700, margin: "2px 0" }}>₹5 Lakhs to ₹10 Lakhs</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Scaling & capital machinery expansion</div>
                    </div>
                  </div>
                </div>

                {/* Applicable Schemes Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  {result.governmentSchemes?.map((scheme, sIdx) => (
                    <div key={sIdx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 22 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#e8e4dc" }}>{scheme.name}</h4>
                            <Tag label={scheme.type} color="#ffb830" />
                          </div>
                          <span style={{ fontSize: 12, color: "#00ff87", fontFamily: "monospace", fontWeight: 700 }}>💰 Max Financial Support: {scheme.maxFunding}</span>
                        </div>
                        <Tag label={scheme.eligibility} color="#00ff87" />
                      </div>

                      <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(232,228,220,0.7)", lineHeight: 1.6 }}>{scheme.summary}</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {/* Interactive Checklist */}
                        <div>
                          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: 8, fontWeight: 700 }}>
                            📋 Required Document Checklist
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {scheme.documentsRequired?.map((doc, dIdx) => {
                              const isChecked = !!checkedDocs[`${sIdx}-${dIdx}`];
                              return (
                                <label key={dIdx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: isChecked ? "#00ff87" : "rgba(232,228,220,0.65)", cursor: "pointer" }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleDoc(sIdx, dIdx)}
                                    style={{ accentColor: "#00ff87", cursor: "pointer" }}
                                  />
                                  <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{doc}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Steps */}
                        <div>
                          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: 8, fontWeight: 700 }}>
                            🚀 Application Step-by-Step
                          </div>
                          <ol style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "rgba(232,228,220,0.65)", lineHeight: 1.6 }}>
                            {scheme.applicationSteps?.map((step, stIdx) => (
                              <li key={stIdx} style={{ marginBottom: 4 }}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Marketing & Growth Strategy */}
            {(activeTab === "marketing" || window.matchMedia("print").matches) && (
              <div className="tab-section">
                {/* Messaging Hook Banner */}
                <div style={{ background: "rgba(200,123,255,0.06)", border: "1px solid rgba(200,123,255,0.25)", borderRadius: 16, padding: 22, marginBottom: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "#c87bff", fontFamily: "monospace", fontWeight: 700, marginBottom: 8 }}>Core Marketing Campaign Hook</div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#e8e4dc", fontStyle: "italic" }}>
                    "{result.marketingStrategy?.messagingHook || "Validate your startup idea before spending a rupee."}"
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {/* Persona */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Ideal Customer Persona" accent="#c87bff">
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(232,228,220,0.7)", lineHeight: 1.6 }}>
                        {result.marketingStrategy?.targetAudiencePersona}
                      </p>
                    </Section>
                  </div>

                  {/* Growth Hacks */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                    <Section title="Viral Growth Hacks" accent="#00ff87">
                      <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(232,228,220,0.7)", fontSize: 13, lineHeight: 1.6 }}>
                        {result.marketingStrategy?.growthHacks?.map((hack, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>⚡ {hack}</li>
                        ))}
                      </ul>
                    </Section>
                  </div>
                </div>

                {/* Marketing Channels Matrix */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <Section title="Acquisition Channels & Strategy" accent="#60cfff">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                      {result.marketingStrategy?.channels?.map((ch, idx) => (
                        <div key={idx} style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(96,207,255,0.15)" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#60cfff", marginBottom: 6 }}>📣 {ch.channel}</div>
                          <p style={{ margin: 0, fontSize: 12, color: "rgba(232,228,220,0.6)", lineHeight: 1.5 }}>{ch.strategy}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>

                {/* GTM Phases */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                  <Section title="Go-To-Market Roadmap" accent="#00ff87">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                      {[result.gtm?.phase1, result.gtm?.phase2, result.gtm?.phase3].map((phase, idx) => (
                        <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: 14, borderRadius: 10 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", color: "#00ff87", textTransform: "uppercase", marginBottom: 6 }}>Phase {idx + 1}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#e8e4dc" }}>{phase?.title}</div>
                          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                            {(phase?.tactics || []).map((t, j) => (
                              <li key={j} style={{ fontSize: 12, color: "rgba(232,228,220,0.6)", lineHeight: 1.6, paddingLeft: 12, position: "relative" }}>
                                <span style={{ position: "absolute", left: 0, color: "#00ff87" }}>›</span>
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              </div>
            )}

            {/* Re-analyze Footer Button */}
            <div className="no-print" style={{ textAlign: "center", marginTop: 32 }}>
              <button
                onClick={() => { setResult(null); setIdea(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 28px", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.06em" }}
              >
                ← Validate Another Startup Idea
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing: border-box; }
        textarea::placeholder, input::placeholder { color: rgba(232,228,220,0.25); }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
          .tab-section { display: block !important; page-break-after: always; }
          div { border-color: #ccc !important; background: transparent !important; color: #000000 !important; }
        }
      `}</style>
    </div>
  );
}