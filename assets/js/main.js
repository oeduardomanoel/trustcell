/* ==========================================================================
   TRUSTCELL · interações
   GSAP + ScrollTrigger + Lenis. Tudo degrada bem sem as libs.
   ========================================================================== */
(() => {
  "use strict";

  const WA_NUMBER = "5547996469347";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const motion = hasGSAP && !reduce;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------------
     Gerador pseudoaleatório com semente (trincos sempre iguais)
     ------------------------------------------------------------------------ */
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ------------------------------------------------------------------------
     Trincos da tela, gerados por código
     ------------------------------------------------------------------------ */
  function crackSVG(seed, ix, iy) {
    const r = rng(seed);
    const W = 100, H = 207;
    const cx = ix * W, cy = iy * H;
    const rays = 13;
    const paths = [];
    const rings = [[], []];
    for (let i = 0; i < rays; i++) {
      const base = (i / rays) * Math.PI * 2 + (r() - 0.5) * 0.45;
      let x = cx, y = cy, a = base;
      let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      const len = 60 + r() * 150;
      let travelled = 0, step = 0;
      while (travelled < len) {
        const seg = 4 + r() * 11;
        a += (r() - 0.5) * 0.55;
        x += Math.cos(a) * seg; y += Math.sin(a) * seg;
        travelled += seg; step++;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        if (step === 1) rings[0].push([x, y]);
        if (step === 3) rings[1].push([x, y]);
        if (r() < 0.22 && step > 1) {
          let bx = x, by = y, ba = a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.7);
          let bd = `M${bx.toFixed(1)} ${by.toFixed(1)}`;
          const bl = 2 + Math.floor(r() * 4);
          for (let k = 0; k < bl; k++) {
            const s = 3 + r() * 8; ba += (r() - 0.5) * 0.6;
            bx += Math.cos(ba) * s; by += Math.sin(ba) * s;
            bd += ` L${bx.toFixed(1)} ${by.toFixed(1)}`;
          }
          paths.push({ d: bd, w: 0.28 });
        }
        if (x < -5 || x > W + 5 || y < -5 || y > H + 5) break;
      }
      paths.push({ d, w: 0.42 + r() * 0.25 });
    }
    const ringPaths = rings.map((pts) => pts.length > 2 ? { d: "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z", w: 0.3 } : null).filter(Boolean);
    const shard = rings[0].length > 2 ? `<path class="shard" d="M${rings[0].map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L")} Z"/>` : "";
    const all = [...ringPaths, ...paths];
    return `<svg class="ph-cracks" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${shard}${all.map((p) => `<path d="${p.d}" stroke-width="${p.w.toFixed(2)}"/>`).join("")}<circle cx="${cx}" cy="${cy}" r="1.6" fill="rgba(255,255,255,.7)"/></svg>`;
  }

  /* ------------------------------------------------------------------------
     iPhone em camadas (CSS 3D)
     ------------------------------------------------------------------------ */
  const now = new Date();
  const hhmm = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const boardSVG = `<svg viewBox="0 0 200 120" aria-hidden="true"><g fill="#0a1218" stroke="rgba(214,180,95,.55)" stroke-width=".8">
    <rect x="70" y="30" width="48" height="48" rx="4"/><rect x="128" y="34" width="30" height="22" rx="2"/><rect x="128" y="62" width="30" height="16" rx="2"/>
    <rect x="24" y="36" width="34" height="18" rx="2"/><rect x="24" y="60" width="20" height="20" rx="2"/><rect x="166" y="34" width="16" height="44" rx="2"/></g>
    <g fill="none" stroke="rgba(143,225,255,.35)" stroke-width=".6"><path d="M58 45h12M58 70h12M118 45h10M118 70h10M44 70h14M158 56h8"/></g>
    <text x="94" y="58" fill="rgba(214,180,95,.8)" font-size="8" text-anchor="middle" font-family="monospace">SoC</text></svg>`;

  function buildPhone(el, variant) {
    const oldScreen = `
      <div class="ph-layer ph-screen ph-screen--old">
        <div class="ph-display">
          <div class="ph-island"></div>
          <div class="ph-status"><span>${hhmm}</span><i></i></div>
          <div class="ph-lock"><div class="ph-date">${dateStr}</div><div class="ph-time">${hhmm}</div></div>
          <div class="ph-notif"><img src="assets/img/logo-coin.webp" alt=""><b>Trustcell <small>agora</small></b><span>Chegamos! Estamos na sua porta.</span></div>
          ${crackSVG(variant === "hero" ? 7 : 19, 0.7, 0.3)}
          <div class="ph-glint"></div>
        </div>
        <span class="ph-label"><b>Tela</b> trincada</span>
      </div>`;
    const newScreen = variant === "repair" ? `
      <div class="ph-layer ph-screen ph-screen--new">
        <div class="ph-display">
          <div class="ph-island"></div>
          <div class="ph-test"><h4>Teste final</h4><ul>
            <li>Touch <b>ok</b></li><li>Brilho <b>ok</b></li><li>Câmeras <b>ok</b></li><li>Áudio <b>ok</b></li><li>Carga <b>ok</b></li></ul></div>
          <div class="ph-warranty"><img src="assets/img/logo-coin.webp" alt=""><strong>90 dias</strong><span>de garantia no serviço</span></div>
          <div class="ph-glint"></div>
        </div>
        <span class="ph-label"><b>Tela</b> nova</span>
      </div>` : "";
    el.innerHTML = `
      <div class="ph-layer ph-back"><div class="ph-back__cam"><i></i><i></i><i></i></div><img class="ph-back__mark" src="assets/img/logo-coin.webp" alt=""><span class="ph-label"><b>Vidro</b> traseiro</span></div>
      <div class="ph-layer ph-battery"><span>Li-ion</span><b>3,87 V</b><span class="ph-label"><b>Bateria</b></span></div>
      <div class="ph-layer ph-board">${boardSVG}<span class="ph-label"><b>Placa</b> lógica</span></div>
      <div class="ph-layer ph-frame-wrap"><div class="ph-layer ph-frame"></div><span class="ph-label"><b>Chassi</b> e conectores</span></div>
      ${oldScreen}${newScreen}`;
  }
  $$("[data-phone]").forEach((el) => buildPhone(el, el.dataset.phone));

  /* ------------------------------------------------------------------------
     Engrenagem do hero (eco do logo)
     ------------------------------------------------------------------------ */
  (function gear() {
    const svg = $("#heroGear"); if (!svg) return;
    const teeth = 16, R = 180, r = 160, cx = 200, cy = 200;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const step = (Math.PI * 2) / teeth;
      const pts = [[a0, r], [a0 + step * 0.18, R], [a0 + step * 0.5, R], [a0 + step * 0.68, r]];
      pts.forEach(([a, rad], k) => { d += `${i === 0 && k === 0 ? "M" : "L"}${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)} `; });
    }
    d += "Z";
    svg.innerHTML = `<path d="${d}"/><circle cx="200" cy="200" r="120"/><circle class="gear-dash" cx="200" cy="200" r="140"/><circle cx="200" cy="200" r="62"/><circle class="gear-dash" cx="200" cy="200" r="196"/>`;
  })();

  /* ------------------------------------------------------------------------
     Selo girando (como funciona)
     ------------------------------------------------------------------------ */
  $$(".seal__ring").forEach((ring) => {
    const text = ring.textContent; ring.textContent = "";
    const chars = Array.from(text);
    chars.forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "seal__ch"; s.textContent = ch;
      s.style.transform = `translateX(-50%) rotate(${(i / chars.length) * 360}deg)`;
      ring.appendChild(s);
    });
  });

  /* ------------------------------------------------------------------------
     Divide palavras para revelar títulos
     ------------------------------------------------------------------------ */
  function splitWords(el) {
    const words = [];
    const walk = (node, metal) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const wm = document.createElement("span"); wm.className = "wm";
            const wi = document.createElement("span"); wi.className = "wi" + (metal ? " metal" : "");
            wi.textContent = p; wm.appendChild(wi); frag.appendChild(wm); words.push(wi);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          const isMetal = child.classList.contains("metal");
          if (isMetal) child.classList.remove("metal");
          walk(child, metal || isMetal);
        }
      });
    };
    walk(el, false);
    return words;
  }
  const style = document.createElement("style");
  style.textContent = ".wm{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}.wi{display:inline-block;will-change:transform}.repair.is-static .rstep{position:static;opacity:1;transform:none;pointer-events:auto}.repair.is-static .rstep p{max-height:none;margin-top:8px}.repair.is-static .repair__pin{height:auto}";
  document.head.appendChild(style);

  /* ------------------------------------------------------------------------
     Lenis (scroll suave)
     ------------------------------------------------------------------------ */
  let lenis = null;
  if (motion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.095, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (target, offset = 0) => {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else {
      const el = typeof target === "string" ? $(target) : target;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? "auto" : "smooth" });
    }
  };

  /* ------------------------------------------------------------------------
     Navegação, menu e âncoras
     ------------------------------------------------------------------------ */
  const nav = $("#nav");
  const waFloat = $("#waFloat");
  let lastY = 0;
  let menuOpen = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 400 && !menuOpen);
    waFloat.classList.toggle("is-on", y > window.innerHeight * 0.7);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $("#burger"), menu = $("#menu");
  const setMenu = (open) => {
    menuOpen = open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      lenis && lenis.stop();
      if (motion) gsap.fromTo(".menu__links a", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: "expo.out", delay: 0.2 });
    } else {
      menu.classList.remove("is-open");
      lenis && lenis.start();
      setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 800);
    }
  };
  burger.addEventListener("click", () => setMenu(!menuOpen));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    const svc = a.closest("[data-service]");
    if (svc) wizard.preselect(svc.dataset.service);
    scrollToTarget(target, id === "#orcamento" ? -40 : 0);
  });

  /* ------------------------------------------------------------------------
     Cursor customizado + botões magnéticos
     ------------------------------------------------------------------------ */
  if (finePointer && motion) {
    document.documentElement.classList.add("has-cursor");
    const cursor = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring"), label = $(".cursor__label");
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" }), dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    let seen = false;
    window.addEventListener("pointermove", (e) => { if (!seen) { seen = true; gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); gsap.to([dot, ring], { opacity: 1, duration: 0.3 }); } dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button, summary, input, textarea");
      cursor.classList.toggle("is-hover", !!lab);
      cursor.classList.toggle("is-link", !lab && !!link);
      label.textContent = lab ? lab.dataset.cursor : "";
    });
    document.addEventListener("pointerleave", () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));
    document.addEventListener("pointerenter", () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }));

    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        xTo((e.clientX - (b.left + b.width / 2)) * 0.28);
        yTo((e.clientY - (b.top + b.height / 2)) * 0.38);
      });
      el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .35)" }); });
    });
  }

  /* ------------------------------------------------------------------------
     Cards com spotlight e inclinação
     ------------------------------------------------------------------------ */
  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const b = card.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      if (motion && finePointer) gsap.to(card, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10, transformPerspective: 900, duration: 0.6, ease: "power3" });
    });
    card.addEventListener("pointerleave", () => { if (motion) gsap.to(card, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1, .4)" }); });
  });

  /* ------------------------------------------------------------------------
     Prévia de sintoma seguindo o cursor (serviços)
     ------------------------------------------------------------------------ */
  (function servicePreview() {
    const box = $("#svcPreview"), text = $("#svcPreviewText");
    if (!box || !finePointer) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = null;
    const loop = () => { x += (tx - x) * 0.16; y += (ty - y) * 0.16; box.style.transform = `translate(${x}px, ${y}px)`; raf = requestAnimationFrame(loop); };
    $$(".svc__row").forEach((row) => {
      row.addEventListener("pointerenter", (e) => {
        text.textContent = row.dataset.hint; tx = x = e.clientX; ty = y = e.clientY;
        box.classList.add("is-on"); if (!raf) loop();
      });
      row.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
      row.addEventListener("pointerleave", () => { box.classList.remove("is-on"); });
    });
    $("#svcList").addEventListener("pointerleave", () => { cancelAnimationFrame(raf); raf = null; });
  })();

  /* ------------------------------------------------------------------------
     Copiar telefone
     ------------------------------------------------------------------------ */
  const copyBtn = $("#copyPhone"), copyState = $("#copyState");
  copyBtn && copyBtn.addEventListener("click", () => {
    const num = "(47) 99646-9347";
    const done = (ok) => { copyState.textContent = ok ? "copiado" : "selecionado"; setTimeout(() => (copyState.textContent = "copiar"), 2200); };
    const select = () => { const r = document.createRange(); r.selectNodeContents($(".copy__num")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false); };
    try { navigator.clipboard.writeText(num).then(() => done(true), select); } catch (_) { select(); }
  });

  /* ------------------------------------------------------------------------
     FAQ: abre um por vez, com altura animada
     ------------------------------------------------------------------------ */
  $$(".acc__item").forEach((item) => {
    const summary = $("summary", item), body = $(".acc__body", item);
    summary.addEventListener("click", (e) => {
      if (!motion) return;
      e.preventDefault();
      const open = item.open;
      if (open) {
        gsap.to(body, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { item.open = false; gsap.set(body, { clearProps: "height" }); } });
      } else {
        $$(".acc__item[open]").forEach((o) => { if (o !== item) { const b = $(".acc__body", o); gsap.to(b, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { o.open = false; gsap.set(b, { clearProps: "height" }); } }); } });
        item.open = true;
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.6, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  /* ------------------------------------------------------------------------
     ORÇAMENTO (wizard → WhatsApp)
     ------------------------------------------------------------------------ */
  const wizard = (() => {
    const MODELS = {
      "16": ["iPhone 16e", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"],
      "15": ["iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"],
      "14": ["iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"],
      "13": ["iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"],
      "12": ["iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max"],
      "11": ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max"],
      "outro": []
    };
    const REPAIRS = [
      ["Troca de tela", "Trinco, mancha ou touch falhando"],
      ["Troca de bateria", "Descarrega rápido ou desliga"],
      ["Vidro traseiro", "Traseira trincada"],
      ["Câmera ou lente", "Lente trincada ou foto ruim"],
      ["Conector de carga", "Não carrega direito"],
      ["Celular molhado", "Caiu na água ou umidade"],
      ["Outro / não sei", "A gente descobre no diagnóstico"]
    ];
    const state = { gen: "16", model: "", other: "", repairs: new Set(), name: "", place: "", note: "", day: "", date: "", shift: "" };
    let step = 1;
    const form = $("#wizard"), gens = $("#gens"), models = $("#models"), repairs = $("#repairs");
    const otherWrap = $("#otherModelWrap"), otherInput = $("#otherModel");
    const next = $("#wizNext"), back = $("#wizBack"), send = $("#wizSend"), err = $("#wizErr");
    const dots = $$("#wizDots li"), bar = $("#wizBar");
    const steps = $$(".wiz__step", form);
    const t = { model: $("#tModel"), repair: $("#tRepair"), name: $("#tName"), place: $("#tPlace"), when: $("#tWhen"), date: $("#tDate") };

    const osNo = "TC-" + String(Math.floor(1000 + Math.random() * 9000));
    $("#osNo").textContent = "Nº " + osNo;
    t.date.textContent = new Date().toLocaleDateString("pt-BR");
    const dateInput = $("#fDate");
    dateInput.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    const genLabels = { "16": "16", "15": "15", "14": "14", "13": "13", "12": "12", "11": "11", "outro": "Outro" };
    Object.keys(MODELS).forEach((g) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "gen"; b.setAttribute("role", "tab"); b.dataset.gen = g;
      b.textContent = g === "outro" ? "Outro modelo" : "iPhone " + genLabels[g];
      b.setAttribute("aria-selected", String(g === state.gen));
      b.addEventListener("click", () => { state.gen = g; renderModels(); });
      gens.appendChild(b);
    });
    function renderModels() {
      $$(".gen", gens).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.gen === state.gen)));
      const isOther = state.gen === "outro";
      otherWrap.hidden = !isOther; models.hidden = isOther;
      models.innerHTML = "";
      MODELS[state.gen].forEach((m) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "opt"; b.textContent = m;
        b.setAttribute("aria-pressed", String(state.model === m));
        b.addEventListener("click", () => { state.model = m; state.other = ""; otherInput.value = ""; renderModels(); update("model"); });
        models.appendChild(b);
      });
      if (motion) gsap.from(models.children, { y: 14, opacity: 0, stagger: 0.035, duration: 0.5, ease: "power3.out" });
      if (isOther) otherInput.focus({ preventScroll: true });
    }
    otherInput.addEventListener("input", () => { state.other = otherInput.value.trim(); state.model = ""; update("model"); });

    REPAIRS.forEach(([name, hint]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt opt--multi"; b.dataset.repair = name;
      b.innerHTML = `${name}<small>${hint}</small>`;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => { state.repairs.has(name) ? state.repairs.delete(name) : state.repairs.add(name); syncRepairs(); update("repair"); });
      repairs.appendChild(b);
    });
    function syncRepairs() { $$(".opt", repairs).forEach((b) => b.setAttribute("aria-pressed", String(state.repairs.has(b.dataset.repair)))); }

    [["fName", "name"], ["fPlace", "place"], ["fNote", "note"]].forEach(([id, key]) => {
      $("#" + id).addEventListener("input", (e) => { state[key] = e.target.value.trim(); update(key === "note" ? null : key); });
    });
    const pillGroup = (sel, key, cb) => $$(".pill", $(sel)).forEach((p) => p.addEventListener("click", () => {
      state[key] = p.dataset.v;
      $$(".pill", $(sel)).forEach((x) => x.setAttribute("aria-pressed", String(x === p)));
      cb && cb(); update("when");
    }));
    pillGroup("#days", "day", () => { $("#dateWrap").hidden = state.day !== "Outro dia"; });
    pillGroup("#shifts", "shift");
    dateInput.addEventListener("change", () => { state.date = dateInput.value; update("when"); });

    const modelName = () => state.model || state.other;
    const whenText = () => {
      let d = state.day;
      if (state.day === "Outro dia" && state.date) d = state.date.split("-").reverse().join("/");
      const sh = { "Manhã": "de manhã", "Tarde": "à tarde", "Noite": "à noite" }[state.shift] || "";
      return [d, sh].filter(Boolean).join(", ");
    };
    function flash(el) { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
    function setT(el, val, empty) { el.textContent = val || empty; el.classList.toggle("is-empty", !val); }
    function update(field) {
      setT(t.model, modelName(), "a escolher");
      setT(t.repair, [...state.repairs].join(", "), "a escolher");
      setT(t.name, state.name, "—");
      setT(t.place, state.place, "—");
      setT(t.when, whenText(), "—");
      const map = { model: t.model, repair: t.repair, name: t.name, place: t.place, when: t.when };
      if (field && map[field]) flash(map[field]);
      send.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message())}`;
      err.textContent = "";
    }
    function message() {
      const lines = [
        "Olá, Trustcell! Quero um orçamento.",
        "",
        `OS: ${osNo}`,
        `Aparelho: ${modelName() || "-"}`,
        `Reparo: ${[...state.repairs].join(", ") || "-"}`,
        `Nome: ${state.name || "-"}`,
        `Local: ${state.place || "-"}`,
        `Quando: ${whenText() || "-"}`
      ];
      if (state.note) lines.push(`Obs.: ${state.note}`);
      return lines.join("\n");
    }
    function validate(s) {
      if (s === 1 && !modelName()) return "Escolha o modelo do seu iPhone pra continuar.";
      if (s === 2 && !state.repairs.size) return "Marque pelo menos um reparo. Se não souber, escolha “Outro / não sei”.";
      if (s === 3 && !state.name) return "Diz seu nome pra gente saber com quem falar.";
      if (s === 3 && !state.place) return "Informe o bairro e a cidade do atendimento.";
      if (s === 4 && !state.day) return "Escolha o dia que fica melhor.";
      if (s === 4 && state.day === "Outro dia" && !state.date) return "Escolha a data no calendário.";
      if (s === 4 && !state.shift) return "Escolha o turno.";
      return "";
    }
    function go(n) {
      const dir = n > step ? 1 : -1;
      const from = steps[step - 1], to = steps[n - 1];
      step = n;
      from.classList.remove("is-active"); to.classList.add("is-active");
      if (motion) gsap.fromTo(to, { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
      dots.forEach((d, i) => { d.classList.toggle("is-active", i === n - 1); d.classList.toggle("is-done", i < n - 1); });
      bar.style.width = `${n * 25}%`;
      back.disabled = n === 1;
      next.hidden = n === 4; send.hidden = n !== 4;
      err.textContent = "";
    }
    next.addEventListener("click", () => {
      const msg = validate(step);
      if (msg) { err.textContent = msg; if (motion) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, .3)" }); return; }
      go(step + 1);
    });
    back.addEventListener("click", () => step > 1 && go(step - 1));
    send.addEventListener("click", (e) => {
      for (let s = 1; s <= 4; s++) {
        const msg = validate(s);
        if (msg) { e.preventDefault(); if (s !== step) go(s); err.textContent = msg; return; }
      }
    });
    form.addEventListener("submit", (e) => e.preventDefault());

    renderModels(); update();
    return {
      preselect(name) {
        const map = { "Troca de tela": "Troca de tela", "Troca de bateria": "Troca de bateria", "Vidro traseiro": "Vidro traseiro", "Câmera ou lente": "Câmera ou lente", "Conector de carga": "Conector de carga", "Celular molhado": "Celular molhado" };
        const k = map[name]; if (!k) return;
        state.repairs.add(k); syncRepairs(); update("repair");
      }
    };
  })();

  /* ------------------------------------------------------------------------
     Sem GSAP ou com movimento reduzido: página estática e completa
     ------------------------------------------------------------------------ */
  const loader = $("#loader");
  if (!motion) {
    loader && loader.remove();
    $(".repair").classList.add("is-static");
    $$(".ph-cracks path").forEach((p) => (p.style.strokeDasharray = "none"));
    return;
  }

  /* ========================================================================
     A partir daqui: animações
     ======================================================================== */
  document.body.classList.add("is-loading");
  lenis && lenis.stop();

  // trincos começam "não desenhados" no hero
  const heroCracks = $$("#heroPhone .ph-screen--old .ph-cracks path");
  heroCracks.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.set("#heroPhone .ph-cracks .shard, #heroPhone .ph-cracks circle", { opacity: 0 });
  gsap.set(".hero__title .line__in", { yPercent: 110 });
  gsap.set([".hero__eyebrow", ".hero__sub", ".hero__ctas > *", ".hero__proof li"], { y: 30, opacity: 0 });
  gsap.set("#heroPhone", { y: 140, opacity: 0, rotateY: -50, rotateX: 18 });
  gsap.set(".chip", { scale: 0.6, opacity: 0 });
  gsap.set(".nav", { yPercent: -100, opacity: 0 });

  /* ---------- loader ---------- */
  const counter = { v: 0 };
  const loadTl = gsap.timeline({ onComplete: startHero });
  loadTl
    .to(counter, { v: 100, duration: 1.1, ease: "power2.inOut", onUpdate: () => {
      $("#loaderCount").textContent = Math.round(counter.v);
      $("#loaderBar").style.width = counter.v + "%";
    } })
    .to(".loader__inner", { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.1")
    .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.15")
    .set(loader, { display: "none" });
  loader.style.clipPath = "inset(0 0 0% 0)";
  loader.style.animation = "none";

  function startHero() {
    document.body.classList.remove("is-loading");
    lenis && lenis.start();
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(".nav", { yPercent: 0, opacity: 1, duration: 1 }, 0)
      .to(".hero__title .line__in", { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.05)
      .to(".hero__eyebrow", { y: 0, opacity: 1, duration: 1 }, 0.1)
      .to("#heroPhone", { y: 0, opacity: 1, rotateY: -14, rotateX: 6, duration: 1.6, ease: "expo.out" }, 0.2)
      .to(".hero__sub", { y: 0, opacity: 1, duration: 1 }, 0.45)
      .to(".hero__ctas > *", { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.55)
      .to(".hero__proof li", { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.65)
      // impacto: tremida + trinco se espalhando
      .to("#heroPhone", { keyframes: [{ x: -7, rotateZ: 0.5, duration: 0.05 }, { x: 6, rotateZ: 3.5, duration: 0.05 }, { x: -4, duration: 0.05 }, { x: 0, rotateZ: 2, duration: 0.08 }], ease: "none" }, 1.25)
      .to(heroCracks, { strokeDashoffset: 0, duration: 0.7, stagger: { each: 0.012, from: "random" }, ease: "power3.out" }, 1.27)
      .to("#heroPhone .ph-cracks .shard, #heroPhone .ph-cracks circle", { opacity: 1, duration: 0.2 }, 1.27)
      .to(".chip", { scale: 1, opacity: 1, duration: 0.9, stagger: 0.15, ease: "back.out(1.8)" }, 1.6)
      .add(() => heroIdle(), 1.9);
  }

  /* ---------- hero: flutuação, tilt e parallax ---------- */
  function heroIdle() {
    const phone = $("#heroPhone");
    const glints = $$("#heroPhone .ph-glint");
    gsap.to(".stage--hero", { y: -12, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    $$(".chip").forEach((c, i) => gsap.to(c, { y: i % 2 ? 10 : -10, duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    if (!finePointer) return;
    const rY = gsap.quickTo(phone, "rotateY", { duration: 1.2, ease: "power3" });
    const rX = gsap.quickTo(phone, "rotateX", { duration: 1.2, ease: "power3" });
    const chips = $$(".chip").map((c) => ({ el: c, d: parseFloat(c.dataset.depth || 1), x: gsap.quickTo(c, "x", { duration: 1.4, ease: "power3" }) }));
    $("#hero").addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      rY(-14 + nx * 26); rX(6 - ny * 18);
      glints.forEach((g) => (g.style.backgroundPosition = `${50 - nx * 120}% 0`));
      chips.forEach((c) => c.x(nx * 30 * c.d));
    });
  }

  /* ---------- engrenagem gira com o scroll ---------- */
  gsap.to("#heroGear", { rotate: 90, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to("#heroGear", { rotate: "+=360", duration: 120, ease: "none", repeat: -1 });
  gsap.to(".hero__visual", { yPercent: 18, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- marquee reagindo à velocidade ---------- */
  const marquee = gsap.to("#marquee", { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
  if (lenis) {
    lenis.on("scroll", ({ velocity, direction }) => {
      const v = Math.min(Math.abs(velocity) / 6, 4);
      gsap.to(marquee, { timeScale: (direction < 0 ? -1 : 1) * (1 + v), duration: 0.4, overwrite: true });
    });
  }

  /* ---------- títulos revelam palavra por palavra ---------- */
  $$(".h2, .final__title").forEach((h) => {
    const words = splitWords(h);
    gsap.from(words, { yPercent: 110, duration: 1.1, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%", once: true } });
  });

  /* ---------- statement: texto acende com o scroll ---------- */
  const st = $("#statementText");
  const stWords = splitWords(st);
  gsap.fromTo(stWords, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: st, start: "top 78%", end: "bottom 45%", scrub: 0.6 } });

  /* ---------- contadores ---------- */
  $$("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    if (!end) return;
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* ---------- entradas genéricas ---------- */
  const reveal = (targets, vars = {}) => ScrollTrigger.batch(targets, {
    start: "top 90%", once: true,
    onEnter: (batch) => gsap.fromTo(batch, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true, ...vars })
  });
  reveal(".section__lede, .eyebrow:not(.hero__eyebrow), .stat, .svc__row, .wiz, .ticket, .acc__item, .shot, .foot__top > *");

  /* ---------- REPARO: vista explodida pinada ---------- */
  (function repair() {
    const phone = $("#repairPhone");
    const L = (s) => $(s, phone);
    const back = L(".ph-back"), batt = L(".ph-battery"), board = L(".ph-board"), frame = L(".ph-frame-wrap"), oldS = L(".ph-screen--old"), newS = L(".ph-screen--new");
    const labels = $$(".ph-label", phone);
    const stepsEls = $$("#repairSteps .rstep");
    const bar = $("#repairBar");
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const spread = isMobile ? 0.62 : 1;

    gsap.set(newS, { z: 420, opacity: 0 });
    gsap.set(labels, { opacity: 0, rotateZ: 38, rotateX: -56 });
    gsap.set(".hud__row", { x: 20 });
    gsap.set($$(".ph-test li", phone), { opacity: 0, x: -10 });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    // 1 · diagnóstico
    tl.to("#scanline", { opacity: 1, duration: 0.2 }, 0)
      .fromTo("#scanline", { top: "12%" }, { top: "86%", duration: 1.4, ease: "none" }, 0)
      .to(".hud__row", { opacity: 1, x: 0, stagger: 0.2, duration: 0.4 }, 0.2)
      .to("#scanline", { opacity: 0, duration: 0.2 }, 1.4)
    // 2 · abertura (vista explodida)
      .to(".hud__row", { opacity: 0, x: 20, stagger: 0.05, duration: 0.3 }, 1.8)
      .to(phone, { rotateX: 56, rotateZ: -38, scale: isMobile ? 0.86 : 0.92, duration: 1.4 }, 1.8)
      .to(oldS, { z: 190 * spread, duration: 1.4 }, 1.9)
      .to(frame, { z: 80 * spread, duration: 1.4 }, 1.9)
      .to(board, { z: -20 * spread, duration: 1.4 }, 1.9)
      .to(batt, { z: -100 * spread, duration: 1.4 }, 1.9)
      .to(back, { z: -190 * spread, duration: 1.4 }, 1.9)
      .to(labels.filter((l) => !newS.contains(l)), { opacity: 1, duration: 0.5, stagger: 0.08 }, 2.9)
    // 3 · troca da tela
      .to($(".ph-label", oldS), { opacity: 0, duration: 0.3 }, 3.8)
      .to(oldS, { x: isMobile ? "70%" : "120%", z: 300 * spread, opacity: 0, duration: 1.2, ease: "power3.in" }, 3.9)
      .to(newS, { z: 190 * spread, opacity: 1, duration: 1.2, ease: "power3.out" }, 4.4)
      .to($(".ph-label", newS), { opacity: 1, duration: 0.4 }, 5.3)
    // 4 · fecha e testa
      .to(labels, { opacity: 0, duration: 0.4 }, 5.9)
      .to(newS, { z: 0, duration: 1.3 }, 6.1)
      .to(frame, { z: -3, duration: 1.3 }, 6.1)
      .to(board, { z: -7, duration: 1.3 }, 6.1)
      .to(batt, { z: -11, duration: 1.3 }, 6.1)
      .to(back, { z: -16, duration: 1.3 }, 6.1)
      .to(phone, { rotateX: 0, rotateZ: 0, scale: 1, duration: 1.3 }, 6.1)
      .to($(".ph-test", newS), { opacity: 1, duration: 0.4 }, 7.2)
      .to($$(".ph-test li", newS), { opacity: 1, x: 0, stagger: 0.18, duration: 0.3 }, 7.4)
    // 5 · garantia (giro mostrando a traseira)
      .to(phone, { rotateY: 360, duration: 1.6, ease: "power3.inOut" }, 8.6)
      .to($(".ph-test", newS), { opacity: 0, duration: 0.3 }, 8.9)
      .to($(".ph-warranty", newS), { opacity: 1, duration: 0.5 }, 9.6)
      .to({}, { duration: 0.6 });

    const marks = [0, 1.8, 3.8, 6.0, 8.5].map((m) => m / tl.duration());
    let current = -1;
    const setStep = (p) => {
      let idx = 0;
      marks.forEach((m, i) => { if (p >= m - 0.001) idx = i; });
      if (idx !== current) { current = idx; stepsEls.forEach((s, i) => s.classList.toggle("is-active", i === idx)); }
      bar.style.width = `${p * 100}%`;
    };

    ScrollTrigger.create({
      trigger: "#reparo", pin: "#repairPin", start: "top top",
      end: () => "+=" + window.innerHeight * (isMobile ? 4 : 4.6),
      scrub: 1, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => setStep(self.progress)
    });
  })();

  /* ---------- COMO FUNCIONA: trilho horizontal no desktop ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const track = $("#howTrack");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, { x: () => -dist(), ease: "none" });
    const stH = ScrollTrigger.create({ trigger: "#como-funciona", pin: "#howPin", start: "top top", end: () => "+=" + dist(), scrub: 1, animation: tween, invalidateOnRefresh: true, anticipatePin: 1 });
    const route = $("#routeLine"), len = route.getTotalLength();
    gsap.fromTo(route, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "#como-funciona", start: () => stH.start + dist() * 0.3, end: () => stH.start + dist() * 0.85, scrub: true, invalidateOnRefresh: true } });
    $$(".hcard").forEach((c, i) => gsap.from(c, { opacity: 0.25, scale: 0.94, ease: "none", scrollTrigger: { trigger: "#como-funciona", start: () => stH.start + (dist() / 4) * (i - 1.4), end: () => stH.start + (dist() / 4) * (i - 0.4), scrub: true, invalidateOnRefresh: true } }));
  });
  mm.add("(max-width: 900px)", () => {
    reveal(".hcard");
    const route = $("#routeLine"), len = route.getTotalLength();
    gsap.fromTo(route, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: route, start: "top 85%", end: "bottom 45%", scrub: true } });
  });
  gsap.to(".seal__ring", { rotate: 360, duration: 18, ease: "none", repeat: -1 });

  /* ---------- bancada: parallax ---------- */
  $$("[data-speed]").forEach((el) => {
    const s = parseFloat(el.dataset.speed);
    gsap.to(el, { yPercent: s * 100, ease: "none", scrollTrigger: { trigger: "#bancada", start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- CTA final ---------- */
  $$(".final__row").forEach((row) => {
    const dir = parseFloat(row.dataset.dir);
    gsap.fromTo(row, { xPercent: dir > 0 ? -30 : 0 }, { xPercent: dir > 0 ? 0 : -30, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.fromTo("#finalCoin img", { rotateY: -180, scale: 0.7 }, { rotateY: 0, scale: 1, ease: "power2.out", scrollTrigger: { trigger: ".final", start: "top 85%", end: "center 60%", scrub: 1 } });
  gsap.from(".foot__word span", { yPercent: 60, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".foot__word", start: "top 95%", once: true } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
