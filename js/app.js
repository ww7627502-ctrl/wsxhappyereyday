/* =============================================================
   app.js —— WEIRDO SYSTEM 引擎
   场景切换 / 打字机 / 键盘操作 / 碎片收集 / 灯箱 / 音效
   ============================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ME = CONTENT.me;

  // 触屏设备（没有键盘、没有 hover）：所有键盘提示都换成能点的说法
  const TOUCH = matchMedia('(hover:none) and (pointer:coarse)').matches;
  document.documentElement.classList.toggle('touch', TOUCH);

  const SCENES = [
    { key: 'char',    no: '01', name: '角色档案', en: 'CHARACTER', desc: '基本信息 · 实习经历 · 自白' },
    { key: 'gallery', no: '02', name: '作品库',   en: 'GALLERY',   desc: '主视觉 / 活动运营 / AI Coding / 品牌 / 插画' },
    { key: 'contact', no: '03', name: '联络',     en: 'CONTACT',   desc: '想说什么就打在终端里' },
  ];

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('weirdo.' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('weirdo.' + k, JSON.stringify(v)); } catch {} },
  };

  /* ---------------- 音效 ----------------
     默认全开（BGM + 音效）。只有自己按 M / 点右上角 ♪ 才会关，关了会记住。 */
  const Sound = {
    on: store.get('sound', true), ctx: null, bgm: null, noiseBuf: null,
    init() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
        if (this.ctx) {
          // 一段短白噪声，键盘敲击声的"咔"就是它
          const n = Math.floor(this.ctx.sampleRate * .04);
          this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
          const d = this.noiseBuf.getChannelData(0);
          for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
        }
      }
      if (!this.bgm) { this.bgm = $('#bgm'); if (this.bgm) this.bgm.volume = .5; }
    },
    // 没有用户手势时 AudioContext 是 suspended，任何一次点击/按键都拿来解锁
    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      if (this.on && this.bgm && this.bgm.paused) this.bgm.play().catch(() => {});
      const m = $('#bootMute'); if (m) m.hidden = true;
    },
    play(freq = 440, dur = .06, type = 'square', vol = .05) {
      this.init();
      if (!this.on || !this.ctx) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    },
    // 噪声"咔"：dur 决定长短，freq/q 决定是清脆还是闷
    click(dur = .02, vol = .06, freq = 1800, q = 1.4) {
      this.init();
      if (!this.on || !this.ctx || !this.noiseBuf) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuf;
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      src.connect(bp).connect(g).connect(this.ctx.destination);
      src.start(t); src.stop(t + dur + .01);
    },
    move() { this.play(320, .05, 'square', .05); },
    ok()   { this.play(660, .09, 'square', .07); setTimeout(() => this.play(880, .09, 'square', .07), 70); },
    get_() { this.play(523, .08, 'square', .07); setTimeout(() => this.play(784, .12, 'square', .07), 80); setTimeout(() => this.play(1046, .16, 'square', .07), 180); },
    // 键帽一按：一声清脆的咔 + 一点低频的"托"
    type() {
      this.click(.016 + Math.random() * .008, .075, 1400 + Math.random() * 1100, 1.6);
      this.play(88 + Math.random() * 26, .022, 'sine', .04);
    },
    // 空格键：闷一点、宽一点
    space() { this.click(.03, .065, 700, .7); this.play(70, .03, 'sine', .045); }, 
    // 回车/换行：一声更沉的
    enter() { this.click(.05, .1, 620, .6); this.play(58, .05, 'sine', .055); },
    // 鼠标扫过按钮时的轻响
    soft() { this.click(.012, .035, 2600, 2.2); },
    // 按下去的"嗒"
    tap() { this.click(.03, .07, 950, .9); this.play(150, .03, 'square', .035); },
    setOn(v) {
      this.init(); this.on = v;
      const b = $('#soundBtn');
      b.textContent = v ? '♪ ON' : '♪ OFF';
      b.setAttribute('aria-pressed', String(v));
      store.set('sound', v);
      if (this.bgm) v ? this.bgm.play().catch(() => {}) : this.bgm.pause();
    },
    toggle() {
      this.setOn(!this.on);
      if (this.on) this.ok();
    },
  };
  // 第一次点击/按键就把音频解锁，开机页的键盘声才响得出来
  ['pointerdown', 'keydown', 'touchstart'].forEach(t =>
    document.addEventListener(t, () => Sound.unlock(), { capture: true, passive: true }));

  // 所有按钮：扫过去一声轻响，按下去一声"嗒"。tabs / cards 是后生成的，所以用委托
  const hoverable = e => e.target.closest('button, a.btn-key, .card, .tab, .menu-item');
  document.addEventListener('pointerover', e => {
    const b = hoverable(e);
    if (!b || b.disabled) return;
    if (e.relatedTarget && b.contains(e.relatedTarget)) return; // 在同一个按钮里挪动不重复响
    Sound.soft();
  });
  document.addEventListener('pointerdown', e => { if (hoverable(e)) Sound.tap(); });

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

  /* ---------------- 开机：像在敲一份 weirdo.js ---------------- */
  // k = 行类型，用来上色：cmd 命令行 / out 输出 / code 代码 / cmt 注释
  const BOOT_LINES = [
    { k: 'cmt',  s: '// weirdo.js — 一个人的视觉作品集' },
    { k: 'cmd',  s: '$ node weirdo.js --boot' },
    { k: 'out',  s: 'compiling player ...' },
    { k: 'code', s: 'const me = {' },
    { k: 'code', s: '  name:   "吴舒逊",' },
    { k: 'code', s: '  born:   "2005-02-08",' },
    { k: 'code', s: '  base:   "everywhere",' },
    { k: 'code', s: '  school: "湖南师范大学 / 艺术设计学",' },
    { k: 'code', s: '  skills: ["沟通", "设计思维", "团队合作", "问题解决", "自我驱动"],' },
    { k: 'code', s: '  perfectionism: 99,' },
    { k: 'code', s: '};' },
    { k: 'code', s: 'export default me;' },
    { k: 'out',  s: 'compiled successfully.' },
    { k: 'cmd',  s: '$ open portfolio' },
  ];

  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  // 行打完之后再上色：字符串、数字、属性名各给一个颜色
  function paint(el, kind, text) {
    let h = esc(text);
    if (kind === 'code') {
      // 顺序要紧：先包字符串，再包属性名/数字/关键字，避免规则打到已插入的标签上
      h = h.replace(/"([^"]*)"/g, '<u class="s-str">"$1"</u>')
           .replace(/^(\s*)([a-z]+)(:)/i, '$1<u class="s-key">$2</u>$3')
           .replace(/(:\s+)(\d+)/g, '$1<u class="s-num">$2</u>')
           .replace(/\b(const|export|default)\b/g, '<u class="s-kw">$1</u>');
    }
    el.innerHTML = h;
  }

  let bootDone = false;
  function boot() {
    const log = $('#bootLog');
    Sound.init();
    // 先试着直接出声（之前在本站放过声音的浏览器会放行）
    if (Sound.on && Sound.bgm) Sound.bgm.play().catch(() => {});
    // 浏览器不允许没交互就出声，先挂个提示，用户一动就撤掉
    if (Sound.ctx && Sound.ctx.state === 'suspended') $('#bootMute').hidden = false;
    const STEP = 2;              // 一次敲进去两个字符，键声才不会糊成一片
    let li = 0, ci = 0, beat = 0, line = null;
    const tick = () => {
      if (li >= BOOT_LINES.length) {
        bootDone = true;
        Sound.ok();
        const p = document.createElement('span');
        p.className = 'b-enter';
        p.innerHTML = TOUCH
          ? '点一下这里进入 ▸'
          : '按 <kbd>ENTER</kbd> 进入 &nbsp;<i>（或点一下这里）</i>';
        log.appendChild(p);
        return;
      }
      const { k, s } = BOOT_LINES[li];
      if (ci === 0) {
        line = document.createElement('span');
        line.className = 'b-line b-' + k;
        line.dataset.caret = '1';
        log.appendChild(line);
      }
      ci = Math.min(ci + STEP, s.length);
      line.textContent = s.slice(0, ci);
      if (beat++ % 2 === 0) (s[ci - 1] === ' ' ? Sound.space() : Sound.type());
      if (ci >= s.length) {
        paint(line, k, s);
        delete line.dataset.caret;
        Sound.enter();
        li++; ci = 0;
        setTimeout(tick, k === 'cmd' ? 300 : 110);
      } else {
        setTimeout(tick, k === 'code' ? 26 : 34);
      }
    };
    setTimeout(tick, 300);
  }

  function start() {
    // 一进来就要有 BGM（这一步是用户手势，浏览器才允许播放）
    Sound.setOn(Sound.on);
    $('#boot').classList.add('off');
    setTimeout(() => { $('#boot').hidden = true; }, 520);
    $('#hud').hidden = false; $('#stage').hidden = false; $('#keybar').hidden = false;
    document.body.classList.remove('booting');
    $('#coverVid')?.play().catch(() => {});
    Sound.ok(); glitch();
    go('hub');
  }

  /* ---------------- 封面视频 ---------------- */
  let coverCtl = null;
  function coverFx() {
    const v = $('#coverVid'), cue = $('#scrollCue');
    if (!v) return;

    // 封面还占着大半屏时显示"往下滑"，滑走就收起
    new IntersectionObserver(([e]) => {
      cue.classList.toggle('is-gone', e.intersectionRatio < .75);
    }, { threshold: [0, .25, .5, .75, .9, 1] }).observe(v);

    cue.addEventListener('click', () => {
      $('#hubMenu').scrollIntoView({ behavior: 'smooth', block: 'start' });
      Sound.move();
    });

    // 正放到尾 → 逐帧倒放回开头 → 再正放，循环
    let raf = 0, prev = 0;
    const stop = () => { cancelAnimationFrame(raf); raf = 0; prev = 0; };
    const rewind = t => {
      const dt = prev ? (t - prev) / 1000 : 0;
      prev = t;
      const next = v.currentTime - dt;
      if (next <= .04) { prev = 0; v.currentTime = 0; v.play().catch(() => {}); return; }
      v.currentTime = next;
      raf = requestAnimationFrame(rewind);
    };
    // 手机和小屏不做逐帧倒放：scrub currentTime 很吃 CPU 和电，直接循环播
    const light = matchMedia('(max-width:900px)').matches
      || matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (light) v.loop = true;
    else v.addEventListener('ended', () => { stop(); raf = requestAnimationFrame(rewind); });

    // 不在目录页、或者切到别的标签页，就把视频和 rAF 都停掉
    coverCtl = {
      pause() { stop(); v.pause(); },
      resume() { v.play().catch(() => {}); },
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) coverCtl.pause();
      else if (cur === 'hub') coverCtl.resume();
    });
  }

  /* ---------------- 场景切换 ---------------- */
  let cur = 'hub';
  function go(key) {
    const target = $(`.scene[data-scene="${key}"]`);
    if (!target) return;
    $$('.scene').forEach(s => s.classList.toggle('is-active', s === target));
    cur = key;
    // 目录页不显示顶部 HUD，只在章节里出现；目录页开启吸附滚动
    $('#hud').classList.toggle('is-away', key === 'hub');
    document.documentElement.classList.toggle('snap', key === 'hub');
    $$('#hudNav button').forEach(b => b.classList.toggle('on', b.dataset.go === key));
    window.scrollTo({ top: 0, behavior: 'auto' });
    glitch(); Sound.move();
    // 离开目录页就停掉封面视频，回来再续上
    if (key === 'hub') coverCtl?.resume(); else coverCtl?.pause();
    if (key === 'char') startDialogue();
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
    // 章节导航第一个就是「回目录」：手机上没有 ESC，得有个能点的
    $('#hudNav').innerHTML = '<button class="nav-home" data-go="hub">← 目录</button>'
      + SCENES.map(s => `<button data-go="${s.key}">${s.no} ${s.name}</button>`).join('');
    $$('.menu-item').forEach(b => b.addEventListener('mouseenter', () => { select(SCENES.findIndex(s => s.key === b.dataset.go)); }));
    if (TOUCH) {
      $('.menu-tip').textContent = '点一下卡片进入 · 左上角「目录」随时回来';
      $$('.keybar span:not(.keybar-sign)').forEach(s => s.remove());
      $('.keybar').insertAdjacentHTML('afterbegin', '<span>点卡片进入 · 顶栏「目录」返回 · ♪ 关音效</span>');
    }
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
    // 基本信息：两组一行
    let rows = '';
    for (let i = 0; i < ME.infos.length; i += 2) {
      rows += '<tr>' + ME.infos.slice(i, i + 2)
        .map(([k, v]) => `<th>${k}</th><td>${v}</td>`).join('') + '</tr>';
    }
    $('#charInfo').innerHTML = rows;
    $('#charIntern').innerHTML = ME.intern.map(j => `
      <li>
        <div class="job-top">
          <b>${j.co}</b>
          <span class="job-role">${j.role}</span>
          <span class="job-date">${j.date}</span>
        </div>
        <ul class="job-pts">${j.points.map(p => `<li>${p}</li>`).join('')}</ul>
      </li>`).join('');
  }

  /* 打字机对白：一句一句点「继续」 */
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
    // 一屏铺满：行数按件数定，列数由行数推出来，格子都是 1fr，不留空白也不挤压
    const n = c.items.length;
    const rows = n <= 3 ? 1 : n % 2 === 0 ? 2 : 1;
    const grid = $('#galGrid');
    grid.style.setProperty('--rows', rows);
    grid.style.setProperty('--cols', Math.ceil(n / rows));
    grid.innerHTML = c.items.map((w, k) => {
      const inner = w.img
        ? `<img src="${w.img}" alt="${w.title}" loading="lazy">`
        : `<span class="slot-hint">空槽位<br><small>把图片放进 img/ 后<br>在 content.js 里填路径</small></span>`;
      return `<button class="card${w.img ? '' : ' empty'}" data-i="${k}" style="--d:${k * 45}ms">
        <span class="card-no">${c.no}-${String(k + 1).padStart(2, '0')}</span>
        <span class="card-img">${inner}</span>
        <span class="card-cap"><b>${w.title}</b><i>${w.meta || ''}</i></span>
      </button>`;
    }).join('');
  }

  /* ---------------- 灯箱 ---------------- */
  let lbI = 0;
  const isVideo = s => /\.(mp4|webm|mov|m4v)$/i.test(s);
  const renderMedia = (s, title, n = 0) => isVideo(s)
    ? `<video src="${s}" controls playsinline preload="metadata" aria-label="${title} ${n + 1}"></video>`
    : `<img src="${s}" alt="${title} ${n + 1}" decoding="async" ${n ? 'loading="lazy"' : ''}>`;
  function openLb(i) {
    lbI = i; const w = CONTENT.gallery[curCat].items[i];
    document.documentElement.classList.add('viewing-work');
    const box = $('#lbImg'), frame = $('.lb-frame');
    const media = Array.isArray(w.media) && w.media.length ? w.media : w.imgs;
    // media/imgs 是多张素材：上下拼成一张作品长页，在灯箱里滑着看
    const long = Array.isArray(media) && media.length > 0;
    box.classList.toggle('long', long);
    if (long) {
      box.innerHTML = media.map((s, n) => renderMedia(s, w.title, n)).join('');
    } else {
      box.innerHTML = w.img
        ? renderMedia(w.img, w.title, 0)
        : '这一格还没有放图<br>（图片准备好之后，填进 content.js 就会出现）';
    }
    $('#lbTitle').textContent = w.title;
    $('#lbMeta').textContent = (w.meta || '') + (long ? '　↕ 上下滑动看长图' : '');
    $('#lbDesc').textContent = w.desc || '';
    $('#lightbox').hidden = false; frame.scrollTop = 0; Sound.ok();
  }
  function stepLb(d) {
    const items = CONTENT.gallery[curCat].items;
    openLb((lbI + d + items.length) % items.length);
  }
  // 关掉就把图从 DOM 里摘掉，长图解码后很占内存，别一直挂着
  const closeLb = () => {
    $('#lightbox').hidden = true;
    $('#lbImg').innerHTML = '';
    document.documentElement.classList.remove('viewing-work');
    Sound.move();
  };

  // 手机上左右滑切上一件/下一件（竖着滑是看长图，不拦）
  (() => {
    const lb = $('#lightbox');
    let x0 = 0, y0 = 0;
    lb.addEventListener('touchstart', e => {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) stepLb(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* ---------------- 联络 ---------------- */
  function buildContact() {
    const subject = encodeURIComponent('来自作品集的消息');
    $('#mailLink').href = `mailto:${ME.email}?subject=${subject}`;
    const saved = store.get('msgs', []);
    termLine('$ cat README');
    termLine('这里是吴舒逊的留言终端，下面三行照着填就行。');
    termLine(`mail   : ${ME.email}`);
    if (ME.phone) termLine(`phone  : ${ME.phone}`);
    if (saved.length) termLine(`draft  : 本机已存 ${saved.length} 条`);
  }
  function termLine(t) { $('#termLog').textContent += t + '\n'; }

  // 在终端里打字，键盘声跟着响
  $$('.tline input, .tline textarea').forEach(el => el.addEventListener('keydown', e => {
    if (e.key === 'Enter') Sound.enter();
    else if (e.key === ' ') Sound.space();
    else if (e.key.length === 1 || e.key === 'Backspace') Sound.type();
  }));

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
    if (tab) { renderCat(+tab.dataset.cat); glitch(); Sound.move(); return; }
    const card = e.target.closest('.card');
    if (card) { openLb(+card.dataset.i); return; }
  });

  $('#boot').addEventListener('click', () => { if (bootDone) start(); });
  $('#soundBtn').addEventListener('click', () => Sound.toggle());
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => stepLb(-1));
  $('#lbNext').addEventListener('click', () => stepLb(1));
  $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLb(); });

  let egg = '';
  document.addEventListener('keydown', e => {
    // 开机页：代码敲完了，按回车进入
    if (!$('#boot').hidden) {
      if (bootDone && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); }
      return;
    }
    // 灯箱优先
    if (!$('#lightbox').hidden) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
      // 长图用上下键滑
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp') {
        e.preventDefault();
        const f = $('.lb-frame'), big = /Page/.test(e.key) ? f.clientHeight * .9 : 160;
        f.scrollBy({ top: /Down/.test(e.key) ? big : -big, behavior: 'smooth' });
      }
      return;
    }
    const typingField = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (typingField) return;

    if (e.key === 'Escape') { go('hub'); return; }
    if (e.key.toLowerCase() === 'm') { Sound.toggle(); return; }
    if (/^[1-3]$/.test(e.key)) { go(SCENES[+e.key - 1].key); return; }
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
  buildMenu(); buildChar(); buildGallery(); buildContact();
  select(0);
  coverFx();

  // 带 # 的链接可以直接进到对应章节（分享用），否则走开机动画
  const deep = location.hash.replace('#', '');
  if (deep && (deep === 'hub' || SCENES.some(s => s.key === deep))) {
    $('#boot').hidden = true;
    $('#hud').hidden = false; $('#stage').hidden = false; $('#keybar').hidden = false;
    go(deep);
    // 直接带 # 进来没有开机手势，浏览器不让自动播；等第一次点击/按键再开 BGM
    const kick = () => { Sound.setOn(Sound.on); document.removeEventListener('pointerdown', kick); document.removeEventListener('keydown', kick); };
    document.addEventListener('pointerdown', kick);
    document.addEventListener('keydown', kick);
  } else {
    boot();
  }
})();
