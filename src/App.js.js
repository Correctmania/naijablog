import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// SUPABASE CONFIG — replace with yours from supabase.com
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const ADMIN_PASSWORD = "naija2026"; // ← change this!
const SITE_EMAIL = "contact@naijablog.com.ng"; // ← change this!
const SITE_NAME = "NaijaToday";
const SITE_DOMAIN = "naijablog.com.ng"; // ← change this!

const isSupabaseConnected = SUPABASE_URL !== "https://YOUR_PROJECT.supabase.co";

const sb = {
  async getArticles() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    return r.ok ? r.json() : [];
  },
  async insertArticle(a) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(a),
    });
    return (await r.json())[0];
  },
  async updateArticle(id, a) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(a),
    });
    return (await r.json())[0];
  },
  async deleteArticle(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
  },
};

// ─── SEED DATA ────────────────────────────────────────────────
const SEED = [
  { id: 1, title: "Nigeria's Economy Shows Resilience Amid Global Headwinds", category: "Economy", featured: true, excerpt: "The Central Bank of Nigeria reports steady GDP growth as oil revenues stabilize and non-oil sectors surge.", content: "Nigeria's economy continues to demonstrate resilience in the face of global economic pressures. The Central Bank of Nigeria has reported steady GDP growth as oil revenues stabilize and non-oil sectors surge. Fintech companies like Flutterwave and Paystack continue to attract foreign investment.\n\nThe Nigerian Stock Exchange has seen increased activity from retail investors, driven largely by a young, tech-savvy population embracing mobile trading platforms. Analysts project strong growth targets for the fiscal year.", author: "Chukwuemeka Obi", read_time: "4 min", created_at: "2026-04-18T08:00:00Z" },
  { id: 2, title: "Lagos State Launches Ambitious Infrastructure Renewal Plan", category: "Politics", featured: true, excerpt: "Governor announces a ₦2.4 trillion investment in roads, bridges, and rail networks.", content: "The Lagos State Government has unveiled an ambitious ₦2.4 trillion infrastructure renewal plan aimed at transforming the megacity's transport landscape over the next five years.\n\nThe plan includes construction of new bridges across the Lagos Lagoon, expansion of the Blue and Red rail lines, and rehabilitation of major arterial roads.", author: "Amina Suleiman", read_time: "5 min", created_at: "2026-04-17T10:00:00Z" },
  { id: 3, title: "Super Eagles Eye AFCON Glory with New Tactical Formation", category: "Sports", featured: false, excerpt: "The national football team unveils a dynamic 4-3-3 system ahead of crucial qualifiers.", content: "The Super Eagles coach has unveiled a dynamic new 4-3-3 tactical formation ahead of crucial Africa Cup of Nations qualifiers. With Victor Osimhen spearheading the attack, Nigeria looks poised for glory.\n\nFans across the country have expressed excitement, with support rallies taking place in Lagos, Abuja, and Port Harcourt.", author: "Taiwo Adeyemi", read_time: "3 min", created_at: "2026-04-16T12:00:00Z" },
  { id: 4, title: "Nollywood's Global Reach Hits Record Streaming Numbers", category: "Entertainment", featured: false, excerpt: "Nigerian films on international platforms surpassed 800 million views last quarter.", content: "Nollywood continues its remarkable global ascent, with Nigerian films on international streaming platforms surpassing 800 million views last quarter.\n\nSeveral Nigerian productions have secured international co-production deals, bringing Hollywood-level production budgets to local stories.", author: "Ngozi Eze", read_time: "4 min", created_at: "2026-04-15T09:00:00Z" },
  { id: 5, title: "Northern Farmers Adopt Solar-Powered Irrigation Technology", category: "Technology", featured: false, excerpt: "A grassroots tech initiative is transforming smallholder farming across Kano, Kaduna and Katsina states.", content: "A transformative grassroots technology initiative is reshaping smallholder farming across northern Nigeria. Solar-powered irrigation systems are boosting crop yields by up to 300% during dry-season harvests.\n\nThe program has already reached over 15,000 farming families, reducing post-harvest losses significantly.", author: "Ibrahim Musa", read_time: "6 min", created_at: "2026-04-14T11:00:00Z" },
  { id: 6, title: "Nigeria's Healthcare System Gets ₦500bn Federal Boost", category: "Health", featured: false, excerpt: "The federal government commits to overhauling primary healthcare centers nationwide.", content: "The Federal Government of Nigeria has committed ₦500 billion to a comprehensive overhaul of the country's primary healthcare system. The investment focuses on upgrading healthcare centers in underserved communities.\n\nHealth experts have called it the most significant healthcare investment in a generation, with funds disbursed over three years.", author: "Dr. Funke Adeyinka", read_time: "5 min", created_at: "2026-04-13T08:00:00Z" },
];

const CATEGORIES = ["Economy", "Politics", "Sports", "Entertainment", "Technology", "Health"];
const NAV_PAGES = ["Home", "About", "Contact", "Privacy Policy"];

const CAT_COLORS = { Economy: "#40916c", Politics: "#9b2226", Sports: "#e63946", Entertainment: "#e07a5f", Technology: "#0096c7", Health: "#52b788" };
const IMG_GRADIENTS = { Economy: "linear-gradient(135deg,#1a472a,#40916c)", Politics: "linear-gradient(135deg,#2c1654,#ab0e86)", Sports: "linear-gradient(135deg,#7d1128,#e63946)", Entertainment: "linear-gradient(135deg,#b5451b,#f4a261)", Technology: "linear-gradient(135deg,#023e8a,#00b4d8)", Health: "linear-gradient(135deg,#1b4332,#52b788)" };

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
}

// ─── CLAUDE AI ────────────────────────────────────────────────
async function callClaude(system, user) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content: user }] }),
  });
  return (await r.json()).content?.[0]?.text || "";
}
async function aiGenArticle(topic, cat) {
  const txt = await callClaude(
    `You are a senior journalist for ${SITE_NAME}, Nigeria's premier digital news platform. Return ONLY valid JSON (no markdown) with: {"title":"...","excerpt":"...","content":"...","author":"...","read_time":"X min"}. title: max 12 words. excerpt: max 40 words. content: 2 paragraphs. author: realistic Nigerian full name.`,
    `Write a news article. Topic: ${topic}. Category: ${cat}`
  );
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
}
async function aiSummarize(content) { return callClaude("Summarize this article in exactly 2 bullet points. Be concise and factual.", content); }
async function aiAsk(q, content) { return callClaude(`You help readers of ${SITE_NAME} understand articles. Article:\n${content}`, q); }

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: type === "error" ? "#c1121f" : "#111", color: "#fff", padding: "12px 20px", borderRadius: "2px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", animation: "slideIn 0.3s ease" }}>{msg}</div>
  );
}

function Header({ page, setPage, search, setSearch, isAdmin, onAdminClick, articleCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header style={{ background: "#0d0d0d", color: "#fff", borderBottom: "3px solid #e63946", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 42, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.06em" }}>SATURDAY, APRIL 18, 2026 · LAGOS · ABUJA · KANO</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!isSupabaseConnected && <span style={{ fontSize: 9, color: "#e63946", fontWeight: 700, letterSpacing: "0.1em" }}>⚠ DEMO MODE</span>}
          <button onClick={onAdminClick} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666", padding: "3px 10px", borderRadius: "1px", cursor: "pointer", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {isAdmin ? "⚙ Dashboard" : "Admin"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div onClick={() => setPage("Home")} style={{ cursor: "pointer" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 40, fontWeight: 900, lineHeight: 1, color: "#fff" }}>
            Naija<span style={{ color: "#e63946" }}>Today</span>
          </div>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 3 }}>Nigeria's Digital Newsroom</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {page === "Home" && (
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "1px" }}>
              <span style={{ padding: "0 8px", color: "#555", fontSize: 13 }}>⌕</span>
              <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 12, padding: "8px 10px 8px 0", width: 160 }} />
            </div>
          )}
          {isAdmin && (
            <button onClick={onAdminClick} style={{ background: "#e63946", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "1px", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>+ New Post</button>
          )}
        </div>
      </div>

      <nav style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", overflowX: "auto", gap: 0 }}>
        {NAV_PAGES.map(p => (
          <button key={p} onClick={() => setPage(p)} style={{ background: "none", border: "none", cursor: "pointer", color: page === p ? "#e63946" : "#555", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 14px", whiteSpace: "nowrap", borderBottom: page === p ? "2px solid #e63946" : "2px solid transparent", transition: "color 0.15s" }}>{p}</button>
        ))}
        {page === "Home" && CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setPage("cat:" + cat)} style={{ background: "none", border: "none", cursor: "pointer", color: page === "cat:" + cat ? "#e63946" : "#444", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 14px", whiteSpace: "nowrap", borderBottom: page === "cat:" + cat ? "2px solid #e63946" : "2px solid transparent" }}>{cat}</button>
        ))}
      </nav>
    </header>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: "#0d0d0d", color: "#444", borderTop: "3px solid #e63946" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
            Naija<span style={{ color: "#e63946" }}>Today</span>
          </div>
          <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 }}>Nigeria's leading digital newsroom. Bringing you accurate, timely, and insightful coverage of Nigeria and Africa.</p>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Categories</div>
          {CATEGORIES.map(c => (
            <div key={c} style={{ fontSize: 12, color: "#555", marginBottom: 6, cursor: "pointer" }} onClick={() => setPage("Home")}>{c}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Company</div>
          {["About", "Contact", "Privacy Policy"].map(p => (
            <div key={p} onClick={() => setPage(p)} style={{ fontSize: 12, color: "#555", marginBottom: 6, cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#e63946"} onMouseLeave={e => e.target.style.color = "#555"}>{p}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Contact</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{SITE_EMAIL}</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Lagos, Nigeria</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {["𝕏", "f", "in"].map(s => (
              <div key={s} style={{ width: 28, height: 28, background: "#1a1a1a", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#666", cursor: "pointer" }}>{s}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1a1a1a", padding: "16px 24px", textAlign: "center", fontSize: 11, color: "#333" }}>
        © 2026 {SITE_NAME} · {SITE_DOMAIN} · All Rights Reserved · Nigeria's Digital Newsroom
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGES
// ─────────────────────────────────────────────────────────────

function AboutPage() {
  const section = (title, body) => (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 12px", borderLeft: "3px solid #e63946", paddingLeft: 14 }}>{title}</h2>
      <div style={{ fontSize: 15, lineHeight: 1.8, color: "#444" }}>{body}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "50px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#e63946", marginBottom: 10 }}>About Us</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 900, color: "#111", margin: "0 0 16px", lineHeight: 1.2 }}>
          Telling Nigeria's Story,<br />One Headline at a Time
        </h1>
        <div style={{ width: 60, height: 4, background: "#e63946", marginBottom: 20 }} />
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "#555", margin: 0 }}>
          {SITE_NAME} is Nigeria's premier digital news platform, dedicated to delivering accurate, timely, and insightful journalism that covers everything from politics and economics to sports, entertainment, technology, and health.
        </p>
      </div>

      {section("Our Mission", `At ${SITE_NAME}, our mission is simple: to keep Nigerians — at home and in the diaspora — informed, engaged, and empowered. We believe that quality journalism is the foundation of a functioning democracy, and we take that responsibility seriously. Every article we publish is written with accuracy, fairness, and the Nigerian people in mind.`)}

      {section("Our Story", `${SITE_NAME} was founded in Lagos by a team of passionate Nigerian journalists and technology enthusiasts who saw a gap in the digital news landscape. We wanted to build a platform that combined world-class journalism with cutting-edge technology — a place where Nigerians could get trusted news fast, wherever they are in the world.`)}

      {section("What We Cover", (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {[["🏛️ Politics", "Federal, state, and local government news"], ["💰 Economy", "Business, finance, and market updates"], ["⚽ Sports", "Super Eagles, NPFL, and international sport"], ["🎬 Entertainment", "Nollywood, music, and celebrity news"], ["💻 Technology", "Tech innovation, startups, and digital trends"], ["🏥 Health", "Public health, medicine, and wellness"]].map(([t, d]) => (
            <li key={t} style={{ marginBottom: 8 }}><strong>{t}:</strong> {d}</li>
          ))}
        </ul>
      ))}

      {section("Editorial Standards", `We hold ourselves to the highest standards of journalism. All our stories are verified before publication. We correct errors promptly and transparently. We do not accept payment for news coverage, and our editorial decisions are made independently of advertisers. If you spot an error or have a tip, please contact us at ${SITE_EMAIL}.`)}

      {section("AI-Powered Journalism", `${SITE_NAME} uses artificial intelligence to assist our journalists — helping with research, article drafts, and story summaries. However, all published content is reviewed and edited by human journalists. We are transparent about our use of AI and committed to responsible, ethical journalism.`)}

      <div style={{ background: "#111", color: "#fff", padding: "30px", borderRadius: "2px", borderLeft: "4px solid #e63946" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Want to write for us?</div>
        <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, margin: "0 0 16px" }}>We welcome pitches from experienced journalists, writers, and subject matter experts across Nigeria and the diaspora.</p>
        <div style={{ fontSize: 13, color: "#e63946", fontWeight: 700 }}>📧 {SITE_EMAIL}</div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "50px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#e63946", marginBottom: 10 }}>Get In Touch</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 900, color: "#111", margin: "0 0 14px" }}>Contact Us</h1>
        <div style={{ width: 60, height: 4, background: "#e63946", marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>Have a story tip, feedback, partnership inquiry, or press request? We'd love to hear from you.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 40, alignItems: "start" }}>
        {/* Info */}
        <div>
          {[
            ["📧", "Editorial", SITE_EMAIL],
            ["📰", "Press & Media", `press@${SITE_DOMAIN}`],
            ["💼", "Advertising", `ads@${SITE_DOMAIN}`],
            ["📍", "Office", "Lagos Island, Lagos, Nigeria"],
            ["⏰", "Hours", "Mon–Fri, 8am–6pm WAT"],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ display: "flex", gap: 14, marginBottom: 22, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, background: "#111", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#333" }}>{val}</div>
              </div>
            </div>
          ))}

          <div style={{ background: "#f8f8f6", padding: "18px", borderRadius: "2px", marginTop: 10, borderLeft: "3px solid #e63946" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 6 }}>Story Tips</div>
            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: 0 }}>Have a news tip? Send it to our editorial team. All tips are kept confidential. We investigate every credible lead.</p>
          </div>
        </div>

        {/* Form */}
        {sent ? (
          <div style={{ background: "#f0faf4", border: "1px solid #40916c", padding: "40px", borderRadius: "2px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 }}>Message Sent!</div>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>Thank you for reaching out. Our team will get back to you within 24–48 hours.</p>
            <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              style={{ marginTop: 16, background: "#111", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "2px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Send Another</button>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee", padding: "30px", borderRadius: "2px" }}>
            {[["Full Name *", "name", "text"], ["Email Address *", "email", "email"], ["Subject", "subject", "text"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: "2px", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5}
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: "2px", padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Georgia, serif" }} />
            </div>
            <button onClick={handleSubmit} disabled={!form.name || !form.email || !form.message}
              style={{ width: "100%", background: "#e63946", color: "#fff", border: "none", padding: 12, borderRadius: "2px", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: (!form.name || !form.email || !form.message) ? 0.5 : 1 }}>
              Send Message →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PrivacyPage() {
  const today = "April 18, 2026";
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 12px", borderLeft: "3px solid #e63946", paddingLeft: 14 }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.85, color: "#444" }}>{children}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "50px 24px 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#e63946", marginBottom: 10 }}>Legal</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 900, color: "#111", margin: "0 0 12px" }}>Privacy Policy</h1>
        <div style={{ width: 60, height: 4, background: "#e63946", marginBottom: 14 }} />
        <p style={{ fontSize: 13, color: "#888" }}>Last updated: {today} · Effective: {today}</p>
      </div>

      <div style={{ background: "#f8f8f6", padding: "16px 20px", borderRadius: "2px", marginBottom: 32, fontSize: 13, color: "#555", lineHeight: 1.7, borderLeft: "3px solid #e63946" }}>
        This Privacy Policy explains how {SITE_NAME} ("{SITE_DOMAIN}") collects, uses, and protects your personal information when you use our website. By using our site, you agree to the terms described here.
      </div>

      <Section title="1. Information We Collect">
        <p>We may collect the following types of information:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}><strong>Usage Data:</strong> Pages visited, time spent on site, browser type, device type, and IP address — collected automatically via analytics tools.</li>
          <li style={{ marginBottom: 8 }}><strong>Contact Information:</strong> Name, email address, and message content when you submit our contact form.</li>
          <li style={{ marginBottom: 8 }}><strong>Cookies:</strong> Small data files stored on your browser to improve your experience and for advertising purposes.</li>
          <li style={{ marginBottom: 8 }}><strong>Newsletter:</strong> Email address if you voluntarily subscribe to our newsletter.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>To operate and improve our website and content</li>
          <li style={{ marginBottom: 8 }}>To respond to your contact form inquiries</li>
          <li style={{ marginBottom: 8 }}>To send newsletters and updates (only if you subscribed)</li>
          <li style={{ marginBottom: 8 }}>To display relevant advertisements through third-party services like Google AdSense</li>
          <li style={{ marginBottom: 8 }}>To analyze site traffic and user behavior using analytics tools</li>
          <li style={{ marginBottom: 8 }}>To comply with applicable Nigerian and international laws</li>
        </ul>
      </Section>

      <Section title="3. Google AdSense & Advertising">
        <p>{SITE_NAME} uses <strong>Google AdSense</strong> to display advertisements. Google AdSense uses cookies and similar tracking technologies to serve ads based on your prior visits to our site and other sites on the internet.</p>
        <p style={{ marginTop: 10 }}>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site. You may opt out of personalized advertising by visiting <strong>Google's Ads Settings</strong> at <em>adssettings.google.com</em>.</p>
        <p style={{ marginTop: 10 }}>We do not control the cookies placed by Google AdSense. For more information, please refer to <strong>Google's Privacy Policy</strong>.</p>
      </Section>

      <Section title="4. Cookies Policy">
        <p>We use the following types of cookies:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}><strong>Essential Cookies:</strong> Required for the website to function properly.</li>
          <li style={{ marginBottom: 8 }}><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site (e.g., Google Analytics).</li>
          <li style={{ marginBottom: 8 }}><strong>Advertising Cookies:</strong> Used by Google AdSense to deliver relevant advertisements.</li>
        </ul>
        <p style={{ marginTop: 10 }}>You can control cookies through your browser settings. Please note that disabling certain cookies may affect your experience on our site.</p>
      </Section>

      <Section title="5. Third-Party Services">
        <p>We may use the following third-party services, each governed by their own privacy policies:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 6 }}><strong>Google Analytics</strong> — website traffic analysis</li>
          <li style={{ marginBottom: 6 }}><strong>Google AdSense</strong> — advertising</li>
          <li style={{ marginBottom: 6 }}><strong>Supabase</strong> — secure database hosting</li>
          <li style={{ marginBottom: 6 }}><strong>Anthropic Claude API</strong> — AI-assisted content tools</li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain personal data only for as long as necessary to fulfill the purposes described in this policy, or as required by Nigerian law. Contact form submissions are retained for up to 12 months. Analytics data is retained per the default settings of each analytics provider.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>Under applicable Nigerian data protection law (NDPA 2023), you have the right to:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 6 }}>Access the personal data we hold about you</li>
          <li style={{ marginBottom: 6 }}>Request correction of inaccurate data</li>
          <li style={{ marginBottom: 6 }}>Request deletion of your personal data</li>
          <li style={{ marginBottom: 6 }}>Withdraw consent to data processing at any time</li>
          <li style={{ marginBottom: 6 }}>Lodge a complaint with Nigeria's data protection authority (NDPC)</li>
        </ul>
        <p style={{ marginTop: 10 }}>To exercise these rights, contact us at <strong>{SITE_EMAIL}</strong>.</p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>{SITE_NAME} is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately.</p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a new "Last Updated" date. Your continued use of the site after changes are posted constitutes your acceptance of the updated policy.</p>
      </Section>

      <Section title="10. Contact Us">
        <p>For questions about this Privacy Policy or your data, contact us at:</p>
        <div style={{ background: "#111", color: "#fff", padding: "18px 20px", borderRadius: "2px", marginTop: 12, fontSize: 13, lineHeight: 2 }}>
          <div><strong style={{ color: "#e63946" }}>{SITE_NAME}</strong></div>
          <div>📧 {SITE_EMAIL}</div>
          <div>🌍 {SITE_DOMAIN}</div>
          <div>📍 Lagos, Nigeria</div>
        </div>
      </Section>
    </div>
  );
}

// ─── ARTICLE CARD ─────────────────────────────────────────────
function ArticleCard({ article, onClick }) {
  return (
    <div onClick={() => onClick(article)} style={{ cursor: "pointer", background: "#fff", borderRadius: "2px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", transition: "transform 0.2s, box-shadow 0.2s", display: "flex", flexDirection: "column" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.07)"; }}>
      <div style={{ height: 160, background: IMG_GRADIENTS[article.category] || IMG_GRADIENTS.Economy, display: "flex", alignItems: "flex-end", padding: 14 }}>
        <span style={{ background: CAT_COLORS[article.category] || "#333", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 9px", borderRadius: "1px" }}>{article.category}</span>
      </div>
      <div style={{ padding: "16px 16px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "#111", lineHeight: 1.35 }}>{article.title}</h3>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555", lineHeight: 1.6, flex: 1 }}>{article.excerpt}</p>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb" }}>
          <span>{article.author}</span>
          <span>{fmtDate(article.created_at)} · {article.read_time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ARTICLE MODAL ────────────────────────────────────────────
function ArticleModal({ article, onClose }) {
  const [summary, setSummary] = useState("");
  const [loadSum, setLoadSum] = useState(false);
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [loadAns, setLoadAns] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "2px", maxWidth: 720, width: "100%", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 220, background: IMG_GRADIENTS[article.category] || IMG_GRADIENTS.Economy, position: "relative", display: "flex", alignItems: "flex-end", padding: 24 }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>×</button>
          <span style={{ background: CAT_COLORS[article.category] || "#333", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "1px" }}>{article.category}</span>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 10px", lineHeight: 1.3 }}>{article.title}</h1>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 20 }}>By <strong style={{ color: "#555" }}>{article.author}</strong> · {fmtDate(article.created_at)} · {article.read_time} read</div>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#333", whiteSpace: "pre-line", marginBottom: 24 }}>{article.content}</p>
          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "20px 0" }} />
          <div style={{ background: "#f8f8f6", padding: 16, borderRadius: "2px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 10 }}>🤖 AI Tools</div>
            <button onClick={async () => { setLoadSum(true); setSummary(await aiSummarize(article.content)); setLoadSum(false); }} disabled={loadSum}
              style={{ background: "#111", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "1px", cursor: "pointer", fontSize: 11, fontWeight: 700, marginBottom: 8, opacity: loadSum ? 0.6 : 1 }}>
              {loadSum ? "Summarising…" : "✦ Quick Summary"}
            </button>
            {summary && <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "10px 12px", fontSize: 12, lineHeight: 1.7, color: "#444", marginBottom: 12, whiteSpace: "pre-line", borderRadius: "2px" }}>{summary}</div>}
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="Ask about this article…" value={q} onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === "Enter" && q.trim() && !loadAns && (async () => { setLoadAns(true); setAns(await aiAsk(q, article.content)); setLoadAns(false); })()}
                style={{ flex: 1, border: "1px solid #ddd", borderRadius: "1px", padding: "7px 10px", fontSize: 12, outline: "none" }} />
              <button onClick={async () => { setLoadAns(true); setAns(await aiAsk(q, article.content)); setLoadAns(false); }} disabled={loadAns || !q.trim()}
                style={{ background: "#111", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "1px", cursor: "pointer", fontSize: 12, fontWeight: 700, opacity: (loadAns || !q.trim()) ? 0.5 : 1 }}>
                {loadAns ? "…" : "Ask"}
              </button>
            </div>
            {ans && <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "10px 12px", fontSize: 12, lineHeight: 1.7, color: "#444", marginTop: 7, whiteSpace: "pre-line", borderRadius: "2px" }}>{ans}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────
function AdminPanel({ articles, onSave, onDelete, onClose }) {
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Economy", excerpt: "", content: "", author: "", read_time: "3 min", featured: false });
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openEdit = a => { setEditing(a); setForm({ title: a.title, category: a.category, excerpt: a.excerpt, content: a.content, author: a.author, read_time: a.read_time, featured: a.featured || false }); setView("edit"); };
  const openNew = () => { setEditing(null); setForm({ title: "", category: "Economy", excerpt: "", content: "", author: "", read_time: "3 min", featured: false }); setView("edit"); };

  const handleAiFill = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try { const d = await aiGenArticle(aiTopic, form.category); setForm(f => ({ ...f, ...d })); } catch {}
    setAiLoading(false); setAiTopic("");
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true); await onSave(form, editing?.id); setSaving(false); setView("list");
  };

  const Inp = React.memo(({ label, k, rows }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>{label}</label>
      {rows
        ? <textarea value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} rows={rows} style={{ width: "100%", border: "1px solid #ddd", borderRadius: "2px", padding: "9px 11px", fontSize: 13, outline: "none", fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }} />
        : <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", border: "1px solid #ddd", borderRadius: "2px", padding: "9px 11px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 700, display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}>
      <div style={{ background: "#0d0d0d", width: 52, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 4 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#e63946", fontSize: 20, cursor: "pointer", marginBottom: 12 }}>×</button>
        <button onClick={() => setView("list")} title="Articles" style={{ background: view === "list" ? "#e63946" : "none", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "2px", cursor: "pointer", fontSize: 14 }}>☰</button>
        <button onClick={openNew} title="New" style={{ background: view === "edit" && !editing ? "#e63946" : "none", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "2px", cursor: "pointer", fontSize: 20 }}>+</button>
      </div>
      <div style={{ background: "#fff", width: "min(660px,90vw)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#111", color: "#fff", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #e63946", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 800 }}>Naija<span style={{ color: "#e63946" }}>Today</span> Admin</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase" }}>{view === "list" ? "All Articles" : editing ? "Edit Article" : "New Article"}</div>
          </div>
          <div style={{ fontSize: 11, color: "#444" }}>{articles.length} articles</div>
        </div>
        <div style={{ padding: "22px", flex: 1 }}>
          {view === "list" && (
            <div>
              <button onClick={openNew} style={{ background: "#e63946", color: "#fff", border: "none", padding: "10px", borderRadius: "2px", cursor: "pointer", fontSize: 13, fontWeight: 700, width: "100%", marginBottom: 18 }}>+ Write New Article</button>
              {articles.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>No articles yet.</div>}
              {articles.map(a => (
                <div key={a.id} style={{ border: "1px solid #eee", borderRadius: "2px", padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "2px", background: IMG_GRADIENTS[a.category] || IMG_GRADIENTS.Economy, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 3, fontFamily: "'Playfair Display', Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: "#bbb", display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ color: CAT_COLORS[a.category], fontWeight: 700 }}>{a.category}</span>
                      <span>·</span><span>{a.author}</span>
                      {a.featured && <span style={{ color: "#e63946", fontWeight: 700 }}>★ Featured</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <button onClick={() => openEdit(a)} style={{ background: "#111", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "2px", cursor: "pointer", fontSize: 11 }}>Edit</button>
                    <button onClick={() => { setDeleting(a.id); onDelete(a.id).then(() => setDeleting(null)); }} disabled={deleting === a.id} style={{ background: "#fff", color: "#c1121f", border: "1px solid #c1121f", padding: "5px 10px", borderRadius: "2px", cursor: "pointer", fontSize: 11, opacity: deleting === a.id ? 0.5 : 1 }}>{deleting === a.id ? "…" : "Del"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "edit" && (
            <div>
              <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 12, marginBottom: 18, padding: 0 }}>← Back to list</button>
              <div style={{ background: "#f8f8f6", border: "1px solid #eee", padding: "14px", borderRadius: "2px", marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: 8 }}>🤖 AI Auto-Fill</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input placeholder="Enter a topic and AI writes the article…" value={aiTopic} onChange={e => setAiTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAiFill()}
                    style={{ flex: 1, border: "1px solid #ddd", borderRadius: "2px", padding: "8px 10px", fontSize: 12, outline: "none" }} />
                  <button onClick={handleAiFill} disabled={aiLoading || !aiTopic.trim()} style={{ background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "2px", cursor: "pointer", fontSize: 11, fontWeight: 700, opacity: (aiLoading || !aiTopic.trim()) ? 0.5 : 1, whiteSpace: "nowrap" }}>{aiLoading ? "Writing…" : "✦ Fill"}</button>
                </div>
              </div>
              <Inp label="Title *" k="title" />
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", border: "1px solid #ddd", borderRadius: "2px", padding: "9px 11px", fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box" }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Inp label="Excerpt" k="excerpt" />
              <Inp label="Full Content *" k="content" rows={9} />
              <Inp label="Author" k="author" />
              <Inp label="Read Time (e.g. 4 min)" k="read_time" />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <input type="checkbox" id="feat" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: 15, height: 15, cursor: "pointer" }} />
                <label htmlFor="feat" style={{ fontSize: 12, color: "#444", cursor: "pointer" }}>★ Mark as Featured Story</label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()} style={{ flex: 1, background: "#e63946", color: "#fff", border: "none", padding: 11, borderRadius: "2px", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving…" : editing ? "Update Article" : "Publish Article"}
                </button>
                <button onClick={() => setView("list")} style={{ padding: "11px 18px", border: "1px solid #ddd", background: "#fff", borderRadius: "2px", cursor: "pointer", fontSize: 13, color: "#555" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────
function LoginModal({ onLogin, onClose }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const handle = () => { if (pw === ADMIN_PASSWORD) { onLogin(); onClose(); } else setErr("Incorrect password."); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "2px", maxWidth: 360, width: "100%", padding: "34px" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 6 }}>Admin Login</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>Enter your password to access the dashboard.</div>
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()}
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: "2px", padding: "11px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
        {err && <div style={{ color: "#c1121f", fontSize: 12, marginBottom: 8 }}>{err}</div>}
        <button onClick={handle} style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: 11, borderRadius: "2px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Enter Dashboard</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────
function HomePage({ articles, loading, isAdmin, onAdminOpen, onArticleClick, activeCategory, setActiveCategory, search }) {
  const filtered = articles.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const q = search.toLowerCase();
    return matchCat && (!q || a.title.toLowerCase().includes(q) || (a.excerpt || "").toLowerCase().includes(q));
  });
  const featured = filtered.filter(a => a.featured).slice(0, 2);
  const rest = filtered.filter(a => !featured.includes(a));
  const Divider = ({ label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <span style={{ flex: 1, height: 1, background: "#ddd" }} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb" }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: "#ddd" }} />
    </div>
  );
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#aaa" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📰</div>
          <div style={{ fontSize: 14 }}>Loading articles…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: "#555" }}>No articles found</div>
          {isAdmin && <button onClick={onAdminOpen} style={{ marginTop: 14, background: "#e63946", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "2px", cursor: "pointer", fontWeight: 700 }}>Write the first one</button>}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <>
              <Divider label="Featured Stories" />
              <div style={{ display: "grid", gridTemplateColumns: featured.length === 1 ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 32 }}>
                {featured.map(a => <ArticleCard key={a.id} article={a} onClick={onArticleClick} />)}
              </div>
            </>
          )}
          {rest.length > 0 && (
            <>
              {featured.length > 0 && <Divider label="Latest News" />}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
                {rest.map(a => <ArticleCard key={a.id} article={a} onClick={onArticleClick} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("Home");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (isSupabaseConnected) {
        const data = await sb.getArticles();
        setArticles(data.length ? data : SEED);
      } else { setArticles(SEED); }
      setLoading(false);
    })();
  }, []);

  // When navigating to a category from the nav bar
  useEffect(() => {
    if (page.startsWith("cat:")) { setActiveCategory(page.replace("cat:", "")); setPage("Home"); }
    else if (page === "Home") setActiveCategory("All");
  }, [page]);

  const handleSave = async (form, id) => {
    const payload = { ...form };
    if (isSupabaseConnected) {
      if (id) { const u = await sb.updateArticle(id, payload); setArticles(prev => prev.map(a => a.id === id ? { ...a, ...u } : a)); showToast("Article updated!"); }
      else { const c = await sb.insertArticle({ ...payload, created_at: new Date().toISOString() }); setArticles(prev => [c, ...prev]); showToast("Article published!"); }
    } else {
      if (id) { setArticles(prev => prev.map(a => a.id === id ? { ...a, ...form } : a)); showToast("Updated (demo mode)"); }
      else { setArticles(prev => [{ ...form, id: Date.now(), created_at: new Date().toISOString() }, ...prev]); showToast("Published (demo mode)"); }
    }
  };

  const handleDelete = async (id) => {
    if (isSupabaseConnected) await sb.deleteArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
    showToast("Article deleted");
  };

  const onAdminClick = () => isAdmin ? setShowAdmin(true) : setShowLogin(true);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap'); @keyframes slideIn { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } } * { box-sizing: border-box; }`}</style>

      <Header page={page} setPage={setPage} search={search} setSearch={setSearch} isAdmin={isAdmin} onAdminClick={onAdminClick} articleCount={articles.length} />

      {page === "Home" && (
        <HomePage articles={articles} loading={loading} isAdmin={isAdmin} onAdminOpen={() => setShowAdmin(true)} onArticleClick={setSelectedArticle} activeCategory={activeCategory} setActiveCategory={setActiveCategory} search={search} />
      )}
      {page === "About" && <AboutPage />}
      {page === "Contact" && <ContactPage />}
      {page === "Privacy Policy" && <PrivacyPage />}

      <Footer setPage={setPage} />

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      {showLogin && <LoginModal onLogin={() => setIsAdmin(true)} onClose={() => setShowLogin(false)} />}
      {showAdmin && isAdmin && <AdminPanel articles={articles} onSave={handleSave} onDelete={handleDelete} onClose={() => setShowAdmin(false)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
