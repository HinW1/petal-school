(function(){
const $ = s => document.querySelector(s);
const app = $("#app");
const F = window.FLOWERS, L = window.LESSONS, LV = window.LEVELS, V = window.VIDEOS || {}, CR = window.CREDITS || [];
const fById = Object.fromEntries(F.map(f=>[f.id,f]));
const crById = Object.fromEntries(CR.map(c=>[c.id,c]));
// 喺 claude.ai Artifact 入面唔可以內嵌 YouTube，就改為連結出去
const EMBED = (() => { try { return window.self !== window.top; } catch(e) { return true; } })();
const LANG = { yue:"粵語", zh:"國語", en:"English", ko:"韓語", ja:"日語" };

// ── 進度（只存喺呢部機） ──
const KEY = "flora.v1";
let S = { done:{}, checks:{}, quiz:{ right:0, total:0, best:0 }, last:null };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch(e){}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
const icon = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
  course:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z"/></svg>',
  flower:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="2.4"/><path d="M12 6.6C11 3.5 13 2.5 14.2 4.2c1.6-1.3 3.6.5 2 2.5 2.2.8 1.6 3.4-.6 3.3.6 2.3-1.8 3.2-3 1.4M12 6.6C13 3.5 11 2.5 9.8 4.2 8.2 2.9 6.2 4.7 7.8 6.7 5.6 7.5 6.2 10.1 8.4 10c-.6 2.3 1.8 3.2 3 1.4M12 11.4V21M12 17c-2-2.5-5-2-6-1 2 2 4 2 6 1zM12 15c2-2 4.5-2 5.5-1-1.5 1.8-3.5 2-5.5 1"/></svg>',
  wrap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21L4 6l6-3 2 3 2-3 6 3z"/><path d="M8 11h8"/><path d="M12 6v15"/></svg>',
  quiz:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.5M12 17h.01"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/></svg>'
};
const IM = window.IMGS || {};
const has = (dir, id) => (IM[dir] || []).includes(id);
// 花材：有去背版就用去背（Cut-out），冇就用原相
const fSrc = id => has("flowers-cut", id) ? { src:`img/flowers-cut/${id}.webp`, cut:true } : { src:`img/flowers/${id}.jpg`, cut:false };
const tSrc = id => id==="wrapping-paper" ? { src:"img/wraps/matte.jpg", cut:false } : has("tools-cut", id) ? { src:`img/tools-cut/${id}.webp`, cut:true } : has("tools", id) ? { src:`img/tools/${id}.jpg`, cut:false } : null;
const rSrc = r => r.tool ? tSrc(r.id) : has("ribbons-cut", r.id) ? { src:`img/ribbons-cut/${r.id}.webp`, cut:true } : has("ribbons", r.id) ? { src:`img/ribbons/${r.id}.jpg`, cut:false } : null;
const imgF = (id, cls="") => { const p = fSrc(id); return `<img class="${cls} ${p.cut?"cut":""}" src="${p.src}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'noimg',innerHTML:window.drawArt('ph')}))">`; };
const imgT = id => { const p = tSrc(id); if (!p) return ""; return `<img class="${p.cut?"cut":""}" src="${p.src}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`; };

// ── 術語配圖：花名、工具、包裝紙、絲帶出現喺文字入面就自動配相 ──
const TERMS = [];
const addTerm = (word, t) => { if (word && word.length >= 2 && !TERMS.some(x=>x.w===word)) TERMS.push(Object.assign({ w:word }, t)); };
F.forEach(f => { const p = fSrc(f.id); const t = { kind:"flower", id:f.id, img:p.src, cut:p.cut, name:f.zh, en:f.en };
  addTerm(f.zh, t); (f.alias||"").split("、").forEach(a=>addTerm(a.trim(), t)); });
const EXTRA = { "尤加利":"eucalyptus","繡球花":"hydrangea","扶郎":"gerbera","桔梗":"lisianthus","虞美人":"poppy","罌粟花":"poppy","雛菊":"matricaria","白玫瑰":"rose","紅玫瑰":"rose","白康乃馨":"carnation","蘭花":"phalaenopsis","草類":"bear-grass" };
Object.entries(EXTRA).forEach(([w,id]) => { const f=fById[id]; const p = fSrc(id); addTerm(w, { kind:"flower", id, img:p.src, cut:p.cut, name:f.zh, en:f.en }); });
Object.entries(window.TOOLS||{}).forEach(([id,[zh,en]]) => { const p = tSrc(id); if (p) addTerm(zh, { kind:"photo", img:p.src, cut:p.cut, name:zh, en }); });
(window.WRAPS||[]).forEach(w => addTerm(w.zh, { kind:"photo", img:`img/wraps/${w.id}.jpg`, name:w.zh, en:w.en, swatch:w.swatch }));
(window.RIBBONS||[]).forEach(r => { const p = rSrc(r); if (p) addTerm(r.zh, { kind:"photo", img:p.src, cut:p.cut, name:r.zh, en:r.en }); });
[["索帶","zip-ties"],["膠紙","clear-tape"],["保水袋","water-tube"]].forEach(([w,id])=>{ const t=(window.TOOLS||{})[id]; if(t && tSrc(id)){ const p=tSrc(id); addTerm(w,{kind:"photo",img:p.src,cut:p.cut,name:t[0],en:t[1]}); } });
TERMS.sort((a,b)=>b.w.length-a.w.length);
const TERM_RE = new RegExp(TERMS.map(t=>t.w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|"), "g");
const termByWord = Object.fromEntries(TERMS.map(t=>[t.w,t]));
// 回傳 { html, hits }：文字保持原樣，只係將術語變成可撳嘅底線字
function rich(text){
  const hits = [];
  const html = esc(text).replace(TERM_RE, w => { const t = termByWord[w]; if (!hits.some(h=>h.img===t.img)) hits.push(t); return `<button class="term" data-w="${esc(w)}">${w}</button>`; });
  return { html, hits };
}
const thumb = (t, size="") => `<button class="tthumb ${size}" data-w="${esc(t.w)}"><img class="${t.cut?"cut":""}" src="${t.img}" alt="" loading="lazy" onerror="this.parentNode.classList.add('noph')"><span>${t.name}</span></button>`;
// 重點／步驟：一個術語 → 左邊一張相；多個 → 文字下面一行細相
function richItem(text){
  const r = rich(text);
  if (!r.hits.length) return `<div class="ri"><span class="dot"></span><div class="rt">${r.html}</div></div>`;
  if (r.hits.length === 1) return `<div class="ri one">${thumb(r.hits[0],"lg")}<div class="rt">${r.html}</div></div>`;
  return `<div class="ri"><span class="dot"></span><div class="rt">${r.html}<div class="trow">${r.hits.slice(0,5).map(h=>thumb(h)).join("")}</div></div></div>`;
}
function richStep(text){
  const r = rich(text);
  return `<p>${r.html}</p>${r.hits.length?`<div class="trow">${r.hits.slice(0,5).map(h=>thumb(h)).join("")}</div>`:""}`;
}
function bindTerms(root){
  root.querySelectorAll("[data-w]").forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); openTerm(termByWord[b.dataset.w]); });
}
function openTerm(t){
  if (!t) return;
  if (t.kind === "flower") { location.hash = "#flower-" + t.id; return; }
  const d = document.createElement("div"); d.className="sheet";
  d.innerHTML = `<div class="panel"><div class="grab"></div><div class="sheet-ph ${t.cut?"is-cut":""} ${t.swatch?"swatch sw-"+t.swatch:""}"><img class="${t.cut?"cut":""}" src="${t.img}" alt="" onerror="this.remove()"></div><h2 style="font-size:24px;margin-top:12px">${t.name}</h2><div class="en">${t.en}</div></div>`;
  d.onclick = e => { if(e.target===d) d.remove(); };
  document.body.appendChild(d);
}
const topbar = (title, back="#home") => `<div class="topbar"><a class="back" href="${back}" aria-label="返回">${icon.back}</a><div class="t">${esc(title)}</div></div>`;
const checkEl = on => `<span class="check ${on?"on":""}"></span>`;
const doneCount = () => L.filter(l=>S.done[l.id]).length;
const ring = (p) => { const r=26, c=2*Math.PI*r; return `<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--card-2)" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="14" font-family="var(--en)" fill="var(--ink)">${Math.round(p*100)}%</text></svg>`; };

// ── 首頁：課程 ──
function home(){
  const n = doneCount(), next = L.find(l=>!S.done[l.id]) || L[0];
  let h = `<header class="hero"><div class="brand">Petal School</div><h1>花藝自修課程</h1><p>由零基礎到接單，${L.length} 課・${F.length} 款花材・包裝圖鑑</p></header>
  <div class="progress-card">${ring(n/L.length)}<div><b>已完成 ${n} / ${L.length} 課</b><span>${n===0?"由第一課開始，慢慢嚟。":n===L.length?"全部完成！可以開始接單喇 🌷":"繼續保持，每日一課。"}</span></div></div>
  <a class="continue" href="#lesson-${next.id}"><small>${n?"繼續學習":"開始學習"} · LV${next.lv}</small><b>${esc(next.title)}</b></a>`;
  LV.forEach(lv=>{
    const ls = L.filter(l=>l.lv===lv.n), d = ls.filter(l=>S.done[l.id]).length;
    h += `<div class="level"><span class="no">0${lv.n}</span><div><h2>${lv.zh}</h2><span class="en">${lv.en} · ${d}/${ls.length}</span></div></div><p class="level-desc">${lv.desc}</p>`;
    ls.forEach(l=>{ h += `<a class="lesson-row" href="#lesson-${l.id}"><div class="thumb">${window.drawArt(l.art)}</div><div class="meta"><b>${esc(l.title)}</b><span class="sub">${l.en} · ${l.mins} 分鐘${(V[l.video]||[]).length?" · ▶︎ 影片":""}</span></div>${checkEl(S.done[l.id])}</a>`; });
  });
  app.innerHTML = h;
}

// ── 課堂 ──
function lesson(id){
  const l = L.find(x=>x.id===id); if(!l) return home();
  S.last = id; save();
  const idx = L.indexOf(l), prev = L[idx-1], next = L[idx+1];
  const vids = V[l.video] || [];
  let h = topbar(`LV${l.lv} · ${l.title}`);
  h += `<div class="lphoto"><img src="img/lessons/${l.id}.jpg" alt="" onerror="this.parentNode.remove()"></div>
  <div class="lesson-h"><h1>${esc(l.title)}</h1><div class="en">${l.en}</div></div>
  <div class="pills"><span class="pill accent">LV${l.lv} ${LV[l.lv-1].zh}</span><span class="pill">${l.mins} 分鐘</span>${vids.length?`<span class="pill">${vids.length} 條影片</span>`:""}</div>
  <p class="intro">${rich(l.intro).html}</p>
  <div class="art diagram"><span class="cap">圖解 Diagram</span>${window.drawArt(l.art)}</div>`;
  h += `<section class="sec"><h3>重點</h3><div class="keys">${l.keys.map(richItem).join("")}</div></section>`;
  if (l.tools) h += `<section class="sec"><h3>認識工具</h3><div class="tools-grid">${l.tools.filter(t=>tSrc(t)).map(t=>`<div class="fchip"><div class="ph">${imgT(t)}</div><b>${(window.TOOLS[t]||[t])[0]}</b><small>${(window.TOOLS[t]||["",""])[1]}</small></div>`).join("")}</div></section>`;
  if (l.stemTypes) h += `<section class="sec"><h3>按莖類處理</h3><div class="table">${l.stemTypes.map(r=>`<div class="tr"><b>${r[0].replace("（","<small>").replace("）","</small>")}</b><span>${r[1]}</span><span class="ex">例：${rich(r[2]).html}</span></div>`).join("")}</div></section>`;
  if (l.palettes) h += `<section class="sec"><h3>配色參考</h3><div class="palettes">${l.palettes.map(p=>`<div class="palette"><div class="sw">${p.slice(1).map(c=>`<i style="background:${c}"></i>`).join("")}</div>${p[0]}</div>`).join("")}</div></section>`;
  if (l.ribbons) h += `<section class="sec"><h3>絲帶種類</h3><div class="table">${l.ribbons.map(r=>`<div class="tr"><b>${r[0].replace("（","<small>").replace("）","</small>")}</b><span>${r[1]}</span></div>`).join("")}</div></section>`;
  h += `<section class="sec"><h3>步驟</h3><div class="steps">${l.steps.map(s=>`<div class="step"><b>${rich(s[0]).html}</b>${richStep(s[1])}</div>`).join("")}</div>`;
  if (l.stepArt) h += `<div class="step-arts">${l.stepArt.map(k=>`<div class="art">${window.drawArt(k)}</div>`).join("")}</div>`;
  h += `</section>`;
  h += `<section class="sec"><h3>影片示範</h3>`;
  if (vids.length) h += `<div class="hscroll">${vids.map(v=>`<${EMBED?`a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener"`:"button"} class="video" data-v="${v.id}" data-t="${esc(v.title)}"><div class="th ${EMBED?"noth":""}" ${EMBED?"":`style="background-image:url('https://i.ytimg.com/vi/${v.id}/hqdefault.jpg')"`}>${EMBED?`<span>YouTube</span>`:""}</div><div class="vt"><span class="lang">${LANG[v.lang]||v.lang}</span>${esc(v.title)}<small>${esc(v.channel)}</small></div></${EMBED?"a":"button"}>`).join("")}</div>`;
  h += `<a class="yt-more" href="https://www.youtube.com/results?search_query=${encodeURIComponent(l.q)}" target="_blank" rel="noopener">喺 YouTube 搵更多「${esc(l.q)}」</a></section>`;
  h += `<section class="sec"><h3>靚 vs 唔靚</h3><div class="gb"><div class="g"><h4>✓ 靚</h4><ul>${l.good.map(x=>`<li>${rich(x).html}</li>`).join("")}</ul></div><div class="b"><h4>✕ 唔靚</h4><ul>${l.bad.map(x=>`<li>${rich(x).html}</li>`).join("")}</ul></div></div></section>`;
  if (l.flowers.length) h += `<section class="sec"><h3>相關花材</h3><div class="chips">${l.flowers.map(fid=>{const f=fById[fid];return f?`<a class="fchip" href="#flower-${fid}"><div class="ph">${imgF(fid)}</div>${f.zh}</a>`:""}).join("")}</div></section>`;
  const p = l.practice, ck = S.checks[l.id] || [];
  h += `<section class="sec"><h3>練習＋自評</h3><div class="practice"><p class="task">${esc(p.task)}</p><div class="need">需要：${p.need.map(esc).join("、")}</div>${p.check.map((c,i)=>`<button class="cbox" data-ck="${i}">${checkEl(ck[i])}<span>${esc(c)}</span></button>`).join("")}</div></section>`;
  h += `<button class="done-btn ${S.done[l.id]?"is":""}" id="done">${S.done[l.id]?"✓ 已完成（再撳取消）":"完成呢一課"}</button>`;
  h += `<div class="navlr">${prev?`<a href="#lesson-${prev.id}"><small>上一課</small>${esc(prev.title)}</a>`:"<span></span>"}${next?`<a href="#lesson-${next.id}"><small>下一課</small>${esc(next.title)}</a>`:"<span></span>"}</div>`;
  app.innerHTML = h;
  bindTerms(app);
  if (!EMBED) app.querySelectorAll(".video").forEach(b=>b.onclick=()=>playVideo(b.dataset.v,b.dataset.t));
  app.querySelectorAll(".cbox").forEach(b=>b.onclick=()=>{ const i=+b.dataset.ck; const a=S.checks[l.id]||[]; a[i]=!a[i]; S.checks[l.id]=a; save(); b.querySelector(".check").classList.toggle("on",!!a[i]); });
  $("#done").onclick=()=>{ S.done[l.id]=!S.done[l.id]; save(); if(S.done[l.id] && next){ location.hash="#lesson-"+next.id; } else lesson(id); };
}

function playVideo(id, title){
  const d = document.createElement("div"); d.className="sheet";
  d.innerHTML = `<div class="panel"><div class="grab"></div><div class="iframe-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen title="${esc(title)}"></iframe></div><p style="font-size:14px;margin:12px 2px 4px">${esc(title)}</p><a class="yt-more" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">喺 YouTube App 開</a></div>`;
  d.onclick = e => { if(e.target===d) d.remove(); };
  document.body.appendChild(d);
}

// ── 花材庫 ──
let fFilter = "all", fQuery = "";
function flowers(){
  const roles = window.ROLES;
  let h = `<header class="page-h"><h1>花材庫</h1><span class="en">${F.length} varieties</span></header>
  <input class="search" id="q" type="search" placeholder="搜尋：玫瑰、rose、藍色、婚禮…" value="${esc(fQuery)}">
  <div class="filters">${[["all","全部"],...Object.entries(roles).map(([k,v])=>[k,v.zh])].map(([k,t])=>`<button data-r="${k}" class="${fFilter===k?"on":""}">${t}</button>`).join("")}</div>
  <p class="role-desc">${fFilter==="all"?"撳入每款花睇花語、季節、揀花方法同處理。":roles[fFilter].desc}</p><div class="fgrid" id="fg"></div>`;
  app.innerHTML = h;
  const draw = () => {
    const q = fQuery.trim().toLowerCase();
    const list = F.filter(f => (fFilter==="all"||f.role===fFilter) && (!q || [f.zh,f.alias,f.en,f.latin,f.lang,f.note,(f.colors||[]).join(" ")].join(" ").toLowerCase().includes(q)));
    $("#fg").innerHTML = list.length ? list.map(f=>`<a class="fcard" href="#flower-${f.id}"><div class="ph">${imgF(f.id)}<span class="role">${roles[f.role].zh}</span></div><div class="nm"><b>${f.zh}</b><span class="en">${f.en}</span></div></a>`).join("") : `<p class="empty">搵唔到「${esc(fQuery)}」</p>`;
  };
  draw();
  $("#q").oninput = e => { fQuery = e.target.value; draw(); };
  app.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{ fFilter=b.dataset.r; flowers(); });
}
function flower(id){
  const f = fById[id]; if(!f) return flowers();
  const cr = crById[id], roles = window.ROLES;
  const used = L.filter(l=>l.flowers.includes(id));
  let h = topbar(f.zh, "#flowers");
  h += `<div class="fhero ${fSrc(id).cut?"is-cut":""}">${imgF(id)}</div>
  <div class="fhead"><h1>${f.zh}</h1><div class="en">${f.en}${f.alias?` · ${f.alias}`:""}</div><div class="latin">${f.latin}</div></div>
  <div class="pills"><span class="pill accent">${roles[f.role].zh}</span>${f.colors.map(c=>`<span class="pill">${c}</span>`).join("")}</div>
  <div class="facts"><div class="fact wide"><small>當造／供應</small><b>${f.season}</b></div><div class="fact"><small>瓶插期</small><b>${f.life}${/\d/.test(f.life)?" 日":""}</b></div><div class="fact"><small>價位</small><b>${f.price}</b></div></div>
  <div class="lang-card"><small>花語</small>${esc(f.lang)}</div>
  ${fSrc(id).cut?`<section class="sec"><h3>實拍相 <span class="en">Photo</span></h3><div class="realph"><img src="img/flowers/${id}.jpg" alt="" loading="lazy">${cr?`<span class="credit">📷 ${esc(cr.author)} · ${esc(cr.license)}</span>`:""}</div></section>`:(cr?`<p class="credit-line">📷 ${esc(cr.author)} · ${esc(cr.license)}</p>`:"")}
  <section class="sec"><h3>新唔新鮮</h3><div class="gb"><div class="g"><h4>✓ 新鮮・靚</h4><ul>${f.fresh.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div class="b"><h4>✕ 唔新鮮</h4><ul>${f.stale.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div></section>
  <section class="sec"><h3>處理方法</h3><div class="note">${rich(f.care).html}</div></section>
  <section class="sec"><h3>小貼士</h3><div class="note">${rich(f.note).html}</div></section>
  <section class="sec"><h3>好搭配</h3><div class="chips">${f.pair.map(p=>fById[p]?`<a class="fchip" href="#flower-${p}"><div class="ph">${imgF(p)}</div>${fById[p].zh}</a>`:"").join("")}</div></section>`;
  if (used.length) h += `<section class="sec"><h3>喺邊課用到</h3><div class="list">${used.map(l=>`<a href="#lesson-${l.id}"><span>LV${l.lv} · ${l.title}</span><small>›</small></a>`).join("")}</div></section>`;
  app.innerHTML = h;
  bindTerms(app);
}

// ── 包裝圖鑑 ──
function wraps(){
  const ph = (src, sw) => `<div class="swatch sw-${sw}"><img src="${src}" alt="" loading="lazy" onerror="this.remove()"></div>`;
  let h = `<header class="page-h"><h1>包裝圖鑑</h1><span class="en">Wrapping & Ribbons</span></header>
  <section class="sec"><h3>包裝紙 <span class="en">Wrapping Paper</span></h3><div class="wgrid">${window.WRAPS.map(w=>`<button class="wcard" data-wr="${w.id}">${ph(`img/wraps/${w.id}.jpg`,w.swatch)}<div class="nm"><b>${w.zh}</b><span class="en">${w.en}</span><p>${w.use}</p></div></button>`).join("")}</div></section>
  <section class="sec"><h3>包裝黃金法則</h3><div class="keys">${window.WRAP_RULES.map(richItem).join("")}</div></section>
  <section class="sec"><h3>絲帶 <span class="en">Ribbons</span></h3><div class="wgrid">${window.RIBBONS.map(r=>{ const p=rSrc(r); return `<div class="wcard">${p?`<div class="swatch ${p.cut?"is-cut":"sw-ribbon"}"><img class="${p.cut?"cut":""}" src="${p.src}" alt="" loading="lazy" onerror="this.remove()"></div>`:ph("","ribbon")}<div class="nm"><b>${r.zh}</b><span class="en">${r.en}</span><p>${r.d}</p></div></div>`; }).join("")}</div></section>
  <section class="sec"><h3>配件 <span class="en">Accessories</span></h3><div class="table">${window.ACCESSORIES.map(r=>`<div class="tr"><b>${r[0]}<small>${r[1]}</small></b><span>${rich(r[2]).html}</span></div>`).join("")}</div></section>
  <section class="sec"><h3>包裝課堂</h3><div class="list">${L.filter(l=>l.lv===3||["single-stem","ribbon"].includes(l.id)).map(l=>`<a href="#lesson-${l.id}"><span>${l.title}<small style="display:block">${l.en}</small></span><small>›</small></a>`).join("")}</div></section>`;
  app.innerHTML = h;
  bindTerms(app);
  app.querySelectorAll(".wcard[data-wr]").forEach(b=>b.onclick=()=>{
    const w = window.WRAPS.find(x=>x.id===b.dataset.wr);
    const d = document.createElement("div"); d.className="sheet";
    d.innerHTML = `<div class="panel"><div class="grab"></div><div class="sheet-ph swatch sw-${w.swatch}"><img src="img/wraps/${w.id}.jpg" alt="" onerror="this.remove()"></div><h2 style="font-size:24px;margin-top:12px">${w.zh}</h2><div class="en">${w.en}</div><div class="table" style="margin-top:12px"><div class="tr"><b>質感</b><span>${w.feel}</span></div><div class="tr"><b>用途</b><span>${w.use}</span></div><div class="tr"><b>技巧</b><span>${w.tip}</span></div><div class="tr"><b>配搭</b><span>${rich(w.pair).html}</span></div></div></div>`;
    d.onclick = e => { if(e.target===d) d.remove(); };
    document.body.appendChild(d); bindTerms(d);
  });
}

// ── 測驗 ──
let qMode = "name", qCur = null, qAns = false;
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
function newQ(){
  const pool = qMode==="lang" ? F.filter(f=>f.lang && f.lang!=="—" && !f.lang.includes("花語少用")) : F.filter(f=>qMode!=="role"||true);
  const ans = pool[Math.floor(Math.random()*pool.length)];
  if (qMode==="role") { qCur = { ans, opts: Object.keys(window.ROLES), right: ans.role }; }
  else { const others = shuffle(pool.filter(f=>f.id!==ans.id)).slice(0,3); qCur = { ans, opts: shuffle([ans,...others]).map(f=>f.id), right: ans.id }; }
  qAns = false;
}
function quiz(){
  if (!qCur) newQ();
  const a = qCur.ans, R = window.ROLES;
  const modes = [["name","認花","睇相講名"],["lang","花語","邊款花係咁嘅意思"],["role","角色","主花？填充？"],["fresh","揀花","新鮮特徵係邊款"]];
  let qText, showImg = true;
  if (qMode==="name") qText = "呢款係咩花？";
  if (qMode==="lang") { qText = `花語「${a.lang.split("｜")[0]}」係邊款花？`; showImg=false; }
  if (qMode==="role") qText = `${a.zh} 喺花束入面通常擔當咩角色？`;
  if (qMode==="fresh") { qText = `「${a.fresh[0]}」係邊款花嘅新鮮特徵？`; showImg=false; }
  const label = o => qMode==="role" ? R[o].zh : fById[o].zh;
  let h = `<header class="page-h"><h1>測驗</h1><span class="en">Practice Quiz</span></header>
  <div class="qmode">${modes.map(m=>`<button data-m="${m[0]}" class="${qMode===m[0]?"on":""}"><b>${m[1]}</b><small>${m[2]}</small></button>`).join("")}</div>
  <div class="score"><span>答啱 ${S.quiz.right} / ${S.quiz.total}</span><span>最高連勝 ${S.quiz.best}</span></div>
  <div class="qcard">${showImg?`<div class="ph">${imgF(a.id)}</div>`:""}<div class="q">${esc(qText)}</div></div>
  <div class="qopts">${qCur.opts.map(o=>`<button data-o="${o}">${label(o)}</button>`).join("")}</div><div id="qfb"></div>`;
  app.innerHTML = h;
  app.querySelectorAll(".qmode button").forEach(b=>b.onclick=()=>{ qMode=b.dataset.m; newQ(); quiz(); });
  app.querySelectorAll(".qopts button").forEach(b=>b.onclick=()=>{
    if (qAns) return; qAns = true;
    const ok = b.dataset.o===qCur.right;
    S.quiz.total++; if(ok){ S.quiz.right++; S.quiz.streak=(S.quiz.streak||0)+1; S.quiz.best=Math.max(S.quiz.best,S.quiz.streak);} else S.quiz.streak=0; save();
    app.querySelectorAll(".qopts button").forEach(x=>{ if(x.dataset.o===qCur.right) x.classList.add("right"); else if(x===b) x.classList.add("wrong"); });
    $("#qfb").innerHTML = `<div class="qfeedback"><b>${ok?"✓ 答啱！":"✕ 再試下"}</b> ${a.zh}（${a.en}）・${R[a.role].zh}<br><span style="color:var(--ink-soft)">花語：${esc(a.lang)}</span><br><a class="yt-more" href="#flower-${a.id}">睇 ${a.zh} 詳細</a></div><button class="next-btn" id="nq">下一題</button>`;
    $("#nq").onclick=()=>{ newQ(); quiz(); };
  });
}

// ── 更多 ──
function creditName(id){
  const [a,b] = id.includes("/") ? id.split("/") : ["", id];
  if (fById[b] && !a) return fById[b].zh;
  if (a==="lessons") { const l=L.find(x=>x.id===b); return l?`課堂：${l.title}`:b; }
  if (a==="wraps") { const w=window.WRAPS.find(x=>x.id===b); return w?w.zh:b; }
  if (a==="ribbons") { const r=window.RIBBONS.find(x=>x.id===b); return r?r.zh:b; }
  return (window.TOOLS[b]||[b])[0];
}
function more(){
  let h = `<header class="page-h"><h1>我的進度</h1><span class="en">Progress & Resources</span></header>
  <div class="list">${LV.map(lv=>{const ls=L.filter(l=>l.lv===lv.n), d=ls.filter(l=>S.done[l.id]).length;return `<div style="display:block"><div style="display:flex;justify-content:space-between"><span>LV${lv.n} ${lv.zh}</span><small>${d}/${ls.length}</small></div><div class="bar"><i style="width:${d/ls.length*100}%"></i></div></div>`;}).join("")}</div>
  <div class="install"><b>加到 iPhone 主畫面：</b>用 Safari 打開 → 撳底部「分享」→「加入主畫面」。之後似 app 咁全螢幕開，課程同花材相離線都睇到（影片要上網）。</div>
  <section class="sec"><h3>送俾客人嘅保養卡</h3><div class="keys">${window.CARE_CARD.map(richItem).join("")}</div></section>
  <section class="sec"><h3>術語表</h3><dl class="gloss">${window.GLOSSARY.map(g=>`<dt>${g[0]}<span class="en">（${g[1]}）</span></dt><dd>${esc(g[2])}</dd>`).join("")}</dl></section>
  <section class="sec"><h3>外觀</h3><div class="list"><button id="theme"><span>深淺色</span><small>${({auto:"跟系統",light:"淺色",dark:"深色"})[localTheme()]}</small></button><button id="reset"><span>重設所有進度</span><small style="color:var(--bad)">清除</small></button></div></section>
  <section class="sec"><h3>相片來源</h3><div class="credits">${CR.length?`相片來自 Wikimedia Commons 同 Openverse，按各自授權使用：${CR.map(c=>`<div>${esc(creditName(c.id))}：${esc(c.author)} · ${esc(c.license)} · <a href="${esc(c.source)}" target="_blank" rel="noopener">來源</a></div>`).join("")}`:"相片準備中。"}影片版權屬各 YouTube 頻道。</div></section>`;
  app.innerHTML = h;
  bindTerms(app);
  $("#theme").onclick=()=>{ const order=["auto","light","dark"]; setTheme(order[(order.indexOf(localTheme())+1)%3]); more(); };
  $("#reset").onclick=e=>{ const b=e.currentTarget; if(!b.dataset.arm){ b.dataset.arm="1"; b.querySelector("small").textContent="再撳一次確認清除"; setTimeout(()=>{ if(b.isConnected){ delete b.dataset.arm; b.querySelector("small").textContent="清除"; } },4000); return; } S={done:{},checks:{},quiz:{right:0,total:0,best:0},last:null}; save(); more(); };
}
function localTheme(){ try{ return localStorage.getItem("flora.theme")||"auto"; }catch(e){ return "auto"; } }
function setTheme(t){ try{ localStorage.setItem("flora.theme",t);}catch(e){} applyTheme(); }
function applyTheme(){ const t=localTheme(); if(t==="auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme",t); }
applyTheme();

// ── 路由 ──
const tabs = [["#home","課程","course"],["#flowers","花材","flower"],["#wraps","包裝","wrap"],["#quiz","測驗","quiz"],["#more","我的","more"]];
function tabbar(active){
  let t = document.querySelector(".tabbar");
  if(!t){ t=document.createElement("div"); t.className="tabbar"; document.body.appendChild(t); }
  t.innerHTML = `<nav>${tabs.map(([href,label,ic])=>`<a href="${href}" class="${active===href?"on":""}">${icon[ic]}${label}</a>`).join("")}</nav>`;
}
function route(){
  const h = (location.hash || "#home").slice(1);
  const i = h.indexOf("-"), page = i<0 ? h : h.slice(0,i), id = i<0 ? "" : h.slice(i+1);
  document.querySelectorAll(".sheet").forEach(s=>s.remove());
  if (page==="lesson") { lesson(id); tabbar("#home"); }
  else if (page==="flowers") { flowers(); tabbar("#flowers"); }
  else if (page==="flower") { flower(id); tabbar("#flowers"); }
  else if (page==="wraps") { wraps(); tabbar("#wraps"); }
  else if (page==="quiz") { quiz(); tabbar("#quiz"); }
  else if (page==="more") { more(); tabbar("#more"); }
  else { home(); tabbar("#home"); }
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
