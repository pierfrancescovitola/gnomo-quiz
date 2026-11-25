(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Coniglietto: inserisce immagine + espressioni in ogni .bunny ---------- */
  const tpl = $('#bunny-tpl');
  $$('.bunny').forEach((el) => el.appendChild(tpl.content.cloneNode(true)));

  const setMood = (screen, mood) => {
    const b = $('.bunny', screen);
    if (b) b.dataset.mood = mood;
  };

  /* ---------- Cuoricini di sfondo ---------- */
  (() => {
    const layer = $('.bg-hearts');
    const n = window.innerWidth < 600 ? 9 : 14;
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'bg-heart';
      h.textContent = '♥';
      h.style.left = `${(i / n) * 100 + Math.random() * (100 / n)}%`;
      h.style.fontSize = `${14 + Math.random() * 22}px`;
      h.style.animationDuration = `${14 + Math.random() * 12}s`;
      h.style.animationDelay = `${-Math.random() * 24}s`;
      layer.appendChild(h);
    }
  })();

  /* ---------- Burst di cuori ---------- */
  const burstHearts = (anchor, count = 12) => {
    if (reducedMotion.matches || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.55;
    const colors = ['#EF8995', '#F8D6C2', '#f4a7b1', '#E4707E'];
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'burst-heart';
      h.textContent = '♥';
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 70 + Math.random() * 60;
      h.style.left = `${cx}px`;
      h.style.top = `${cy}px`;
      h.style.color = colors[i % colors.length];
      h.style.fontSize = `${14 + Math.random() * 14}px`;
      h.style.setProperty('--dx', `${Math.cos(a) * dist}px`);
      h.style.setProperty('--dy', `${Math.sin(a) * dist - 20}px`);
      document.body.appendChild(h);
      h.addEventListener('animationend', () => h.remove());
      setTimeout(() => h.remove(), 1500);
    }
  };

  const setFeedback = (screen, text) => {
    const fb = $('.feedback', screen);
    if (!fb) return;
    fb.textContent = text || ' ';
    fb.classList.remove('pop');
    void fb.offsetWidth; // riavvia l'animazione
    fb.classList.add('pop');
  };

  /* ---------- Navigazione tra schermate ---------- */
  const header = $('.quiz-header');
  const counterN = $('.counter-n');
  const progress = $('.progress');
  const progressFill = $('.progress-fill');
  let current = $('#landing');
  let busy = false;

  const setProgress = (done) => {
    progressFill.style.width = `${(done / 4) * 100}%`;
    progress.setAttribute('aria-valuenow', String(done));
  };

  const show = (id) => {
    if (busy) return;
    const next = document.getElementById(id);
    if (!next || next === current) return;
    busy = true;
    const prev = current;
    const swap = () => {
      prev.hidden = true;
      prev.classList.remove('is-leaving', 'is-entering');
      const step = Number(next.dataset.step || 0);
      document.body.classList.toggle('in-quiz', step > 0);
      header.hidden = step === 0;
      if (step > 0) {
        counterN.textContent = String(step);
        setProgress(step - 1);
      }
      next.hidden = false;
      next.classList.add('is-entering');
      window.scrollTo(0, 0);
      current = next;
      onEnter[id] && onEnter[id]();
      setTimeout(() => { next.classList.remove('is-entering'); busy = false; }, reducedMotion.matches ? 20 : 460);
    };
    if (reducedMotion.matches) { swap(); return; }
    prev.classList.add('is-leaving');
    setTimeout(swap, 260);
  };

  const order = ['landing', 'q1', 'q2', 'q3', 'q4', 'final'];
  const goNext = () => show(order[order.indexOf(current.id) + 1]);

  const complete = (screen) => {
    setProgress(Number(screen.dataset.step));
    const nextBtn = $('.btn--next', screen);
    if (nextBtn) {
      nextBtn.disabled = false;
      const r = nextBtn.getBoundingClientRect();
      if (r.bottom > window.innerHeight) {
        nextBtn.scrollIntoView({ block: 'end', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      }
    }
  };

  /* ---------- Domanda 1: slider ---------- */
  const q1 = $('#q1');
  const slider = $('#love', q1);
  const sliderValue = $('.slider-value', q1);
  let q1WasTen = false;

  const q1Message = (v) => {
    if (v === 10) return 'Yeee! Lo sapevo! ❤️';
    if (v === 9) return 'Solo 9?!';
    if (v >= 5) return 'Mi ami così poco?';
    return 'Mi si spezza il cuoricino...';
  };

  const updateQ1 = () => {
    const v = Number(slider.value);
    sliderValue.textContent = String(v);
    sliderValue.classList.add('bump');
    setTimeout(() => sliderValue.classList.remove('bump'), 160);
    slider.style.setProperty('--fill', `${((v - 1) / 9) * 100}%`);
    slider.setAttribute('aria-valuetext', `${v} su 10`);
    const fb = $('.feedback', q1);
    const msg = q1Message(v);
    if (fb.textContent !== msg) setFeedback(q1, msg);
    const nextBtn = $('.btn--next', q1);
    if (v === 10) {
      setMood(q1, 'happy');
      nextBtn.disabled = false;
      setProgress(1);
      if (!q1WasTen) burstHearts($('.bunny', q1), 14);
      q1WasTen = true;
    } else {
      setMood(q1, 'sad');
      nextBtn.disabled = true;
      setProgress(0);
      q1WasTen = false;
    }
  };
  slider.addEventListener('input', updateQ1);
  slider.addEventListener('change', updateQ1);

  /* ---------- Domanda 2: chi è il più bello ---------- */
  const q2 = $('#q2');
  let q2Morphed = false;
  let q2Done = false;

  const acceptQ2 = (btn) => {
    q2Done = true;
    $$('.btn--option', q2).forEach((b) => {
      b.disabled = true;
      b.classList.toggle('is-selected', b === btn);
      b.classList.toggle('is-dim', b !== btn);
    });
    setMood(q2, 'happy');
    setFeedback(q2, 'Che buon gusto! ❤️');
    burstHearts($('.bunny', q2), 10);
    complete(q2);
  };

  let q2Timers = [];
  const finishMorph = () => {
    q2Timers.forEach(clearTimeout);
    q2Timers = [];
    $$('.btn--option', q2).forEach((b) => {
      b.textContent = 'Tu, ovviamente';
      b.dataset.answer = 'tu';
      b.classList.remove('is-morphing');
    });
  };

  q2.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn--option');
    if (!btn || q2Done) return;
    // Dopo la trasformazione qualunque risposta è giusta (anche se l'animazione è ancora in corso)
    if (btn.dataset.answer === 'tu' || q2Morphed) {
      if (q2Morphed) finishMorph();
      acceptQ2(btn);
      return;
    }

    // Risposta "sbagliata": tutte le opzioni diventano "Tu, ovviamente"
    q2Morphed = true;
    setMood(q2, 'sad');
    setFeedback(q2, 'Mmm... forse intendevi un\'altra cosa');
    const rm = reducedMotion.matches;
    $$('.btn--option', q2).forEach((b, i) => {
      const t0 = rm ? 0 : i * 90;
      q2Timers.push(setTimeout(() => b.classList.add('is-morphing'), t0));
      q2Timers.push(setTimeout(() => {
        b.textContent = 'Tu, ovviamente';
        b.dataset.answer = 'tu';
      }, t0 + (rm ? 0 : 250)));
      q2Timers.push(setTimeout(() => b.classList.remove('is-morphing'), t0 + (rm ? 10 : 520)));
    });
    q2Timers.push(setTimeout(() => { if (!q2Done) setMood(q2, 'neutral'); }, rm ? 10 : 800));
  });

  /* ---------- Domanda 3: quanto ti manco ---------- */
  const q3 = $('#q3');
  const growBtn = $('.btn--grow', q3);
  const q3Messages = [
    'Sei sicura?',
    'Pensaci meglio...',
    'Gnomo?!',
    'Forse non vedi la risposta giusta...',
    'Te la faccio ancora più grande?',
  ];
  const MAX_GROW = 12; // limite solo per non uscire dallo schermo
  let q3Wrong = 0;
  let q3Done = false;

  q3.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn--option');
    if (!btn || q3Done) return;

    if (btn.dataset.answer === 'impazzire') {
      q3Done = true;
      $$('.btn--option', q3).forEach((b) => {
        b.disabled = true;
        b.classList.toggle('is-selected', b === btn);
        b.classList.toggle('is-dim', b !== btn);
      });
      setMood(q3, 'happy');
      setFeedback(q3, 'Anche tu mi manchi da impazzire! ❤️');
      burstHearts($('.bunny', q3), 12);
      complete(q3);
      return;
    }

    q3Wrong++;
    setMood(q3, 'sad');
    setFeedback(q3, q3Messages[Math.min(q3Wrong, q3Messages.length) - 1]);
    btn.classList.remove('is-wrong');
    void btn.offsetWidth;
    btn.classList.add('is-wrong');
    q3.style.setProperty('--g', String(Math.min(q3Wrong, MAX_GROW)));
    growBtn.classList.remove('is-growing');
    void growBtn.offsetWidth;
    growBtn.classList.add('is-growing');
  });

  /* ---------- Domanda 4: vuoi uscire con me? ---------- */
  const q4 = $('#q4');
  const arena = $('.arena', q4);
  const yesBtn = $('.btn--yes', q4);
  const noBtn = $('.btn--no', q4);
  const q4Messages = [
    'Mmm... riprova!',
    'Sei proprio sicura?',
    'Quel pulsante sembra avere qualche problema...',
    "Secondo me volevi schiacciare l'altro.",
  ];
  const YES_STEP = 0.08;
  const YES_MAX = 1.6;
  let yesScale = 1;
  let noAttempts = 0;
  let lastFlee = 0;
  let q4MoodTimer = 0;

  const rectsOverlap = (a, b, pad = 0) =>
    a.left - pad < b.right && a.right + pad > b.left && a.top - pad < b.bottom && a.bottom + pad > b.top;

  // Rettangolo del "Sì" alla scala indicata (relativo all'arena)
  const yesRectAt = (scale) => {
    const w = yesBtn.offsetWidth * scale;
    const h = yesBtn.offsetHeight * scale;
    const cx = yesBtn.offsetLeft; // left = centro (translate -50%)
    const cy = yesBtn.offsetTop;
    return { left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2 };
  };

  const flee = (pointer) => {
    const now = performance.now();
    if (now - lastFlee < 280) return;
    lastFlee = now;

    noAttempts++;
    yesScale = Math.min(YES_MAX, yesScale + YES_STEP);
    yesBtn.style.setProperty('--s', yesScale.toFixed(2));
    setFeedback(q4, q4Messages[(noAttempts - 1) % q4Messages.length]);
    setMood(q4, 'sad');
    clearTimeout(q4MoodTimer);
    q4MoodTimer = setTimeout(() => { if (current === q4) setMood(q4, 'neutral'); }, 1600);

    const aw = arena.clientWidth;
    const ah = arena.clientHeight;
    const nw = noBtn.offsetWidth;
    const nh = noBtn.offsetHeight;
    const margin = 6;
    const yes = yesRectAt(yesScale);
    const arenaBox = arena.getBoundingClientRect();
    const cur = { x: noBtn.offsetLeft, y: noBtn.offsetTop };
    const p = pointer
      ? { x: pointer.x - arenaBox.left, y: pointer.y - arenaBox.top }
      : cur;

    // Il bottone non deve mai uscire dallo schermo visibile
    const vwLeft = -arenaBox.left + margin;
    const vwRight = window.innerWidth - arenaBox.left - margin;
    const minX = Math.max(nw / 2 + margin, vwLeft + nw / 2);
    const maxX = Math.min(aw - nw / 2 - margin, vwRight - nw / 2);
    const minY = nh / 2 + margin;
    const maxY = ah - nh / 2 - margin;

    // Salti lunghi: si sceglie a caso tra le posizioni più lontane da dove si trova ora
    const cands = [];
    for (let i = 0; i < 80; i++) {
      const x = minX + Math.random() * Math.max(0, maxX - minX);
      const y = minY + Math.random() * Math.max(0, maxY - minY);
      const r = { left: x - nw / 2, right: x + nw / 2, top: y - nh / 2, bottom: y + nh / 2 };
      if (rectsOverlap(r, yes, 14)) continue;
      const fromPointer = Math.hypot(x - p.x, y - p.y);
      const fromCurrent = Math.hypot(x - cur.x, y - cur.y);
      cands.push({ x, y, score: fromCurrent + Math.min(fromPointer, 260) * 0.6 });
    }
    cands.sort((a, b) => b.score - a.score);
    let best = cands.length ? cands[Math.floor(Math.random() * Math.min(5, cands.length))] : null;
    if (!best) {
      // fallback: l'angolo più lontano dal "Sì"
      const corners = [
        { x: minX, y: minY }, { x: maxX, y: minY }, { x: minX, y: maxY }, { x: maxX, y: maxY },
      ];
      best = corners.reduce((a, c) =>
        Math.hypot(c.x - p.x, c.y - p.y) > Math.hypot(a.x - p.x, a.y - p.y) ? c : a);
    }

    noBtn.style.left = `${best.x}px`;
    noBtn.style.top = `${best.y}px`;
    noBtn.classList.remove('is-fleeing');
    void noBtn.offsetWidth;
    noBtn.classList.add('is-fleeing');
  };

  // Desktop: scappa quando il cursore si avvicina
  document.addEventListener('pointermove', (e) => {
    if (current !== q4 || e.pointerType !== 'mouse') return;
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = Math.max(Math.abs(e.clientX - cx) - r.width / 2, 0);
    const dy = Math.max(Math.abs(e.clientY - cy) - r.height / 2, 0);
    if (Math.hypot(dx, dy) < 40) flee({ x: e.clientX, y: e.clientY });
  });

  // Mobile (e qualunque tentativo di click): scappa al tocco
  noBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    flee({ x: e.clientX, y: e.clientY });
  });
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Da tastiera (Invio/Spazio) il "No" scappa lo stesso
    if (e.detail === 0) { lastFlee = 0; flee(null); }
  });

  yesBtn.addEventListener('click', () => {
    setProgress(4);
    show('final');
  });

  /* ---------- Coriandoli finali ---------- */
  const canvas = $('.confetti');
  const ctx = canvas.getContext('2d');
  let confettiRaf = 0;

  const launchConfetti = () => {
    cancelAnimationFrame(confettiRaf);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ['#EF8995', '#FCE4E8', '#F8D6C2', '#f4a7b1', '#fbd3c0', '#ffd9e0', '#f7b8a0'];
    const few = reducedMotion.matches;
    const N = few ? 0 : (W < 600 ? 110 : 160);
    const parts = Array.from({ length: N }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.35 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 11 - 4,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      heart: Math.random() < 0.22,
    }));
    if (!N) return;

    const start = performance.now();
    const drawHeart = (s) => {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.5, -s, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.4, 0, s * 0.3);
      ctx.fill();
    };
    const frame = (t) => {
      const el = t - start;
      ctx.clearRect(0, 0, W, H);
      const fade = el > 4200 ? Math.max(0, 1 - (el - 4200) / 1300) : 1;
      ctx.globalAlpha = fade;
      for (const p of parts) {
        p.vy += 0.22;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx + Math.sin((el + p.w * 100) / 300) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.heart) drawHeart(p.w * 1.1);
        else ctx.fillRect(-p.w / 2, -p.h / 4, p.w, p.h / 2);
        ctx.restore();
      }
      if (fade > 0) confettiRaf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    confettiRaf = requestAnimationFrame(frame);
  };

  /* ---------- Hook all'ingresso delle schermate ---------- */
  const onEnter = {
    q1: () => updateQ1(),
    final: () => {
      document.body.classList.add('celebrate');
      launchConfetti();
      setTimeout(() => burstHearts($('.bunny', $('#final')), 16), 350);
    },
  };

  /* ---------- Reset ---------- */
  const resetAll = () => {
    document.body.classList.remove('celebrate');
    slider.value = '5';
    q1WasTen = false;

    q2Timers.forEach(clearTimeout);
    q2Timers = [];
    q2Morphed = false;
    q2Done = false;
    const labels = { tu: 'Tu', io: 'Io', entrambi: 'Entrambi' };
    $$('.btn--option', q2).forEach((b, i) => {
      const key = ['tu', 'io', 'entrambi'][i];
      b.dataset.answer = key;
      b.textContent = labels[key];
    });

    q3Wrong = 0;
    q3Done = false;
    q3.style.setProperty('--g', '0');

    yesScale = 1;
    noAttempts = 0;
    yesBtn.style.setProperty('--s', '1');
    noBtn.style.left = '';
    noBtn.style.top = '';

    $$('.screen[data-step]').forEach((s) => {
      $$('.btn--option', s).forEach((b) => {
        b.disabled = false;
        b.classList.remove('is-selected', 'is-dim', 'is-wrong', 'is-growing');
      });
      const nb = $('.btn--next', s);
      if (nb) nb.disabled = true;
      setMood(s, s.id === 'q1' ? 'sad' : 'neutral');
      const fb = $('.feedback', s);
      if (fb) fb.textContent = ' ';
    });
    setProgress(0);
  };

  /* ---------- Azioni ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'start': show('q1'); break;
      case 'next': if (!el.disabled) goNext(); break;
      case 'restart':
        cancelAnimationFrame(confettiRaf);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resetAll();
        show('landing');
        break;
      default: break;
    }
  });

  // Se cambia la dimensione dello schermo (es. rotazione) il "No" torna al suo posto
  // iniziale, che non si sovrappone mai al "Sì" ed è sempre dentro lo schermo
  window.addEventListener('resize', () => {
    noBtn.style.left = '';
    noBtn.style.top = '';
  });
})();
