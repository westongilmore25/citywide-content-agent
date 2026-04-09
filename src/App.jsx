import { useState } from "react";

const ANTHROPIC_KEY_PLACEHOLDER = "YOUR_ANTHROPIC_API_KEY";
const FAL_KEY_PLACEHOLDER = "YOUR_FAL_API_KEY";

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

const IMAGE_PROMPTS = {
  "buyer-education": "Professional lifestyle photography, young couple reviewing mortgage documents at a bright modern desk, warm Colorado mountain light through large windows, confident smiling expressions, soft bokeh background, aspirational homeownership mood, photorealistic, no text, no words",
  "agent-focused": "Two confident real estate professionals shaking hands in a modern Colorado office, natural light, trust and partnership atmosphere, clean minimal background, professional business setting, photorealistic, no text, no words",
  "deal-story": "Joyful young family standing in front of a beautiful Colorado home holding house keys, warm golden hour sunlight, Rocky Mountain peaks visible in background, celebratory mood, photorealistic, no text, no words",
  "personal": "Confident professional mortgage advisor standing outdoors with Colorado Rocky Mountain skyline, warm natural light, approachable and trustworthy expression, lifestyle photography, photorealistic, no text, no words",
};

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

function extractJSON(raw) {
  try { return JSON.parse(raw.trim()); } catch {}
  const s = raw.replace(/```json/gi,"").replace(/```/g,"").trim();
  try { return JSON.parse(s); } catch {}
  const o1=s.indexOf("{"),o2=s.lastIndexOf("}");
  if(o1!==-1&&o2>o1){try{return JSON.parse(s.slice(o1,o2+1));}catch{}}
  const a1=s.indexOf("["),a2=s.lastIndexOf("]");
  if(a1!==-1&&a2>a1){try{return {posts:JSON.parse(s.slice(a1,a2+1))};}catch{}}
  throw new Error("Could not parse response. Please try again.");
}

function useKeys() {
  const stored = localStorage.getItem("cw_keys");
  const parsed = stored ? JSON.parse(stored) : {};
  const [anthropicKey, setAnthropicKeyState] = useState(parsed.anthropic || "");
  const [falKey, setFalKeyState] = useState(parsed.fal || "");
  const setAnthropicKey = (k) => { setAnthropicKeyState(k); localStorage.setItem("cw_keys", JSON.stringify({anthropic:k,fal:falKey})); };
  const setFalKey = (k) => { setFalKeyState(k); localStorage.setItem("cw_keys", JSON.stringify({anthropic:anthropicKey,fal:k})); };
  return { anthropicKey, falKey, setAnthropicKey, setFalKey };
}

async function callClaude(apiKey, system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages:[{role:"user",content:user}]}),
  });
  if(!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  const text=(data.content||[]).map(b=>b.text||"").join("").trim();
  if(!text) throw new Error("Empty response from Claude");
  return extractJSON(text);
}

async function callFal(apiKey, prompt) {
  const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Key ${apiKey}`},
    body:JSON.stringify({prompt,image_size:"square_hd",num_inference_steps:4,num_images:1,enable_safety_checker:true,sync_mode:true}),
  });
  if(!res.ok){const t=await res.text().catch(()=>"");throw new Error(`fal.ai error ${res.status}: ${t.slice(0,120)}`);}
  const data=await res.json();
  const url=data?.images?.[0]?.url;
  if(!url) throw new Error("No image returned from fal.ai");
  return url;
}

function makeSystem() {
  return `You are a social media copywriter for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. Audience: ${BRAND.audience}. Also targeting: ${BRAND.agents}. Content mix: 40% buyer education, 30% agent-focused, 20% deal stories, 10% personal. Buyer CTA: "${BRAND.cta_buyer}". Agent CTA: "${BRAND.cta_agent}". Sign-offs: ${BRAND.taglines.join(" | ")}. IMPORTANT: Respond with ONLY a raw JSON object starting with { and ending with }. No markdown, no explanation, no text outside the JSON.`;
}
function makeCalSystem() {
  return `You are a content strategist for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. Audience: ${BRAND.audience}. Also targeting: ${BRAND.agents}. Content mix: 40% buyer education, 30% agent-focused, 20% deal stories, 10% personal. Buyer CTA: "${BRAND.cta_buyer}". Agent CTA: "${BRAND.cta_agent}". IMPORTANT: Respond with ONLY a raw JSON object starting with { and ending with }. No markdown, no explanation, no text outside the JSON.`;
}

function Spinner({msg}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 20px",gap:14}}>
      <div style={{width:32,height:32,border:`3px solid ${C.goldBg}`,borderTopColor:C.gold,borderRadius:"50%",animation:"cwspin 0.8s linear infinite"}}/>
      <p style={{fontSize:13,color:C.muted,margin:0}}>{msg||"Generating..."}</p>
      <style>{`@keyframes cwspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ImagePanel({post, falKey}) {
  const [state,setState]=useState("idle");
  const [imageUrl,setImageUrl]=useState(null);
  const [imgError,setImgError]=useState("");
  const prompt=IMAGE_PROMPTS[post.type]||IMAGE_PROMPTS["buyer-education"];
  const generate=async()=>{
    setState("loading");setImgError("");
    try{const url=await callFal(falKey,prompt);setImageUrl(url);setState("done");}
    catch(e){setImgError(e.message||"Image generation failed.");setState("error");}
  };
  const download=async()=>{
    try{const res=await fetch(imageUrl);const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="citywide-post-image.jpg";a.click();URL.revokeObjectURL(url);}
    catch{window.open(imageUrl,"_blank");}
  };
  if(!falKey) return <div style={{marginTop:12,fontSize:12,color:C.muted,textAlign:"center",padding:"8px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>Add your fal.ai key in ⚙️ Settings to enable image generation</div>;
  if(state==="idle") return <button onClick={generate} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 16px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",background:C.goldBg,border:`1px solid ${C.goldBorder}`,color:C.gold,marginTop:14,width:"100%",fontFamily:"'DM Sans',sans-serif"}}>🎨 Generate Matching Image with Flux AI</button>;
  if(state==="loading") return <div style={{marginTop:14,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:22,textAlign:"center",border:`1px solid ${C.border}`}}><div style={{width:24,height:24,border:`2px solid ${C.goldBg}`,borderTopColor:C.gold,borderRadius:"50%",animation:"cwspin 0.8s linear infinite",margin:"0 auto 10px"}}/><p style={{fontSize:12,color:C.muted,margin:0}}>Generating with Flux AI — 5 to 10 seconds...</p></div>;
  if(state==="error") return <div style={{marginTop:14}}><div style={{background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"10px 14px",color:C.red,fontSize:13,marginBottom:8,lineHeight:1.5}}>⚠️ {imgError}</div><button onClick={generate} style={{padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",background:"transparent",border:`1px solid ${C.goldBorder}`,color:C.gold,width:"100%",fontFamily:"'DM Sans',sans-serif"}}>↺ Try Again</button></div>;
  return (
    <div style={{marginTop:14}}>
      <img src={imageUrl} alt="AI generated visual" style={{width:"100%",borderRadius:10,display:"block",border:`1px solid ${C.border}`}}/>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={download} style={{flex:1,padding:"9px 16px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,border:"none",color:"#0a0f1a",fontFamily:"'DM Sans',sans-serif"}}>⬇️ Download Image</button>
        <button onClick={()=>{setState("idle");setImageUrl(null);}} style={{padding:"9px 14px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",background:C.surface,border:`1px solid ${C.border}`,color:C.white,fontFamily:"'DM Sans',sans-serif"}}>↺ New</button>
      </div>
    </div>
  );
}

function PostCard({post,id,onSave,saved,falKey}) {
  const [copied,setCopied]=useState(false);
  const isInsta=post.platform==="Instagram";
  const ac=audienceType(post.type);
  const col=audienceBadge(ac);
  const copy=()=>{navigator.clipboard.writeText(post.content||"").catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),1500);};
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",padding:"4px 10px",borderRadius:6,background:isInsta?C.instaBg:C.fbBg,color:isInsta?C.insta:C.fb,border:`1px solid ${isInsta?C.instaBorder:C.fbBorder}`}}>{isInsta?"📸":"👥"} {post.platform}</span>
          <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",padding:"4px 10px",borderRadius:6,background:col.bg,color:col.text,border:`1px solid ${col.border}`}}>{audienceLabel(ac)}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onSave(post)} disabled={saved} style={{padding:"7px 13px",borderRadius:8,fontSize:12,fontWeight:700,cursor:saved?"default":"pointer",background:"transparent",border:`1px solid ${C.goldBorder}`,color:saved?C.green:C.gold,fontFamily:"'DM Sans',sans-serif"}}>{saved?"✅ Saved":"🔖 Save"}</button>
          <button onClick={copy} style={{padding:"7px 13px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",background:C.surfaceHov,border:`1px solid ${C.borderBright}`,color:C.white,fontFamily:"'DM Sans',sans-serif"}}>{copied?"✓ Copied!":"📋 Copy"}</button>
        </div>
      </div>
      <div style={{fontSize:14,lineHeight:1.75,color:C.white,whiteSpace:"pre-wrap",background:"rgba(0,0,0,0.3)",borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>{post.content}</div>
      {post.topic&&<div style={{marginTop:8,fontSize:12,color:C.muted,fontWeight:600}}>📌 {post.topic}</div>}
      <ImagePanel post={post} falKey={falKey}/>
    </div>
  );
}

function SettingsPanel({anthropicKey,falKey,setAnthropicKey,setFalKey,onClose}) {
  const [ak,setAk]=useState(anthropicKey);
  const [fk,setFk]=useState(falKey);
  const save=()=>{setAnthropicKey(ak);setFalKey(fk);onClose();};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:28,maxWidth:480,width:"100%"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.gold,marginBottom:6}}>⚙️ API Keys</div>
        <p style={{fontSize:13,color:C.muted,marginBottom:22,lineHeight:1.6}}>Your keys are saved in your browser only — never sent anywhere else.</p>
        <label style={{display:"block",fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Anthropic API Key (for post generation)</label>
        <input value={ak} onChange={e=>setAk(e.target.value)} placeholder="sk-ant-..." type="password" style={{width:"100%",background:"#0f1825",border:`1px solid ${C.borderBright}`,borderRadius:10,padding:"12px 14px",color:C.white,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",marginBottom:16,boxSizing:"border-box"}}/>
        <p style={{fontSize:12,color:C.muted,marginBottom:18}}>Get your key at <a href="https://console.anthropic.com" target="_blank" style={{color:C.gold}}>console.anthropic.com</a></p>
        <label style={{display:"block",fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>fal.ai API Key (for image generation)</label>
        <input value={fk} onChange={e=>setFk(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx:xxxxxxxxxxxxxxxx" type="password" style={{width:"100%",background:"#0f1825",border:`1px solid ${C.borderBright}`,borderRadius:10,padding:"12px 14px",color:C.white,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
        <p style={{fontSize:12,color:C.muted,marginBottom:22}}>Get your key at <a href="https://fal.ai/dashboard/keys" target="_blank" style={{color:C.gold}}>fal.ai/dashboard/keys</a></p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={save} style={{flex:1,padding:"12px",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#0a0f1a"}}>Save Keys</button>
          <button onClick={onClose} style={{padding:"12px 18px",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",background:"transparent",border:`1px solid ${C.border}`,color:C.muted}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const {anthropicKey,falKey,setAnthropicKey,setFalKey}=useKeys();
  const [showSettings,setShowSettings]=useState(!anthropicKey);
  const [tab,setTab]=useState("batch");
  const [loading,setLoading]=useState(false);
  const [loadMsg,setLoadMsg]=useState("");
  const [error,setError]=useState("");
  const [savedPosts,setSavedPosts]=useState([]);
  const [savedIds,setSavedIds]=useState(new Set());

  const [platforms,setPlatforms]=useState(new Set(["Instagram","Facebook"]));
  const [buyerThemes,setBuyerThemes]=useState(new Set(["tips","unknown"]));
  const [agentThemes,setAgentThemes]=useState(new Set(["deals","help"]));
  const [dealThemes,setDealThemes]=useState(new Set(["wins"]));
  const [personalThemes,setPersonalThemes]=useState(new Set());
  const [authorityTopic,setAuthorityTopic]=useState("");
  const [postCount,setPostCount]=useState(5);
  const [batchPosts,setBatchPosts]=useState([]);

  const [calStart,setCalStart]=useState(new Date().toISOString().split("T")[0]);
  const [calWeeks,setCalWeeks]=useState("1");
  const [phase,setPhase]=useState(0);
  const [calPosts,setCalPosts]=useState([]);

  const [agentAngles,setAgentAngles]=useState(new Set(["deals","help"]));
  const [agentPlatform,setAgentPlatform]=useState("Facebook");
  const [agentCount,setAgentCount]=useState(3);
  const [agentPosts,setAgentPosts]=useState([]);

  const [refineInput,setRefineInput]=useState("");
  const [refineInstr,setRefineInstr]=useState("");
  const [refineResult,setRefineResult]=useState(null);

  const toggleSet=(set,setFn,val,min=0)=>{const n=new Set(set);if(n.has(val)){if(n.size>min)n.delete(val);}else n.add(val);setFn(n);};
  const savePost=(post,id)=>{if(savedIds.has(id))return;setSavedIds(p=>new Set([...p,id]));setSavedPosts(p=>[...p,{...post}]);};
  const run=async(fn)=>{setLoading(true);setError("");try{await fn();}catch(e){setError(e.message||"Something went wrong.");}setLoading(false);setLoadMsg("");};

  const getThemeList=()=>{
    const items=[];
    const bmap={tips:"mortgage tips, down payments, pre-approval, credit scores for Colorado homebuyers",first:"first-time homebuyer programs and myths in Colorado",unknown:"what buyers don't understand about loans — simplified",rates:"current Colorado interest rates and buying power"};
    const amap={deals:"why deals fall apart and how Weston prevents it for Realtors",help:"how Weston helps agents close faster on the Front Range",win:"how to win offers with smart financing strategy"};
    const dmap={wins:"client success stories and homeownership wins in Colorado",behind:"behind the scenes of how a mortgage deal closes"};
    const pmap={why:"Weston's values and mission as a Colorado mortgage advisor",co:"Colorado lifestyle and Front Range community connection"};
    buyerThemes.forEach(k=>bmap[k]&&items.push("buyer education: "+bmap[k]));
    agentThemes.forEach(k=>amap[k]&&items.push("agent-focused: "+amap[k]));
    dealThemes.forEach(k=>dmap[k]&&items.push("deal story: "+dmap[k]));
    personalThemes.forEach(k=>pmap[k]&&items.push("personal: "+pmap[k]));
    return items;
  };

  const getAgentAngleList=()=>{
    const amap={deals:"why deals get delayed and how Weston prevents it",help:"how Weston helps agents close faster",behind:"what Weston handles behind the scenes",partner:"invitation to partner or refer clients to Weston",buyertips:"financing tips agents can share with buyers"};
    return [...agentAngles].map(k=>amap[k]).filter(Boolean);
  };

  const generateBatch=()=>run(async()=>{
    if(!anthropicKey)throw new Error("Please add your Anthropic API key in ⚙️ Settings first.");
    setBatchPosts([]);setLoadMsg("Writing your posts...");
    const themes=getThemeList();
    if(!themes.length)throw new Error("Please select at least one content theme.");
    const result=await callClaude(anthropicKey,makeSystem(),`Generate exactly ${postCount} social media posts following the 40/30/20/10 content mix. Platforms (alternate): ${[...platforms].join(" and ")}. Themes: ${themes.join("; ")}. ${authorityTopic?`Priority authority topic: ${authorityTopic}.`:""} Each post needs emojis, line breaks, hashtags, and a CTA. Respond with ONLY: {"posts":[{"platform":"...","content":"...","topic":"...","type":"..."}]}`);
    const posts=result?.posts||(Array.isArray(result)?result:[]);
    if(!posts.length)throw new Error("No posts returned. Please try again.");
    setBatchPosts(posts);
  });

  const generateCalendar=()=>run(async()=>{
    if(!anthropicKey)throw new Error("Please add your Anthropic API key in ⚙️ Settings first.");
    setCalPosts([]);setLoadMsg("Building your calendar...");
    const result=await callClaude(anthropicKey,makeCalSystem(),`Create a ${calWeeks}-week social media content calendar starting on ${calStart}. Phase: ${PHASES[phase].val}. Facebook 2-3x/week for relationships, Instagram 3-4x/week for discovery. Follow 40/30/20/10 mix. Each post needs emojis, line breaks, hashtags, CTA. Respond with ONLY: {"posts":[{"date":"YYYY-MM-DD","platform":"...","content":"...","topic":"...","type":"..."}]}`);
    const posts=result?.posts||(Array.isArray(result)?result:[]);
    if(!posts.length)throw new Error("No posts returned. Please try again.");
    setCalPosts(posts);
  });

  const generateAgent=()=>run(async()=>{
    if(!anthropicKey)throw new Error("Please add your Anthropic API key in ⚙️ Settings first.");
    setAgentPosts([]);setLoadMsg("Writing agent posts...");
    const angles=getAgentAngleList();
    if(!angles.length)throw new Error("Please select at least one content angle.");
    const result=await callClaude(anthropicKey,`You are a social media strategist for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. Posts target Colorado Front Range Realtors. Goal: make Weston the lender agents call first. Peer-to-peer — credible, never salesy. CTA: "${BRAND.cta_agent}". IMPORTANT: Respond with ONLY a raw JSON object. No markdown.`,`Generate exactly ${agentCount} agent-focused posts for ${agentPlatform}. Angles: ${angles.join("; ")}. Respond with ONLY: {"posts":[{"platform":"${agentPlatform}","content":"...","topic":"...","type":"agent-focused"}]}`);
    const posts=result?.posts||(Array.isArray(result)?result:[]);
    if(!posts.length)throw new Error("No posts returned. Please try again.");
    setAgentPosts(posts);
  });

  const refinePost=()=>run(async()=>{
    if(!anthropicKey)throw new Error("Please add your Anthropic API key in ⚙️ Settings first.");
    if(!refineInput.trim())throw new Error("Please paste a post to refine.");
    if(!refineInstr.trim())throw new Error("Please add an instruction or pick a quick option.");
    setRefineResult(null);setLoadMsg("Refining your post...");
    const safeInput=refineInput.replace(/"/g,"'").replace(/\n/g," ");
    const result=await callClaude(anthropicKey,`You are a copywriter for ${BRAND.name}. ${BRAND.positioning} Tone: ${BRAND.tone}. IMPORTANT: Respond with ONLY a raw JSON object. No markdown.`,`Refine this post: "${safeInput}" Instruction: ${refineInstr}. Respond with ONLY: {"posts":[{"content":"...","platform":"Instagram or Facebook","topic":"3-5 words","type":"buyer-education or agent-focused or deal-story or personal","changes":"one sentence on what changed"}]}`);
    const posts=result?.posts||(Array.isArray(result)?result:[]);
    if(!posts.length)throw new Error("Could not refine. Please try again.");
    setRefineResult(posts[0]);
  });

  const calGrouped={};
  calPosts.forEach(p=>{if(!calGrouped[p.date])calGrouped[p.date]=[];calGrouped[p.date].push(p);});

  const S={
    app:{fontFamily:"'DM Sans',sans-serif",background:C.bg,color:C.white,minHeight:"100vh",paddingBottom:48},
    wrap:{maxWidth:860,margin:"0 auto",padding:"24px 18px"},
    card:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:18},
    lbl:{display:"block",fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8},
    inp:{width:"100%",background:"#0f1825",border:`1px solid ${C.borderBright}`,borderRadius:10,padding:"12px 14px",color:C.white,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"},
    btn:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 22px",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",width:"100%",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,color:"#0a0f1a",marginTop:4},
    h2:{fontFamily:"'Playfair Display',serif",fontSize:16,color:C.gold,marginBottom:14,fontWeight:700},
    sh:{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.white,marginBottom:14},
  };

  const Chip=({label,active,onClick,bg,border,text})=>(
    <button onClick={onClick} style={{padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${active?border:C.border}`,background:active?bg:"transparent",color:active?text:C.muted,marginRight:6,marginBottom:8,fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
      {label}
    </button>
  );

  const buyerC={bg:C.greenBg,border:C.greenBorder,text:C.green};
  const agentC={bg:C.purpleBg,border:C.purpleBorder,text:C.purple};
  const dealC={bg:C.dealBg,border:C.dealBorder,text:C.deal};
  const persC={bg:C.personalBg,border:C.personalBorder,text:C.personal};
  const instaC={bg:C.instaBg,border:C.instaBorder,text:C.insta};
  const fbC={bg:C.fbBg,border:C.fbBorder,text:C.fb};

  const TABS=[{id:"batch",label:"⚡ Batch"},{id:"agent",label:"🤝 Agent Content"},{id:"calendar",label:"📅 Calendar"},{id:"refine",label:"✏️ Refine"},{id:"saved",label:`📋 Saved (${savedPosts.length})`}];

  const rp=(posts,prefix)=>posts.map((p,i)=><PostCard key={i} post={p} id={`${prefix}${i}`} onSave={post=>savePost(post,`${prefix}${i}`)} saved={savedIds.has(`${prefix}${i}`)} falKey={falKey}/>);

  return (
    <div style={S.app}>
      {showSettings&&<SettingsPanel anthropicKey={anthropicKey} falKey={falKey} setAnthropicKey={setAnthropicKey} setFalKey={setFalKey} onClose={()=>setShowSettings(false)}/>}
      <div style={S.wrap}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,paddingBottom:18,borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏡</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:C.white}}>CityWide Content Agent</div>
              <div style={{fontSize:12,color:C.gold,letterSpacing:"0.09em",textTransform:"uppercase",fontWeight:600}}>Weston Gilmore · Colorado Front Range</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:11,fontWeight:700,background:C.goldBg,border:`1px solid ${C.goldBorder}`,color:C.gold,borderRadius:20,padding:"5px 12px"}}>📋 Audit Applied</span>
            <span style={{fontSize:11,fontWeight:700,background:anthropicKey?C.greenBg:"rgba(248,113,113,0.1)",border:`1px solid ${anthropicKey?C.greenBorder:C.redBorder}`,color:anthropicKey?C.green:C.red,borderRadius:20,padding:"5px 12px"}}>{anthropicKey?"● Claude Connected":"● No API Key"}</span>
            <button onClick={()=>setShowSettings(true)} style={{fontSize:11,fontWeight:700,background:C.surface,border:`1px solid ${C.borderBright}`,color:C.white,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⚙️ Settings</button>
          </div>
        </div>

        {!anthropicKey&&(
          <div style={{background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20}}>🔑</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:3}}>API Keys Required</div>
              <div style={{fontSize:13,color:C.offwhite}}>Click <b style={{color:C.white}}>⚙️ Settings</b> above to add your Anthropic and fal.ai API keys to get started.</div>
            </div>
          </div>
        )}

        <div style={{background:C.purpleBg,border:`1px solid ${C.purpleBorder}`,borderRadius:14,padding:"14px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:20,flexShrink:0}}>📊</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.purple,marginBottom:3}}>Credibility Report Applied — Julietta Voronkov</div>
            <div style={{fontSize:13,color:C.offwhite,lineHeight:1.6}}>Mix: <b style={{color:C.white}}>40% buyer · 30% agent · 20% deal · 10% personal</b> — Goal: the lender agents rely on and buyers trust.</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:22,overflowX:"auto"}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:"max-content",padding:"10px 14px",border:"none",background:tab===t.id?"#1a2a45":"transparent",color:tab===t.id?C.gold:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,borderRadius:9,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>{t.label}</button>)}
        </div>

        {error&&<div style={{background:C.redBg,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:"13px 16px",color:C.red,fontSize:13,marginBottom:16,lineHeight:1.5,fontWeight:600}}>⚠️ {error}</div>}

        {/* BATCH */}
        {tab==="batch"&&(
          <div>
            <div style={S.card}>
              <div style={S.h2}>📊 Audit Content Mix</div>
              <div style={{display:"flex",borderRadius:8,overflow:"hidden",height:10,marginBottom:12}}>
                {[["40%",C.green],["30%",C.purple],["20%",C.deal],["10%",C.personal]].map(([w,c])=><div key={c} style={{width:w,background:c}}/>)}
              </div>
              <div style={{display:"flex",gap:18,flexWrap:"wrap",marginBottom:16}}>
                {[[C.green,"40% Buyer"],[C.purple,"30% Agent"],[C.deal,"20% Deal"],[C.personal,"10% Personal"]].map(([c,l])=><span key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:C.offwhite}}><span style={{width:9,height:9,borderRadius:"50%",background:c,flexShrink:0}}/>{l}</span>)}
              </div>
              <span style={S.lbl}>Platforms</span>
              <div>
                <Chip label="📸 Instagram" active={platforms.has("Instagram")} onClick={()=>toggleSet(platforms,setPlatforms,"Instagram",1)} {...instaC}/>
                <Chip label="👥 Facebook" active={platforms.has("Facebook")} onClick={()=>toggleSet(platforms,setPlatforms,"Facebook",1)} {...fbC}/>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.h2}>🎯 Content Themes</div>
              <span style={S.lbl}>Buyer Education (40%)</span>
              <div>
                <Chip label="💡 Mortgage Tips" active={buyerThemes.has("tips")} onClick={()=>toggleSet(buyerThemes,setBuyerThemes,"tips")} {...buyerC}/>
                <Chip label="🔑 First-Time Buyers" active={buyerThemes.has("first")} onClick={()=>toggleSet(buyerThemes,setBuyerThemes,"first")} {...buyerC}/>
                <Chip label="❓ What Buyers Don't Know" active={buyerThemes.has("unknown")} onClick={()=>toggleSet(buyerThemes,setBuyerThemes,"unknown")} {...buyerC}/>
                <Chip label="📊 Rate Updates" active={buyerThemes.has("rates")} onClick={()=>toggleSet(buyerThemes,setBuyerThemes,"rates")} {...buyerC}/>
              </div>
              <span style={S.lbl}>Agent-Focused (30%)</span>
              <div>
                <Chip label="⚠️ Why Deals Fall Apart" active={agentThemes.has("deals")} onClick={()=>toggleSet(agentThemes,setAgentThemes,"deals")} {...agentC}/>
                <Chip label="🤝 How I Help Agents" active={agentThemes.has("help")} onClick={()=>toggleSet(agentThemes,setAgentThemes,"help")} {...agentC}/>
                <Chip label="🏆 Win With Financing" active={agentThemes.has("win")} onClick={()=>toggleSet(agentThemes,setAgentThemes,"win")} {...agentC}/>
              </div>
              <span style={S.lbl}>Deal Stories (20%)</span>
              <div>
                <Chip label="🎉 Client Wins" active={dealThemes.has("wins")} onClick={()=>toggleSet(dealThemes,setDealThemes,"wins")} {...dealC}/>
                <Chip label="🔍 Behind the Scenes" active={dealThemes.has("behind")} onClick={()=>toggleSet(dealThemes,setDealThemes,"behind")} {...dealC}/>
              </div>
              <span style={S.lbl}>Personal (10%)</span>
              <div>
                <Chip label="❤️ My Why" active={personalThemes.has("why")} onClick={()=>toggleSet(personalThemes,setPersonalThemes,"why")} {...persC}/>
                <Chip label="🏔️ Colorado Life" active={personalThemes.has("co")} onClick={()=>toggleSet(personalThemes,setPersonalThemes,"co")} {...persC}/>
              </div>
              <span style={{...S.lbl,marginTop:8}}>Authority Topics — tap to focus</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {AUTHORITY_TOPICS.map(t=><button key={t.val} onClick={()=>setAuthorityTopic(authorityTopic===t.val?"":t.val)} style={{background:authorityTopic===t.val?C.goldBg:"rgba(255,255,255,0.03)",border:`1px solid ${authorityTopic===t.val?C.gold:C.border}`,borderRadius:10,padding:"11px 14px",textAlign:"left",cursor:"pointer",color:authorityTopic===t.val?C.gold:C.offwhite,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:authorityTopic===t.val?700:500,lineHeight:1.4}}>{t.label}</button>)}
              </div>
              <span style={S.lbl}>Number of Posts: {postCount}</span>
              <input type="range" min={2} max={10} value={postCount} onChange={e=>setPostCount(Number(e.target.value))} style={{width:"100%",marginBottom:18,accentColor:C.gold}}/>
              <button onClick={generateBatch} disabled={loading} style={{...S.btn,opacity:loading?0.5:1}}>✨ Generate Posts</button>
            </div>
            {loading&&<Spinner msg={loadMsg}/>}
            {batchPosts.length>0&&<><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><div style={S.sh}>Generated Posts</div><span style={{fontSize:12,fontWeight:700,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,padding:"4px 12px",borderRadius:20}}>{batchPosts.length} posts</span></div>{rp(batchPosts,"b")}</>}
          </div>
        )}

        {/* AGENT */}
        {tab==="agent"&&(
          <div>
            <div style={{...S.card,borderColor:C.purpleBorder}}>
              <div style={{...S.h2,color:C.purple}}>🤝 Agent Referral Content</div>
              <p style={{fontSize:13,color:C.offwhite,marginBottom:18,lineHeight:1.7}}>Your biggest growth opportunity per the audit. Written peer-to-peer for Realtors — credible and helpful, never salesy.</p>
              <span style={S.lbl}>Content Angle</span>
              <div>
                <Chip label="⚠️ Why Deals Fail" active={agentAngles.has("deals")} onClick={()=>toggleSet(agentAngles,setAgentAngles,"deals")} {...agentC}/>
                <Chip label="⚡ I Help You Close" active={agentAngles.has("help")} onClick={()=>toggleSet(agentAngles,setAgentAngles,"help")} {...agentC}/>
                <Chip label="🔍 What I Handle" active={agentAngles.has("behind")} onClick={()=>toggleSet(agentAngles,setAgentAngles,"behind")} {...agentC}/>
                <Chip label="🤝 Partner With Me" active={agentAngles.has("partner")} onClick={()=>toggleSet(agentAngles,setAgentAngles,"partner")} {...agentC}/>
                <Chip label="🏆 Tips for Your Buyers" active={agentAngles.has("buyertips")} onClick={()=>toggleSet(agentAngles,setAgentAngles,"buyertips")} {...agentC}/>
              </div>
              <span style={S.lbl}>Platform</span>
              <div>
                <Chip label="👥 Facebook (primary)" active={agentPlatform==="Facebook"} onClick={()=>setAgentPlatform("Facebook")} {...fbC}/>
                <Chip label="📸 Instagram" active={agentPlatform==="Instagram"} onClick={()=>setAgentPlatform("Instagram")} {...instaC}/>
              </div>
              <span style={S.lbl}>Number of Posts: {agentCount}</span>
              <input type="range" min={1} max={6} value={agentCount} onChange={e=>setAgentCount(Number(e.target.value))} style={{width:"100%",marginBottom:18,accentColor:C.gold}}/>
              <button onClick={generateAgent} disabled={loading} style={{...S.btn,opacity:loading?0.5:1}}>🤝 Generate Agent Posts</button>
            </div>
            {loading&&<Spinner msg={loadMsg}/>}
            {rp(agentPosts,"a")}
          </div>
        )}

        {/* CALENDAR */}
        {tab==="calendar"&&(
          <div>
            <div style={S.card}>
              <div style={S.h2}>📅 Content Calendar</div>
              <p style={{fontSize:13,color:C.offwhite,marginBottom:16,lineHeight:1.7}}>Per the audit: <b style={{color:C.white}}>Facebook 2-3x/week</b> for relationships. <b style={{color:C.white}}>Instagram 3-4x/week</b> for discovery.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><span style={S.lbl}>Start Date</span><input type="date" value={calStart} onChange={e=>setCalStart(e.target.value)} style={S.inp}/></div>
                <div><span style={S.lbl}>Weeks to Plan</span><select value={calWeeks} onChange={e=>setCalWeeks(e.target.value)} style={{...S.inp,background:"#0f1825"}}><option value="1">1 week</option><option value="2">2 weeks</option><option value="4">4 weeks</option></select></div>
              </div>
              <span style={S.lbl}>30/60/90 Day Phase</span>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {PHASES.map((p,i)=><button key={i} onClick={()=>setPhase(i)} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 16px",borderRadius:12,border:`2px solid ${phase===i?C.gold:C.border}`,background:phase===i?C.goldBg:"rgba(255,255,255,0.02)",color:phase===i?C.gold:C.offwhite,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.15s"}}><span style={{fontSize:20,flexShrink:0}}>{p.icon}</span><span><span style={{fontWeight:700,display:"block",marginBottom:2,fontSize:14,color:phase===i?C.gold:C.white}}>{p.label}</span><span style={{fontSize:12,color:phase===i?C.gold:C.muted}}>{p.desc}</span></span></button>)}
              </div>
              <button onClick={generateCalendar} disabled={loading} style={{...S.btn,opacity:loading?0.5:1}}>📅 Build My Calendar</button>
            </div>
            {loading&&<Spinner msg={loadMsg}/>}
            {Object.keys(calGrouped).length>0&&(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><div style={S.sh}>{calWeeks}-Week Calendar</div><span style={{fontSize:12,fontWeight:700,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,padding:"4px 12px",borderRadius:20}}>{calPosts.length} posts</span></div>
                {Object.entries(calGrouped).sort(([a],[b])=>a.localeCompare(b)).map(([date,posts])=>{
                  const d=new Date(date+"T12:00:00");
                  const lbl=d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});
                  return <div key={date}><div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:C.gold,margin:"18px 0 10px",paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{lbl}</div>{posts.map((p,i)=><PostCard key={i} post={p} id={`c${date}${i}`} onSave={post=>savePost(post,`c${date}${i}`)} saved={savedIds.has(`c${date}${i}`)} falKey={falKey}/>)}</div>;
                })}
              </div>
            )}
          </div>
        )}

        {/* REFINE */}
        {tab==="refine"&&(
          <div>
            <div style={S.card}>
              <div style={S.h2}>✏️ Refine or Rewrite a Post</div>
              <span style={S.lbl}>Paste Your Post</span>
              <textarea value={refineInput} onChange={e=>setRefineInput(e.target.value)} placeholder="Paste any post here..." style={{...S.inp,minHeight:120,resize:"vertical"}}/>
              <span style={S.lbl}>Quick Instructions</span>
              <div style={{marginBottom:14}}>
                {REFINE_OPTIONS.map(c=><button key={c} onClick={()=>setRefineInstr(c)} style={{padding:"6px 13px",borderRadius:16,fontSize:12,cursor:"pointer",border:`1px solid ${refineInstr===c?C.goldBorder:C.border}`,background:refineInstr===c?C.goldBg:"transparent",color:refineInstr===c?C.gold:C.offwhite,marginRight:6,marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:refineInstr===c?700:500}}>{c}</button>)}
              </div>
              <span style={S.lbl}>Custom Instruction</span>
              <input value={refineInstr} onChange={e=>setRefineInstr(e.target.value)} placeholder="e.g. Add a Colorado housing market stat" style={S.inp}/>
              <button onClick={refinePost} disabled={loading} style={{...S.btn,opacity:loading?0.5:1}}>✨ Refine This Post</button>
            </div>
            {loading&&<Spinner msg={loadMsg}/>}
            {refineResult&&(
              <div>
                <div style={{...S.sh,marginBottom:12}}>Refined Post</div>
                <div style={{...S.card,borderColor:C.goldBorder}}>
                  {refineResult.changes&&<><div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",color:C.gold,marginBottom:6,letterSpacing:"0.08em"}}>✨ What Changed</div><p style={{fontSize:13,color:C.offwhite,marginBottom:16,lineHeight:1.6}}>{refineResult.changes}</p></>}
                  <PostCard post={refineResult} id="r0" onSave={post=>savePost(post,"r0")} saved={savedIds.has("r0")} falKey={falKey}/>
                  <button onClick={()=>{setRefineInput(refineResult.content||"");setRefineResult(null);setRefineInstr("");}} style={{width:"100%",padding:"11px 22px",borderRadius:10,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",background:"transparent",border:`1px solid ${C.goldBorder}`,color:C.gold,marginTop:8}}>🔄 Refine Again</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SAVED */}
        {tab==="saved"&&(
          savedPosts.length===0
            ?<div style={{textAlign:"center",padding:"60px 20px",color:C.muted}}><div style={{fontSize:44,marginBottom:16,opacity:0.5}}>📋</div><div style={{fontSize:18,marginBottom:8,color:C.white,fontWeight:700}}>No saved posts yet</div><div style={{fontSize:14,color:C.muted}}>Generate posts and click 🔖 to save them here.</div></div>
            :<div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div style={S.sh}>Saved Posts</div><span style={{fontSize:12,fontWeight:700,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,padding:"4px 12px",borderRadius:20}}>{savedPosts.length} saved</span></div>{rp(savedPosts,"s")}</div>
        )}
      </div>
    </div>
  );
}
