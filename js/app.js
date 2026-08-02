/* =============================================================
   app.js —— WEIRDO SYSTEM 引擎
   场景切换 / 打字机 / 键盘操作 / 碎片收集 / 灯箱 / 音效
   ============================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ME = CONTENT.me;

  const SCENES = [
    { key: 'char',    no: '01', name: '角色档案', en: 'CHARACTER', desc: '我是谁，属性面板拉出来给你看' },
    { key: 'gallery', no: '02', name: '作品库',   en: 'GALLERY',   desc: '手工 / 绘画 / 设计 / 手账' },
    { key: 'frag',    no: '03', name: '生活碎片', en: 'FRAGMENTS', desc: '可收集：眼睛、案件、银杏叶……' },
    { key: 'contact', no: '04', name: '联络',     en: 'CONTACT',   desc: '想说什么就打在终端里' },
  ];

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('weirdo.' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('weirdo.' + k, JSON.stringify(v)); } catch {} },
  };

  /* ---------------- 音效 ---------------- */
  const Sound = {
    on: false, ctx: null,
    init() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } },
    play(freq = 440, dur = .06, type = 'square', vol = .05) {
      if (!this.on || !this.ctx) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    },
    move() { this.play(320, .04, 'square', .035); },
    ok()   { this.play(660, .09); setTimeout(() => this.play(880, .09), 70); },
    get_() { this.play(523, .08); setTimeout(() => this.play(784, .12), 80); setTimeout(() => this.play(1046, .16), 180); },
    type() { this.play(1200 + Math.random() * 300, .012, 'square', .015); },
    toggle() {
      this.init(); this.on = !this.on;
      const b = $('#soundBtn');
      b.textContent = this.on ? '♪ ON' : '♪ OFF';
      b.setAttribute('aria-pressed', String(this.on));
      if (this.on) this.ok();
    },
  };

  /* ---------------- 提示条 ---------------- */
  function toast(label, text, gold) {
    const el = document.createElement('div');
    el.className = 'toast' + (gold ? ' gold' : '');
    el.innerHTML = `<div><b></b><span></span></div>`;
    el.querySelector('b').textContent = label;
    el.querySelector('span').textContent = text;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3600);
  }

  function glitch() {
    const g = $('#fxGlitch');
    g.classList.remove('on'); void g.offsetWidth; g.classList.add('on');
  }

  /* ---------------- 开机 ---------------- */
  const BOOT_LINES = [
    'WEIRDO SYSTEM v2.0  ——  booting',
    'loading player .............. WU SHUXUN / 吴舒逊',
    'location .................... 湖南 · 浏阳',
    'class ....................... 视觉设计 / 手作成瘾者',
    'inventory ................... 水彩笔, 掐丝镊子, 美工刀, 手账本',
    'warning ..................... 完美主义 99 / 胆量 82',
    'ready.',
  ];

  function boot() {
    const log = $('#bootLog');
    let li = 0, ci = 0;
    const tick = () => {
      if (li >= BOOT_LINES.length) {
        $('.boot-title').classList.add('show');
        setTimeout(() => { $('#startBtn').hidden = false; $('#startBtn').focus(); }, 420);
        return;
      }
      const line = BOOT_LINES[li];
      log.textContent += line[ci] ?? '';
      Sound.type();
      ci++;
      if (ci > line.length) { log.textContent += '\n'; li++; ci = 0; setTimeout(tick, 90); }
      else setTimeout(tick, 8);
    };
    setTimeout(tick, 350);
  }

  function start() {
    Sound.init();
    $('#boot').classList.add('off');
    setTimeout(() => { $('#boot').hidden = true; }, 520);
    $('#hud').hidden = false; $('#stage').hidden = false; $('#keybar').hidden = false;
    document.body.classList.remove('booting');
    Sound.ok(); glitch();
    go('hub');
    if (fragsGot().length) toast('SAVE 读取', `已收集碎片 ${fragsGot().length}/${CONTENT.fragments.length}`);
  }

  /* ---------------- 场景切换 ---------------- */
  let cur = 'hub';
  function go(key) {
    const target = $(`.scene[data-scene="${key}"]`);
    if (!target) return;
    $$('.scene').forEach(s => s.classList.toggle('is-active', s === target));
    cur = key;
    $$('#hudNav button').forEach(b => b.classList.toggle('on', b.dataset.go === key));
    window.scrollTo({ top: 0, behavior: 'auto' });
    glitch(); Sound.move();
    if (key === 'char') { runStats(); startDialogue(); }
    history.replaceState(null, '', key === 'hub' ? location.pathname : '#' + key);
  }

  /* ---------------- 目录菜单 ---------------- */
  function buildMenu() {
    const ol = $('#menu');
    ol.innerHTML = SCENES.map(s => `
      <li><button class="menu-item" data-go="${s.key}">
        <span class="m-no">${s.no}</span>
        <span class="m-txt"><b>${s.name}</b><i>${s.en}</i><span>${s.desc}</span></span>
        <span class="m-go">▶</span>
      </button></li>`).join('');
    $('#hudNav').innerHTML = SCENES.map(s => `<button data-go="${s.key}">${s.no} ${s.name}</button>`).join('');
    $$('.menu-item').forEach(b => b.addEventListener('mouseenter', () => { select(SCENES.findIndex(s => s.key === b.dataset.go)); }));
    // 目录页拍立得照片
    (ME.photos || []).forEach((p, i) => {
      const fig = $(`.polaroid.p${i + 1}`);
      if (!fig) return;
      if (p.img) fig.querySelector('.pola-photo').innerHTML = `<img src="${p.img}" alt="${p.cap || ''}">`;
      if (p.cap) fig.querySelector('figcaption').textContent = p.cap;
    });
  }

  let sel = 0;
  function select(i) {
    if (i < 0) return;
    sel = (i + SCENES.length) % SCENES.length;
    $$('.menu-item').forEach((b, n) => b.classList.toggle('sel', n === sel));
    Sound.move();
  }

  /* ---------------- 角色档案 ---------------- */
  function buildChar() {
    $('#charImg').src = ME.hero;
    $('#dlgAvatar').src = ME.avatar;
    $('#hudAvatar').src = ME.avatar;
    $('#hudName').textContent = ME.handle;
    $('#charName').textContent = ME.name;
    $('#charRole').textContent = ME.role;
    $('#charInfo').innerHTML = ME.infos.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
    $('#charStats').innerHTML = ME.stats.map(([k, v]) => `
      <div class="stat"><span>${k}</span>
        <span class="stat-track"><span class="stat-fill" data-v="${v}"></span></span>
        <span class="stat-num">${v}</span></div>`).join('');
    $('#charSkills').innerHTML = ME.skills.map(s => `<span>${s}</span>`).join('');
    $('#charGear').innerHTML = ME.gear.map(s => `<span>${s}</span>`).join('');
  }
  function runStats() {
    $$('.stat-fill').forEach((f, i) => {
      f.style.transform = 'scaleX(0)';
      setTimeout(() => { f.style.transform = `scaleX(${f.dataset.v / 100})`; }, 90 * i + 120);
    });
  }

  /* 打字机对白 */
  let dlgI = 0, typing = null, typedAll = false;
  function startDialogue() {
    if (typedAll) return;
    dlgI = 0; typedAll = true; typeLine();
  }
  function typeLine() {
    const p = $('#dlgText'), txt = ME.dialogue[dlgI] || '';
    p.classList.remove('done'); p.textContent = '';
    let i = 0;
    clearInterval(typing);
    typing = setInterval(() => {
      p.textContent += txt[i] ?? ''; i++;
      if (i % 2 === 0) Sound.type();
      if (i > txt.length) { clearInterval(typing); p.classList.add('done'); }
    }, 34);
    $('#dlgNext').textContent = dlgI >= ME.dialogue.length - 1 ? '去看作品 ▸' : '继续 ▾';
  }
  $('#dlgNext').addEventListener('click', () => {
    const p = $('#dlgText');
    if (!p.classList.contains('done')) { // 先跳过打字
      clearInterval(typing); p.textContent = ME.dialogue[dlgI]; p.classList.add('done'); return;
    }
    if (dlgI >= ME.dialogue.length - 1) { go('gallery'); return; }
    dlgI++; typeLine(); Sound.move();
  });

  /* ---------------- 作品库 ---------------- */
  let curCat = 0;
  function buildGallery() {
    $('#galTabs').innerHTML = CONTENT.gallery.map((c, i) =>
      `<button class="tab${i === 0 ? ' on' : ''}" data-cat="${i}" role="tab">${c.name}<i>${c.nameEn}</i></button>`).join('');
    renderCat(0);
  }
  function renderCat(i) {
    curCat = i;
    const c = CONTENT.gallery[i];
    $$('#galTabs .tab').forEach((t, n) => t.classList.toggle('on', n === i));
    $('#galIntro').textContent = c.intro;
    $('#galGrid').innerHTML = c.items.map((w, n) => {
      const rot = (n % 3 - 1) * 1.1;
      const inner = w.img
        ? `<img src="${w.img}" alt="${w.title}" loading="lazy">`
        : `<span class="slot-hint">空槽位<br><small>把图片放进 img/ 后<br>在 content.js 里填路径</small></span>`;
      return `<button class="card${w.img ? '' : ' empty'}" style="--rot:${rot}deg" data-i="${n}">
        <span class="card-no">${c.no}-${String(n + 1).padStart(2, '0')}</span>
        <span class="card-img">${inner}</span>
        <span class="card-cap"><b>${w.title}</b><i>${w.meta || ''}</i></span>
      </button>`;
    }).join('');
  }

  /* ---------------- 灯箱 ---------------- */
  let lbI = 0;
  function openLb(i) {
    lbI = i; const w = CONTENT.gallery[curCat].items[i];
    $('#lbImg').innerHTML = w.img
      ? `<img src="${w.img}" alt="${w.title}">`
      : '这一格还没有放图<br>（图片准备好之后，填进 content.js 就会出现）';
    $('#lbTitle').textContent = w.title;
    $('#lbMeta').textContent = w.meta || '';
    $('#lbDesc').textContent = w.desc || '';
    $('#lightbox').hidden = false; Sound.ok();
  }
  function stepLb(d) {
    const items = CONTENT.gallery[curCat].items;
    openLb((lbI + d + items.length) % items.length);
  }
  const closeLb = () => { $('#lightbox').hidden = true; Sound.move(); };

  /* ---------------- 生活碎片 ---------------- */
  const fragsGot = () => store.get('frags', []);
  function buildFrags() {
    $('#fragTotal').textContent = CONTENT.fragments.length;
    const got = fragsGot();
    $('#fragGrid').innerHTML = CONTENT.fragments.map((f, i) => `
      <button class="frag${got.includes(i) ? ' open' : ''}" data-f="${i}">
        <span class="frag-ico">${f.icon}</span>
        <b>${f.title}</b>
        <span class="tag">${f.tag}</span>
        <p>${f.text.replace(/</g, '&lt;')}</p>
        <span class="more">点击查看 ▸</span>
      </button>`).join('');
    syncFrag();
  }
  function syncFrag() {
    const got = fragsGot();
    $('#fragCount').textContent = got.length;
    if (got.length >= CONTENT.fragments.length) showSecret();
  }
  function takeFrag(i) {
    const card = $(`.frag[data-f="${i}"]`);
    card.classList.toggle('open');
    const got = fragsGot();
    if (!got.includes(i)) {
      got.push(i); store.set('frags', got); syncFrag();
      Sound.get_();
      toast('FRAGMENT GET', `${CONTENT.fragments[i].title}（${got.length}/${CONTENT.fragments.length}）`);
    } else Sound.move();
  }
  function showSecret() {
    const s = $('#secret');
    if (!s.hidden) return;
    s.hidden = false;
    s.innerHTML = `<span class="frag-ico">${CONTENT.secret.icon}</span><b>${CONTENT.secret.title}</b><p>${CONTENT.secret.text}</p>`;
    toast('ACHIEVEMENT', '碎片全部收集 · 隐藏卡已解锁', true);
    Sound.get_();
  }

  /* ---------------- 联络 ---------------- */
  function buildContact() {
    const subject = encodeURIComponent('来自作品集的消息');
    $('#mailLink').href = `mailto:${ME.email}?subject=${subject}`;
    const saved = store.get('msgs', []);
    termLine(`weirdo@portfolio:~$ hello`);
    termLine(`你好。这里是吴舒逊的留言终端。`);
    termLine(`邮箱：${ME.email}${ME.wechat ? '　微信：' + ME.wechat : ''}`);
    if (saved.length) termLine(`（本机已存 ${saved.length} 条草稿）`);
  }
  function termLine(t) { $('#termLog').textContent += t + '\n'; }

  $('#msgForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#mName').value.trim(), back = $('#mBack').value.trim(), text = $('#mText').value.trim();
    if (!name || !text) return;
    const msgs = store.get('msgs', []);
    msgs.push({ name, back, text, at: new Date().toISOString() });
    store.set('msgs', msgs);
    termLine(`> [${name}] ${text}`);
    termLine(`已存到本机。想让我真的看到，点「用邮箱发给我」。`);
    $('#mailLink').href = `mailto:${ME.email}?subject=${encodeURIComponent('作品集留言 · ' + name)}&body=${encodeURIComponent(text + '\n\n联系方式：' + back)}`;
    $('#msgForm').reset();
    Sound.ok(); toast('MESSAGE', '留言已存在本机');
  });

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', e => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { go(goBtn.dataset.go); return; }
    const tab = e.target.closest('.tab');
    if (tab) { renderCat(+tab.dataset.cat); Sound.move(); return; }
    const card = e.target.closest('.card');
    if (card) { openLb(+card.dataset.i); return; }
    const frag = e.target.closest('.frag');
    if (frag) { takeFrag(+frag.dataset.f); return; }
  });

  $('#startBtn').addEventListener('click', start);
  $('#soundBtn').addEventListener('click', () => Sound.toggle());
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => stepLb(-1));
  $('#lbNext').addEventListener('click', () => stepLb(1));
  $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLb(); });

  let egg = '';
  document.addEventListener('keydown', e => {
    // 开机页
    if (!$('#boot').hidden) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } return; }
    // 灯箱优先
    if (!$('#lightbox').hidden) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
      return;
    }
    const typingField = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (typingField) return;

    if (e.key === 'Escape') { go('hub'); return; }
    if (e.key.toLowerCase() === 'm') { Sound.toggle(); return; }
    if (/^[1-4]$/.test(e.key)) { go(SCENES[+e.key - 1].key); return; }
    if (cur === 'hub') {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - 1); }
      if (e.key === 'Enter') { go(SCENES[sel].key); }
    }
    if (cur === 'gallery' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      renderCat((curCat + (e.key === 'ArrowRight' ? 1 : -1) + CONTENT.gallery.length) % CONTENT.gallery.length);
      Sound.move();
    }
    // 彩蛋：打出 weirdo
    egg = (egg + e.key.toLowerCase()).slice(-6);
    if (egg === 'weirdo') {
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
      toast('EASTER EGG', '你把整个世界翻过来了（4 秒后恢复）', true);
      Sound.get_();
      setTimeout(() => { document.body.style.filter = ''; }, 4000);
    }
  });

  /* ---------------- 启动 ---------------- */
  $('#yr').textContent = new Date().getFullYear();
  buildMenu(); buildChar(); buildGallery(); buildFrags(); buildContact();
  select(0);

  // 带 # 的链接可以直接进到对应章节（分享用），否则走开机动画
  const deep = location.hash.replace('#', '');
  if (deep && (deep === 'hub' || SCENES.some(s => s.key === deep))) {
    $('#boot').hidden = true;
    $('#hud').hidden = false; $('#stage').hidden = false; $('#keybar').hidden = false;
    go(deep);
  } else {
    boot();
  }
})();
