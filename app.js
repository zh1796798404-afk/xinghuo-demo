/* 星火平台 · 可交互 Demo（纯静态，双击 index.html 即用） */
"use strict";

/* ================= 状态 ================= */
const LS_KEY = "spark-demo-state";
function loadState() {
  try { return Object.assign(defaultState(), JSON.parse(localStorage.getItem(LS_KEY) || "{}")); }
  catch (e) { return defaultState(); }
}
function defaultState() {
  return { user: null, role: "user", likes: {}, favs: {}, patch: {}, myUploads: [], myTickets: [], chat: [], chats: [], curChat: null, menuOpen: false, agentOk: false };
}
let S = loadState();
function save() { localStorage.setItem(LS_KEY, JSON.stringify(S)); }

/* 合并种子数据与运行时改动 */
function allTools() {
  const base = SEED.tools.map(t => {
    const p = S.patch[t.id] || {};
    return Object.assign({}, t, p, {
      likes: t.likes + (p.likeDelta || 0),
      favs: t.favs + (p.favDelta || 0),
      reuse: t.reuse + (p.reuseDelta || 0),
      comments: t.comments.concat(p.newComments || []),
    });
  });
  return base.concat(S.myUploads);
}
function toolById(id) { return allTools().find(t => t.id === Number(id)); }
function patch(id, fn) { const p = S.patch[id] = S.patch[id] || {}; fn(p); save(); }
function allTickets() { return SEED.tickets.map(t => Object.assign({}, t, (S.patch["tk" + t.id] || {}))).concat(S.myTickets); }

/* ================= 工具函数 ================= */
function esc(s) { return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200); }
function openModal(html, lock) {
  const m = document.getElementById("modal");
  m.innerHTML = `<div class="modal-mask" ${lock ? "" : 'onclick="closeModal()"'}></div><div class="modal-card">${html}</div>`;
  m.classList.add("show");
}
function closeModal() { const m = document.getElementById("modal"); m.classList.remove("show"); m.innerHTML = ""; }
window.closeModal = closeModal;

function copyText(text, okMsg) {
  const done = () => toast(okMsg || "已复制到剪贴板");
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done)); }
  else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
  ta.select(); try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta); done();
}
function typeIcon(t) { return { "网页应用": "🖥️", "脚本": "📜", "Skill": "🤖", "表格模板": "📊", "桌面程序": "💻" }[t] || "🧰"; }
const GLYPHS = { /* Lucide (ISC) */
  "receipt-text": '<path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
  "newspaper": '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  "folder-pen": '<path d="M2 11.5V5a2 2 0 0 1 2-2h3.9c.7 0 1.3.3 1.7.9l.8 1.2c.4.6 1 .9 1.7.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9.5"/><path d="M11.378 13.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
  "chart-line": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  "languages": '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  "id-card": '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
  "table": '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  "scale": '<path d="M12 3v18"/><path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/><path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/><path d="M7 21h10"/>',
  "mic": '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  "headset": '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  "calculator": '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
  "calendar-clock": '<path d="M16 14v2.2l1.6 1"/><path d="M16 2v4"/><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M3 10h5"/><path d="M8 2v4"/><circle cx="16" cy="16" r="6"/>',
  "wrench": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>',
};
function appIcon(t, cls) {
  const g = t.g || ["#8E8E93", "#636366"];
  const glyph = GLYPHS[t.ic] || GLYPHS.wrench;
  return `<span class="app-icon ${cls || ""}" style="background:linear-gradient(135deg,${g[0]},${g[1]})"><svg viewBox="0 0 24 24">${glyph}</svg></span>`;
}
const FEATURED = [
  { id: 1, label: "本周编辑推荐", title: "告别一整天的发票录入", sub: "电子发票拖入即出报销 Excel，金额税号零容错" },
  { id: 4, label: "效率之星", title: "竞品动态，每天自动到手", sub: "价格与促销变化自动巡查，一张对比表看全" },
];
function agentBadge(t) { return t.agent ? '<span class="badge agent">需 agent 环境</span>' : '<span class="badge ready">即开即用</span>'; }
function statusBadge(st) {
  const map = { "待审核": "s1", "已上架": "s3", "已驳回": "s4", "待研判": "s1", "已接单": "s2", "制作中": "s2", "已结单": "s3" };
  return `<span class="status ${map[st] || "s1"}">${esc(st)}</span>`;
}

/* ================= 路由 ================= */
const routes = { "": vHome, "home": vHome, "market": vMarket, "rank": vRank, "spark": vSpark, "detail": vDetail, "upload": vUpload, "ticket": vTicket, "plugin": vPlugin, "envguide": vEnvGuide, "me": vMe, "admin": vAdmin };
function nav(hash) { location.hash = hash; }
function currentRoute() { const h = location.hash.replace(/^#\/?/, ""); const [name, arg] = h.split("/"); return { name: name || "home", arg }; }

let lastRouteName = null;
function paint() {
  const app = document.getElementById("app");
  renderNav();
  if (!S.user) { app.innerHTML = vLogin(); return; }
  const r = currentRoute();
  const view = routes[r.name] || vMarket;
  app.innerHTML = view(r.arg);
  afterRender(r);
  window.scrollTo(0, 0);
}
function render() {
  const r = currentRoute();
  const routeChanged = lastRouteName !== null && lastRouteName !== r.name;
  lastRouteName = r.name;
  if (routeChanged && S.user && document.startViewTransition) {
    document.startViewTransition(paint);
  } else {
    paint();
  }
}
window.addEventListener("hashchange", render);

/* ================= 顶栏 ================= */
function renderNav() {
  const el = document.getElementById("topnav");
  if (!S.user) { el.innerHTML = `<div class="nav-inner"><div class="logo"><img class="logo-img" src="logo.svg" alt=""><b>星火平台</b><em>SPARK</em></div><div class="nav-spacer"></div><span style="font-size:12px;color:#9b988f">公司内部 AI 提效平台 · 可交互 Demo</span></div>`; return; }
  const r = currentRoute().name;
  const IC = { /* Lucide icons (ISC) */
    home: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    market: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></svg>',
    rank: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>',
    ticket: '<svg class="nav-ic" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
    admin: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>',
  };
  const link = (h, label, ic) => `<a class="nav-link ${r === h ? "active" : ""}" href="#/${h}">${IC[ic] || ""}${label}</a>`;
  el.innerHTML = `<div class="nav-inner">
    <div class="logo" onclick="location.hash='#/home'"><img class="logo-img" src="logo.svg" alt=""><b>星火平台</b><em>SPARK</em></div>
    <nav class="nav-links">
      ${link("home", "首页", "home")}${link("market", "工具市场", "market")}${link("rank", "排行榜", "rank")}${link("ticket", "痛点提单", "ticket")}
      ${S.role === "admin" ? link("admin", "后台管理", "admin") : ""}
    </nav>
    <div class="user-chip" onclick="APP.toggleMenu(event)">
      <img class="avatar chip-av" src="${SEED.user.avatarImg}" alt=""><span>${esc(S.user.name)}</span>
      ${S.role === "admin" ? '<span class="role-badge">运营视角</span>' : ""}
      ${S.menuOpen ? `<div class="user-menu" onclick="event.stopPropagation()">
        <div onclick="APP.go('me')">👤 个人中心</div>
        <div onclick="APP.uploadGate()">📤 上传工具</div>
        <div onclick="APP.go('plugin')">🔥 插件下载</div>
        <div onclick="APP.toggleRole()">${S.role === "admin" ? "🔁 切回普通视角" : "🛠️ 切换运营视角"}</div>
        <div onclick="APP.resetDemo()">🧹 重置演示数据</div>
        <div onclick="APP.logout()">🚪 退出登录</div>
      </div>` : ""}
    </div>
  </div>`;
}

/* ================= 视图：登录 ================= */
function vLogin() {
  let cells = "";
  let seed = 7;
  for (let i = 0; i < 81; i++) { seed = (seed * 137 + 41) % 97; cells += `<i class="${seed % 2 ? "" : "w"}"></i>`; }
  return `<div class="login-wrap"><div class="card login-card">
    <img class="login-logo" src="logo.svg" alt="星火平台">
    <h1>星火平台</h1>
    <div class="slogan">找工具 · 做工具 · 传工具，提效从这里开始</div>
    <div class="qr">${cells}</div>
    <button class="btn" onclick="APP.login()">📱 模拟飞书扫码登录</button>
    <div class="hint">企业飞书统一认证（PRD 4.3）：登录即带出姓名与部门<br>Demo 环境点击按钮即模拟完成扫码授权</div>
  </div></div>`;
}

/* ================= 视图：首页 ================= */
function vHome() {
  const tools = allTools().filter(t => t.status === "已上架");
  const hot = [...tools].sort((a, b) => b.reuse - a.reuse).slice(0, 3);
  const totalReuse = tools.reduce((s, t) => s + t.reuse, 0);
  return `<div class="page">
    <div class="hero">
      <div class="hero-logo-wrap">
        <img class="hero-logo" src="logo.svg" alt="">
        <div class="hero-bubble" id="heroBubble" onclick="document.getElementById('homeAsk').focus()">嗨～我是小火苗！</div>
      </div>
      <h1>星火平台</h1>
      <p class="hero-sub">找工具 · 做工具 · 传工具 —— 让每个重复劳动都有一个提效工具</p>
      <div class="hero-search">
        <input id="homeAsk" placeholder="🔍 用大白话告诉小火苗：你工作里哪儿最麻烦？例如：每月要手动录入一堆发票" onkeydown="if(event.key==='Enter')APP.homeAsk()">
        <button class="btn" onclick="APP.homeAsk()">问小火苗</button>
      </div>
      <div class="hero-stats">
        <span><b>${tools.length}</b> 个工具在架</span><i></i>
        <span><b>${totalReuse}</b> 次累计复用</span><i></i>
        <span><b>${SEED.dashboard.savedHours.toLocaleString()}</b> 人时累计节省</span>
      </div>
    </div>
    <div class="entry-grid">
      <div class="entry-card" onclick="APP.go('market')"><div class="e-icon">🔍</div><div class="e-t">找工具</div><div class="e-d">工具市场逛一逛，找到就装</div></div>
      <div class="entry-card" onclick="APP.go('plugin')"><div class="e-icon">🛠</div><div class="e-t">做工具</div><div class="e-d">教练插件带你从痛点到工具</div></div>
      <div class="entry-card" onclick="APP.uploadGate()"><div class="e-icon">📤</div><div class="e-t">传工具</div><div class="e-d">现成工具上架市场 🎁 有奖励</div></div>
      <div class="entry-card" onclick="APP.go('ticket')"><div class="e-icon">📨</div><div class="e-t">痛点提单</div><div class="e-d">搭不出来？平台团队来跟进</div></div>
    </div>
    <div class="section-title">🔥 本周热门</div>
    <div class="grid">${hot.map(toolCard).join("")}</div>
  </div>`;
}

/* ================= 视图：工具市场 ================= */
function marketListHTML() {
  const f = marketFilter;
  const list = allTools().filter(t => t.status === "已上架").filter(t => {
    if (f.type && t.type !== f.type) return false;
    if (f.agent === "yes" && !t.agent) return false;
    if (f.agent === "no" && t.agent) return false;
    if (f.dept && t.dept !== f.dept) return false;
    if (f.q) { const hay = t.name + t.desc + t.tags.join(""); if (!hay.toLowerCase().includes(f.q.toLowerCase())) return false; }
    return true;
  }).sort((a, b) => b.reuse - a.reuse);
  return list.length ? `<div class="grid">${list.map(toolCard).join("")}</div>`
    : `<div class="empty">市场里还没有这个工具——正好，你可以成为第一个做出它的人。<br><span style="font-size:12.5px">用星火教练插件自己做一个，不会代码也行，最多问你 5 个问题；做完上架还有 Bold 币奖励 🎁</span><br><br><button class="btn" onclick="APP.go('plugin')">🛠 用教练插件做一个</button></div>`;
}
let marketFilter = { q: "", type: "", agent: "", dept: "" };
function vMarket() {
  const tools = allTools().filter(t => t.status === "已上架");
  const depts = [...new Set(tools.map(t => t.dept))];
  const f = marketFilter;
  return `<div class="page">
    <h1>工具市场</h1>
    <div class="sub">同事们上传的提效工具，找到就装；找不到？<a href="#/plugin">用教练插件自己做一个</a></div>
    <div class="feature-row">
      ${FEATURED.map(f => { const t = toolById(f.id); if (!t || t.status !== "已上架") return ""; return `
      <div class="feature-card" style="background:linear-gradient(135deg,${t.g[0]},${t.g[1]})" onclick="APP.go('detail/${t.id}')">
        <div class="f-label">${f.label}</div>
        <div class="f-title">${f.title}</div>
        <div class="f-sub">${f.sub}</div>
        <div class="f-foot">${appIcon(t, "mini")}<span class="f-name">${esc(t.name)}<i>${esc(t.type)} · ⬇ ${t.reuse} 次复用</i></span>
          <button class="get-btn light" onclick="event.stopPropagation();APP.download(${t.id})">获取</button></div>
      </div>`; }).join("")}
    </div>
    <div class="section-title">全部工具</div>
    <div class="filters">
      <input placeholder="搜索工具名称、描述、标签…" value="${esc(f.q)}" oninput="APP.mf('q',this.value)">
      <select onchange="APP.mf('type',this.value)">
        <option value="">全部类型</option>${["网页应用", "脚本", "Skill", "表格模板", "桌面程序"].map(t => `<option ${f.type === t ? "selected" : ""}>${t}</option>`).join("")}
      </select>
      <select onchange="APP.mf('agent',this.value)">
        <option value="">是否需 agent 环境</option><option value="no" ${f.agent === "no" ? "selected" : ""}>即开即用</option><option value="yes" ${f.agent === "yes" ? "selected" : ""}>需 agent 环境</option>
      </select>
      <select onchange="APP.mf('dept',this.value)">
        <option value="">全部部门</option>${depts.map(d => `<option ${f.dept === d ? "selected" : ""}>${esc(d)}</option>`).join("")}
      </select>
    </div>
    <div id="marketList">${marketListHTML()}</div>
  </div>`;
}
function toolCard(t) {
  const g = t.g || ["#8E8E93", "#636366"];
  const glyph = GLYPHS[t.ic] || GLYPHS.wrench;
  return `<div class="tool-card" onclick="APP.go('detail/${t.id}')">
    <div class="tool-cover" style="background:linear-gradient(135deg,${g[0]},${g[1]})">
      <svg class="cover-glyph" viewBox="0 0 24 24">${glyph}</svg>
      <div class="cover-win">
        <div class="cw-dots"><i></i><i></i><i></i></div>
        <div class="cw-title">${esc(t.name)}</div>
        <div class="cw-bar"></div><div class="cw-bar short"></div>
        <div class="cw-accent" style="background:linear-gradient(90deg,${g[0]},${g[1]})"></div>
      </div>
      ${t.agent ? '<span class="cover-badge">需 agent 环境</span>' : '<span class="cover-badge ready">即开即用</span>'}
    </div>
    <div class="tool-body">
      <div class="tool-head">${appIcon(t)}
        <div class="tool-tit"><div class="tool-name">${esc(t.name)}</div><div class="tool-sub2">${esc(t.type)}</div></div>
        <button class="get-btn" onclick="event.stopPropagation();APP.download(${t.id})">获取</button></div>
      <div class="tool-desc">${esc(t.desc)}</div>
      <div class="tool-author">
        ${t.av ? `<img class="avatar" src="${t.av}" alt="">` : `<span class="avatar" style="background:${g[0]}">${esc((t.owner || "?").charAt(0))}</span>`}
        <b>${esc(t.owner)}</b><span class="handle">@${esc(t.dept)}</span>
        <span class="a-right"><span class="rate">★ ${(t.rate || 5.0).toFixed(1)}</span><span>${t.reuse} 人使用</span><span class="cat">${esc(t.tags[0] || t.type)}</span></span>
      </div>
    </div>
  </div>`;
}




/* ================= 视图：排行榜 ================= */
let rankTab = "reuse";
const RANK_IC = {
  reuse: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/></svg>',
  likes: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>',
  dept: '<svg class="nav-ic" viewBox="0 0 24 24"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>',
};
function medal(n) {
  if (n > 3) return `<span class="rank-no">${n}</span>`;
  const g = [["#FFDF6B", "#EDAB0F"], ["#E9EBEF", "#ADB3BE"], ["#F0B183", "#C97C43"]][n - 1];
  return `<svg class="medal" viewBox="0 0 36 40">
    <defs><linearGradient id="md${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
    <path d="M18 1 33 9.5v17L18 35 3 26.5v-17Z" fill="url(#md${n})"/>
    <path d="M18 4 30.4 11v14L18 32 5.6 25V11Z" fill="rgba(255,255,255,.22)"/>
    <text x="18" y="24" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">${n}</text>
  </svg>`;
}
function vRank() {
  const tools = allTools().filter(t => t.status === "已上架");
  const CROWN = '<svg class="crown" viewBox="0 0 24 24"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>';
  const key = rankTab;
  let rows = "", myCard = "";
  if (rankTab === "dept") {
    rows = SEED.dashboard.deptHours.map((r, i) => `<div class="rank-item" style="cursor:default">${medal(i + 1)}
      <span class="rank-av dept-av">${RANK_IC.dept}</span>
      <div class="rank-main"><div class="n">${esc(r.dept)}</div><div class="d">按已上架工具的复用测算</div></div>
      <div class="rank-val">${r.hours} <i>人时</i></div></div>`).join("");
    const my = SEED.dashboard.deptHours.findIndex(x => SEED.user.dept.includes(x.dept.replace("其他部门", "__")));
    myCard = my >= 0 ? `我的部门 · 第 ${my + 1} 名` : "我的部门 · 产品中心 第 2 名";
  } else {
    const sorted = [...tools].sort((a, b) => b[key] - a[key]).slice(0, 8);
    rows = sorted.map((t, i) => `<div class="rank-item" onclick="APP.go('detail/${t.id}')">${medal(i + 1)}
      ${t.av ? `<img class="rank-av" src="${t.av}" alt="">` : `<span class="rank-av dept-av">${RANK_IC.dept}</span>`}
      <div class="rank-main"><div class="n">${esc(t.name)}</div><div class="d">${esc(t.owner)} · ${esc(t.dept)}</div></div>
      <div class="rank-val">${t[key]} <i>${key === "reuse" ? "次复用" : "点赞"}</i></div></div>`).join("");
    const mineBest = [...tools].sort((a, b) => b[key] - a[key]).findIndex(t => t.owner === S.user.name);
    myCard = mineBest >= 0 ? `我的最佳工具 · 第 ${mineBest + 1} 名 · ${[...tools].sort((a, b) => b[key] - a[key])[mineBest][key]} ${key === "reuse" ? "次复用" : "点赞"}` : "还没有上架工具，去做一个吧";
  }
  const tab = (k, label) => `<button class="${rankTab === k ? "on" : ""}" onclick="APP.rankTab('${k}')">${RANK_IC[k]}${label}</button>`;
  return `<div class="page">
    <div class="rank-hero">
      ${CROWN}
      <h1>排行榜</h1>
      <p>复用才是提效的实质 —— 北极星指标：累计节省工时</p>
      <div class="my-score"><img class="avatar" src="${SEED.user.avatarImg}" alt=""><b>${esc(S.user.name)}</b><span>${myCard}</span></div>
    </div>
    <div class="rank-tabs">${tab("reuse", "复用榜")}${tab("likes", "点赞榜")}${tab("dept", "部门贡献榜")}</div>
    ${rows}
  </div>`;
}

/* ================= 视图：小火苗 ================= */
const SK_IC = {
  panel: '<svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',
  msg: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
};
function vSpark() {
  const chats = S.chats || [];
  const cur = chats.find(c => c.id === S.curChat);
  const CHIPS = ["每月要手动录入一堆发票", "各门店销售数据合并很费劲", "英文文案要润色", "会议纪要整理太花时间", "想批量给新员工做工牌"];
  const item = c => `<div class="sk-item ${cur && c.id === cur.id ? "on" : ""}" onclick="APP.openChat(${c.id})">${SK_IC.msg}<span>${esc(c.title)}</span></div>`;
  const empty = `<div class="sk-empty">
      <img src="logo.svg" class="sk-logo" alt="">
      <h2>有什么我能帮你的吗？</h2>
      <p>用大白话描述你工作里最麻烦的事，我帮你找现成工具；找不到就带你做一个</p>
      <div class="sk-chips">${CHIPS.map(q => `<button onclick="APP.ask('${q}')">${q}</button>`).join("")}</div>
    </div>`;
  const msgs = cur && cur.msgs.length
    ? cur.msgs.map(m => `<div class="msg ${m.who === "me" ? "me" : ""}"><div class="who">${m.who === "me" ? `<img class="avatar" src="${SEED.user.avatarImg}" alt="">` : `<img src="logo.svg" style="width:22px;height:22px" alt="">`}</div><div class="bubble">${m.html}</div></div>`).join("")
    : empty;
  const collapsed = !!S.skCollapsed;
  return `<div class="spark-wrap">
    ${collapsed ? `<button class="sk-expand" onclick="APP.toggleSide()" title="展开历史对话">${SK_IC.panel}</button>` : ""}
    <aside class="sk-side ${collapsed ? "hide" : ""}">
      <div class="sk-brand"><img src="logo.svg" alt="">小火苗<button class="sk-fold" onclick="APP.toggleSide()" title="收起">${SK_IC.panel}</button></div>
      <button class="sk-new" onclick="APP.newChat()">${SK_IC.plus}新对话</button>
      <div class="sk-hist-label">历史对话</div>
      <div class="sk-hist">${chats.map(item).join("") || '<div class="sk-none">暂无历史对话</div>'}</div>
      <div class="sk-back" onclick="APP.go('home')">← 返回首页</div>
    </aside>
    <main class="sk-main">
      <div class="sk-msgs" id="chatBox">${msgs}</div>
      <div class="sk-inputbar">
        <div class="sk-input">
          <input id="sparkInput" placeholder="给小火苗发消息，例如：我每周要把 12 个部门的周报汇总成总表…" onkeydown="if(event.key==='Enter')APP.askInput()">
          <button class="sk-send" onclick="APP.askInput()">${SK_IC.up}</button>
        </div>
        <div class="sk-note">AI 检索可能有误 · 找不到现成工具时会引导你用教练插件自己做，或提单让平台跟进</div>
      </div>
    </main>
  </div>`;
}
function sparkMatch(q) {
  const tools = allTools().filter(t => t.status === "已上架");
  const grams = [];
  for (let i = 0; i < q.length - 1; i++) { const g = q.slice(i, i + 2); if (/[一-龥a-zA-Z]{2}/.test(g)) grams.push(g); }
  return tools.map(t => {
    const hay = t.name + t.desc + t.tags.join("");
    let score = 0; grams.forEach(g => { if (hay.includes(g)) score++; });
    return { t, score };
  }).filter(x => x.score >= 2).sort((a, b) => b.score - a.score).slice(0, 3).map(x => x.t);
}

/* ================= 视图：详情 ================= */
function vDetail(id) {
  const t = toolById(id);
  if (!t) return `<div class="page"><div class="empty">工具不存在</div></div>`;
  const g = t.g || ["#8E8E93", "#636366"];
  const glyph = GLYPHS[t.ic] || GLYPHS.wrench;
  const liked = S.likes[t.id], faved = S.favs[t.id];
  const rate = t.rate || 5.0;
  const steps = (t.usage || "").split(/[；;]/).map(x => x.trim()).filter(Boolean);
  const stars = Array.from({ length: 5 }, (_, i) => `<i class="${i < Math.round(rate) ? "on" : ""}">★</i>`).join("");
  return `<div class="page detail-page">
    <a class="d-back" href="#/market">← 返回市场</a>
    <div class="detail-hero" style="background:linear-gradient(135deg,${g[0]},${g[1]})">
      <span class="dh-icon"><svg viewBox="0 0 24 24">${glyph}</svg></span>
      <div class="dh-main">
        <div class="dh-title">${esc(t.name)}</div>
        <div class="dh-sub">${esc(t.type)}${t.agent ? " · 需 agent 环境" : " · 即开即用"} · ${esc(t.env)}</div>
        <div class="dh-author">${t.av ? `<img class="avatar" src="${t.av}" alt="">` : ""}<span>${esc(t.owner)} · ${esc(t.dept)} · 发布于 ${esc(t.date)}</span></div>
      </div>
      <div class="dh-cta">
        <button class="get-btn light big" onclick="APP.download(${t.id})">获取</button>
        <button class="dh-round like ${liked ? "on" : ""}" title="点赞" onclick="APP.like(${t.id})"><svg viewBox="0 0 24 24"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg></button>
        <button class="dh-round fav ${faved ? "on" : ""}" title="收藏" onclick="APP.fav(${t.id})"><svg viewBox="0 0 24 24"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"/></svg></button>
      </div>
    </div>
    <div class="stat-bar">
      <div class="sb-cell"><b>${rate.toFixed(1)}</b><span class="sb-stars">${stars}</span><span>评分</span></div>
      <div class="sb-cell"><b>${t.reuse}</b><span>复用次数</span></div>
      <div class="sb-cell"><b>${t.likes}</b><span>点赞</span></div>
      <div class="sb-cell"><b>${t.favs}</b><span>收藏</span></div>
      <div class="sb-cell"><b>${t.comments.length}</b><span>评论</span></div>
    </div>
    <div class="section-title">预览</div>
    <div class="shots">
      <div class="shot" style="background:linear-gradient(135deg,${g[0]}26,${g[1]}26)">
        <div class="cover-win shot-win"><div class="cw-dots"><i></i><i></i><i></i></div><div class="cw-title">${esc(t.name)}</div><div class="cw-bar"></div><div class="cw-bar short"></div><div class="cw-accent" style="background:linear-gradient(90deg,${g[0]},${g[1]})"></div></div>
      </div>
      <div class="shot" style="background:linear-gradient(135deg,${g[0]}26,${g[1]}26)">
        <span class="shot-glyph" style="background:linear-gradient(135deg,${g[0]},${g[1]})"><svg viewBox="0 0 24 24">${glyph}</svg></span>
      </div>
      <div class="shot" style="background:linear-gradient(135deg,${g[0]}26,${g[1]}26)">
        <div class="cover-win shot-win"><div class="shot-row" style="background:${g[0]}"></div><div class="shot-row w80"></div><div class="shot-row w95"></div><div class="shot-row w60"></div><div class="shot-row w90"></div></div>
      </div>
    </div>
    <div class="d-grid">
      <div>
        <div class="section-title">简介</div>
        <p class="d-desc">${esc(t.desc)}</p>
        <div class="section-title">使用方法 <button class="btn ghost small" style="margin-left:10px" onclick="APP.copyUsage(${t.id})">一键复制</button>${t.agent ? `<button class="btn ghost small" style="margin-left:8px" onclick="APP.copyInstallPrompt(${t.id})">复制安装提示词</button>` : ""}</div>
        <div class="d-steps">${steps.map((st, i) => `<div class="d-step"><i>${i + 1}</i><span>${esc(st.replace(/^第[一二三四五六七八九十\d]+步[:：]?\s*/, ""))}</span></div>`).join("")}</div>
      </div>
      <div>
        <div class="section-title">信息</div>
        <div class="info-grid">
          <div><span>类型</span><b>${esc(t.type)}</b></div>
          <div><span>发布人</span><b>${esc(t.owner)}</b></div>
          <div><span>所在部门</span><b>${esc(t.dept)}</b></div>
          <div><span>发布时间</span><b>${esc(t.date)}</b></div>
          <div><span>来源渠道</span><b>${esc(t.source)}</b></div>
          <div><span>运行环境</span><b>${esc(t.env)}</b></div>
          <div><span>标签</span><b>${t.tags.map(x => `<span class="tag">${esc(x)}</span>`).join(" ")}</b></div>
        </div>
      </div>
    </div>
    <div class="section-title">评论（${t.comments.length}）· 实名</div>
    <div class="card" style="padding:6px 22px 18px">
      ${t.comments.map(c => `<div class="comment"><span class="c-av" style="background:${g[0]}">${esc(c.user.charAt(0))}</span><div class="c-wrap"><div class="c-head">${esc(c.user)}（${esc(c.dept)}）<span>${esc(c.time)}</span></div><div class="c-body">${esc(c.text)}</div></div></div>`).join("") || '<div class="empty" style="padding:22px 0">还没有评论，用过就来说两句</div>'}
      <div class="comment-input"><input id="cmtInput" placeholder="说说你的使用体验…（署名：${esc(S.user.name)}）" onkeydown="if(event.key==='Enter')APP.comment(${t.id})"><button class="btn" onclick="APP.comment(${t.id})">发布</button></div>
    </div>
  </div>`;
}

/* ================= 视图：上传工具 ================= */
function vUpload() {
  return `<div class="page ticket-page">
    <div class="tk-head"><h1>手动上传工具</h1><p>填好上架信息，审核通过后进入工具市场 · 🎁 前 100 名上传每个上架工具奖励 20 Bold 币</p></div>
    <div class="card tk-card"><div class="form" style="max-width:none">
      <div class="row" style="gap:14px"><div class="ro" style="flex:1"><label>发布人（飞书身份自动带出）</label><input value="${esc(S.user.name)}" readonly></div>
      <div class="ro" style="flex:1"><label>所在部门</label><input value="${esc(SEED.user.dept)}" readonly></div></div>
      <div><label>工具名称 *</label><input id="upName" placeholder="一句话说清工具是什么"></div>
      <div class="tk-row2">
        <div><label>工具类型 *</label><select id="upType">${["网页应用", "脚本", "Skill", "表格模板", "桌面程序", "其他"].map(t => `<option>${t}</option>`).join("")}</select></div>
        <div><label>运行环境要求</label><input id="upEnv" placeholder="零依赖 / 需 Python3 / 需 agent 环境…"></div>
      </div>
      <div><label>工具描述 *</label><textarea id="upDesc" placeholder="解决什么痛点、适用场景"></textarea></div>
      <div><label>使用方法 *</label><textarea id="upUsage" placeholder="第一步：…；第二步：…（把用户当小白）"></textarea></div>
      <div><label>标签（逗号分隔）</label><input id="upTags" placeholder="数据处理, 报表"></div>
      <div class="notice">🔒 上传前请确认：包里不含未发布产品信息、机密数据和密钥；样例数据需脱敏，遵循公司信息安全规范。</div>
      <button class="btn tk-submit" onclick="APP.submitUpload()">提交，进入审核队列</button>
    </div></div>
    <div class="up-alt">嫌填表麻烦？<a href="#/plugin">用教练插件上传</a>——把工具文件夹拖给它，上架信息自动生成，一屏确认</div>
  </div>`;
}

/* ================= 视图：提单 ================= */
function vTicket() {
  const mine = allTickets();
  const rec = tk => `<div class="list-item"><div class="main">
      <div class="n">${esc(tk.title)}　<span class="rec-id">${esc(tk.id)}</span></div>
      <div class="d">${esc(tk.desc)}</div>
      <div class="rec-meta">${esc(tk.owner)} · ${esc(tk.dept)}　|　${esc(tk.freq)} · 单次 ${tk.minutes} 分钟 · ${tk.people} 人 · 紧急度${esc(tk.urgency)}${tk.reason ? `<br>驳回原因：${esc(tk.reason)}` : ""}${tk.linkedTool ? `<br>✓ 产出工具：<a href="#/detail/${tk.linkedTool}">${esc((toolById(tk.linkedTool) || {}).name || "")}</a>` : ""}</div>
    </div>${statusBadge(tk.status)}</div>`;
  return `<div class="page ticket-page">
    <div class="tk-head"><h1>痛点提单</h1><p>自己搭不出来？描述你的痛点，平台研判后下场跟进，做好的工具回流市场</p></div>
    <div class="card tk-card"><div class="form" style="max-width:none">
      <div><label>需求标题</label><input id="tkTitle" placeholder="一句话说清想解决什么问题"></div>
      <div><label>需求描述</label><textarea id="tkDesc" placeholder="现在怎么做、哪里麻烦、期望什么结果——从教练插件转来的单会自动带上你说过的话"></textarea></div>
      <div class="tk-trio-label"><label>提效三要素</label><span>决定研判优先级 = 频率 × 耗时 × 人数</span></div>
      <div class="tk-trio">
        <div class="tk-cell"><span>发生频率</span><div class="tk-inline">
          <select id="tkFreqUnit" onchange="APP.calcScore()"><option value="22">每天</option><option value="4.3">每周</option><option value="1" selected>每月</option></select>
          <input id="tkFreqN" type="number" value="1" min="1" oninput="APP.calcScore()"><i>次</i></div></div>
        <div class="tk-cell"><span>单次耗时</span><div class="tk-inline"><input id="tkMin" type="number" value="60" min="1" oninput="APP.calcScore()"><i>分钟</i></div></div>
        <div class="tk-cell"><span>涉及人数</span><div class="tk-inline"><input id="tkPpl" type="number" value="1" min="1" oninput="APP.calcScore()"><i>人</i></div></div>
      </div>
      <div class="tk-row2">
        <div><label>期望完成时间</label><input id="tkDue" type="date"></div>
        <div><label>紧急程度</label>
          <div class="seg">
            <button type="button" class="seg-btn" onclick="APP.setUrg(this,'高')">高</button>
            <button type="button" class="seg-btn on" onclick="APP.setUrg(this,'中')">中</button>
            <button type="button" class="seg-btn" onclick="APP.setUrg(this,'低')">低</button>
          </div>
          <input type="hidden" id="tkUrg" value="中">
        </div>
      </div>
      <div class="tk-score">
        <div class="tk-score-l"><b>提效潜力</b><span>平台按这个数排研判优先级</span></div>
        <div class="tk-score-val"><em id="tkScore">22</em>人时/月</div>
      </div>
      <button class="btn tk-submit" onclick="APP.submitTicket()">提交提单</button>
    </div></div>
    <div class="section-title">提单记录</div>
    ${mine.map(rec).join("") || '<div class="empty">暂无提单</div>'}
  </div>`;
}

/* ================= 视图：环境配置引导（占位） ================= */
function vEnvGuide() {
  return `<div class="page">
    <a class="d-back" href="#/market">← 返回市场</a>
    <div class="env-placeholder">
      <img src="logo.svg" style="width:56px;height:56px;margin-bottom:18px" alt="">
      <h2>环境安装配置引导</h2>
      <p>【用于展示 Codex / Claude Code 的配置教程，暂未开发】</p>
    </div>
  </div>`;
}

/* ================= 视图：插件下载 ================= */
let plugTab = "agent";
let pluginOk = false; // 本次会话内已确认装好环境
const PLUG_PROMPT = "帮我安装「星火提效工具制作教练」插件：https://github.com/zh1796798404-afk/xinghuo-productivity-tool-coach ，按仓库里 INSTALL.md 的说明完成安装，装好后告诉我怎么调用。";
function vPlugin() {
  if (!S.agentOk && !pluginOk) {
    return `<div class="page"><div class="plug-lock"><img src="logo.svg" style="width:56px;height:56px" alt=""><p>先回答一个小问题，马上就好…</p></div></div>`;
  }
  const tab = (k, label) => `<button class="plug-tab ${plugTab === k ? "on" : ""}" onclick="APP.plugTab('${k}')">${label}</button>`;
  const agentPanel = `
    <p class="plug-tip">将下方提示词复制给你的 AI 助手（<b>Claude Code、Codex</b>、Cursor、Trae 等），它会自动完成安装。</p>
    <div class="prompt-card"><span>提示词</span><div class="prompt-text">${esc(PLUG_PROMPT)}</div></div>
    <button class="btn plug-copy" onclick="APP.copyPlugPrompt()">复制提示词</button>`;
  const manualPanel = `<div style="text-align:left">
    <div class="step"><div class="no">1</div><div><div class="t">获取插件包</div><div class="b">从工具市场或平台管理员处下载 productivity-tool-coach.zip 并解压。</div></div></div>
    <div class="step"><div class="no">2</div><div><div class="t">拷贝到 skills 目录</div><div class="b">Claude Code：<b>~/.claude/skills/</b>　Codex：<b>~/.codex/skills/</b>　<button class="btn ghost small" onclick="copyText('~/.claude/skills/','路径已复制')">复制路径</button></div></div></div>
    <div class="step"><div class="no">3</div><div><div class="t">开始使用</div><div class="b">新开会话，输入 <b>/productivity-tool-coach</b>（Codex 为 <b>$productivity-tool-coach</b>），选「A 造新工具」或「B 上传现成工具」。</div></div></div>
  </div>`;
  return `<div class="page plug-page">
    <div class="plug-hero">
      <img class="hero-logo" src="logo.svg" alt="">
      <div class="plug-name">星火教练插件</div>
      <h1>一句提示词，装进你的 Agent</h1>
      <p>制作模式从痛点到工具，上传模式一键回流市场 —— 同一台机器只装一次</p>
    </div>
    <div class="plug-tabs">${tab("agent", "通过 AI Agent 安装")}${tab("manual", "手动安装")}</div>
    <div class="plug-panel">${plugTab === "agent" ? agentPanel : manualPanel}</div>
    <div class="plug-foot">✅ 配置完成后，新开会话输入 <b>/productivity-tool-coach</b> 即可开始　·　🎁 做完的工具上架回流，前 100 名奖励 20 Bold 币</div>
  </div>`;
}

/* ================= 视图：个人中心 ================= *//* ================= 视图：个人中心 ================= */
function vMe() {
  const favTools = allTools().filter(t => S.favs[t.id]);
  const myUp = allTools().filter(t => t.owner === S.user.name && (t.source || "").includes("上传") || S.myUploads.some(u => u.id === t.id));
  const made = allTools().filter(t => t.owner === S.user.name && t.source === "教练制作回流");
  const myTk = allTickets().filter(t => t.owner === S.user.name);
  const li = t => `<div class="list-item" ${t.status === "已上架" ? `onclick="APP.go('detail/${t.id}')" style="cursor:pointer"` : ""}>
    <div class="main"><div class="n">${appIcon(t, "sm")}${esc(t.name)}</div><div class="d">${esc(t.date)} · ⬇ ${t.reuse} 复用 · ❤ ${t.likes}${t.reason ? `<br>❗ 驳回原因：${esc(t.reason)}（修改后可二次提交）` : ""}</div></div>${statusBadge(t.status)}</div>`;
  return `<div class="page"><h1>个人中心</h1><div class="sub" style="display:flex;align-items:center;gap:8px"><img class="avatar" src="${SEED.user.avatarImg}" alt="" style="width:30px;height:30px"> ${esc(S.user.name)} · ${esc(SEED.user.dept)}（飞书身份自动带出）</div>
    <div class="section-title">🛠 我制作的工具（教练制作回流）</div>${made.map(li).join("") || '<div class="empty">还没有，去试试教练插件</div>'}
    <div class="section-title">📤 我上传的工具</div>${myUp.length ? myUp.map(li).join("") : '<div class="empty">暂无上传记录</div>'}
    <div class="section-title">📨 我的提单</div>${myTk.length ? myTk.map(tk => `<div class="list-item"><div class="main"><div class="n">${esc(tk.title)}</div><div class="d">${esc(tk.id)} · ${esc(tk.date)}</div></div>${statusBadge(tk.status)}</div>`).join("") : '<div class="empty">暂无提单</div>'}
    <div class="section-title">⭐ 我的收藏</div>${favTools.length ? favTools.map(li).join("") : '<div class="empty">暂无收藏</div>'}
  </div>`;
}

/* ================= 视图：后台管理 ================= */
let adminTab = "review";
function vAdmin() {
  if (S.role !== "admin") return `<div class="page"><div class="empty">需要运营视角（右上角头像菜单切换）</div></div>`;
  const tab = (k, label) => `<button class="${adminTab === k ? "on" : ""}" onclick="APP.adminTab('${k}')">${label}</button>`;
  let body = "";
  if (adminTab === "review") {
    const pending = allTools().filter(t => t.status === "待审核");
    const done = allTools().filter(t => t.status === "已驳回");
    body = pending.map(t => `<div class="list-item"><div class="main"><div class="n">${appIcon(t, "sm")}${esc(t.name)}　<span class="tag">${esc(t.type)}</span></div>
      <div class="d">${esc(t.desc)}<br>发布人：${esc(t.owner)}（${esc(t.dept)}）· 来源：${esc(t.source)} · 使用方法：${esc(t.usage)}</div></div>
      <button class="btn small" onclick="APP.approve(${t.id})">✅ 通过上架</button>
      <button class="btn small danger" onclick="APP.reject(${t.id})">驳回</button></div>`).join("") || '<div class="empty">审核队列空啦 🎉</div>';
    if (done.length) body += `<div class="section-title">已驳回</div>` + done.map(t => `<div class="list-item"><div class="main"><div class="n">${esc(t.name)}</div><div class="d">原因：${esc(t.reason || "")}</div></div>${statusBadge(t.status)}</div>`).join("");
  } else if (adminTab === "ticket") {
    const tks = allTickets().sort((a, b) => scoreOf(b) - scoreOf(a));
    body = tks.map(tk => `<div class="list-item"><div class="main"><div class="n">${esc(tk.title)}　<span style="font-size:12px;color:#3370ff;font-weight:700">潜力分 ${scoreOf(tk)} 人时/月</span></div>
      <div class="d">${esc(tk.id)} · ${esc(tk.owner)}（${esc(tk.dept)}）· 频率 ${esc(tk.freq)} × ${tk.minutes} 分钟 × ${tk.people} 人 · 紧急度 ${esc(tk.urgency)}</div></div>
      ${statusBadge(tk.status)}
      ${tk.status === "待研判" ? `<button class="btn small" onclick="APP.tkAction('${tk.id}','已接单')">接单</button><button class="btn small danger" onclick="APP.tkAction('${tk.id}','已驳回')">驳回</button>` : ""}
      ${tk.status === "已接单" || tk.status === "制作中" ? `<button class="btn small" onclick="APP.tkAction('${tk.id}','已结单')">结单关联工具</button>` : ""}
    </div>`).join("");
  } else {
    body = vDashboard();
  }
  return `<div class="page"><h1>后台管理</h1><div class="sub">审核上架 · 提单研判 · 数据统计看板（PRD 4.4 / 4.5 / 6）</div>
    <div class="admin-tabs">${tab("review", "📋 审核队列")}${tab("ticket", "📨 提单研判")}${tab("board", "📊 数据看板")}</div>${body}</div>`;
}
function scoreOf(tk) {
  const m = { "每天": 22, "每周": 4.3, "每月": 1 };
  const mt = tk.freq.match(/(每天|每周|每月)(\d+)次/);
  const monthly = mt ? m[mt[1]] * Number(mt[2]) : 1;
  return Math.round(monthly * tk.minutes / 60 * tk.people);
}

/* ---- 数据看板（图表规范：单色系、细标记、直接数值标签、悬停提示） ---- */
function vDashboard() {
  const d = SEED.dashboard;
  const totalReuse = allTools().reduce((s, t) => s + t.reuse, 0);
  const online = allTools().filter(t => t.status === "已上架").length;
  const maxH = Math.max(...d.deptHours.map(x => x.hours));
  const bars = d.deptHours.map(x => `<div class="hbar-row"><div class="hbar-label">${esc(x.dept)}</div>
    <div class="hbar-track"><div class="hbar-fill" style="width:${(x.hours / maxH * 100).toFixed(1)}%"></div><span class="hbar-val">${x.hours}</span></div></div>`).join("");
  return `<div>
    <div class="tiles">
      <div class="tile"><div class="v hero">${d.savedHours.toLocaleString()}</div><div class="k">⭐ 北极星 · 累计节省工时（人时）</div></div>
      <div class="tile"><div class="v">${online}</div><div class="k">已上架工具</div></div>
      <div class="tile"><div class="v">${totalReuse}</div><div class="k">累计复用次数</div></div>
      <div class="tile"><div class="v">${d.coveredUsers}</div><div class="k">覆盖受益人数</div></div>
      <div class="tile"><div class="v">${d.buildSessions}</div><div class="k">教练制作会话数</div></div>
      <div class="tile"><div class="v">${Math.round(d.buildSuccessRate * 100)}%</div><div class="k">成品率 · 平均 ${d.avgQuestions} 问</div></div>
      <div class="tile"><div class="v">${Math.round(d.uploadRate * 100)}%</div><div class="k">做完工具后的上传率</div></div>
    </div>
    <div class="charts">
      <div class="chart-card"><h3>近 30 天复用次数趋势</h3><div class="cap">复制安装命令 + 下载跳转 + 安装成功 计入复用（PRD 5.6）</div>${lineChart(d.reuseTrend)}</div>
      <div class="chart-card"><h3>部门贡献榜 · 累计节省工时</h3><div class="cap">单位：人时；按工具复用测算</div>${bars}</div>
    </div>
    <div class="viz-tip" id="vizTip"></div>
  </div>`;
}
function lineChart(data) {
  const W = 460, H = 180, P = 28;
  const max = Math.max(...data) * 1.15;
  const x = i => P + i * (W - P - 10) / (data.length - 1);
  const y = v => H - P - v / max * (H - P - 14);
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  const gridY = [0.25, 0.5, 0.75, 1].map(f => `<line x1="${P}" x2="${W - 10}" y1="${y(max * f / 1.15).toFixed(1)}" y2="${y(max * f / 1.15).toFixed(1)}" stroke="#eef0f2" stroke-width="1"/>`).join("");
  const dots = data.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="8" fill="transparent" data-v="${v}" data-d="${i + 1}" class="hotdot"/>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%" id="trendSvg" role="img" aria-label="近30天复用趋势折线图">
    ${gridY}
    <polyline points="${pts}" fill="none" stroke="var(--series-1)" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="${x(data.length - 1)}" cy="${y(last)}" r="4" fill="var(--series-1)"/>
    <text x="${x(data.length - 1) - 6}" y="${y(last) - 10}" font-size="12" fill="#1f2329" font-weight="700">${last}</text>
    <text x="${P}" y="${H - 8}" font-size="11" fill="#8f959e">30 天前</text>
    <text x="${W - 46}" y="${H - 8}" font-size="11" fill="#8f959e">今天</text>
    ${dots}
  </svg>`;
}

/* ================= 交互动作 ================= */
window.APP = {
  go(h) { S.menuOpen = false; save(); nav(h); },
  login() { S.user = { name: SEED.user.name }; save(); render(); toast("✅ 飞书授权成功，欢迎 " + SEED.user.name); },
  logout() { S.user = null; S.menuOpen = false; save(); nav("market"); render(); },
  toggleMenu(e) { e.stopPropagation(); S.menuOpen = !S.menuOpen; renderNav(); },
  toggleRole() { S.role = S.role === "admin" ? "user" : "admin"; S.menuOpen = false; save(); nav(S.role === "admin" ? "admin" : "market"); render(); toast(S.role === "admin" ? "已切换为运营视角" : "已切回普通视角"); },
  resetDemo() { localStorage.removeItem(LS_KEY); location.reload(); },
  mf(k, v) { marketFilter[k] = v; const el = document.getElementById("marketList"); if (el) el.innerHTML = marketListHTML(); else render(); },
  rankTab(k) { rankTab = k; render(); },
  adminTab(k) { adminTab = k; render(); },

  ask(q) { doAsk(q); },
  newChat() { if (!S.chats) S.chats = []; const c = { id: Date.now() % 1e9, title: "新对话", msgs: [] }; S.chats.unshift(c); S.curChat = c.id; save(); render(); },
  openChat(id) { S.curChat = id; save(); render(); },
  toggleSide() { S.skCollapsed = !S.skCollapsed; save(); render(); },
  homeAsk() {
    const el = document.getElementById("homeAsk"); const q = el && el.value.trim();
    S.curChat = null; save();
    location.hash = "#/spark";
    if (q) setTimeout(() => doAsk(q), 30);
  },
  askInput() { const el = document.getElementById("sparkInput"); if (el && el.value.trim()) { doAsk(el.value.trim()); } },

  like(id) { const on = !S.likes[id]; S.likes[id] = on; patch(id, p => p.likeDelta = (p.likeDelta || 0) + (on ? 1 : -1)); render(); },
  fav(id) { const on = !S.favs[id]; S.favs[id] = on; patch(id, p => p.favDelta = (p.favDelta || 0) + (on ? 1 : -1)); render(); toast(on ? "已收藏，可在个人中心查看" : "已取消收藏"); },
  download(id) {
    const t = toolById(id);
    if (t && t.agent) { APP.agentGate(id); return; }
    patch(id, p => p.reuseDelta = (p.reuseDelta || 0) + 1); render(); toast("⬇️ 已开始下载（Demo）· 复用 +1 已计入看板");
  },
  agentGate(id) {
    if (S.agentOk) { APP.showPrompt(id); return; }
    const t = toolById(id);
    openModal(`
      <div class="m-icon">${appIcon(t)}</div>
      <h3>需要 agent 环境</h3>
      <p>「${esc(t.name)}」需要在 <b>Codex / Claude Code</b> 里运行。<br>你的电脑已经装好这类 agent 工具了吗？</p>
      <div class="m-actions">
        <button class="btn ghost" onclick="APP.agentNo()">否，还没装</button>
        <button class="btn" onclick="APP.agentYes(${id})">是，装好了</button>
      </div>
      <label class="m-remember"><input type="checkbox" id="noRemind">不再提醒</label>
    `);
  },
  agentYes(id) {
    const cb = document.getElementById("noRemind");
    if (cb && cb.checked) { S.agentOk = true; save(); }
    APP.showPrompt(id);
  },
  agentNo() { closeModal(); APP.go("envguide"); },
  uploadGate() {
    const IC_BOT = '<svg viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
    const IC_PEN = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>';
    openModal(`
      <h3>把你的工具搬上市场</h3>
      <p>选一种上传方式 · 🎁 前 100 名上传有 Bold 币奖励</p>
      <div class="m-opts">
        <div class="m-opt" onclick="closeModal();APP.go('plugin')">
          <span class="m-rec">推荐</span>
          <div class="m-opt-ic">${IC_BOT}</div>
          <div><div class="t">用星火教练插件上传</div><div class="d">把工具文件夹拖给插件，上架信息自动解析生成，你一屏确认即可</div></div>
        </div>
        <div class="m-opt" onclick="closeModal();APP.go('upload')">
          <div class="m-opt-ic">${IC_PEN}</div>
          <div><div class="t">手动填表上传</div><div class="d">自己填写名称、描述、使用方法等信息，约 3 分钟</div></div>
        </div>
      </div>
    `);
  },
  pluginYes() {
    const cb = document.getElementById("noRemind");
    if (cb && cb.checked) { S.agentOk = true; save(); }
    pluginOk = true; closeModal(); render();
  },
  plugTab(k) { plugTab = k; render(); },
  copyPlugPrompt() { copyText(PLUG_PROMPT, "已复制，去 Codex / Claude Code 粘贴发送即可安装"); },
  showPrompt(id) {
    const t = toolById(id);
    const promptText = `请帮我安装并配置「${t.name}」：${t.usage}`;
    openModal(`
      <div class="m-icon">${appIcon(t)}</div>
      <h3>复制安装提示词</h3>
      <p>打开 <b>Codex / Claude Code</b>，把下面这段直接粘贴发送，agent 会帮你装好：</p>
      <div class="m-code" id="mPrompt">${esc(promptText)}</div>
      <div class="m-actions">
        <button class="btn" style="flex:1" onclick="APP.copyPromptGo(${id})">复制提示词</button>
      </div>
      <div class="m-note">复制即计入一次复用 · 粘贴到 agent 对话框发送即可</div>
    `);
  },
  copyPromptGo(id) {
    const t = toolById(id);
    copyText(`请帮我安装并配置「${t.name}」：${t.usage}`, "已复制，去 Codex / Claude Code 粘贴发送吧");
    patch(id, p => p.reuseDelta = (p.reuseDelta || 0) + 1);
    closeModal(); render();
  },
  copyUsage(id) { copyText(toolById(id).usage, "使用方法已复制"); },
  copyInstallPrompt(id) { const t = toolById(id); copyText(`请帮我安装并配置「${t.name}」：${t.usage}`, "安装提示词已复制，粘贴给你的 agent 即可"); },
  copyCmd() { copyText("curl -s https://spark.insta360.internal/install.sh | bash -s -- --token=SPK-你的专属凭证", "安装命令已复制（含你的专属凭证）"); },
  comment(id) {
    const el = document.getElementById("cmtInput"); const text = el && el.value.trim(); if (!text) return;
    patch(id, p => { (p.newComments = p.newComments || []).push({ user: S.user.name, dept: SEED.user.dept, text, time: new Date().toISOString().slice(0, 10), likes: 0 }); });
    render(); toast("评论已发布（实名）");
  },

  submitUpload() {
    const v = id => (document.getElementById(id) || {}).value || "";
    if (!v("upName").trim() || !v("upDesc").trim() || !v("upUsage").trim()) { toast("请填写名称、描述和使用方法"); return; }
    const id = 100 + S.myUploads.length;
    const palette = [["#FF9500","#FF5E3A"],["#5AC8FA","#007AFF"],["#34C759","#30B0C7"],["#AF52DE","#5856D6"],["#FF6482","#FF2D55"]];
    S.myUploads.push({ id, g: palette[id % palette.length], ic: "wrench", av: SEED.user.avatarImg, rate: 5.0, name: v("upName").trim(), type: v("upType"), agent: /agent/i.test(v("upEnv")),
      desc: v("upDesc").trim(), usage: v("upUsage").trim(), tags: v("upTags").split(/[,，]/).map(s => s.trim()).filter(Boolean),
      owner: S.user.name, dept: SEED.user.dept, date: new Date().toISOString().slice(0, 10),
      env: v("upEnv").trim() || "未填写", source: "平台手动上传", status: "待审核", reuse: 0, likes: 0, favs: 0, comments: [] });
    save(); nav("me"); toast("✅ 已提交，进入审核队列（可切运营视角体验审核）");
  },

  setUrg(btn, v) {
    btn.parentElement.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    document.getElementById("tkUrg").value = v;
  },
  calcScore() {
    const unit = Number((document.getElementById("tkFreqUnit") || {}).value || 1);
    const n = Number((document.getElementById("tkFreqN") || {}).value || 1);
    const min = Number((document.getElementById("tkMin") || {}).value || 0);
    const ppl = Number((document.getElementById("tkPpl") || {}).value || 1);
    const el = document.getElementById("tkScore"); if (el) el.textContent = Math.round(unit * n * min / 60 * ppl);
  },
  submitTicket() {
    const v = id => (document.getElementById(id) || {}).value || "";
    if (!v("tkTitle").trim() || !v("tkDesc").trim()) { toast("请填写标题和描述"); return; }
    const unitTxt = { "22": "每天", "4.3": "每周", "1": "每月" }[v("tkFreqUnit")] || "每月";
    S.myTickets.push({ id: "T-2026-" + String(20 + S.myTickets.length).padStart(3, "0"), title: v("tkTitle").trim(), desc: v("tkDesc").trim(),
      freq: unitTxt + (v("tkFreqN") || 1) + "次", minutes: Number(v("tkMin") || 0), people: Number(v("tkPpl") || 1),
      urgency: v("tkUrg"), status: "待研判", owner: S.user.name, dept: SEED.user.dept, date: new Date().toISOString().slice(0, 10), linkedTool: null });
    save(); render(); toast("✅ 提单已提交，等待平台研判（可切运营视角体验）");
  },

  approve(id) { setToolStatus(id, { status: "已上架" }); toast("✅ 已通过上架，工具市场可见"); },
  reject(id) {
    const reason = prompt("驳回原因（必填，将通知上传者）：");
    if (!reason || !reason.trim()) { toast("驳回必须填写原因"); return; }
    setToolStatus(id, { status: "已驳回", reason: reason.trim() }); toast("已驳回并通知上传者");
  },
  tkAction(id, st) {
    let extra = {};
    if (st === "已驳回") { const r = prompt("驳回原因（必填）："); if (!r || !r.trim()) { toast("驳回必须填写原因"); return; } extra.reason = r.trim(); }
    if (st === "已结单") {
      const cands = allTools().filter(t => t.status === "已上架").map(t => `${t.id}=${t.name}`).join("\n");
      const tid = prompt("结单必须关联产出工具 ID（打通提单转工具率）：\n" + cands);
      const t = toolById(tid); if (!t) { toast("未找到该工具 ID"); return; }
      extra.linkedTool = t.id;
    }
    const seedTk = SEED.tickets.find(t => t.id === id);
    if (seedTk) { S.patch["tk" + id] = Object.assign(S.patch["tk" + id] || {}, { status: st }, extra); }
    else { const mine = S.myTickets.find(t => t.id === id); if (mine) Object.assign(mine, { status: st }, extra); }
    save(); render(); toast("提单状态 → " + st);
  },
};
function setToolStatus(id, obj) {
  const mine = S.myUploads.find(t => t.id === Number(id));
  if (mine) Object.assign(mine, obj); else patch(Number(id), p => Object.assign(p, obj));
  save(); render();
}

/* 小火苗对话（多会话） */
function doAsk(q) {
  if (!S.chats) S.chats = [];
  let cur = S.chats.find(c => c.id === S.curChat);
  if (!cur) { cur = { id: Date.now() % 1e9, title: "新对话", msgs: [] }; S.chats.unshift(cur); S.curChat = cur.id; }
  if (!cur.msgs.length) cur.title = q.slice(0, 16) + (q.length > 16 ? "…" : "");
  cur.msgs.push({ who: "me", html: esc(q) });
  const hits = sparkMatch(q);
  let reply;
  if (hits.length) {
    reply = `帮你找到 ${hits.length} 个现成工具，点开直接用 👇` + hits.map(t =>
      `<div class="mini-tool" onclick="APP.go('detail/${t.id}')"><div class="n">${esc(t.name)}　<span style="font-size:12px;color:#9b988f">⬇ ${t.reuse} 复用 · ★ ${(t.rate || 5).toFixed(1)}</span></div><div class="d">${esc(t.desc)}</div></div>`).join("");
  } else {
    reply = `市场里暂时没有现成的，但你有两条路：
      <div class="mini-tool" onclick="APP.go('plugin')"><div class="n">🛠 用星火教练插件自己做一个</div><div class="d">不会代码也行，最多问你 5 个问题；做完一键回流市场（前 100 名有 Bold 币奖励）</div></div>
      <div class="mini-tool" onclick="APP.go('ticket')"><div class="n">📨 提单让平台团队跟进</div><div class="d">你刚才的描述会自动带入提单表，不用重写</div></div>`;
  }
  cur.msgs.push({ who: "bot", html: reply });
  if (cur.msgs.length > 40) cur.msgs = cur.msgs.slice(-40);
  save(); render();
  const box = document.getElementById("chatBox"); if (box) box.scrollTop = box.scrollHeight;
}

/* 图表悬停提示 */
const BUBBLE_LINES = [
  "嗨～我是小火苗！",
  "今天想偷个懒吗？嘿嘿",
  "重复的活儿，交给我烧掉！",
  "说说看，哪儿最麻烦？",
  "做好的工具记得上架呀～",
];
let bubbleTimer = null, bubbleIdx = 0;
function afterRender(r) {
  if (r.name === "plugin" && !S.agentOk && !pluginOk) {
    openModal(`
      <div class="m-icon"><img src="logo.svg" style="width:56px;height:56px" alt=""></div>
      <h3>需要 agent 环境</h3>
      <p>「星火教练插件」需要运行在 <b>Codex / Claude Code</b> 里。<br>你的电脑已经装好这类 agent 工具了吗？</p>
      <div class="m-actions">
        <button class="btn ghost" onclick="APP.agentNo()">否，还没装</button>
        <button class="btn" onclick="APP.pluginYes()">是，装好了</button>
      </div>
      <label class="m-remember"><input type="checkbox" id="noRemind">不再提醒</label>
    `, true);
  }
  clearInterval(bubbleTimer);
  const bub = document.getElementById("heroBubble");
  if (bub) {
    bubbleTimer = setInterval(() => {
      bubbleIdx = (bubbleIdx + 1) % BUBBLE_LINES.length;
      bub.textContent = BUBBLE_LINES[bubbleIdx];
      bub.classList.remove("pop"); void bub.offsetWidth; bub.classList.add("pop");
    }, 3200);
  }
  const tip = document.getElementById("vizTip");
  document.querySelectorAll(".hotdot").forEach(dot => {
    dot.addEventListener("mousemove", e => {
      tip.style.display = "block"; tip.textContent = `第 ${dot.dataset.d} 天 · 复用 ${dot.dataset.v} 次`;
      tip.style.left = (e.clientX + 12) + "px"; tip.style.top = (e.clientY - 30) + "px";
    });
    dot.addEventListener("mouseleave", () => { tip.style.display = "none"; });
  });
  const box = document.getElementById("chatBox"); if (box) box.scrollTop = box.scrollHeight;
}
document.body.addEventListener("click", () => { if (S.menuOpen) { S.menuOpen = false; renderNav(); } });

/* 自检（?selftest）：无头浏览器验证用 */
if (location.search.includes("selftest")) {
  S = defaultState(); S.user = { name: SEED.user.name };
  if (location.search.includes("board")) { S.role = "admin"; adminTab = "board"; location.hash = "#/admin"; }
  else if (location.search.includes("liked")) { S.likes[1] = true; S.favs[1] = true; location.hash = "#/detail/1"; }
  else if (location.search.includes("gate")) { location.hash = "#/market"; setTimeout(() => APP.agentGate(5), 80); }
  else if (location.search.includes("noresult")) { marketFilter.q = "不存在的工具xyz"; location.hash = "#/market"; }
  else if (location.search.includes("plugok")) { S.agentOk = true; location.hash = "#/plugin"; }
  else if (location.search.includes("chatmiss")) { location.hash = "#/spark"; setTimeout(() => doAsk("11"), 120); }
  else if (location.search.includes("upchoice")) { location.hash = "#/home"; setTimeout(() => APP.uploadGate(), 120); }
  else if (!location.hash) { location.hash = "#/market"; }
  render();
  const cards = document.querySelectorAll(".tool-card").length;
  const ok = cards >= 10 && typeof sparkMatch === "function" && sparkMatch("发票录入好麻烦").length >= 1;
  document.title = (ok ? "DEMO_OK" : "DEMO_FAIL") + " cards=" + cards;
} else {
  render();
}
