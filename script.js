// ============================================================
// 🌙 WELCOME SCREEN + AUDIO
// ============================================================
const audio   = document.getElementById('bg-audio');
audio.volume  = 0.10; // soft — not too loud

// Try autoplay immediately (works if browser allows it)
audio.play().catch(() => {
  // Browser blocked autoplay — that's fine, play button will handle it
});

document.getElementById('play-btn').addEventListener('click', () => {
  // Resume / start audio on user gesture (required by browsers)
  audio.play().catch(() => {});
  showScreen('lantern-screen');
});

// ============================================================
// ⭐ STARFIELD
// ============================================================
const canvas = document.getElementById('starfield');
const sCtx   = canvas.getContext('2d');
let stars    = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
function initStars(count = 130) {
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    alpha: Math.random(),
    dAlpha: (Math.random() * 0.005 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
    speed: Math.random() * 0.06 + 0.01,
  }));
}
function drawStars() {
  sCtx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    s.alpha += s.dAlpha;
    if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
    s.alpha = Math.max(0, Math.min(1, s.alpha));
    s.y -= s.speed;
    if (s.y < 0) s.y = canvas.height;
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(201,153,58,${s.alpha.toFixed(3)})`;
    sCtx.fill();
  }
  requestAnimationFrame(drawStars);
}
resizeCanvas(); initStars(); drawStars();
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

// ============================================================
// 🖥 SCREEN CONTROLLER
// ============================================================
const screens = document.querySelectorAll('.screen');
function showScreen(id) {
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ============================================================
// 🏮 LANTERN DATA — colors & quiz questions
// ============================================================
const LANTERN_COLORS = ['#e85d5d', '#e8a23a', '#4caf7d', '#5b9bd5', '#9b59b6', '#e8c06a'];
const LANTERN_GLOW   = ['rgba(232,93,93,.55)', 'rgba(232,162,58,.55)', 'rgba(76,175,125,.55)', 'rgba(91,155,213,.55)', 'rgba(155,89,182,.55)', 'rgba(232,192,106,.55)'];

const QUIZ_DATA = [
  // ── Pillars 1 & 2 ──────────────────────────────────────────
  {
    category: '✦ The Five Pillars of Islam ✦',
    question: 'Which pillar of Islam refers to the declaration of faith — "There is no god but Allah, and Muhammad is His messenger"?',
    options: ['Salah', 'Shahada', 'Zakat', 'Sawm'],
    answer: 1,
    explanation: 'Shahada is the first and most fundamental pillar — the testimony of faith that unites all Muslims.'
  },
  {
    category: '✦ The Five Pillars of Islam ✦',
    question: 'Sawm, the pillar observed during Ramadan, means what?',
    options: ['Prayer five times daily', 'Giving 2.5% of wealth to charity', 'Fasting from dawn to sunset', 'Pilgrimage to Makkah'],
    answer: 2,
    explanation: 'Sawm is the fast of Ramadan — abstaining from food, drink, and worldly desires from Fajr to Maghrib.'
  },
  // ── Prophets 3 & 4 ─────────────────────────────────────────
  {
    category: '✦ Prophets & Their Stories ✦',
    question: 'This prophet was swallowed by a great whale after leaving his people without permission, and made du\'a from inside it. Who was he?',
    options: ['Prophet Musa (AS)', 'Prophet Yunus (AS)', 'Prophet Ayyub (AS)', 'Prophet Ibrahim (AS)'],
    answer: 1,
    explanation: 'Prophet Yunus (Jonah) was swallowed by a whale. His prayer — "There is no god but You, glory be to You, I was among the wrongdoers" — is one of the most powerful duas in the Quran.'
  },
  {
    category: '✦ Prophets & Their Stories ✦',
    question: 'Which prophet is known for his extraordinary patience through severe illness, loss of wealth, and family — and was ultimately rewarded with healing and restoration?',
    options: ['Prophet Yusuf (AS)', 'Prophet Idris (AS)', 'Prophet Ayyub (AS)', 'Prophet Sulayman (AS)'],
    answer: 2,
    explanation: 'Prophet Ayyub (Job) is the emblem of sabr (patience). After years of suffering, Allah restored his health, wealth, and family as a reward for his unwavering trust.'
  },
  // ── Quran Stories 5 & 6 ────────────────────────────────────
  {
    category: '✦ Stories from the Quran ✦',
    question: 'In Surah Yusuf, what did the brothers of Prophet Yusuf do to him out of jealousy?',
    options: ['Exiled him to another city', 'Threw him into a well', 'Sold him to a rival tribe', 'Left him in the desert'],
    answer: 1,
    explanation: 'Yusuf\'s brothers threw him into a well, then told their father he had been eaten by a wolf. Years later, after rising to power in Egypt, Yusuf forgave them entirely — one of the Quran\'s most moving moments.'
  },
  {
    category: '✦ Stories from the Quran ✦',
    question: 'The People of the Cave (Ashab al-Kahf) slept for how many years, according to the Quran?',
    options: ['7 years', '100 years', '309 years', '40 years'],
    answer: 2,
    explanation: 'Surah Al-Kahf tells of young believers who fled persecution and slept in a cave for 309 years. Their story is a sign of Allah\'s protection over those who hold firm to their faith.'
  },
];

// ============================================================
// 🏮 LANTERN SCREEN STATE
// ============================================================
let currentQuizIndex  = -1;   // which lantern's quiz is active (-1 = none)
let lanternsHung      = 0;    // how many are on the string
let awaitingDrag      = false; // true after correct answer, waiting for drag

const quizPanel    = document.getElementById('quiz-panel');
const quizCategory = document.getElementById('quiz-category');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions  = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const startBtn     = document.getElementById('start-quiz-btn');
const trayLanterns = document.querySelectorAll('.tray-lantern');
const hooks        = document.querySelectorAll('.hook');

// Colour each tray lantern
trayLanterns.forEach((tl, i) => {
  tl.style.color  = LANTERN_COLORS[i];
  tl.style.filter = `drop-shadow(0 0 6px ${LANTERN_GLOW[i]})`;
});

// "Begin" button → show first quiz
startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  document.querySelector('.subtitle').style.display = 'none';
  showQuiz(0);
});

function showQuiz(index) {
  currentQuizIndex = index;
  const q = QUIZ_DATA[index];

  quizCategory.textContent = q.category;
  quizQuestion.textContent = q.question;
  quizFeedback.textContent = '';
  quizFeedback.className   = '';
  quizOptions.innerHTML    = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className   = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    quizOptions.appendChild(btn);
  });

  quizPanel.classList.remove('hidden');
  quizPanel.classList.add('visible');
}

function handleAnswer(chosen, btn) {
  const q = QUIZ_DATA[currentQuizIndex];
  const allOpts = quizOptions.querySelectorAll('.quiz-opt');
  allOpts.forEach(b => b.disabled = true);

  if (chosen === q.answer) {
    btn.classList.add('correct');
    quizFeedback.textContent = '✓ ' + q.explanation;
    quizFeedback.className   = 'feedback-correct';

    // Unlock the matching tray lantern for dragging
    const tl = document.getElementById(`tl-${currentQuizIndex}`);
    setTimeout(() => {
      tl.classList.remove('locked');
      tl.classList.add('unlocked');
      quizPanel.classList.remove('visible');
      quizPanel.classList.add('hidden');
      awaitingDrag = true;
      // pulse the lantern to draw attention
      tl.classList.add('pulse');
    }, 1800);

  } else {
    btn.classList.add('wrong');
    allOpts[q.answer].classList.add('correct');
    quizFeedback.textContent = '✗ Not quite. ' + q.explanation;
    quizFeedback.className   = 'feedback-wrong';

    // Allow retry after 2.5s
    setTimeout(() => {
      allOpts.forEach(b => { b.disabled = false; b.classList.remove('wrong','correct'); });
      quizFeedback.textContent = '';
    }, 2600);
  }
}

// ── Drag-to-hang mechanics ───────────────────────────────────
trayLanterns.forEach(tl => {
  tl.addEventListener('mousedown',  e => startLanternDrag(e, tl));
  tl.addEventListener('touchstart', e => startLanternDrag(e, tl), { passive: false });
});

function startLanternDrag(e, tl) {
  if (tl.classList.contains('locked') || tl.classList.contains('hung')) return;
  e.preventDefault();

  const idx     = parseInt(tl.dataset.index);
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;
  const rect    = tl.getBoundingClientRect();
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;

  // Create a floating clone to drag
  const ghost = document.createElement('div');
  ghost.className   = 'lantern-ghost';
  ghost.textContent = '🏮';
  ghost.style.color  = LANTERN_COLORS[idx];
  ghost.style.filter = `drop-shadow(0 0 12px ${LANTERN_GLOW[idx]})`;
  ghost.style.left   = rect.left + 'px';
  ghost.style.top    = rect.top  + 'px';
  document.body.appendChild(ghost);

  function onMove(e) {
    const x = (e.clientX ?? e.touches[0].clientX) - offsetX;
    const y = (e.clientY ?? e.touches[0].clientY) - offsetY;
    ghost.style.left = x + 'px';
    ghost.style.top  = y + 'px';

    // Highlight nearest hook
    hooks.forEach(h => h.classList.remove('hook-hover'));
    const nearest = getNearestFreeHook(e.clientX ?? e.touches[0].clientX, e.clientY ?? e.touches[0].clientY);
    if (nearest) nearest.classList.add('hook-hover');
  }

  function onUp(e) {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend',  onUp);
    hooks.forEach(h => h.classList.remove('hook-hover'));
    ghost.remove();

    const dropX = e.clientX ?? e.changedTouches[0].clientX;
    const dropY = e.clientY ?? e.changedTouches[0].clientY;
    const nearest = getNearestFreeHook(dropX, dropY, 120);

    if (nearest) {
      hangLantern(tl, nearest, idx);
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend',  onUp);
}

function getNearestFreeHook(x, y, maxDist = Infinity) {
  let best = null, bestD = maxDist;
  hooks.forEach(h => {
    if (h.dataset.hung) return;
    const r  = h.getBoundingClientRect();
    const hx = r.left + r.width / 2;
    const hy = r.top  + r.height / 2;
    const d  = Math.hypot(x - hx, y - hy);
    if (d < bestD) { bestD = d; best = h; }
  });
  return best;
}

function hangLantern(tl, hook, idx) {
  // Mark hook as taken
  hook.dataset.hung = '1';
  hook.classList.add('has-lantern');

  // Place a hung lantern div inside the hook
  const hung = document.createElement('div');
  hung.className   = 'hung-lantern';
  hung.textContent = '🏮';
  hung.style.color = LANTERN_COLORS[idx];
  hung.style.setProperty('--glow', `drop-shadow(0 0 14px ${LANTERN_GLOW[idx]}) drop-shadow(0 0 30px ${LANTERN_GLOW[idx]})`);
  hung.style.filter = `drop-shadow(0 0 14px ${LANTERN_GLOW[idx]}) drop-shadow(0 0 30px ${LANTERN_GLOW[idx]})`;
  hook.appendChild(hung);

  // Hide the tray slot
  tl.classList.add('hung');
  tl.classList.remove('pulse');

  lanternsHung++;

  if (lanternsHung === 6) {
    // All hung — celebrate then move on
    setTimeout(() => showScreen('iftar-screen'), 1400);
  } else {
    // Show next quiz after a beat
    const next = currentQuizIndex + 1;
    if (next < QUIZ_DATA.length) {
      setTimeout(() => showQuiz(next), 700);
    }
  }
}

// ============================================================
// 🍽 IFTAR DRAG & DROP
// ============================================================
const foodItems    = document.querySelectorAll('.draggable');
const iftarDoneBtn = document.getElementById('iftar-done');
let placedCount    = 0;

foodItems.forEach(item => {
  item.addEventListener('mousedown', startDrag);
  item.addEventListener('touchstart', startDrag, { passive: false });
});

function startDrag(e) {
  e.preventDefault();
  const item    = e.currentTarget;
  const clientX = e.clientX ?? e.touches[0].clientX;
  const clientY = e.clientY ?? e.touches[0].clientY;
  const rect    = item.getBoundingClientRect();
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;

  function moveAt(x, y) {
    item.style.left   = (x - offsetX) + 'px';
    item.style.top    = (y - offsetY) + 'px';
    item.style.zIndex = 1000;
  }
  function onMove(e) { moveAt(e.clientX ?? e.touches[0].clientX, e.clientY ?? e.touches[0].clientY); }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend',  onUp);
    const plate     = document.getElementById('plate');
    const plateRect = plate.getBoundingClientRect();
    const itemRect  = item.getBoundingClientRect();
    const isInside  = itemRect.left < plateRect.right && itemRect.right > plateRect.left &&
                      itemRect.top  < plateRect.bottom && itemRect.bottom > plateRect.top;
    if (isInside) placedCount++;
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend',  onUp);
}

iftarDoneBtn.addEventListener('click', () => {
  if (placedCount > 0) showScreen('tasbih-screen');
  else alert('Place at least one food item on the plate!');
});

// ============================================================
// 📿 TASBIH — bead-by-bead necklace
// ============================================================
const TOTAL_BEADS  = 15;
let   beadCount    = 0;
const countDisplay = document.getElementById('count');
const tapBead      = document.getElementById('tap-bead');
const necklaceEl   = document.getElementById('necklace');
const beadSlots    = [];

function buildNecklace() {
  necklaceEl.innerHTML = '';
  beadSlots.length = 0;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 320 220');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
  const cx = 160, cy = 170, r = 135;
  const sx = cx + r * Math.cos(Math.PI), sy = cy + r * Math.sin(Math.PI);
  const ex = cx + r * Math.cos(0),       ey = cy + r * Math.sin(0);
  const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arc.setAttribute('d', `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`);
  arc.setAttribute('fill', 'none');
  arc.setAttribute('stroke', 'rgba(139,69,19,0.22)');
  arc.setAttribute('stroke-width', '2.5');
  arc.setAttribute('stroke-dasharray', '5 5');
  svg.appendChild(arc);
  necklaceEl.appendChild(svg);

  for (let i = 0; i < TOTAL_BEADS; i++) {
    const angle = Math.PI - (i / (TOTAL_BEADS - 1)) * Math.PI;
    const bx = cx + r * Math.cos(angle);
    const by = cy + r * Math.sin(angle);
    const slot = document.createElement('div');
    slot.className  = 'bead-slot';
    slot.style.left = (bx / 320 * 100) + '%';
    slot.style.top  = (by / 220 * 100) + '%';
    necklaceEl.appendChild(slot);
    beadSlots.push(slot);
  }
}
buildNecklace();

tapBead.addEventListener('click', () => {
  if (beadCount >= TOTAL_BEADS) return;
  tapBead.classList.add('tapped');
  setTimeout(() => tapBead.classList.remove('tapped'), 160);
  beadSlots[beadCount].classList.add('filled');
  beadCount++;
  countDisplay.textContent = `${beadCount} / 15`;
  if (beadCount >= TOTAL_BEADS) setTimeout(() => showScreen('final-screen'), 950);
});
