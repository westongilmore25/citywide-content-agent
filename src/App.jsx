import { useState } from "react";

const BRAND = {
  name: "Weston Gilmore | CityWide Home Mortgage",
  audience: "First-time and experienced homebuyers and refinancers across Colorado's Front Range — Fort Collins, Denver, and Colorado Springs",
  agents: "Colorado Front Range Realtors and real estate agents",
  tone: "strong, professional, trusted educator — a financial advisor and deal strategist, not just a lender",
  positioning: "Weston Gilmore helps buyers and real estate agents navigate the mortgage process with clarity, speed, and strategic guidance that ensures deals close smoothly.",
  cta_buyer: "DM me PRE-APPROVAL if you are thinking about buying",
  cta_agent: "Let us connect — DM me or drop a comment below",
  taglines: ["Your Colorado mortgage expert.", "Helping Colorado families get home.", "The lender agents rely on. The advisor buyers trust."]
};

const AUTHORITY_TOPICS = [
  { label: "Why deals fall apart", val: "why mortgage deals fall apart and how to prevent it" },
  { label: "What buyers don't understand", val: "what buyers don't understand about the loan process" },
  { label: "How to win offers with financing", val: "how to win a competitive offer using smart financing strategy" },
  { label: "How I help agents close faster", val: "how Weston helps agents close deals faster with less stress" },
  { label: "Behind the scenes of a mortgage", val: "what happens behind the scenes from application to closing" },
  { label: "Down payment myths debunked", val: "common myths about down payments and what Colorado buyers actually need" },
];

const PHASES = [
  { icon: "📅", label: "Days 1-30: Foundation", desc: "Fix structure, implement content categories, start consistent posting", val: "Days 1-30 foundation: implement 40/30/20/10 content mix and start consistent posting" },
  { icon: "📈", label: "Days 31-60: Growth", desc: "Increase video content, ramp up agent posts, build engagement habits", val: "Days 31-60 growth: increase video content, strengthen agent posts, build engagement habits" },
  { icon: "🚀", label: "Days 61-90: Scale", desc: "Track referrals, scale what works, deepen agent relationships", val: "Days 61-90 scale: deepen agent relationships, scale what works, increase inbound DMs" },
];

const REFINE_OPTIONS = [
  "Make it shorter and punchier","Make it longer with more detail","Add a strong DM call-to-action",
  "Rewrite as a trusted financial advisor not just a lender","Rewrite targeting Realtors as the audience",
  "Add Colorado Front Range local references","Add relevant real estate hashtags","Rewrite with a story-based hook",
  "Optimize for Instagram with emojis and line breaks","Optimize for Facebook with a warmer conversational feel",
  "Simplify like an educator explaining something complex",
];


const C = {
  bg:"#0a0f1a", surface:"#111827", surfaceHov:"#1a2236", border:"#2a3550", borderBright:"#3d5080",
  white:"#ffffff", offwhite:"#e8edf5", muted:"#7a8fb0",
  gold:"#f0b429", goldDark:"#c9901a", goldBg:"rgba(240,180,41,0.12)", goldBorder:"rgba(240,180,41,0.45)",
  green:"#22d3a0", greenBg:"rgba(34,211,160,0.12)", greenBorder:"rgba(34,211,160,0.4)",
  purple:"#a78bfa", purpleBg:"rgba(167,139,250,0.12)", purpleBorder:"rgba(167,139,250,0.4)",
  insta:"#f06a8a", instaBg:"rgba(240,106,138,0.12)", instaBorder:"rgba(240,106,138,0.4)",
  fb:"#60a5fa", fbBg:"rgba(96,165,250,0.12)", fbBorder:"rgba(96,165,250,0.4)",
  deal:"#fb923c", dealBg:"rgba(251,146,60,0.12)", dealBorder:"rgba(251,146,60,0.4)",
  personal:"#f472b6", personalBg:"rgba(244,114,182,0.12)", personalBorder:"rgba(244,114,182,0.4)",
  red:"#f87171", redBg:"rgba(248,113,113,0.1)", redBorder:"rgba(248,113,113,0.3)",
};

const audienceType = (t) => t?.includes("buyer")?"buyer":t?.includes("agent")?"agent":t?.includes("deal")?"deal":"personal";
const audienceLabel = (ac) => ({buyer:"Buyer Education",agent:"Agent-Focused",deal:"Deal Story",personal:"Personal"})[ac]||"Post";
const audienceBadge = (ac) => ({
  buyer:{bg:C.greenBg,border:C.greenBorder,text:C.green},
  agent:{bg:C.purpleBg,border:C.purpleBorder,text:C.purple},
  deal:{bg:C.dealBg,border:C.dealBorder,text:C.deal},
  personal:{bg:C.personalBg,border:C.personalBorder,text:C.personal},
})[ac]||{bg:C.goldBg,border:C.goldBorder,text:C.gold};

// Ultra-robust JSON extractor — tries every possible strategy
function extractJSON(raw) {
  if (!raw || !raw.trim()) throw new Error("Empty response from API");
  
  // Clean up the raw text
  const cleaned = raw
    .replace(/^[\s\S]*?(?=\{|\[)/, '') // strip everything before first { or [
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Strategy 1: direct parse of cleaned
  try { const r = JSON.parse(cleaned); if (r) return r; } catch {}
  
  // Strategy 2: direct parse of raw
  try { const r = JSON.parse(raw.trim()); if (r) return r; } catch {}

  // Strategy 3: find outermost { }
  const o1 = cleaned.indexOf("{"), o2 = cleaned.lastIndexOf("}");
  if (o1 !== -1 && o2 > o1) {
    try { const r = JSON.parse(cleaned.slice(o1, o2 + 1)); if (r) return r; } catch {}
  }

  // Strategy 4: find outermost [ ]
  const a1 = cleaned.indexOf("["), a2 = cleaned.lastIndexOf("]");
  if (a1 !== -1 && a2 > a1) {
    try { return { posts: JSON.parse(cleaned.slice(a1, a2 + 1)) }; } catch {}
  }

  // Strategy 5: regex extract all JSON objects
  const matches = cleaned.match(/\{[\s\S]*?\}/g);
  if (matches) {
    const objects = matches.map(m => { try { return JSON.parse(m); } catch { return null; } }).filter(Boolean);
    if (objects.length > 0) return { posts: objects };
  }

  // Strategy 6: try to find posts array specifically
  const postsMatch = cleaned.match(/"posts"\s*:\s*(\[[\s\S]*?\])/);
  if (postsMatch) {
    try { return { posts: JSON.parse(postsMatch[1]) }; } catch {}
  }

  console.error("All parse strategies failed. Raw response:", raw);
  throw new Error("Could not parse response. Please try again.");
}

function useKeys() {
  const stored = () => { try { return JSON.parse(localStorage.getItem("cw_keys") || "{}"); } catch { return {}; } };
  const [anthropicKey, setAKState] = useState(stored().anthropic || "");
  const setAnthropicKey = (k) => { setAKState(k); try { localStorage.setItem("cw_keys", JSON.stringify({ anthropic: k })); } catch {} };
  return { anthropicKey, setAnthropicKey };
}

async function callClaude(apiKey, messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", // haiku is faster and cheaper, still excellent
      max_tokens: 2000,
      system: systemPrompt,
      messages
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "API error");
  const text = (data.content || []).map(b => b.text || "").join("").trim();
  if (!text) throw new Error("Empty response from API");
  return extractJSON(text);
}

function buildImagePrompt(post) {
  const type = post.type || "buyer-education";
  const topic = (post.topic || "mortgage tip").slice(0, 60);

  const prompts = {
    "buyer-education": `Clean informational infographic about "${topic}". Simple icons, minimal text, white background, navy and gold accents. No people.`,
    "agent-focused": `Simple professional graphic about "${topic}" for real estate agents. Clean layout, minimal icons, navy and gold color scheme. No people.`,
    "deal-story": `Clean celebratory graphic about "${topic}". Simple checkmark or key icon, minimal design, navy and gold. No people.`,
    "personal": `Simple motivational graphic about "${topic}". Clean minimal design, Colorado mountain icon, navy and gold. No people.`,
  };

  return prompts[type] || prompts["buyer-education"];
}

function ImagePromptPanel({ post }) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const prompt = buildImagePrompt(post);

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={copyPrompt} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", background: C.goldBg, border: `1px solid ${C.goldBorder}`, color: C.gold, fontFamily: "inherit" }}>
          {copied ? "✓ Prompt Copied!" : "🎨 Copy Image Prompt for Nano Banana 2"}
        </button>
        <button onClick={() => setShowPrompt(!showPrompt)} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontFamily: "inherit" }}>
          {showPrompt ? "Hide" : "Preview"}
        </button>
      </div>
      {showPrompt && (
        <div style={{ marginTop: 10, background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Nano Banana 2 Prompt</div>
          {prompt}
        </div>
      )}
      <a href="https://fal.ai/models/fal-ai/nano-banana-2" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8, fontSize: 12, color: C.muted, textDecoration: "none" }}>
        Open fal.ai Nano Banana 2 ↗
      </a>
    </div>
  );
}

function makeSystem() {
  return `You are a social media copywriter for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. Audience: ${BRAND.audience}. Also targeting: ${BRAND.agents}. Content mix: 40% buyer education, 30% agent-focused, 20% deal stories, 10% personal. Buyer CTA: "${BRAND.cta_buyer}". Agent CTA: "${BRAND.cta_agent}". Sign-offs: ${BRAND.taglines.join(" | ")}.

YOU MUST respond with ONLY a valid JSON object. Your entire response must be parseable JSON. Start with { and end with }. No text before or after. No markdown. No explanation. Example format:
{"posts":[{"platform":"Instagram","content":"post text here","topic":"short topic","type":"buyer-education"}]}`;
}

function Spinner({ msg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 20px", gap: 14 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.goldBg}`, borderTopColor: C.gold, borderRadius: "50%", animation: "cwspin 0.8s linear infinite" }} />
      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{msg || "Generating..."}</p>
      <style>{`@keyframes cwspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}


function PostCard({ post, id, onSave, saved }) {
  const [copied, setCopied] = useState(false);
  const isInsta = post.platform === "Instagram";
  const ac = audienceType(post.type);
  const col = audienceBadge(ac);
  const copy = () => { navigator.clipboard.writeText(post.content || "").catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 6, background: isInsta ? C.instaBg : C.fbBg, color: isInsta ? C.insta : C.fb, border: `1px solid ${isInsta ? C.instaBorder : C.fbBorder}` }}>{isInsta ? "📸" : "👥"} {post.platform}</span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 6, background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>{audienceLabel(ac)}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onSave(post)} disabled={saved} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: saved ? "default" : "pointer", background: "transparent", border: `1px solid ${C.goldBorder}`, color: saved ? C.green : C.gold, fontFamily: "inherit" }}>{saved ? "✅ Saved" : "🔖 Save"}</button>
          <button onClick={copy} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: C.surfaceHov, border: `1px solid ${C.borderBright}`, color: C.white, fontFamily: "inherit" }}>{copied ? "✓ Copied!" : "📋 Copy"}</button>
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: C.white, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>{post.content}</div>
      {post.topic && <div style={{ marginTop: 8, fontSize: 12, color: C.muted, fontWeight: 600 }}>📌 {post.topic}</div>}
      <ImagePromptPanel post={post} />
    </div>
  );
}

function SettingsPanel({ anthropicKey, setAnthropicKey, onClose }) {
  const [ak, setAk] = useState(anthropicKey);
  const save = () => { setAnthropicKey(ak); onClose(); };
  const inp = { width: "100%", background: "#0f1825", border: `1px solid ${C.borderBright}`, borderRadius: 10, padding: "12px 14px", color: C.white, fontFamily: "inherit", fontSize: 14, outline: "none", marginBottom: 6, boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, maxWidth: 480, width: "100%" }}>
        <div style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 6 }}>⚙️ API Keys</div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 22, lineHeight: 1.6 }}>Your keys are saved in your browser only — never sent anywhere else.</p>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Anthropic API Key</label>
        <input value={ak} onChange={e => setAk(e.target.value)} placeholder="sk-ant-..." type="password" style={inp} />
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 22 }}>Get your key at <a href="https://console.anthropic.com" target="_blank" style={{ color: C.gold }}>console.anthropic.com</a></p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} style={{ flex: 1, padding: 12, borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, color: "#0a0f1a" }}>Save keys</button>
          <button onClick={onClose} style={{ padding: "12px 18px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "transparent", border: `1px solid ${C.border}`, color: C.muted }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { anthropicKey, setAnthropicKey } = useKeys();
  const [showSettings, setShowSettings] = useState(!anthropicKey);
  const [tab, setTab] = useState("batch");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  const [platforms, setPlatforms] = useState(new Set(["Instagram", "Facebook"]));
  const [buyerThemes, setBuyerThemes] = useState(new Set(["tips", "unknown"]));
  const [agentThemes, setAgentThemes] = useState(new Set(["deals", "help"]));
  const [dealThemes, setDealThemes] = useState(new Set(["wins"]));
  const [personalThemes, setPersonalThemes] = useState(new Set());
  const [authorityTopic, setAuthorityTopic] = useState("");
  const [postCount, setPostCount] = useState(5);
  const [batchPosts, setBatchPosts] = useState([]);

  const [calStart, setCalStart] = useState(new Date().toISOString().split("T")[0]);
  const [calWeeks, setCalWeeks] = useState("1");
  const [phase, setPhase] = useState(0);
  const [calPosts, setCalPosts] = useState([]);

  const [agentAngles, setAgentAngles] = useState(new Set(["deals", "help"]));
  const [agentPlatform, setAgentPlatform] = useState("Facebook");
  const [agentCount, setAgentCount] = useState(3);
  const [agentPosts, setAgentPosts] = useState([]);

  const [refineInput, setRefineInput] = useState("");
  const [refineInstr, setRefineInstr] = useState("");
  const [refineResult, setRefineResult] = useState(null);

  const toggleSet = (set, setFn, val, min = 0) => { const n = new Set(set); if (n.has(val)) { if (n.size > min) n.delete(val); } else n.add(val); setFn(n); };
  const savePost = (post, id) => { if (savedIds.has(id)) return; setSavedIds(p => new Set([...p, id])); setSavedPosts(p => [...p, { ...post }]); };
  const run = async (fn) => { setLoading(true); setError(""); try { await fn(); } catch (e) { setError(e.message || "Something went wrong. Please try again."); } setLoading(false); setLoadMsg(""); };

  const getThemeList = () => {
    const items = [];
    const bmap = { tips: "mortgage tips, down payments, pre-approval, credit scores for Colorado homebuyers", first: "first-time homebuyer programs and myths in Colorado", unknown: "what buyers dont understand about loans simplified", rates: "current Colorado interest rates and buying power" };
    const amap = { deals: "why deals fall apart and how Weston prevents it for Realtors", help: "how Weston helps agents close faster on the Front Range", win: "how to win offers with smart financing strategy" };
    const dmap = { wins: "client success stories and homeownership wins in Colorado", behind: "behind the scenes of how a mortgage deal closes" };
    const pmap = { why: "Westons values and mission as a Colorado mortgage advisor", co: "Colorado lifestyle and Front Range community connection" };
    buyerThemes.forEach(k => bmap[k] && items.push("buyer education: " + bmap[k]));
    agentThemes.forEach(k => amap[k] && items.push("agent-focused: " + amap[k]));
    dealThemes.forEach(k => dmap[k] && items.push("deal story: " + dmap[k]));
    personalThemes.forEach(k => pmap[k] && items.push("personal: " + pmap[k]));
    return items;
  };

  const getAgentAngleList = () => {
    const amap = { deals: "why deals get delayed and how Weston prevents it", help: "how Weston helps agents close faster", behind: "what Weston handles behind the scenes", partner: "invitation to partner or refer clients to Weston", buyertips: "financing tips agents can share with buyers" };
    return [...agentAngles].map(k => amap[k]).filter(Boolean);
  };

  const generateBatch = () => run(async () => {
    if (!anthropicKey) throw new Error("Please add your Anthropic API key in Settings first.");
    setBatchPosts([]); setLoadMsg("Writing your posts...");
    const themes = getThemeList();
    if (!themes.length) throw new Error("Please select at least one content theme.");
    const platList = [...platforms].join(" and ");
    const result = await callClaude(anthropicKey, [{ role: "user", content: `Generate exactly ${postCount} social media posts following the 40/30/20/10 content mix. Alternate between platforms: ${platList}. Content themes: ${themes.join("; ")}. ${authorityTopic ? "Priority authority topic: " + authorityTopic + "." : ""} Each post needs emojis, line breaks, hashtags, and a CTA. Return JSON object with posts array. Each post object needs: platform, content, topic (3-5 words), type (buyer-education OR agent-focused OR deal-story OR personal).` }], makeSystem());
    const posts = result?.posts || (Array.isArray(result) ? result : []);
    if (!posts.length) throw new Error("No posts returned. Please try again.");
    setBatchPosts(posts);
  });

  const generateCalendar = () => run(async () => {
    if (!anthropicKey) throw new Error("Please add your Anthropic API key in Settings first.");
    setCalPosts([]); setLoadMsg("Building your calendar...");
    const result = await callClaude(anthropicKey, [{ role: "user", content: `Create a ${calWeeks}-week social media content calendar starting on ${calStart}. Phase context: ${PHASES[phase].val}. Schedule Facebook posts 2-3 times per week for relationship building. Schedule Instagram posts 3-4 times per week for discovery and authority content. Follow the 40/30/20/10 content mix throughout. Each post needs emojis, line breaks, hashtags, and a CTA. Return JSON object with posts array. Each post object needs: date (YYYY-MM-DD), platform (Instagram or Facebook), content (full post text), topic (3-5 words), type (buyer-education OR agent-focused OR deal-story OR personal).` }],
      `You are a content strategist for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. Audience: ${BRAND.audience}. Also targeting: ${BRAND.agents}. Content mix: 40% buyer education, 30% agent-focused, 20% deal stories, 10% personal. Buyer CTA: "${BRAND.cta_buyer}". Agent CTA: "${BRAND.cta_agent}".

YOU MUST respond with ONLY a valid JSON object. Your entire response must be parseable JSON. Start with { and end with }. No text before or after. No markdown. No explanation. Example format:
{"posts":[{"date":"2026-04-09","platform":"Instagram","content":"post text","topic":"short topic","type":"buyer-education"}]}`
    );
    const posts = result?.posts || (Array.isArray(result) ? result : []);
    if (!posts.length) throw new Error("No posts returned. Please try again.");
    setCalPosts(posts);
  });

  const generateAgent = () => run(async () => {
    if (!anthropicKey) throw new Error("Please add your Anthropic API key in Settings first.");
    setAgentPosts([]); setLoadMsg("Writing agent posts...");
    const angles = getAgentAngleList();
    if (!angles.length) throw new Error("Please select at least one content angle.");
    const result = await callClaude(anthropicKey, [{ role: "user", content: `Generate exactly ${agentCount} agent-focused posts for ${agentPlatform}. Content angles: ${angles.join("; ")}. Each post needs emojis, hashtags, and a CTA. Return JSON object with posts array. Each post object needs: platform (${agentPlatform}), content (full post text), topic (3-5 words), type (agent-focused).` }],
      `You are a social media strategist for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. These posts target Colorado Front Range Realtors. Goal: make Weston the lender agents call first. Write peer-to-peer — credible and helpful, never salesy. CTA: "${BRAND.cta_agent}".

YOU MUST respond with ONLY a valid JSON object. Start with { end with }. No markdown. No explanation.
Example: {"posts":[{"platform":"Facebook","content":"post text","topic":"short topic","type":"agent-focused"}]}`
    );
    const posts = result?.posts || (Array.isArray(result) ? result : []);
    if (!posts.length) throw new Error("No posts returned. Please try again.");
    setAgentPosts(posts);
  });

  const refinePost = () => run(async () => {
    if (!anthropicKey) throw new Error("Please add your Anthropic API key in Settings first.");
    if (!refineInput.trim()) throw new Error("Please paste a post to refine.");
    if (!refineInstr.trim()) throw new Error("Please add an instruction or pick a quick option.");
    setRefineResult(null); setLoadMsg("Refining your post...");
    const safeInput = refineInput.replace(/"/g, "'").replace(/\n/g, " ").slice(0, 800);
    const result = await callClaude(anthropicKey, [{ role: "user", content: `Refine this social media post: "${safeInput}". Instruction: ${refineInstr}. Return JSON object with posts array containing one post object with: content (refined post text), platform (Instagram or Facebook), topic (3-5 words), type (buyer-education OR agent-focused OR deal-story OR personal), changes (one sentence describing what changed).` }],
      `You are a copywriter for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}.

YOU MUST respond with ONLY a valid JSON object. Start with { end with }. No markdown. No explanation.
Example: {"posts":[{"content":"refined post","platform":"Instagram","topic":"short topic","type":"buyer-education","changes":"Made it shorter and added CTA"}]}`
    );
    const posts = result?.posts || (Array.isArray(result) ? result : []);
    if (!posts.length) throw new Error("Could not refine. Please try again.");
    setRefineResult(posts[0]);
  });

  const calGrouped = {};
  calPosts.forEach(p => { if (!calGrouped[p.date]) calGrouped[p.date] = []; calGrouped[p.date].push(p); });

  const S = {
    app: { fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: C.bg, color: C.white, minHeight: "100vh", paddingBottom: 48 },
    wrap: { maxWidth: 860, margin: "0 auto", padding: "24px 18px" },
    card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, marginBottom: 18 },
    lbl: { display: "block", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 },
    inp: { width: "100%", background: "#0f1825", border: `1px solid ${C.borderBright}`, borderRadius: 10, padding: "12px 14px", color: C.white, fontFamily: "inherit", fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" },
    btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 22px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", width: "100%", background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, color: "#0a0f1a", marginTop: 4 },
    h2: { fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 14 },
    sh: { fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 14 },
  };

  const Chip = ({ label, active, onClick, bg, border, text }) => (
    <button onClick={onClick} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${active ? border : C.border}`, background: active ? bg : "transparent", color: active ? text : C.muted, marginRight: 6, marginBottom: 8, fontFamily: "inherit", transition: "all 0.15s" }}>{label}</button>
  );

  const buyerC = { bg: C.greenBg, border: C.greenBorder, text: C.green };
  const agentC = { bg: C.purpleBg, border: C.purpleBorder, text: C.purple };
  const dealC = { bg: C.dealBg, border: C.dealBorder, text: C.deal };
  const persC = { bg: C.personalBg, border: C.personalBorder, text: C.personal };
  const instaC = { bg: C.instaBg, border: C.instaBorder, text: C.insta };
  const fbC = { bg: C.fbBg, border: C.fbBorder, text: C.fb };

  const TABS = [{ id: "batch", label: "⚡ Batch" }, { id: "agent", label: "🤝 Agent Content" }, { id: "calendar", label: "📅 Calendar" }, { id: "refine", label: "✏️ Refine" }, { id: "saved", label: `📋 Saved (${savedPosts.length})` }];

  const rp = (posts, prefix) => posts.map((p, i) => <PostCard key={i} post={p} id={`${prefix}${i}`} onSave={post => savePost(post, `${prefix}${i}`)} saved={savedIds.has(`${prefix}${i}`)} />);

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {showSettings && <SettingsPanel anthropicKey={anthropicKey} setAnthropicKey={setAnthropicKey} onClose={() => setShowSettings(false)} />}
      <div style={S.wrap}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏡</div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: C.white }}>CityWide Content Agent</div>
              <div style={{ fontSize: 12, color: C.gold, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>Weston Gilmore · Colorado Front Range</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: C.goldBg, border: `1px solid ${C.goldBorder}`, color: C.gold, borderRadius: 20, padding: "5px 12px" }}>📋 Audit Applied</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: anthropicKey ? C.greenBg : C.redBg, border: `1px solid ${anthropicKey ? C.greenBorder : C.redBorder}`, color: anthropicKey ? C.green : C.red, borderRadius: 20, padding: "5px 12px" }}>{anthropicKey ? "● Connected" : "● No API Key"}</span>
            <button onClick={() => setShowSettings(true)} style={{ fontSize: 11, fontWeight: 700, background: C.surface, border: `1px solid ${C.borderBright}`, color: C.white, borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>⚙️ Settings</button>
          </div>
        </div>

        {!anthropicKey && <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}><span style={{ fontSize: 20 }}>🔑</span><div><div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 3 }}>API key required</div><div style={{ fontSize: 13, color: C.offwhite }}>Click <b style={{ color: C.white }}>⚙️ Settings</b> above to add your Anthropic API key to get started.</div></div></div>}

        <div style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📊</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: C.purple, marginBottom: 3 }}>Credibility Report Applied — Julietta Voronkov</div><div style={{ fontSize: 13, color: C.offwhite, lineHeight: 1.6 }}>Mix: <b style={{ color: C.white }}>40% buyer · 30% agent · 20% deal · 10% personal</b> — The lender agents rely on and buyers trust.</div></div>
        </div>

        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 22, overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, minWidth: "max-content", padding: "10px 14px", border: "none", background: tab === t.id ? "#1a2a45" : "transparent", color: tab === t.id ? C.gold : C.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 700, borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>{t.label}</button>)}
        </div>

        {error && <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 10, padding: "13px 16px", color: C.red, fontSize: 13, marginBottom: 16, lineHeight: 1.5, fontWeight: 600 }}>⚠️ {error}</div>}

        {tab === "batch" && (
          <div>
            <div style={S.card}>
              <div style={S.h2}>📊 Audit content mix</div>
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 10, marginBottom: 12 }}>
                {[["40%", C.green], ["30%", C.purple], ["20%", C.deal], ["10%", C.personal]].map(([w, c]) => <div key={c} style={{ width: w, background: c }} />)}
              </div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 16 }}>
                {[[C.green, "40% Buyer"], [C.purple, "30% Agent"], [C.deal, "20% Deal"], [C.personal, "10% Personal"]].map(([c, l]) => <span key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.offwhite }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: c, flexShrink: 0 }} />{l}</span>)}
              </div>
              <span style={S.lbl}>Platforms</span>
              <div>
                <Chip label="📸 Instagram" active={platforms.has("Instagram")} onClick={() => toggleSet(platforms, setPlatforms, "Instagram", 1)} {...instaC} />
                <Chip label="👥 Facebook" active={platforms.has("Facebook")} onClick={() => toggleSet(platforms, setPlatforms, "Facebook", 1)} {...fbC} />
              </div>
            </div>
            <div style={S.card}>
              <div style={S.h2}>🎯 Content themes</div>
              <span style={S.lbl}>Buyer Education (40%)</span>
              <div>
                <Chip label="💡 Mortgage Tips" active={buyerThemes.has("tips")} onClick={() => toggleSet(buyerThemes, setBuyerThemes, "tips")} {...buyerC} />
                <Chip label="🔑 First-Time Buyers" active={buyerThemes.has("first")} onClick={() => toggleSet(buyerThemes, setBuyerThemes, "first")} {...buyerC} />
                <Chip label="❓ What Buyers Don't Know" active={buyerThemes.has("unknown")} onClick={() => toggleSet(buyerThemes, setBuyerThemes, "unknown")} {...buyerC} />
                <Chip label="📊 Rate Updates" active={buyerThemes.has("rates")} onClick={() => toggleSet(buyerThemes, setBuyerThemes, "rates")} {...buyerC} />
              </div>
              <span style={S.lbl}>Agent-Focused (30%)</span>
              <div>
                <Chip label="⚠️ Why Deals Fall Apart" active={agentThemes.has("deals")} onClick={() => toggleSet(agentThemes, setAgentThemes, "deals")} {...agentC} />
                <Chip label="🤝 How I Help Agents" active={agentThemes.has("help")} onClick={() => toggleSet(agentThemes, setAgentThemes, "help")} {...agentC} />
                <Chip label="🏆 Win With Financing" active={agentThemes.has("win")} onClick={() => toggleSet(agentThemes, setAgentThemes, "win")} {...agentC} />
              </div>
              <span style={S.lbl}>Deal Stories (20%)</span>
              <div>
                <Chip label="🎉 Client Wins" active={dealThemes.has("wins")} onClick={() => toggleSet(dealThemes, setDealThemes, "wins")} {...dealC} />
                <Chip label="🔍 Behind the Scenes" active={dealThemes.has("behind")} onClick={() => toggleSet(dealThemes, setDealThemes, "behind")} {...dealC} />
              </div>
              <span style={S.lbl}>Personal (10%)</span>
              <div>
                <Chip label="❤️ My Why" active={personalThemes.has("why")} onClick={() => toggleSet(personalThemes, setPersonalThemes, "why")} {...persC} />
                <Chip label="🏔️ Colorado Life" active={personalThemes.has("co")} onClick={() => toggleSet(personalThemes, setPersonalThemes, "co")} {...persC} />
              </div>
              <span style={{ ...S.lbl, marginTop: 8 }}>Authority topics — tap to focus</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {AUTHORITY_TOPICS.map(t => <button key={t.val} onClick={() => setAuthorityTopic(authorityTopic === t.val ? "" : t.val)} style={{ background: authorityTopic === t.val ? C.goldBg : "rgba(255,255,255,0.03)", border: `1px solid ${authorityTopic === t.val ? C.gold : C.border}`, borderRadius: 10, padding: "11px 14px", textAlign: "left", cursor: "pointer", color: authorityTopic === t.val ? C.gold : C.offwhite, fontFamily: "inherit", fontSize: 13, fontWeight: authorityTopic === t.val ? 700 : 500, lineHeight: 1.4 }}>{t.label}</button>)}
              </div>
              <span style={S.lbl}>Number of posts: {postCount}</span>
              <input type="range" min={2} max={10} value={postCount} onChange={e => setPostCount(Number(e.target.value))} style={{ width: "100%", marginBottom: 18, accentColor: C.gold }} />
              <button onClick={generateBatch} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.5 : 1 }}>✨ Generate posts</button>
            </div>
            {loading && <Spinner msg={loadMsg} />}
            {batchPosts.length > 0 && <><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={S.sh}>Generated posts</div><span style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, padding: "4px 12px", borderRadius: 20 }}>{batchPosts.length} posts</span></div>{rp(batchPosts, "b")}</>}
          </div>
        )}

        {tab === "agent" && (
          <div>
            <div style={{ ...S.card, borderColor: C.purpleBorder }}>
              <div style={{ ...S.h2, color: C.purple }}>🤝 Agent referral content</div>
              <p style={{ fontSize: 13, color: C.offwhite, marginBottom: 18, lineHeight: 1.7 }}>Your biggest growth opportunity per the audit. Written peer-to-peer for Realtors — credible and helpful, never salesy.</p>
              <span style={S.lbl}>Content angle</span>
              <div>
                <Chip label="⚠️ Why Deals Fail" active={agentAngles.has("deals")} onClick={() => toggleSet(agentAngles, setAgentAngles, "deals")} {...agentC} />
                <Chip label="⚡ I Help You Close" active={agentAngles.has("help")} onClick={() => toggleSet(agentAngles, setAgentAngles, "help")} {...agentC} />
                <Chip label="🔍 What I Handle" active={agentAngles.has("behind")} onClick={() => toggleSet(agentAngles, setAgentAngles, "behind")} {...agentC} />
                <Chip label="🤝 Partner With Me" active={agentAngles.has("partner")} onClick={() => toggleSet(agentAngles, setAgentAngles, "partner")} {...agentC} />
                <Chip label="🏆 Tips for Your Buyers" active={agentAngles.has("buyertips")} onClick={() => toggleSet(agentAngles, setAgentAngles, "buyertips")} {...agentC} />
              </div>
              <span style={S.lbl}>Platform</span>
              <div>
                <Chip label="👥 Facebook (primary)" active={agentPlatform === "Facebook"} onClick={() => setAgentPlatform("Facebook")} {...fbC} />
                <Chip label="📸 Instagram" active={agentPlatform === "Instagram"} onClick={() => setAgentPlatform("Instagram")} {...instaC} />
              </div>
              <span style={S.lbl}>Number of posts: {agentCount}</span>
              <input type="range" min={1} max={6} value={agentCount} onChange={e => setAgentCount(Number(e.target.value))} style={{ width: "100%", marginBottom: 18, accentColor: C.gold }} />
              <button onClick={generateAgent} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.5 : 1 }}>🤝 Generate agent posts</button>
            </div>
            {loading && <Spinner msg={loadMsg} />}
            {rp(agentPosts, "a")}
          </div>
        )}

        {tab === "calendar" && (
          <div>
            <div style={S.card}>
              <div style={S.h2}>📅 Content calendar</div>
              <p style={{ fontSize: 13, color: C.offwhite, marginBottom: 16, lineHeight: 1.7 }}>Per the audit: <b style={{ color: C.white }}>Facebook 2-3x/week</b> for relationships. <b style={{ color: C.white }}>Instagram 3-4x/week</b> for discovery.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div><span style={S.lbl}>Start date</span><input type="date" value={calStart} onChange={e => setCalStart(e.target.value)} style={S.inp} /></div>
                <div><span style={S.lbl}>Weeks to plan</span><select value={calWeeks} onChange={e => setCalWeeks(e.target.value)} style={{ ...S.inp, background: "#0f1825" }}><option value="1">1 week</option><option value="2">2 weeks</option><option value="4">4 weeks</option></select></div>
              </div>
              <span style={S.lbl}>30/60/90 day phase</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {PHASES.map((p, i) => <button key={i} onClick={() => setPhase(i)} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderRadius: 12, border: `2px solid ${phase === i ? C.gold : C.border}`, background: phase === i ? C.goldBg : "rgba(255,255,255,0.02)", color: phase === i ? C.gold : C.offwhite, fontFamily: "inherit", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s" }}><span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span><span><span style={{ fontWeight: 700, display: "block", marginBottom: 2, fontSize: 14, color: phase === i ? C.gold : C.white }}>{p.label}</span><span style={{ fontSize: 12, color: phase === i ? C.gold : C.muted }}>{p.desc}</span></span></button>)}
              </div>
              <button onClick={generateCalendar} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.5 : 1 }}>📅 Build my calendar</button>
            </div>
            {loading && <Spinner msg={loadMsg} />}
            {Object.keys(calGrouped).length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={S.sh}>{calWeeks}-Week calendar</div><span style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, padding: "4px 12px", borderRadius: 20 }}>{calPosts.length} posts</span></div>
                {Object.entries(calGrouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, posts]) => {
                  const d = new Date(date + "T12:00:00");
                  const lbl = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                  return <div key={date}><div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, margin: "18px 0 10px", paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>{lbl}</div>{posts.map((p, i) => <PostCard key={i} post={p} id={`c${date}${i}`} onSave={post => savePost(post, `c${date}${i}`)} saved={savedIds.has(`c${date}${i}`)} />)}</div>;
                })}
              </div>
            )}
          </div>
        )}

        {tab === "refine" && (
          <div>
            <div style={S.card}>
              <div style={S.h2}>✏️ Refine or rewrite a post</div>
              <span style={S.lbl}>Paste your post</span>
              <textarea value={refineInput} onChange={e => setRefineInput(e.target.value)} placeholder="Paste any post here..." style={{ ...S.inp, minHeight: 120, resize: "vertical" }} />
              <span style={S.lbl}>Quick instructions</span>
              <div style={{ marginBottom: 14 }}>
                {REFINE_OPTIONS.map(c => <button key={c} onClick={() => setRefineInstr(c)} style={{ padding: "6px 13px", borderRadius: 16, fontSize: 12, cursor: "pointer", border: `1px solid ${refineInstr === c ? C.goldBorder : C.border}`, background: refineInstr === c ? C.goldBg : "transparent", color: refineInstr === c ? C.gold : C.offwhite, marginRight: 6, marginBottom: 8, fontFamily: "inherit", fontWeight: refineInstr === c ? 700 : 500 }}>{c}</button>)}
              </div>
              <span style={S.lbl}>Custom instruction</span>
              <input value={refineInstr} onChange={e => setRefineInstr(e.target.value)} placeholder="e.g. Add a Colorado housing market stat" style={S.inp} />
              <button onClick={refinePost} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.5 : 1 }}>✨ Refine this post</button>
            </div>
            {loading && <Spinner msg={loadMsg} />}
            {refineResult && (
              <div>
                <div style={{ ...S.sh, marginBottom: 12 }}>Refined post</div>
                <div style={{ ...S.card, borderColor: C.goldBorder }}>
                  {refineResult.changes && <><div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: C.gold, marginBottom: 6, letterSpacing: "0.08em" }}>✨ What changed</div><p style={{ fontSize: 13, color: C.offwhite, marginBottom: 16, lineHeight: 1.6 }}>{refineResult.changes}</p></>}
                  <PostCard post={refineResult} id="r0" onSave={post => savePost(post, "r0")} saved={savedIds.has("r0")} />
                  <button onClick={() => { setRefineInput(refineResult.content || ""); setRefineResult(null); setRefineInstr(""); }} style={{ width: "100%", padding: "11px 22px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "transparent", border: `1px solid ${C.goldBorder}`, color: C.gold, marginTop: 8 }}>🔄 Refine again</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "saved" && (
          savedPosts.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}><div style={{ fontSize: 44, marginBottom: 16, opacity: 0.4 }}>📋</div><div style={{ fontSize: 18, marginBottom: 8, color: C.white, fontWeight: 700 }}>No saved posts yet</div><div style={{ fontSize: 14, color: C.muted }}>Generate posts and click 🔖 to save them here.</div></div>
            : <div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div style={S.sh}>Saved posts</div><span style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, padding: "4px 12px", borderRadius: 20 }}>{savedPosts.length} saved</span></div>{rp(savedPosts, "s")}</div>
        )}
      </div>
    </div>
  );
}

