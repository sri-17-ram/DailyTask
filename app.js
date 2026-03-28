// ============================================================
// LIFEOS — APP.JS  |  Pure Vanilla JS ES6+
// ============================================================

// ============ AI CONFIG ============
const AI_CONFIG = {
  get apiKey() { return (getStorage('lifeos_settings') || {}).apiKey || ''; },
  get model() {
    const s = getStorage('lifeos_settings') || {};
    return s.aiProvider === 'openai' ? 'gpt-4o-mini' : 'claude-opus-4-5';
  },
  get baseUrl() {
    const s = getStorage('lifeos_settings') || {};
    return s.aiProvider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.anthropic.com/v1/messages';
  },
  maxTokens: 1000
};

async function askAI(systemPrompt, userMessage) {
  if (!AI_CONFIG.apiKey) {
    showToast('Add your API key in Settings → AI Settings', 'warning');
    return null;
  }
  const s = getStorage('lifeos_settings') || {};
  const isOpenAI = s.aiProvider === 'openai';
  try {
    const headers = { 'Content-Type': 'application/json' };
    let body;
    if (isOpenAI) {
      headers['Authorization'] = `Bearer ${AI_CONFIG.apiKey}`;
      body = JSON.stringify({ model: AI_CONFIG.model, max_tokens: AI_CONFIG.maxTokens,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] });
    } else {
      headers['x-api-key'] = AI_CONFIG.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({ model: AI_CONFIG.model, max_tokens: AI_CONFIG.maxTokens,
        system: systemPrompt, messages: [{ role: 'user', content: userMessage }] });
    }
    const res = await fetch(AI_CONFIG.baseUrl, { method: 'POST', headers, body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'API error');
    return isOpenAI ? data.choices[0].message.content : data.content[0].text;
  } catch (err) {
    showToast('AI request failed: ' + err.message, 'error');
    return null;
  }
}

// ============ STORAGE HELPERS ============
function getStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function setStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { showToast('Storage full!', 'error'); }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ============ SEED DATA ============
function seedData() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return fmt(d); };

  setStorage('lifeos_user', { name: 'Alex', username: 'alex', avatar: '#7B2FFF', theme: 'dark' });

  const tasks = [
    { id: uid(), title: 'Design new landing page', desc: 'Create wireframes and mockups', priority: 'high', tags: ['design','work'], dueDate: daysAgo(-1)+'T17:00', status: 'inprogress', subtasks: [], timeLogged: 45, recurring: 'none', created: daysAgo(3), updated: daysAgo(1) },
    { id: uid(), title: 'Review pull requests', desc: '', priority: 'medium', tags: ['dev'], dueDate: fmt(today)+'T12:00', status: 'todo', subtasks: [], timeLogged: 0, recurring: 'daily', created: daysAgo(1), updated: daysAgo(1) },
    { id: uid(), title: 'Team standup meeting', desc: 'Daily sync with the team', priority: 'medium', tags: ['meeting'], dueDate: fmt(today)+'T09:00', status: 'done', subtasks: [], timeLogged: 30, recurring: 'daily', created: daysAgo(5), updated: fmt(today) },
    { id: uid(), title: 'Write blog post', desc: 'Topic: productivity tips', priority: 'low', tags: ['writing'], dueDate: daysAgo(-3)+'T18:00', status: 'todo', subtasks: [], timeLogged: 0, recurring: 'none', created: daysAgo(2), updated: daysAgo(2) },
    { id: uid(), title: 'Fix login bug', desc: 'Users report 500 error on login', priority: 'high', tags: ['bug','dev'], dueDate: daysAgo(-1)+'T10:00', status: 'done', subtasks: [], timeLogged: 90, recurring: 'none', created: daysAgo(1), updated: fmt(today) },
  ];
  setStorage('lifeos_tasks', tasks);

  const habits = [
    { id: uid(), name: 'Drink Water', icon: '💧', color: '#00F5FF', frequency: 'daily', streak: 7, bestStreak: 21, entries: Object.fromEntries(Array.from({length:14},(_,i)=>[daysAgo(i), Math.random()>0.2])) },
    { id: uid(), name: 'Read 20 mins', icon: '📚', color: '#7B2FFF', frequency: 'daily', streak: 4, bestStreak: 14, entries: Object.fromEntries(Array.from({length:14},(_,i)=>[daysAgo(i), Math.random()>0.3])) },
    { id: uid(), name: 'Exercise', icon: '🏃', color: '#6BCB77', frequency: 'weekdays', streak: 3, bestStreak: 10, entries: Object.fromEntries(Array.from({length:14},(_,i)=>[daysAgo(i), Math.random()>0.35])) },
  ];
  setStorage('lifeos_habits', habits);

  const goals = [
    { id: uid(), title: 'Launch side project', desc: 'Build and ship my SaaS product to first 100 users', category: 'career', targetDate: daysAgo(-60), milestones: [{id:uid(),text:'Define MVP features',done:true},{id:uid(),text:'Build backend API',done:true},{id:uid(),text:'Create landing page',done:false}], notes: [], progress: 40, status: 'active', created: daysAgo(30) },
    { id: uid(), title: 'Get fit', desc: 'Lose 10kg and run a 5K', category: 'health', targetDate: daysAgo(-90), milestones: [{id:uid(),text:'Join a gym',done:true},{id:uid(),text:'Run 1K without stopping',done:false},{id:uid(),text:'Lose 5kg',done:false},{id:uid(),text:'Complete 5K run',done:false}], notes: [], progress: 25, status: 'active', created: daysAgo(20) },
  ];
  setStorage('lifeos_goals', goals);

  const plannerDate = fmt(today);
  const planner = { [plannerDate]: [
    { id: uid(), title: 'Deep Work Session', start: '09:00', end: '11:00', category: 'work', color: '#00F5FF', notes: '' },
    { id: uid(), title: 'Lunch Break', start: '12:00', end: '13:00', category: 'break', color: '#FFD93D', notes: '' },
    { id: uid(), title: 'Exercise', start: '17:00', end: '18:00', category: 'health', color: '#6BCB77', notes: '' },
  ]};
  setStorage('lifeos_planner', planner);

  const health = {};
  for (let i = 0; i < 30; i++) {
    const d = daysAgo(i);
    health[d] = {
      water: Math.floor(Math.random()*4)+4,
      sleep: { bedtime: '23:00', wake: '06:30', quality: Math.floor(Math.random()*3)+2, duration: 7.5 },
      steps: Math.floor(Math.random()*7000)+5000,
      meals: [true, Math.random()>0.2, Math.random()>0.3, Math.random()>0.5],
      exercise: { mins: Math.floor(Math.random()*40)+10, type: 'Walk' },
      mood: Math.floor(Math.random()*3)+2,
      weight: 72 + (Math.random()-0.5)*2
    };
  }
  setStorage('lifeos_health', health);

  const balance = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i*7);
    balance.push({ date: fmt(d), scores: { health: Math.floor(Math.random()*4)+5, work: Math.floor(Math.random()*4)+4, family: Math.floor(Math.random()*4)+5, finances: Math.floor(Math.random()*4)+3, fun: Math.floor(Math.random()*4)+5, learning: Math.floor(Math.random()*4)+4, social: Math.floor(Math.random()*4)+4, mindfulness: Math.floor(Math.random()*4)+4 }, analysis: '' });
  }
  setStorage('lifeos_balance', balance);

  const journal = [];
  for (let i = 0; i < 3; i++) {
    journal.push({ id: uid(), date: daysAgo(i), title: ['Productive day!','Feeling motivated','Slow start but good finish'][i], body: ['Had a great day working on the project. Made significant progress on the UI.','Feeling really motivated today. Set clear goals and crushed them.','Started slow but picked up momentum. Completed all my tasks.'][i], mood: [4,5,3][i], energy: [4,5,3][i], tags: ['work','personal'], created: daysAgo(i), updated: daysAgo(i) });
  }
  setStorage('lifeos_journal', journal);

  const cats = ['Food','Transport','Health','Shopping','Bills','Fun','Salary','Other'];
  const catEmoji = {Food:'🍔',Transport:'🚗',Health:'❤️',Shopping:'🛍️',Bills:'📄',Fun:'🎉',Salary:'💼',Other:'📦'};
  const transactions = [];
  for (let i = 0; i < 20; i++) {
    const isIncome = i < 2;
    const cat = isIncome ? 'Salary' : cats[Math.floor(Math.random()*(cats.length-2))];
    transactions.push({ id: uid(), type: isIncome?'income':'expense', amount: isIncome ? 3000+Math.random()*2000 : Math.floor(Math.random()*200)+10, category: cat, desc: isIncome ? 'Monthly salary' : `${cat} expense`, date: daysAgo(Math.floor(Math.random()*30)), recurring: false });
  }
  setStorage('lifeos_finance', { transactions, budgets: { Food: 500, Transport: 200, Health: 150, Shopping: 300, Bills: 400, Fun: 200 }, currency: '$' });

  const notifications = [
    { id: uid(), type: 'tasks', title: 'Task overdue', body: 'Fix login bug is past due', read: false, module: 'tasks', timestamp: Date.now()-3600000 },
    { id: uid(), type: 'habits', title: 'Habit reminder', body: "Don't forget to drink water!", read: false, module: 'habits', timestamp: Date.now()-7200000 },
    { id: uid(), type: 'goals', title: 'Goal milestone', body: 'You completed a milestone!', read: true, module: 'goals', timestamp: Date.now()-86400000 },
    { id: uid(), type: 'system', title: 'Welcome to LifeOS!', body: 'Your productivity journey starts here.', read: true, module: 'dashboard', timestamp: Date.now()-172800000 },
    { id: uid(), type: 'system', title: 'Streak achieved!', body: '7 day habit streak — keep it up!', read: true, module: 'habits', timestamp: Date.now()-259200000 },
  ];
  setStorage('lifeos_notifications', notifications);

  setStorage('lifeos_routine', { wakeTime: '06:30', items: [
    { id: uid(), name: 'Morning stretch', duration: 10, icon: '🧘' },
    { id: uid(), name: 'Cold shower', duration: 10, icon: '🚿' },
    { id: uid(), name: 'Healthy breakfast', duration: 20, icon: '🥗' },
    { id: uid(), name: 'Read / Journal', duration: 20, icon: '📖' },
    { id: uid(), name: 'Plan the day', duration: 10, icon: '📋' },
  ], streak: 5, history: [] });

  setStorage('lifeos_focus', { sessions: Array.from({length:7},(_,i)=>({ date: daysAgo(i), duration: Math.floor(Math.random()*3+1)*25, taskId: null, mode: 'focus' })), settings: { focus: 25, short: 5, long: 15 } });
  setStorage('lifeos_chat', { conversations: [], activeId: null });
  setStorage('lifeos_settings', { theme: 'dark', accentColor: '#00F5FF', fontSize: '15px', focusDuration: 25, apiKey: '', aiProvider: 'claude', aiPersonality: 'friendly' });
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span><div class="toast-progress"></div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
  const dismiss = () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); };
  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, 3000);
}

// ============ MODAL SYSTEM ============
function openModal(id) {
  const el = document.getElementById(`modal-${id}`);
  if (el) { el.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(`modal-${id}`);
  if (el) { el.classList.add('hidden'); document.body.style.overflow = ''; }
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  document.body.style.overflow = '';
}

// ============ ROUTER / NAVIGATION ============
const SECTIONS = ['dashboard','tasks','planner','habits','goals','health','focus','routine','journal','finance','balance','analytics','ai','notifications','settings'];
const SECTION_TITLES = { dashboard:'Dashboard', tasks:'Tasks', planner:'Planner', habits:'Habits', goals:'Goals', health:'Health', focus:'Focus Timer', routine:'Morning Routine', journal:'Journal', finance:'Finance', balance:'Life Balance', analytics:'Analytics', ai:'AI Assistant', notifications:'Notifications', settings:'Settings' };
let activeSection = 'dashboard';

function navigateTo(section) {
  if (!SECTIONS.includes(section)) return;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  const el = document.getElementById(`section-${section}`);
  if (el) el.classList.add('active');
  document.querySelectorAll(`[data-section="${section}"]`).forEach(n => n.classList.add('active'));
  document.getElementById('topbarTitle').textContent = SECTION_TITLES[section] || section;
  activeSection = section;
  onSectionLoad(section);
}

function navigateToIndex(idx) {
  if (SECTIONS[idx]) navigateTo(SECTIONS[idx]);
}

function onSectionLoad(section) {
  switch(section) {
    case 'dashboard': renderDashboard(); break;
    case 'tasks': renderTasks(); break;
    case 'planner': renderPlanner(); break;
    case 'habits': renderHabits(); break;
    case 'goals': renderGoals(); break;
    case 'health': renderHealth(); break;
    case 'focus': renderFocus(); break;
    case 'routine': renderRoutine(); break;
    case 'journal': renderJournal(); break;
    case 'finance': renderFinance(); break;
    case 'balance': renderBalance(); break;
    case 'analytics': renderAnalytics(); break;
    case 'ai': renderAI(); break;
    case 'notifications': renderNotifications(); break;
    case 'settings': renderSettings(); break;
  }
}

// ============ THEME ============
function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.contains('light-mode');
  body.classList.toggle('light-mode', !isLight);
  body.classList.toggle('dark-mode', isLight);
  document.getElementById('themeToggle').textContent = isLight ? '🌙' : '☀️';
  const s = getStorage('lifeos_settings') || {};
  s.theme = isLight ? 'dark' : 'light';
  setStorage('lifeos_settings', s);
}

function applyTheme() {
  const s = getStorage('lifeos_settings') || {};
  if (s.theme === 'light') {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggle').textContent = '☀️';
  }
  if (s.fontSize) document.documentElement.style.setProperty('--font-size-base', s.fontSize);
}

// ============ SIDEBAR TOGGLE ============
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.section); });
  });
  document.querySelectorAll('.tab-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.section));
  });
  document.querySelectorAll('[data-section].icon-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.section));
  });
}

// ============ COUNT-UP ANIMATION ============
function countUp(el, target, duration = 800, prefix = '', suffix = '') {
  const start = performance.now();
  const from = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(from + (target - from) * ease);
    el.textContent = prefix + val + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ============ CANVAS HELPERS ============
function drawSparkline(canvas, data, color = '#00F5FF') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!data || data.length < 2) return;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length-1)) * w, y: h - ((v - min) / range) * (h - 4) - 2 }));
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBarChart(canvas, labels, datasets, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const allVals = datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allVals, 1);
  const barGroupW = chartW / labels.length;
  const barW = (barGroupW - 8) / datasets.length;

  // Y axis
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + chartH - (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px sans-serif';
    ctx.fillText(Math.round((i/4)*maxVal), 2, y + 4);
  }

  datasets.forEach((ds, di) => {
    ds.data.forEach((val, i) => {
      const x = pad.left + i * barGroupW + di * barW + 4;
      const barH = (val / maxVal) * chartH;
      const y = pad.top + chartH - barH;
      ctx.fillStyle = ds.color || '#00F5FF';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barW - 2, barH, 3) : ctx.rect(x, y, barW - 2, barH);
      ctx.fill();
    });
  });

  // X labels
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => {
    ctx.fillText(l, pad.left + i * barGroupW + barGroupW / 2, h - 8);
  });
}

function drawLineChart(canvas, labels, datasets, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const allVals = datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allVals, 1);
  const minVal = opts.minVal !== undefined ? opts.minVal : 0;
  const range = maxVal - minVal || 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + chartH - (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(minVal + (i/4)*range), pad.left - 4, y + 4);
  }

  datasets.forEach(ds => {
    const pts = ds.data.map((v, i) => ({
      x: pad.left + (i / (ds.data.length - 1 || 1)) * chartW,
      y: pad.top + chartH - ((v - minVal) / range) * chartH
    }));
    if (opts.fill) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pad.top + chartH);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length-1].x, pad.top + chartH);
      ctx.closePath();
      ctx.fillStyle = ds.color ? ds.color.replace(')', ',0.15)').replace('rgb','rgba') : 'rgba(0,245,255,0.1)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = ds.color || '#00F5FF';
    ctx.lineWidth = 2;
    ctx.stroke();
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
      ctx.fillStyle = ds.color || '#00F5FF'; ctx.fill();
    });
  });

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(labels.length / 6));
  labels.forEach((l, i) => {
    if (i % step === 0) ctx.fillText(l, pad.left + (i / (labels.length-1||1)) * chartW, h - 8);
  });
}

function drawDonutChart(canvas, segments, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2 - 10;
  const r = Math.min(cx, cy) - 20;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let angle = -Math.PI / 2;
  segments.forEach(seg => {
    const slice = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    angle += slice;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim() || '#0D1120';
  ctx.fill();
  if (opts.centerText) {
    ctx.fillStyle = '#F0F4FF';
    ctx.font = `bold 14px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(opts.centerText, cx, cy + 5);
  }
  // Legend
  const legendY = cy + r + 16;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  segments.slice(0, 4).forEach((seg, i) => {
    const lx = (i % 2) * (w/2) + 10;
    const ly = legendY + Math.floor(i/2) * 18;
    ctx.fillStyle = seg.color;
    ctx.fillRect(lx, ly - 8, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`${seg.label} ${Math.round(seg.value/total*100)}%`, lx + 14, ly);
  });
}

// ============ DASHBOARD MODULE ============
function renderDashboard() {
  updateHeroCard();
  renderStatCards();
  renderDashTimeline();
  renderActivityFeed();
  renderWeeklyChart();
  loadAIBrief();
}

function updateHeroCard() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const user = getStorage('lifeos_user') || {};
  const name = user.name || 'Friend';
  const greetEl = document.getElementById('heroGreeting');
  if (greetEl) typewriterEffect(greetEl, `${greeting}, ${name} 👋`);

  const dateEl = document.getElementById('heroDate');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  updateClock();
  updateHeroRing();
}

function updateClock() {
  const el = document.getElementById('heroClock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

function updateHeroRing() {
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(today));
  const doneTasks = todayTasks.filter(t => t.status === 'done').length;
  const doneHabits = habits.filter(h => h.entries && h.entries[today]).length;
  const total = todayTasks.length + habits.length;
  const done = doneTasks + doneHabits;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const ring = document.getElementById('heroRing');
  const pctEl = document.getElementById('heroRingPct');
  if (ring) ring.style.strokeDashoffset = 251 - (251 * pct / 100);
  if (pctEl) pctEl.textContent = pct + '%';
}

function renderStatCards() {
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const goals = getStorage('lifeos_goals') || [];
  const focus = getStorage('lifeos_focus') || { sessions: [] };
  const today = new Date().toISOString().split('T')[0];

  const tasksDone = tasks.filter(t => t.status === 'done' && t.updated && t.updated.startsWith(today)).length;
  const habitsDone = habits.filter(h => h.entries && h.entries[today]).length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const focusMins = focus.sessions.filter(s => s.date === today).reduce((a, s) => a + (s.duration || 0), 0);
  const focusHrs = (focusMins / 60).toFixed(1);

  const el = (id) => document.getElementById(id);
  if (el('statTasksDone')) countUp(el('statTasksDone'), tasksDone);
  if (el('statFocusHrs')) countUp(el('statFocusHrs'), parseFloat(focusHrs), 800, '', 'h');
  if (el('statHabitsDone')) countUp(el('statHabitsDone'), habitsDone);
  if (el('statGoals')) countUp(el('statGoals'), activeGoals);

  // Sparklines
  const last7 = Array.from({length:7}, (_,i) => { const d = new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().split('T')[0]; });
  drawSparkline(el('sparkTasks'), last7.map(d => tasks.filter(t => t.status==='done' && t.updated && t.updated.startsWith(d)).length));
  drawSparkline(el('sparkHabits'), last7.map(d => habits.filter(h => h.entries && h.entries[d]).length), '#6BCB77');
  drawSparkline(el('sparkGoals'), last7.map(() => activeGoals), '#FFD93D');
  drawSparkline(el('sparkFocus'), last7.map(d => focus.sessions.filter(s => s.date===d).reduce((a,s)=>a+(s.duration||0),0)/60), '#FF6B6B');
}

function renderDashTimeline() {
  const planner = getStorage('lifeos_planner') || {};
  const today = new Date().toISOString().split('T')[0];
  const events = (planner[today] || []).slice(0, 5);
  const el = document.getElementById('dashTimeline');
  if (!el) return;
  if (!events.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🌟</div><div class="empty-state-title">All clear!</div><div class="empty-state-sub">No events scheduled today</div></div>'; return; }
  el.innerHTML = events.map(ev => `
    <div class="timeline-item">
      <span class="timeline-time">${ev.start}</span>
      <span class="timeline-dot" style="background:${ev.color||'var(--accent-1)'}"></span>
      <span class="timeline-title">${ev.title}</span>
    </div>`).join('');
}

function renderActivityFeed() {
  const el = document.getElementById('activityFeed');
  if (!el) return;
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const journal = getStorage('lifeos_journal') || [];
  const activities = [
    ...tasks.slice(-3).map(t => ({ icon: '✅', text: `Task: ${t.title}`, time: t.updated || t.created })),
    ...habits.slice(-2).map(h => ({ icon: '💪', text: `Habit: ${h.name}`, time: new Date().toISOString().split('T')[0] })),
    ...journal.slice(-1).map(j => ({ icon: '📔', text: `Journal: ${j.title}`, time: j.updated || j.created })),
  ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  el.innerHTML = activities.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <span class="activity-text">${a.text}</span>
      <span class="activity-time">${relativeTime(a.time)}</span>
    </div>`).join('') || '<div class="empty-state"><div class="empty-state-sub">No recent activity</div></div>';
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

function renderWeeklyChart() {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;
  const tasks = getStorage('lifeos_tasks') || [];
  const last7 = Array.from({length:7}, (_,i) => { const d = new Date(); d.setDate(d.getDate()-6+i); return d; });
  const labels = last7.map(d => d.toLocaleDateString('en-US',{weekday:'short'}));
  const data = last7.map(d => {
    const ds = d.toISOString().split('T')[0];
    return tasks.filter(t => t.status==='done' && t.updated && t.updated.startsWith(ds)).length;
  });
  drawBarChart(canvas, labels, [{ data, color: '#00F5FF' }]);

  // Streak
  const habits = getStorage('lifeos_habits') || [];
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);
  const streakEl = document.getElementById('dashStreak');
  if (streakEl) countUp(streakEl, maxStreak);
}

async function loadAIBrief() {
  const el = document.getElementById('aiBriefText');
  if (!el) return;
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(today));
  const doneHabits = habits.filter(h => h.entries && h.entries[today]).length;

  if (!AI_CONFIG.apiKey) {
    const quotes = [
      "The secret of getting ahead is getting started. — Mark Twain",
      "Focus on being productive instead of busy. — Tim Ferriss",
      "Small daily improvements lead to stunning results.",
      "Done is better than perfect.",
      "Your future self will thank you for what you do today."
    ];
    typewriterEffect(el, quotes[Math.floor(Math.random()*quotes.length)]);
    return;
  }
  el.textContent = 'Generating your brief...';
  const result = await askAI(
    'You are a productivity coach. Give a brief, encouraging 2-sentence daily summary.',
    `Today: ${todayTasks.length} tasks scheduled, ${doneHabits}/${habits.length} habits done. Give a motivating brief.`
  );
  if (result) typewriterEffect(el, result);
}

function typewriterEffect(el, text, speed = 30) {
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

document.getElementById('refreshBrief')?.addEventListener('click', loadAIBrief);

// ============ TASKS MODULE ============
let taskFilters = { priority: 'all', status: 'all', view: 'list', search: '', sort: 'dueDate' };
let editingTaskId = null;
let taskTags = [];

function renderTasks() {
  const tasks = getFilteredTasks();
  if (taskFilters.view === 'list') renderTaskList(tasks);
  else if (taskFilters.view === 'kanban') renderKanban();
  else if (taskFilters.view === 'calendar') renderCalendar();
}

function getFilteredTasks() {
  let tasks = getStorage('lifeos_tasks') || [];
  if (taskFilters.search) tasks = tasks.filter(t => t.title.toLowerCase().includes(taskFilters.search.toLowerCase()));
  if (taskFilters.priority !== 'all') tasks = tasks.filter(t => t.priority === taskFilters.priority);
  if (taskFilters.status !== 'all') tasks = tasks.filter(t => t.status === taskFilters.status);
  tasks.sort((a, b) => {
    if (taskFilters.sort === 'dueDate') return new Date(a.dueDate||'9999') - new Date(b.dueDate||'9999');
    if (taskFilters.sort === 'priority') { const p = {high:0,medium:1,low:2}; return p[a.priority]-p[b.priority]; }
    if (taskFilters.sort === 'title') return a.title.localeCompare(b.title);
    return new Date(b.created) - new Date(a.created);
  });
  return tasks;
}

function renderTaskList(tasks) {
  const el = document.getElementById('taskList');
  if (!el) return;
  if (!tasks.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">No tasks found</div><div class="empty-state-sub">Create your first task!</div></div>'; return; }
  el.innerHTML = tasks.map(t => {
    const today = new Date().toISOString().split('T')[0];
    const dueClass = t.dueDate ? (t.dueDate < today ? 'overdue' : t.dueDate.startsWith(today) ? 'today' : '') : '';
    const dueLabel = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
    return `<div class="task-row ${t.status==='done'?'done':''}" data-id="${t.id}">
      <div class="task-check ${t.status==='done'?'checked':''}" data-id="${t.id}" role="checkbox" aria-checked="${t.status==='done'}" aria-label="Complete task"></div>
      <span class="priority-dot ${t.priority}"></span>
      <span class="task-title">${t.title}</span>
      <div class="task-tags">${(t.tags||[]).map(tag=>`<span class="tag-chip">${tag}</span>`).join('')}</div>
      ${dueLabel ? `<span class="task-due ${dueClass}">${dueLabel}</span>` : ''}
      <div class="task-actions">
        <button class="task-action-btn edit-task" data-id="${t.id}" aria-label="Edit task">✏️</button>
        <button class="task-action-btn delete-task" data-id="${t.id}" aria-label="Delete task">🗑️</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('click', e => { e.stopPropagation(); toggleTaskDone(cb.dataset.id); });
  });
  el.querySelectorAll('.edit-task').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openEditTask(btn.dataset.id); });
  });
  el.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteTask(btn.dataset.id); });
  });
}

function toggleTaskDone(id) {
  const tasks = getStorage('lifeos_tasks') || [];
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.status = t.status === 'done' ? 'todo' : 'done';
  t.updated = new Date().toISOString().split('T')[0];
  setStorage('lifeos_tasks', tasks);
  renderTasks();
  showToast(t.status === 'done' ? '✅ Task completed!' : 'Task reopened', 'success');
}

function deleteTask(id) {
  const tasks = (getStorage('lifeos_tasks') || []).filter(t => t.id !== id);
  setStorage('lifeos_tasks', tasks);
  renderTasks();
  showToast('Task deleted', 'info');
}

function renderKanban() {
  const tasks = getStorage('lifeos_tasks') || [];
  const statuses = ['backlog','todo','inprogress','done'];
  statuses.forEach(status => {
    const col = tasks.filter(t => t.status === status);
    const countEl = document.getElementById(`kCount-${status}`);
    const cardsEl = document.getElementById(`kCards-${status}`);
    if (countEl) countEl.textContent = col.length;
    if (cardsEl) {
      cardsEl.innerHTML = col.map(t => `
        <div class="kanban-card" draggable="true" data-id="${t.id}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span class="priority-dot ${t.priority}"></span>
            <span style="font-size:13px;font-weight:600">${t.title}</span>
          </div>
          ${(t.tags||[]).map(tag=>`<span class="tag-chip">${tag}</span>`).join('')}
          ${t.dueDate ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px">${new Date(t.dueDate).toLocaleDateString()}</div>` : ''}
        </div>`).join('');
      cardsEl.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', e => { e.dataTransfer.setData('taskId', card.dataset.id); card.classList.add('dragging'); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
      });
    }
  });
  document.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', e => {
      e.preventDefault(); col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('taskId');
      const newStatus = col.dataset.status;
      const tasks = getStorage('lifeos_tasks') || [];
      const t = tasks.find(t => t.id === taskId);
      if (t) { t.status = newStatus; t.updated = new Date().toISOString().split('T')[0]; setStorage('lifeos_tasks', tasks); renderKanban(); }
    });
  });
}

let calMonth = new Date().getMonth(), calYear = new Date().getFullYear();
function renderCalendar() {
  const el = document.getElementById('calGrid');
  const label = document.getElementById('calMonthLabel');
  if (!el) return;
  const tasks = getStorage('lifeos_tasks') || [];
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  if (label) label.textContent = new Date(calYear, calMonth).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day other-month"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
    const isToday = dateStr === today;
    html += `<div class="cal-day ${isToday?'today':''}" data-date="${dateStr}">
      <div class="cal-day-num">${d}</div>
      <div class="cal-dots">${dayTasks.slice(0,3).map(t=>`<span class="cal-dot" style="background:${t.priority==='high'?'var(--accent-3)':t.priority==='medium'?'var(--accent-4)':'var(--accent-5)'}"></span>`).join('')}${dayTasks.length>3?`<span style="font-size:9px;color:var(--text-muted)">+${dayTasks.length-3}</span>`:''}</div>
    </div>`;
  }
  el.innerHTML = html;
}

// Task Modal
function openAddTask(prefill = {}) {
  editingTaskId = null;
  taskTags = [];
  document.getElementById('taskModalTitle').textContent = 'New Task';
  document.getElementById('taskTitleInput').value = prefill.title || '';
  document.getElementById('taskDescInput').value = '';
  document.getElementById('taskDueInput').value = '';
  document.getElementById('taskTagChips').innerHTML = '';
  document.querySelectorAll('#taskPriorityInput .pill').forEach(p => p.classList.toggle('active', p.dataset.val === 'medium'));
  document.querySelectorAll('#taskRecurringInput .pill').forEach(p => p.classList.toggle('active', p.dataset.val === 'none'));
  openModal('task');
}

function openEditTask(id) {
  const tasks = getStorage('lifeos_tasks') || [];
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editingTaskId = id;
  taskTags = [...(t.tags || [])];
  document.getElementById('taskModalTitle').textContent = 'Edit Task';
  document.getElementById('taskTitleInput').value = t.title;
  document.getElementById('taskDescInput').value = t.desc || '';
  document.getElementById('taskDueInput').value = t.dueDate ? t.dueDate.slice(0,16) : '';
  document.querySelectorAll('#taskPriorityInput .pill').forEach(p => p.classList.toggle('active', p.dataset.val === t.priority));
  document.querySelectorAll('#taskRecurringInput .pill').forEach(p => p.classList.toggle('active', p.dataset.val === (t.recurring||'none')));
  renderTagChips();
  openModal('task');
}

function renderTagChips() {
  const el = document.getElementById('taskTagChips');
  if (!el) return;
  el.innerHTML = taskTags.map(tag => `<span class="tag-chip-removable">${tag}<button onclick="removeTag('${tag}')" aria-label="Remove tag">×</button></span>`).join('');
}

function removeTag(tag) { taskTags = taskTags.filter(t => t !== tag); renderTagChips(); }

function saveTask() {
  const title = document.getElementById('taskTitleInput').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }
  const tasks = getStorage('lifeos_tasks') || [];
  const priority = document.querySelector('#taskPriorityInput .pill.active')?.dataset.val || 'medium';
  const recurring = document.querySelector('#taskRecurringInput .pill.active')?.dataset.val || 'none';
  const dueDate = document.getElementById('taskDueInput').value;
  if (editingTaskId) {
    const t = tasks.find(t => t.id === editingTaskId);
    if (t) { Object.assign(t, { title, desc: document.getElementById('taskDescInput').value, priority, tags: taskTags, dueDate, recurring, updated: new Date().toISOString().split('T')[0] }); }
  } else {
    tasks.push({ id: uid(), title, desc: document.getElementById('taskDescInput').value, priority, tags: taskTags, dueDate, status: 'todo', subtasks: [], timeLogged: 0, recurring, created: new Date().toISOString().split('T')[0], updated: new Date().toISOString().split('T')[0] });
  }
  setStorage('lifeos_tasks', tasks);
  closeModal('task');
  renderTasks();
  showToast(editingTaskId ? 'Task updated!' : 'Task created!', 'success');
}

function initTaskEvents() {
  document.getElementById('addTaskBtn')?.addEventListener('click', () => openAddTask());
  document.getElementById('saveTaskBtn')?.addEventListener('click', saveTask);
  document.getElementById('taskSearch')?.addEventListener('input', debounce(e => { taskFilters.search = e.target.value; renderTasks(); }, 300));
  document.getElementById('taskSort')?.addEventListener('change', e => { taskFilters.sort = e.target.value; renderTasks(); });
  document.querySelectorAll('#taskPriorityFilter .pill').forEach(p => p.addEventListener('click', () => { taskFilters.priority = p.dataset.val; document.querySelectorAll('#taskPriorityFilter .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); renderTasks(); }));
  document.querySelectorAll('#taskStatusFilter .pill').forEach(p => p.addEventListener('click', () => { taskFilters.status = p.dataset.val; document.querySelectorAll('#taskStatusFilter .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); renderTasks(); }));
  document.querySelectorAll('#taskViewToggle .pill').forEach(p => p.addEventListener('click', () => {
    taskFilters.view = p.dataset.val;
    document.querySelectorAll('#taskViewToggle .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active');
    document.getElementById('taskListView').classList.toggle('hidden', p.dataset.val !== 'list');
    document.getElementById('taskKanbanView').classList.toggle('hidden', p.dataset.val !== 'kanban');
    document.getElementById('taskCalendarView').classList.toggle('hidden', p.dataset.val !== 'calendar');
    renderTasks();
  }));
  document.getElementById('taskTitleInput')?.addEventListener('input', e => {
    const el = document.getElementById('taskTitleCount');
    if (el) el.textContent = `${e.target.value.length}/100`;
  });
  document.getElementById('taskTagInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v && !taskTags.includes(v)) { taskTags.push(v); renderTagChips(); e.target.value = ''; } }
  });
  document.getElementById('calPrev')?.addEventListener('click', () => { calMonth--; if (calMonth<0){calMonth=11;calYear--;} renderCalendar(); });
  document.getElementById('calNext')?.addEventListener('click', () => { calMonth++; if (calMonth>11){calMonth=0;calYear++;} renderCalendar(); });
  document.getElementById('calToday')?.addEventListener('click', () => { calMonth=new Date().getMonth(); calYear=new Date().getFullYear(); renderCalendar(); });
  document.querySelectorAll('.kanban-add').forEach(btn => btn.addEventListener('click', () => openAddTask()));
  document.getElementById('aiSuggestTaskBtn')?.addEventListener('click', async () => {
    const title = document.getElementById('taskTitleInput').value.trim();
    if (!title) { showToast('Enter a title first', 'warning'); return; }
    showToast('AI is filling in details...', 'info');
    const result = await askAI('You are a task management assistant. Return JSON only: {"desc":"...","priority":"high|medium|low","tags":["tag1"],"dueDate":"YYYY-MM-DD"}', `Suggest details for task: "${title}"`);
    if (result) {
      try {
        const data = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || result);
        if (data.desc) document.getElementById('taskDescInput').value = data.desc;
        if (data.priority) document.querySelectorAll('#taskPriorityInput .pill').forEach(p => p.classList.toggle('active', p.dataset.val === data.priority));
        if (data.tags) { taskTags = data.tags; renderTagChips(); }
        if (data.dueDate) document.getElementById('taskDueInput').value = data.dueDate + 'T09:00';
        showToast('AI filled in task details!', 'success');
      } catch { showToast('Could not parse AI response', 'error'); }
    }
  });
}

// ============ PLANNER MODULE ============
let plannerDate = new Date().toISOString().split('T')[0];
let miniCalMonth = new Date().getMonth(), miniCalYear = new Date().getFullYear();
let editingEventId = null;

function renderPlanner() {
  renderMiniCal();
  renderTimeGrid();
  updatePlannerLabel();
}

function updatePlannerLabel() {
  const el = document.getElementById('plannerDateLabel');
  if (el) el.textContent = new Date(plannerDate + 'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
}

function renderTimeGrid() {
  const grid = document.getElementById('timeGrid');
  if (!grid) return;
  const planner = getStorage('lifeos_planner') || {};
  const events = planner[plannerDate] || [];
  const catColors = { work: '#00F5FF', health: '#6BCB77', personal: '#7B2FFF', break: '#FFD93D' };
  let html = '';
  for (let h = 5; h <= 23; h++) {
    const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`;
    html += `<div class="time-slot" data-hour="${h}">
      <div class="time-label">${label}</div>
      <div class="time-slot-area" data-hour="${h}"></div>
    </div>`;
  }
  grid.innerHTML = html;

  // Current time line
  const now = new Date();
  const totalMins = (now.getHours() - 5) * 60 + now.getMinutes();
  if (totalMins >= 0 && plannerDate === new Date().toISOString().split('T')[0]) {
    const line = document.createElement('div');
    line.className = 'current-time-line';
    line.style.top = (totalMins * 60 / 60) + 'px';
    grid.style.position = 'relative';
    grid.appendChild(line);
  }

  // Render events
  events.forEach(ev => {
    const [sh, sm] = ev.start.split(':').map(Number);
    const [eh, em] = ev.end.split(':').map(Number);
    const startMins = (sh - 5) * 60 + sm;
    const durMins = (eh - sh) * 60 + (em - sm);
    const block = document.createElement('div');
    block.className = 'event-block';
    block.style.top = (startMins) + 'px';
    block.style.height = Math.max(durMins, 30) + 'px';
    block.style.background = (catColors[ev.category] || '#00F5FF') + '22';
    block.style.borderLeftColor = catColors[ev.category] || '#00F5FF';
    block.innerHTML = `<div class="event-title">${ev.title}</div><div class="event-time">${ev.start}–${ev.end}</div>`;
    block.addEventListener('click', () => openEditEvent(ev.id));
    grid.appendChild(block);
  });

  // Click to add
  grid.querySelectorAll('.time-slot-area').forEach(area => {
    area.addEventListener('click', () => {
      const h = parseInt(area.dataset.hour);
      document.getElementById('eventStartInput').value = `${String(h).padStart(2,'0')}:00`;
      document.getElementById('eventEndInput').value = `${String(h+1).padStart(2,'0')}:00`;
      editingEventId = null;
      document.getElementById('eventModalTitle').textContent = 'New Event';
      openModal('event');
    });
  });
}

function renderMiniCal() {
  const grid = document.getElementById('miniCalGrid');
  const label = document.getElementById('miniCalLabel');
  if (!grid) return;
  const firstDay = new Date(miniCalYear, miniCalMonth, 1).getDay();
  const daysInMonth = new Date(miniCalYear, miniCalMonth+1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  if (label) label.textContent = new Date(miniCalYear, miniCalMonth).toLocaleDateString('en-US',{month:'short',year:'numeric'});
  const days = ['S','M','T','W','T','F','S'];
  let html = days.map(d=>`<div class="mini-cal-header">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="mini-cal-day other-month"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${miniCalYear}-${String(miniCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html += `<div class="mini-cal-day ${ds===today?'today':''} ${ds===plannerDate?'selected':''}" data-date="${ds}">${d}</div>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll('.mini-cal-day[data-date]').forEach(d => {
    d.addEventListener('click', () => { plannerDate = d.dataset.date; renderPlanner(); });
  });
}

function openEditEvent(id) {
  const planner = getStorage('lifeos_planner') || {};
  const events = planner[plannerDate] || [];
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  editingEventId = id;
  document.getElementById('eventModalTitle').textContent = 'Edit Event';
  document.getElementById('eventTitleInput').value = ev.title;
  document.getElementById('eventStartInput').value = ev.start;
  document.getElementById('eventEndInput').value = ev.end;
  document.getElementById('eventNotesInput').value = ev.notes || '';
  document.querySelectorAll('#eventCategoryInput .pill').forEach(p => p.classList.toggle('active', p.dataset.val === ev.category));
  openModal('event');
}

function saveEvent() {
  const title = document.getElementById('eventTitleInput').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }
  const planner = getStorage('lifeos_planner') || {};
  if (!planner[plannerDate]) planner[plannerDate] = [];
  const category = document.querySelector('#eventCategoryInput .pill.active')?.dataset.val || 'work';
  const catColors = { work: '#00F5FF', health: '#6BCB77', personal: '#7B2FFF', break: '#FFD93D' };
  const ev = { id: editingEventId || uid(), title, start: document.getElementById('eventStartInput').value, end: document.getElementById('eventEndInput').value, category, color: catColors[category], notes: document.getElementById('eventNotesInput').value };
  if (editingEventId) {
    const idx = planner[plannerDate].findIndex(e => e.id === editingEventId);
    if (idx >= 0) planner[plannerDate][idx] = ev;
  } else {
    planner[plannerDate].push(ev);
  }
  setStorage('lifeos_planner', planner);
  closeModal('event');
  renderPlanner();
  showToast('Event saved!', 'success');
}

function initPlannerEvents() {
  document.getElementById('plannerPrev')?.addEventListener('click', () => { const d = new Date(plannerDate+'T12:00'); d.setDate(d.getDate()-1); plannerDate=d.toISOString().split('T')[0]; renderPlanner(); });
  document.getElementById('plannerNext')?.addEventListener('click', () => { const d = new Date(plannerDate+'T12:00'); d.setDate(d.getDate()+1); plannerDate=d.toISOString().split('T')[0]; renderPlanner(); });
  document.getElementById('plannerToday')?.addEventListener('click', () => { plannerDate=new Date().toISOString().split('T')[0]; renderPlanner(); });
  document.getElementById('addEventBtn')?.addEventListener('click', () => { editingEventId=null; document.getElementById('eventModalTitle').textContent='New Event'; openModal('event'); });
  document.getElementById('saveEventBtn')?.addEventListener('click', saveEvent);
  document.getElementById('miniCalPrev')?.addEventListener('click', () => { miniCalMonth--; if(miniCalMonth<0){miniCalMonth=11;miniCalYear--;} renderMiniCal(); });
  document.getElementById('miniCalNext')?.addEventListener('click', () => { miniCalMonth++; if(miniCalMonth>11){miniCalMonth=0;miniCalYear++;} renderMiniCal(); });
  document.getElementById('aiPlanDay')?.addEventListener('click', async () => {
    showToast('AI is planning your day...', 'info');
    const tasks = getStorage('lifeos_tasks') || [];
    const todayTasks = tasks.filter(t => t.status !== 'done').slice(0, 5).map(t => t.title).join(', ');
    const result = await askAI('You are a scheduling assistant. Return a JSON array of events: [{"title":"...","start":"HH:MM","end":"HH:MM","category":"work|health|personal|break"}]', `Plan a productive day. Tasks to schedule: ${todayTasks || 'general productive day'}. Work hours: 9am-6pm.`);
    if (result) {
      try {
        const events = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || result);
        const planner = getStorage('lifeos_planner') || {};
        const catColors = { work: '#00F5FF', health: '#6BCB77', personal: '#7B2FFF', break: '#FFD93D' };
        planner[plannerDate] = events.map(e => ({ id: uid(), ...e, color: catColors[e.category] || '#00F5FF', notes: '' }));
        setStorage('lifeos_planner', planner);
        renderPlanner();
        showToast('Day planned by AI!', 'success');
      } catch { showToast('Could not parse AI schedule', 'error'); }
    }
  });
}

// ============ HABITS MODULE ============
const COMMON_EMOJIS = ['💧','📚','🏃','🧘','💪','🥗','😴','🎯','✍️','🎨','🎵','🌿','☀️','🚴','🏊','🧹','💊','🍎','🧠','❤️','🌟','🔥','⚡','🎉','🌈','🦋','🌸','🍀','🎸','📝'];
let habitSelectedEmoji = '💪';
let habitSelectedColor = '#00F5FF';
let heatmapYear = new Date().getFullYear();
let showingHeatmap = false;

function renderHabits() {
  const habits = getStorage('lifeos_habits') || [];
  const today = new Date().toISOString().split('T')[0];
  const done = habits.filter(h => h.entries && h.entries[today]).length;

  const statsBar = document.getElementById('habitStatsBar');
  if (statsBar) statsBar.innerHTML = `
    <span class="stat-pill">Active: <strong>${habits.length}</strong></span>
    <span class="stat-pill">Done Today: <strong>${done}/${habits.length}</strong></span>
    <span class="stat-pill">Best Streak: <strong>🔥 ${habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0)}</strong></span>`;

  if (showingHeatmap) renderHeatmap();
  else renderHabitGrid();
}

function renderHabitGrid() {
  const el = document.getElementById('habitGrid');
  if (!el) return;
  const habits = getStorage('lifeos_habits') || [];
  const today = new Date().toISOString().split('T')[0];
  if (!habits.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💪</div><div class="empty-state-title">No habits yet</div><div class="empty-state-sub">Build your first habit!</div></div>'; return; }
  el.innerHTML = habits.map(h => {
    const isDone = h.entries && h.entries[today];
    const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().split('T')[0]; });
    const weekDots = last7.map(d => `<span class="week-dot ${h.entries&&h.entries[d]?'done':d<today?'missed':''}"></span>`).join('');
    return `<div class="habit-card" data-id="${h.id}">
      <div class="habit-card-top">
        <span class="habit-emoji">${h.icon}</span>
        <div><div class="habit-name">${h.name}</div><div class="habit-freq">${h.frequency}</div></div>
      </div>
      <div class="habit-check-circle ${isDone?'done':''}" data-id="${h.id}" role="checkbox" aria-checked="${isDone}" aria-label="Complete habit" style="${isDone?'':'border-color:'+h.color}">${isDone?'✓':''}</div>
      <div class="habit-streak">🔥 ${h.streak || 0} days</div>
      <div class="habit-week-dots">${weekDots}</div>
      <div class="habit-card-actions">
        <button class="btn-ghost btn-sm edit-habit" data-id="${h.id}" aria-label="Edit habit">✏️ Edit</button>
        <button class="btn-ghost btn-sm delete-habit" data-id="${h.id}" aria-label="Delete habit">🗑️</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.habit-check-circle').forEach(c => {
    c.addEventListener('click', () => toggleHabit(c.dataset.id));
  });
  el.querySelectorAll('.delete-habit').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteHabit(btn.dataset.id); });
  });
}

function toggleHabit(id) {
  const habits = getStorage('lifeos_habits') || [];
  const h = habits.find(h => h.id === id);
  if (!h) return;
  const today = new Date().toISOString().split('T')[0];
  if (!h.entries) h.entries = {};
  const wasDone = h.entries[today];
  h.entries[today] = !wasDone;
  if (!wasDone) {
    h.streak = (h.streak || 0) + 1;
    h.bestStreak = Math.max(h.bestStreak || 0, h.streak);
    showToast(`${h.icon} ${h.name} completed!`, 'success');
    spawnConfetti(document.querySelector(`.habit-check-circle[data-id="${id}"]`));
  } else {
    h.streak = Math.max(0, (h.streak || 1) - 1);
  }
  setStorage('lifeos_habits', habits);
  renderHabits();
}

function deleteHabit(id) {
  const habits = (getStorage('lifeos_habits') || []).filter(h => h.id !== id);
  setStorage('lifeos_habits', habits);
  renderHabits();
  showToast('Habit deleted', 'info');
}

function renderHeatmap() {
  const el = document.getElementById('heatmapContainer');
  const yearEl = document.getElementById('heatmapYear');
  if (!el) return;
  if (yearEl) yearEl.textContent = heatmapYear;
  const habits = getStorage('lifeos_habits') || [];
  const start = new Date(heatmapYear, 0, 1);
  const end = new Date(heatmapYear, 11, 31);
  let html = '<div class="heatmap-grid">';
  const cur = new Date(start);
  while (cur.getDay() !== 0) cur.setDate(cur.getDate() - 1);
  while (cur <= end) {
    html += '<div class="heatmap-col">';
    for (let d = 0; d < 7; d++) {
      const ds = cur.toISOString().split('T')[0];
      const count = habits.filter(h => h.entries && h.entries[ds]).length;
      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
      html += `<div class="heatmap-cell level-${level}" title="${ds}: ${count} habits" aria-label="${ds}: ${count} habits"></div>`;
      cur.setDate(cur.getDate() + 1);
    }
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function initHabitModal() {
  const picker = document.getElementById('habitEmojiPicker');
  if (picker) {
    picker.innerHTML = COMMON_EMOJIS.map(e => `<button class="emoji-option" data-emoji="${e}" aria-label="${e}">${e}</button>`).join('');
    picker.querySelectorAll('.emoji-option').forEach(btn => {
      btn.addEventListener('click', () => { habitSelectedEmoji = btn.dataset.emoji; document.getElementById('habitSelectedEmoji').textContent = habitSelectedEmoji; });
    });
  }
  document.querySelectorAll('#habitColorSwatches .color-swatch').forEach(s => {
    s.addEventListener('click', () => { habitSelectedColor = s.dataset.color; document.querySelectorAll('#habitColorSwatches .color-swatch').forEach(x=>x.classList.remove('active')); s.classList.add('active'); });
  });
}

function saveHabit() {
  const name = document.getElementById('habitNameInput').value.trim();
  if (!name) { showToast('Name is required', 'error'); return; }
  const habits = getStorage('lifeos_habits') || [];
  const freq = document.querySelector('#habitFreqInput .pill.active')?.dataset.val || 'daily';
  habits.push({ id: uid(), name, icon: habitSelectedEmoji, color: habitSelectedColor, frequency: freq, streak: 0, bestStreak: 0, entries: {} });
  setStorage('lifeos_habits', habits);
  closeModal('habit');
  renderHabits();
  showToast('Habit created!', 'success');
}

function initHabitEvents() {
  document.getElementById('addHabitBtn')?.addEventListener('click', () => { document.getElementById('habitNameInput').value = ''; habitSelectedEmoji = '💪'; document.getElementById('habitSelectedEmoji').textContent = '💪'; openModal('habit'); });
  document.getElementById('saveHabitBtn')?.addEventListener('click', saveHabit);
  document.getElementById('habitHeatmapToggle')?.addEventListener('click', () => {
    showingHeatmap = !showingHeatmap;
    document.getElementById('habitGridView').classList.toggle('hidden', showingHeatmap);
    document.getElementById('habitHeatmapView').classList.toggle('hidden', !showingHeatmap);
    renderHabits();
  });
  document.getElementById('heatmapPrev')?.addEventListener('click', () => { heatmapYear--; renderHeatmap(); });
  document.getElementById('heatmapNext')?.addEventListener('click', () => { heatmapYear++; renderHeatmap(); });
  document.getElementById('aiSuggestHabitsBtn')?.addEventListener('click', async () => {
    showToast('AI is suggesting habits...', 'info');
    const goals = getStorage('lifeos_goals') || [];
    const goalTitles = goals.map(g => g.title).join(', ');
    const result = await askAI('You are a habit coach. Return JSON array: [{"name":"...","icon":"emoji","frequency":"daily"}]', `Suggest 5 habits for someone with goals: ${goalTitles || 'general productivity and wellness'}`);
    if (result) {
      try {
        const suggestions = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || result);
        showToast(`AI suggests: ${suggestions.map(s=>s.name).join(', ')}`, 'info');
      } catch { showToast('Could not parse suggestions', 'error'); }
    }
  });
}

// ============ GOALS MODULE ============
let goalFilters = { category: 'all' };
let goalStep = 1;
let goalMilestones = [];
let editingGoalId = null;

function renderGoals() {
  let goals = getStorage('lifeos_goals') || [];
  if (goalFilters.category !== 'all') goals = goals.filter(g => g.category === goalFilters.category);
  const el = document.getElementById('goalsGrid');
  if (!el) return;
  if (!goals.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-title">No goals yet</div><div class="empty-state-sub">Set your first goal!</div></div>'; return; }
  const catColors = { health:'#6BCB77', career:'#00F5FF', finance:'#FFD93D', personal:'#7B2FFF', learning:'#FF6B6B' };
  el.innerHTML = goals.map(g => {
    const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / 86400000);
    const deadlineClass = daysLeft < 7 ? 'urgent' : daysLeft < 14 ? 'warning' : '';
    const deadlineLabel = daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`;
    const doneMilestones = (g.milestones||[]).filter(m=>m.done).length;
    const totalMilestones = (g.milestones||[]).length;
    const pct = g.progress || 0;
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (pct / 100) * circumference;
    return `<div class="goal-card" data-id="${g.id}">
      <span class="goal-cat-badge" style="background:${catColors[g.category]||'#00F5FF'}22;color:${catColors[g.category]||'#00F5FF'};border:1px solid ${catColors[g.category]||'#00F5FF'}44">${g.category}</span>
      <div class="goal-title">${g.title}</div>
      <div class="goal-desc">${g.desc || ''}</div>
      <div class="goal-ring-wrap">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/>
          <circle cx="40" cy="40" r="36" fill="none" stroke="${catColors[g.category]||'#00F5FF'}" stroke-width="6"
            stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            transform="rotate(-90 40 40)"/>
          <text x="40" y="45" text-anchor="middle" fill="${catColors[g.category]||'#00F5FF'}" font-size="14" font-weight="bold">${pct}%</text>
        </svg>
        <div>
          <div class="goal-deadline ${deadlineClass}">${deadlineLabel}</div>
          <div style="font-size:12px;color:var(--text-muted)">${doneMilestones}/${totalMilestones} milestones</div>
        </div>
      </div>
      <div class="goal-milestones">${(g.milestones||[]).slice(0,3).map(m=>`<div class="goal-milestone-item"><input type="checkbox" ${m.done?'checked':''} data-goal="${g.id}" data-milestone="${m.id}" aria-label="${m.text}" /><span>${m.text}</span></div>`).join('')}</div>
      <div class="goal-card-actions">
        <button class="btn-ghost btn-sm edit-goal" data-id="${g.id}" aria-label="Edit goal">✏️ Edit</button>
        <button class="btn-ghost btn-sm delete-goal" data-id="${g.id}" aria-label="Delete goal">🗑️</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.goal-milestone-item input').forEach(cb => {
    cb.addEventListener('change', () => {
      const goals = getStorage('lifeos_goals') || [];
      const g = goals.find(g => g.id === cb.dataset.goal);
      if (!g) return;
      const m = g.milestones.find(m => m.id === cb.dataset.milestone);
      if (m) { m.done = cb.checked; g.progress = Math.round(g.milestones.filter(m=>m.done).length / g.milestones.length * 100); }
      setStorage('lifeos_goals', goals);
      renderGoals();
    });
  });
  el.querySelectorAll('.delete-goal').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); const goals = (getStorage('lifeos_goals')||[]).filter(g=>g.id!==btn.dataset.id); setStorage('lifeos_goals',goals); renderGoals(); showToast('Goal deleted','info'); });
  });
}

function openAddGoal() {
  goalStep = 1; goalMilestones = []; editingGoalId = null;
  document.getElementById('goalTitleInput').value = '';
  document.getElementById('goalDescInput').value = '';
  document.getElementById('goalDateInput').value = '';
  document.getElementById('goalWhyInput').value = '';
  renderGoalMilestones();
  updateGoalSteps();
  openModal('goal');
}

function renderGoalMilestones() {
  const el = document.getElementById('goalMilestones');
  if (!el) return;
  el.innerHTML = goalMilestones.map((m, i) => `
    <div class="milestone-input-row">
      <input class="input" value="${m.text}" placeholder="Milestone ${i+1}" data-idx="${i}" aria-label="Milestone ${i+1}" />
      <button class="btn-ghost btn-sm" data-idx="${i}" aria-label="Remove milestone">×</button>
    </div>`).join('');
  el.querySelectorAll('input').forEach(inp => inp.addEventListener('input', e => { goalMilestones[parseInt(inp.dataset.idx)].text = e.target.value; }));
  el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { goalMilestones.splice(parseInt(btn.dataset.idx),1); renderGoalMilestones(); }));
}

function updateGoalSteps() {
  document.querySelectorAll('.goal-step').forEach((s,i) => s.classList.toggle('hidden', i+1 !== goalStep));
  document.querySelectorAll('.step-dot').forEach((d,i) => d.classList.toggle('active', i+1 === goalStep));
  document.getElementById('goalNextBtn').textContent = goalStep === 3 ? '✓ Create Goal' : 'Next →';
  document.getElementById('goalBackBtn').classList.toggle('hidden', goalStep === 1);
}

function saveGoal() {
  const title = document.getElementById('goalTitleInput').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }
  const goals = getStorage('lifeos_goals') || [];
  const category = document.querySelector('#goalCatInput .pill.active')?.dataset.val || 'personal';
  goals.push({ id: uid(), title, desc: document.getElementById('goalDescInput').value, category, targetDate: document.getElementById('goalDateInput').value, milestones: goalMilestones.filter(m=>m.text), notes: [], progress: 0, status: 'active', created: new Date().toISOString().split('T')[0] });
  setStorage('lifeos_goals', goals);
  closeModal('goal');
  renderGoals();
  showToast('Goal created!', 'success');
}

function initGoalEvents() {
  document.getElementById('addGoalBtn')?.addEventListener('click', openAddGoal);
  document.getElementById('goalNextBtn')?.addEventListener('click', () => {
    if (goalStep < 3) { goalStep++; updateGoalSteps(); }
    else saveGoal();
  });
  document.getElementById('goalBackBtn')?.addEventListener('click', () => { if (goalStep > 1) { goalStep--; updateGoalSteps(); } });
  document.getElementById('addMilestoneBtn')?.addEventListener('click', () => { goalMilestones.push({ id: uid(), text: '', done: false }); renderGoalMilestones(); });
  document.querySelectorAll('#goalCatFilter .pill').forEach(p => p.addEventListener('click', () => {
    goalFilters.category = p.dataset.val;
    document.querySelectorAll('#goalCatFilter .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active');
    renderGoals();
  }));
  document.getElementById('aiMilestonesBtn')?.addEventListener('click', async () => {
    const title = document.getElementById('goalTitleInput').value.trim();
    if (!title) { showToast('Enter goal title first', 'warning'); return; }
    showToast('AI generating milestones...', 'info');
    const result = await askAI('Return JSON array of milestones: [{"text":"milestone description"}]', `Generate 5 milestones for goal: "${title}"`);
    if (result) {
      try {
        const ms = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || result);
        goalMilestones = ms.map(m => ({ id: uid(), text: m.text, done: false }));
        renderGoalMilestones();
        showToast('Milestones generated!', 'success');
      } catch { showToast('Could not parse milestones', 'error'); }
    }
  });
}

// ============ FOCUS TIMER MODULE ============
let focusTimer = { running: false, mode: 'focus', seconds: 25*60, interval: null, session: 0, pomCount: 0 };
let focusQueue = [];

function renderFocus() {
  const settings = (getStorage('lifeos_focus') || {}).settings || { focus: 25, short: 5, long: 15 };
  focusTimer.seconds = settings.focus * 60;
  updateTimerDisplay();
  renderFocusQueue();
  renderFocusStats();
}

function updateTimerDisplay() {
  const mins = Math.floor(focusTimer.seconds / 60);
  const secs = focusTimer.seconds % 60;
  const el = document.getElementById('timerDigits');
  if (el) el.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  const settings = (getStorage('lifeos_focus') || {}).settings || { focus: 25, short: 5, long: 15 };
  const total = (focusTimer.mode === 'focus' ? settings.focus : focusTimer.mode === 'short' ? settings.short : settings.long) * 60;
  const circumference = 753;
  const offset = circumference - (focusTimer.seconds / total) * circumference;
  const ring = document.getElementById('timerRing');
  if (ring) ring.style.strokeDashoffset = offset;
  const modeLabel = document.getElementById('timerModeLabel');
  if (modeLabel) modeLabel.textContent = focusTimer.mode === 'focus' ? 'FOCUS' : focusTimer.mode === 'short' ? 'SHORT BREAK' : 'LONG BREAK';
  updatePomodoroDots();
}

function updatePomodoroDots() {
  document.querySelectorAll('.pom-dot').forEach((d, i) => d.classList.toggle('filled', i < focusTimer.pomCount));
}

function startPauseTimer() {
  const btn = document.getElementById('timerStartPause');
  if (focusTimer.running) {
    clearInterval(focusTimer.interval);
    focusTimer.running = false;
    if (btn) btn.textContent = '▶ Start';
  } else {
    focusTimer.running = true;
    if (btn) btn.textContent = '⏸ Pause';
    focusTimer.interval = setInterval(() => {
      focusTimer.seconds--;
      updateTimerDisplay();
      if (focusTimer.seconds <= 0) {
        clearInterval(focusTimer.interval);
        focusTimer.running = false;
        onTimerEnd();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(focusTimer.interval);
  focusTimer.running = false;
  const settings = (getStorage('lifeos_focus') || {}).settings || { focus: 25, short: 5, long: 15 };
  focusTimer.seconds = (focusTimer.mode === 'focus' ? settings.focus : focusTimer.mode === 'short' ? settings.short : settings.long) * 60;
  updateTimerDisplay();
  const btn = document.getElementById('timerStartPause');
  if (btn) btn.textContent = '▶ Start';
}

function onTimerEnd() {
  if (focusTimer.mode === 'focus') {
    focusTimer.pomCount = (focusTimer.pomCount + 1) % 5;
    const focusData = getStorage('lifeos_focus') || { sessions: [], settings: {} };
    focusData.sessions.push({ date: new Date().toISOString().split('T')[0], duration: (getStorage('lifeos_focus')||{}).settings?.focus || 25, taskId: null, mode: 'focus' });
    setStorage('lifeos_focus', focusData);
    renderFocusStats();
  }
  showTimerEndOverlay();
}

function showTimerEndOverlay() {
  const overlay = document.getElementById('timerEndOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    spawnConfettiOverlay();
  }
}

function spawnConfettiOverlay() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#00F5FF','#7B2FFF','#FF6B6B','#FFD93D','#6BCB77'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*20}%;background:${colors[i%colors.length]};animation-delay:${Math.random()*0.5}s;animation-duration:${1+Math.random()}s;transform:rotate(${Math.random()*360}deg)`;
    container.appendChild(piece);
  }
}

function spawnConfetti(anchor) {
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const colors = ['#00F5FF','#7B2FFF','#FF6B6B','#FFD93D','#6BCB77'];
  for (let i = 0; i < 12; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `position:fixed;left:${rect.left+rect.width/2}px;top:${rect.top}px;width:6px;height:6px;border-radius:2px;background:${colors[i%colors.length]};pointer-events:none;z-index:9999;animation:confettiFall 1s ease-out forwards;animation-delay:${i*0.05}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1500);
  }
}

function renderFocusQueue() {
  const tasks = getStorage('lifeos_tasks') || [];
  const pending = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const el = document.getElementById('focusTaskList');
  if (!el) return;
  el.innerHTML = pending.map((t, i) => `
    <div class="focus-task-item ${i===0?'current':''}" data-id="${t.id}">
      <span class="priority-dot ${t.priority}" style="display:inline-block;margin-right:6px"></span>${t.title}
    </div>`).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:8px">No tasks in queue</div>';
}

function renderFocusStats() {
  const focusData = getStorage('lifeos_focus') || { sessions: [] };
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = focusData.sessions.filter(s => s.date === today);
  const todayMins = todaySessions.reduce((a, s) => a + (s.duration || 0), 0);
  const allMins = focusData.sessions.reduce((a, s) => a + (s.duration || 0), 0);
  const el = id => document.getElementById(id);
  if (el('focusTodaySessions')) el('focusTodaySessions').textContent = `${todaySessions.length} sessions`;
  if (el('focusTodayTime')) el('focusTodayTime').textContent = `${Math.floor(todayMins/60)}h ${todayMins%60}m`;
  if (el('focusAllTime')) el('focusAllTime').textContent = `${Math.floor(allMins/60)} hours`;
  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().split('T')[0]; });
  const chartData = last7.map(d => focusData.sessions.filter(s=>s.date===d).length);
  drawBarChart(document.getElementById('focusChart'), last7.map(d=>new Date(d+'T12:00').toLocaleDateString('en-US',{weekday:'short'})), [{ data: chartData, color: '#00F5FF' }]);
}

function initFocusEvents() {
  document.getElementById('timerStartPause')?.addEventListener('click', startPauseTimer);
  document.getElementById('timerReset')?.addEventListener('click', resetTimer);
  document.getElementById('timerSkip')?.addEventListener('click', () => { clearInterval(focusTimer.interval); focusTimer.running = false; onTimerEnd(); });
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t=>t.classList.remove('active')); tab.classList.add('active');
      focusTimer.mode = tab.dataset.mode;
      resetTimer();
    });
  });
  document.querySelectorAll('.ambient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      document.querySelectorAll('.ambient-btn').forEach(b=>b.classList.remove('active'));
      if (!wasActive) { btn.classList.add('active'); document.getElementById('volumeSlider').classList.remove('hidden'); }
      else document.getElementById('volumeSlider').classList.add('hidden');
    });
  });
  document.getElementById('takeBreakBtn')?.addEventListener('click', () => {
    document.getElementById('timerEndOverlay').classList.add('hidden');
    focusTimer.mode = focusTimer.pomCount >= 4 ? 'long' : 'short';
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === focusTimer.mode));
    resetTimer();
  });
  document.getElementById('skipBreakBtn')?.addEventListener('click', () => {
    document.getElementById('timerEndOverlay').classList.add('hidden');
    focusTimer.mode = 'focus';
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === 'focus'));
    resetTimer();
  });
  document.getElementById('aiSortQueueBtn')?.addEventListener('click', async () => {
    showToast('AI is sorting your queue...', 'info');
    const tasks = getStorage('lifeos_tasks') || [];
    const pending = tasks.filter(t => t.status !== 'done');
    const result = await askAI('You are a productivity assistant. Return a JSON array of task IDs sorted by priority and urgency: ["id1","id2"]', `Sort these tasks: ${JSON.stringify(pending.map(t=>({id:t.id,title:t.title,priority:t.priority,due:t.dueDate})))}`);
    if (result) { showToast('Queue sorted by AI!', 'success'); renderFocusQueue(); }
  });
}

// ============ ROUTINE MODULE ============
let routineActive = false;
let routineCurrentIdx = 0;
let routineInterval = null;

function renderRoutine() {
  const data = getStorage('lifeos_routine') || { wakeTime: '06:30', items: [], streak: 0 };
  document.getElementById('wakeTimeInput').value = data.wakeTime || '06:30';
  document.getElementById('routineStreak').textContent = data.streak || 0;
  renderRoutineTimeline();
}

function renderRoutineTimeline() {
  const data = getStorage('lifeos_routine') || { wakeTime: '06:30', items: [] };
  const el = document.getElementById('routineTimeline');
  if (!el) return;
  if (!data.items.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🌅</div><div class="empty-state-title">No routine items</div><div class="empty-state-sub">Add items or let AI build your routine</div></div>'; return; }
  let cumMins = 0;
  const [wh, wm] = (data.wakeTime || '06:30').split(':').map(Number);
  el.innerHTML = data.items.map((item, i) => {
    const startH = wh + Math.floor((wm + cumMins) / 60);
    const startM = (wm + cumMins) % 60;
    const startTime = `${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}`;
    cumMins += item.duration || 10;
    return `<div class="routine-item ${routineActive && i === routineCurrentIdx ? 'active' : ''}" data-idx="${i}">
      <span class="routine-drag-handle" aria-hidden="true">⠿</span>
      <span class="routine-icon">${item.icon || '⭐'}</span>
      <span class="routine-name">${item.name}</span>
      <span class="routine-duration">${item.duration} min</span>
      <span class="routine-start-time">${startTime}</span>
      <div class="routine-item-actions">
        <button class="btn-ghost btn-sm done-routine" data-idx="${i}" aria-label="Mark done">✓ Done</button>
        <button class="btn-ghost btn-sm skip-routine" data-idx="${i}" aria-label="Skip">⏭</button>
        <button class="btn-ghost btn-sm delete-routine" data-idx="${i}" aria-label="Delete">🗑️</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.done-routine').forEach(btn => btn.addEventListener('click', () => markRoutineItem(parseInt(btn.dataset.idx), 'done')));
  el.querySelectorAll('.skip-routine').forEach(btn => btn.addEventListener('click', () => markRoutineItem(parseInt(btn.dataset.idx), 'skip')));
  el.querySelectorAll('.delete-routine').forEach(btn => btn.addEventListener('click', () => {
    const data = getStorage('lifeos_routine') || { items: [] };
    data.items.splice(parseInt(btn.dataset.idx), 1);
    setStorage('lifeos_routine', data);
    renderRoutineTimeline();
  }));
}

function markRoutineItem(idx, action) {
  const data = getStorage('lifeos_routine') || { items: [] };
  const item = data.items[idx];
  if (!item) return;
  if (action === 'done') { showToast(`✓ ${item.name} done!`, 'success'); spawnConfetti(document.querySelector(`.routine-item[data-idx="${idx}"]`)); }
  routineCurrentIdx = idx + 1;
  renderRoutineTimeline();
  updateRoutineProgress();
}

function updateRoutineProgress() {
  const data = getStorage('lifeos_routine') || { items: [] };
  const total = data.items.length;
  const pct = total > 0 ? Math.round((routineCurrentIdx / total) * 100) : 0;
  const fill = document.getElementById('routineProgressFill');
  const label = document.getElementById('routineProgressLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${routineCurrentIdx} of ${total} complete`;
}

function initRoutineEvents() {
  document.getElementById('startRoutineBtn')?.addEventListener('click', () => {
    routineActive = true; routineCurrentIdx = 0;
    document.getElementById('routineProgressBar').classList.remove('hidden');
    updateRoutineProgress();
    renderRoutineTimeline();
    showToast('Routine started!', 'success');
  });
  document.getElementById('addRoutineItemBtn')?.addEventListener('click', () => {
    const name = prompt('Item name:');
    if (!name) return;
    const duration = parseInt(prompt('Duration (minutes):', '10')) || 10;
    const data = getStorage('lifeos_routine') || { items: [] };
    data.items.push({ id: uid(), name, duration, icon: '⭐' });
    setStorage('lifeos_routine', data);
    renderRoutineTimeline();
  });
  document.getElementById('aiRoutineBtn')?.addEventListener('click', async () => {
    showToast('AI is building your routine...', 'info');
    const wakeTime = document.getElementById('wakeTimeInput').value;
    const goals = [document.getElementById('goal1').value, document.getElementById('goal2').value, document.getElementById('goal3').value].filter(Boolean).join(', ');
    const result = await askAI('You are a morning routine coach. Return JSON array: [{"name":"...","duration":10,"icon":"emoji"}]', `Build a morning routine. Wake time: ${wakeTime}. Goals: ${goals || 'productivity and wellness'}. Include 5-7 items.`);
    if (result) {
      try {
        const items = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || result);
        const data = getStorage('lifeos_routine') || { wakeTime: '06:30', items: [], streak: 0 };
        data.items = items.map(item => ({ id: uid(), ...item }));
        data.wakeTime = wakeTime;
        setStorage('lifeos_routine', data);
        renderRoutineTimeline();
        showToast('Routine built by AI!', 'success');
      } catch { showToast('Could not parse routine', 'error'); }
    }
  });
  document.getElementById('wakeTimeInput')?.addEventListener('change', e => {
    const data = getStorage('lifeos_routine') || { items: [] };
    data.wakeTime = e.target.value;
    setStorage('lifeos_routine', data);
    renderRoutineTimeline();
  });
  document.getElementById('energySlider')?.addEventListener('input', e => {
    document.getElementById('energyVal').textContent = e.target.value;
  });
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// ============ JOURNAL MODULE ============
let currentJournalId = null;
let journalSaveTimeout = null;
let journalMood = 3, journalEnergy = 3;

function renderJournal() {
  renderJournalList();
  loadOrCreateJournalEntry();
  loadJournalPrompts();
}

function renderJournalList() {
  const entries = getStorage('lifeos_journal') || [];
  const el = document.getElementById('journalList');
  if (!el) return;
  const search = document.getElementById('journalSearch')?.value.toLowerCase() || '';
  const filtered = entries.filter(e => !search || e.title.toLowerCase().includes(search) || e.body.toLowerCase().includes(search));
  el.innerHTML = filtered.map(e => `
    <div class="journal-list-item ${e.id===currentJournalId?'active':''}" data-id="${e.id}">
      <div class="journal-list-date">${new Date(e.date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} ${['😢','😐','🙂','😊','🤩'][e.mood-1]||''}</div>
      <div class="journal-list-preview">${e.title || e.body.slice(0,40) || 'Untitled'}</div>
    </div>`).join('') || '<div style="color:var(--text-muted);font-size:13px;padding:8px">No entries found</div>';
  el.querySelectorAll('.journal-list-item').forEach(item => {
    item.addEventListener('click', () => loadJournalEntry(item.dataset.id));
  });
  const streak = calcJournalStreak(entries);
  const monthCount = entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0,7))).length;
  const streakEl = document.getElementById('journalStreak');
  const monthEl = document.getElementById('journalMonthCount');
  if (streakEl) streakEl.textContent = streak;
  if (monthEl) monthEl.textContent = monthCount;
}

function calcJournalStreak(entries) {
  const dates = new Set(entries.map(e => e.date));
  let streak = 0, d = new Date();
  while (dates.has(d.toISOString().split('T')[0])) { streak++; d.setDate(d.getDate()-1); }
  return streak;
}

function loadOrCreateJournalEntry() {
  const entries = getStorage('lifeos_journal') || [];
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);
  if (todayEntry) loadJournalEntry(todayEntry.id);
  else createNewJournalEntry();
}

function createNewJournalEntry() {
  const today = new Date().toISOString().split('T')[0];
  const entry = { id: uid(), date: today, title: '', body: '', mood: 3, energy: 3, tags: [], created: today, updated: today };
  const entries = getStorage('lifeos_journal') || [];
  entries.unshift(entry);
  setStorage('lifeos_journal', entries);
  currentJournalId = entry.id;
  populateJournalEditor(entry);
  renderJournalList();
}

function loadJournalEntry(id) {
  const entries = getStorage('lifeos_journal') || [];
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  currentJournalId = id;
  populateJournalEditor(entry);
  renderJournalList();
}

function populateJournalEditor(entry) {
  const dateEl = document.getElementById('journalDateHeader');
  if (dateEl) dateEl.textContent = new Date(entry.date+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('journalTitle').value = entry.title || '';
  document.getElementById('journalBody').value = entry.body || '';
  journalMood = entry.mood || 3;
  journalEnergy = entry.energy || 3;
  document.querySelectorAll('.journal-mood-row .mood-btn').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.mood) === journalMood));
  document.querySelectorAll('.energy-star').forEach(s => s.classList.toggle('active', parseInt(s.dataset.e) <= journalEnergy));
  updateJournalWordCount();
}

function saveJournalEntry() {
  if (!currentJournalId) return;
  const entries = getStorage('lifeos_journal') || [];
  const entry = entries.find(e => e.id === currentJournalId);
  if (!entry) return;
  entry.title = document.getElementById('journalTitle').value;
  entry.body = document.getElementById('journalBody').value;
  entry.mood = journalMood;
  entry.energy = journalEnergy;
  entry.updated = new Date().toISOString().split('T')[0];
  setStorage('lifeos_journal', entries);
  const statusEl = document.getElementById('journalSaveStatus');
  if (statusEl) { statusEl.textContent = '✓ Saved'; setTimeout(() => { statusEl.textContent = ''; }, 2000); }
}

function updateJournalWordCount() {
  const body = document.getElementById('journalBody')?.value || '';
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const el = document.getElementById('journalWordCount');
  if (el) el.textContent = `${words} words`;
}

async function loadJournalPrompts() {
  const el = document.getElementById('journalPrompts');
  if (!el) return;
  const staticPrompts = [
    "What are 3 things you're grateful for today?",
    "What's one thing you'd do differently today?",
    "What made you smile today?"
  ];
  el.innerHTML = staticPrompts.map(p => `<button class="prompt-chip" aria-label="Use prompt">${p}</button>`).join('');
  el.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const body = document.getElementById('journalBody');
      if (body) { body.value += (body.value ? '\n\n' : '') + chip.textContent + '\n'; updateJournalWordCount(); scheduleJournalSave(); }
    });
  });
}

function scheduleJournalSave() {
  const statusEl = document.getElementById('journalSaveStatus');
  if (statusEl) statusEl.textContent = 'Saving...';
  clearTimeout(journalSaveTimeout);
  journalSaveTimeout = setTimeout(saveJournalEntry, 1000);
}

function initJournalEvents() {
  document.getElementById('newJournalBtn')?.addEventListener('click', createNewJournalEntry);
  document.getElementById('journalTitle')?.addEventListener('input', scheduleJournalSave);
  document.getElementById('journalBody')?.addEventListener('input', () => { updateJournalWordCount(); scheduleJournalSave(); });
  document.getElementById('journalSearch')?.addEventListener('input', debounce(() => renderJournalList(), 300));
  document.querySelectorAll('.journal-mood-row .mood-btn').forEach(btn => {
    btn.addEventListener('click', () => { journalMood = parseInt(btn.dataset.mood); document.querySelectorAll('.journal-mood-row .mood-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.mood)===journalMood)); scheduleJournalSave(); });
  });
  document.querySelectorAll('.energy-star').forEach(star => {
    star.addEventListener('click', () => { journalEnergy = parseInt(star.dataset.e); document.querySelectorAll('.energy-star').forEach(s=>s.classList.toggle('active',parseInt(s.dataset.e)<=journalEnergy)); scheduleJournalSave(); });
  });
  document.getElementById('weeklyReviewBtn')?.addEventListener('click', async () => {
    showToast('Generating weekly review...', 'info');
    const entries = (getStorage('lifeos_journal') || []).slice(0, 7);
    const summary = entries.map(e => `${e.date}: ${e.title} (mood:${e.mood})`).join('\n');
    const result = await askAI('You are a reflective journal coach. Provide a brief weekly summary with mood trends and key themes.', `Journal entries this week:\n${summary}`);
    if (result) showToast(result.slice(0, 100) + '...', 'info');
  });
}

// ============ FINANCE MODULE ============
let txPage = 0;
const TX_PAGE_SIZE = 20;
let txFilters = { type: 'all', category: 'all', search: '' };

function renderFinance() {
  const data = getStorage('lifeos_finance') || { transactions: [], budgets: {}, currency: '$' };
  const currency = data.currency || '$';
  const now = new Date();
  const monthTx = data.transactions.filter(t => t.date && t.date.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`));
  const income = monthTx.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const expenses = monthTx.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  const totalBudget = Object.values(data.budgets||{}).reduce((a,v)=>a+v,0);
  const savings = income > 0 ? Math.round((income-expenses)/income*100) : 0;

  const el = id => document.getElementById(id);
  if (el('finBudget')) countUp(el('finBudget'), totalBudget, 800, currency);
  if (el('finIncome')) countUp(el('finIncome'), Math.round(income), 800, currency);
  if (el('finExpenses')) countUp(el('finExpenses'), Math.round(expenses), 800, currency);
  if (el('finSavings')) countUp(el('finSavings'), savings, 800, '', '%');
  if (el('finBudgetBar')) el('finBudgetBar').style.width = Math.min(100, totalBudget > 0 ? (expenses/totalBudget*100) : 0) + '%';
  if (el('currencyPrefix')) el('currencyPrefix').textContent = currency;

  renderFinanceCharts(data, monthTx, currency);
  renderTransactionList(data);
  populateCatFilter(data);
}

function renderFinanceCharts(data, monthTx, currency) {
  const catColors = { Food:'#FF6B6B', Transport:'#FFD93D', Health:'#6BCB77', Shopping:'#7B2FFF', Bills:'#00F5FF', Fun:'#FF6B6B', Salary:'#6BCB77', Other:'#8892A4' };
  const expenseByCat = {};
  monthTx.filter(t=>t.type==='expense').forEach(t => { expenseByCat[t.category] = (expenseByCat[t.category]||0) + t.amount; });
  const segments = Object.entries(expenseByCat).map(([k,v]) => ({ label: k, value: v, color: catColors[k]||'#8892A4' }));
  const total = segments.reduce((a,s)=>a+s.value,0);
  drawDonutChart(document.getElementById('finDonut'), segments, { centerText: currency + Math.round(total) });

  // 6-month bar chart
  const months = Array.from({length:6},(_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()-5+i); return { label: d.toLocaleDateString('en-US',{month:'short'}), key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }; });
  const incomeData = months.map(m => data.transactions.filter(t=>t.type==='income'&&t.date&&t.date.startsWith(m.key)).reduce((a,t)=>a+t.amount,0));
  const expenseData = months.map(m => data.transactions.filter(t=>t.type==='expense'&&t.date&&t.date.startsWith(m.key)).reduce((a,t)=>a+t.amount,0));
  drawBarChart(document.getElementById('finBar'), months.map(m=>m.label), [{ data: incomeData, color: '#6BCB77' }, { data: expenseData, color: '#FF6B6B' }]);
}

function renderTransactionList(data) {
  const el = document.getElementById('txList');
  if (!el) return;
  let txs = data.transactions || [];
  if (txFilters.type !== 'all') txs = txs.filter(t => t.type === txFilters.type);
  if (txFilters.category !== 'all') txs = txs.filter(t => t.category === txFilters.category);
  if (txFilters.search) txs = txs.filter(t => t.desc.toLowerCase().includes(txFilters.search.toLowerCase()));
  txs = txs.sort((a,b) => new Date(b.date) - new Date(a.date));
  const page = txs.slice(0, (txPage+1)*TX_PAGE_SIZE);
  const catEmoji = {Food:'🍔',Transport:'🚗',Health:'❤️',Shopping:'🛍️',Bills:'📄',Fun:'🎉',Salary:'💼',Other:'📦'};
  const currency = data.currency || '$';
  el.innerHTML = page.map(t => `
    <div class="tx-row" data-id="${t.id}">
      <span class="tx-icon">${catEmoji[t.category]||'📦'}</span>
      <div><div class="tx-desc">${t.desc}</div><div class="tx-cat">${t.category}</div></div>
      <span class="tx-date">${t.date ? new Date(t.date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''}</span>
      <span class="tx-amount ${t.type}">${t.type==='income'?'+':'-'}${currency}${Math.abs(t.amount).toFixed(2)}</span>
      <button class="task-action-btn delete-tx" data-id="${t.id}" aria-label="Delete transaction">🗑️</button>
    </div>`).join('') || '<div class="empty-state"><div class="empty-state-sub">No transactions found</div></div>';
  el.querySelectorAll('.delete-tx').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); const d = getStorage('lifeos_finance')||{}; d.transactions=(d.transactions||[]).filter(t=>t.id!==btn.dataset.id); setStorage('lifeos_finance',d); renderFinance(); showToast('Transaction deleted','info'); });
  });
}

function populateCatFilter(data) {
  const el = document.getElementById('txCatFilter');
  if (!el) return;
  const cats = [...new Set((data.transactions||[]).map(t=>t.category))];
  el.innerHTML = `<option value="all">All Categories</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function saveTx() {
  const data = getStorage('lifeos_finance') || { transactions: [], budgets: {}, currency: '$' };
  const type = document.querySelector('#txTypeInput .pill.active')?.dataset.val || 'expense';
  const amount = parseFloat(document.getElementById('txAmountInput').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
  const category = document.querySelector('#txCatGrid .cat-icon-btn.active')?.dataset.cat || 'Other';
  data.transactions.push({ id: uid(), type, amount, category, desc: document.getElementById('txDescInput').value || category, date: document.getElementById('txDateInput').value || new Date().toISOString().split('T')[0], recurring: false });
  setStorage('lifeos_finance', data);
  closeModal('transaction');
  renderFinance();
  showToast('Transaction saved!', 'success');
}

function initFinanceEvents() {
  document.getElementById('addTxBtn')?.addEventListener('click', () => { document.getElementById('txAmountInput').value=''; document.getElementById('txDescInput').value=''; document.getElementById('txDateInput').value=new Date().toISOString().split('T')[0]; openModal('transaction'); });
  document.getElementById('saveTxBtn')?.addEventListener('click', saveTx);
  document.getElementById('txSearch')?.addEventListener('input', debounce(e => { txFilters.search=e.target.value; renderFinance(); }, 300));
  document.getElementById('txCatFilter')?.addEventListener('change', e => { txFilters.category=e.target.value; renderFinance(); });
  document.querySelectorAll('#txTypeFilter .pill').forEach(p => p.addEventListener('click', () => { txFilters.type=p.dataset.val; document.querySelectorAll('#txTypeFilter .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); renderFinance(); }));
  document.querySelectorAll('#txTypeInput .pill').forEach(p => p.addEventListener('click', () => { document.querySelectorAll('#txTypeInput .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); }));
  document.querySelectorAll('#txCatGrid .cat-icon-btn').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('#txCatGrid .cat-icon-btn').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); }));
  document.getElementById('loadMoreTx')?.addEventListener('click', () => { txPage++; renderFinance(); });
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    const data = getStorage('lifeos_finance') || { transactions: [] };
    const csv = ['Date,Type,Category,Description,Amount'].concat(data.transactions.map(t=>`${t.date},${t.type},${t.category},"${t.desc}",${t.amount}`)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lifeos-finance.csv'; a.click();
    showToast('CSV exported!', 'success');
  });
  document.getElementById('aiCategorizeTxBtn')?.addEventListener('click', async () => {
    const desc = document.getElementById('txDescInput').value.trim();
    if (!desc) { showToast('Enter a description first', 'warning'); return; }
    const result = await askAI('Return only the category name from: Food, Transport, Health, Shopping, Bills, Fun, Salary, Other', `Categorize this transaction: "${desc}"`);
    if (result) {
      const cat = result.trim().replace(/[^a-zA-Z]/g,'');
      document.querySelectorAll('#txCatGrid .cat-icon-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat.toLowerCase() === cat.toLowerCase()));
      showToast(`AI suggests: ${cat}`, 'success');
    }
  });
}

// ============ HEALTH MODULE ============
let healthDate = new Date().toISOString().split('T')[0];

function renderHealth() {
  updateHealthDateLabel();
  renderHealthCards();
  renderHealthCharts();
}

function updateHealthDateLabel() {
  const el = document.getElementById('healthDateLabel');
  if (el) el.textContent = new Date(healthDate+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
}

function getHealthDay() {
  const health = getStorage('lifeos_health') || {};
  return health[healthDate] || { water: 0, sleep: { bedtime: '23:00', wake: '06:30', quality: 3, duration: 7.5 }, steps: 0, meals: [false,false,false,false], exercise: { mins: 0, type: 'Walk' }, mood: 3, weight: 70 };
}

function saveHealthDay(data) {
  const health = getStorage('lifeos_health') || {};
  health[healthDate] = data;
  setStorage('lifeos_health', health);
}

function renderHealthCards() {
  const el = document.getElementById('healthGrid');
  if (!el) return;
  const day = getHealthDay();
  el.innerHTML = `
    <div class="health-card">
      <div class="health-card-title">💧 Water Intake</div>
      <div class="health-metric">${day.water}/8</div>
      <div class="water-glasses">${Array.from({length:8},(_,i)=>`<span class="water-glass ${i<day.water?'filled':''}" data-glass="${i}" role="button" aria-label="Glass ${i+1}">💧</span>`).join('')}</div>
    </div>
    <div class="health-card">
      <div class="health-card-title">😴 Sleep</div>
      <div class="health-metric">${day.sleep.duration || 7.5}h</div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <label style="font-size:12px">Bed <input type="time" class="input" style="width:100px;padding:4px 8px" id="sleepBed" value="${day.sleep.bedtime||'23:00'}" /></label>
        <label style="font-size:12px">Wake <input type="time" class="input" style="width:100px;padding:4px 8px" id="sleepWake" value="${day.sleep.wake||'06:30'}" /></label>
      </div>
      <div class="quality-pills">
        ${['Poor','Fair','Good','Great'].map((q,i)=>`<button class="quality-pill ${day.sleep.quality===i+1?'active':''}" data-q="${i+1}">${q}</button>`).join('')}
      </div>
    </div>
    <div class="health-card">
      <div class="health-card-title">🏃 Steps</div>
      <div class="health-metric">${(day.steps||0).toLocaleString()}</div>
      <input type="number" class="input" id="stepsInput" value="${day.steps||0}" min="0" style="margin-top:8px" aria-label="Steps" />
      <div class="mini-progress" style="margin-top:8px"><div class="mini-progress-fill" style="width:${Math.min(100,(day.steps||0)/10000*100)}%"></div></div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${Math.max(0,10000-(day.steps||0)).toLocaleString()} more to goal</div>
    </div>
    <div class="health-card">
      <div class="health-card-title">🍎 Meals</div>
      <div class="meal-slots">
        ${['Breakfast','Lunch','Dinner','Snacks'].map((m,i)=>`<label class="meal-slot"><input type="checkbox" ${(day.meals||[])[i]?'checked':''} data-meal="${i}" aria-label="${m}" />${m}</label>`).join('')}
      </div>
    </div>
    <div class="health-card">
      <div class="health-card-title">🧘 Exercise</div>
      <div class="health-metric">${day.exercise?.mins||0} min</div>
      <input type="number" class="input" id="exerciseMins" value="${day.exercise?.mins||0}" min="0" style="margin-top:8px" aria-label="Exercise minutes" />
      <select class="select-input" id="exerciseType" style="margin-top:8px;width:100%" aria-label="Exercise type">
        ${['Walk','Run','Gym','Yoga','Swim','Cycle','Other'].map(t=>`<option ${day.exercise?.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="health-card">
      <div class="health-card-title">😊 Mood</div>
      <div class="mood-selector" style="justify-content:center;margin:10px 0">
        ${['😢','😐','🙂','😊','🤩'].map((e,i)=>`<button class="mood-btn ${day.mood===i+1?'selected':''}" data-mood="${i+1}" aria-label="Mood ${i+1}">${e}</button>`).join('')}
      </div>
    </div>`;

  // Water glasses
  el.querySelectorAll('.water-glass').forEach(g => {
    g.addEventListener('click', () => {
      const day = getHealthDay();
      const idx = parseInt(g.dataset.glass);
      day.water = day.water === idx + 1 ? idx : idx + 1;
      saveHealthDay(day); renderHealthCards();
    });
  });
  // Sleep
  el.querySelectorAll('.quality-pill').forEach(p => {
    p.addEventListener('click', () => { const day=getHealthDay(); day.sleep.quality=parseInt(p.dataset.q); saveHealthDay(day); renderHealthCards(); });
  });
  el.querySelector('#sleepBed')?.addEventListener('change', e => { const day=getHealthDay(); day.sleep.bedtime=e.target.value; calcSleepDuration(day); saveHealthDay(day); });
  el.querySelector('#sleepWake')?.addEventListener('change', e => { const day=getHealthDay(); day.sleep.wake=e.target.value; calcSleepDuration(day); saveHealthDay(day); });
  el.querySelector('#stepsInput')?.addEventListener('change', e => { const day=getHealthDay(); day.steps=parseInt(e.target.value)||0; saveHealthDay(day); renderHealthCards(); });
  el.querySelectorAll('[data-meal]').forEach(cb => { cb.addEventListener('change', () => { const day=getHealthDay(); if(!day.meals)day.meals=[false,false,false,false]; day.meals[parseInt(cb.dataset.meal)]=cb.checked; saveHealthDay(day); }); });
  el.querySelector('#exerciseMins')?.addEventListener('change', e => { const day=getHealthDay(); if(!day.exercise)day.exercise={mins:0,type:'Walk'}; day.exercise.mins=parseInt(e.target.value)||0; saveHealthDay(day); });
  el.querySelector('#exerciseType')?.addEventListener('change', e => { const day=getHealthDay(); if(!day.exercise)day.exercise={mins:0,type:'Walk'}; day.exercise.type=e.target.value; saveHealthDay(day); });
  el.querySelectorAll('.mood-btn').forEach(btn => { btn.addEventListener('click', () => { const day=getHealthDay(); day.mood=parseInt(btn.dataset.mood); saveHealthDay(day); renderHealthCards(); }); });
}

function calcSleepDuration(day) {
  const [bh,bm] = (day.sleep.bedtime||'23:00').split(':').map(Number);
  const [wh,wm] = (day.sleep.wake||'06:30').split(':').map(Number);
  let dur = (wh*60+wm) - (bh*60+bm);
  if (dur < 0) dur += 24*60;
  day.sleep.duration = Math.round(dur/60*10)/10;
}

function renderHealthCharts() {
  const health = getStorage('lifeos_health') || {};
  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().split('T')[0]; });
  const labels = last7.map(d=>new Date(d+'T12:00').toLocaleDateString('en-US',{weekday:'short'}));
  drawBarChart(document.getElementById('waterChart'), labels, [{ data: last7.map(d=>(health[d]||{}).water||0), color: '#00F5FF' }]);
  drawLineChart(document.getElementById('sleepChart'), labels, [{ data: last7.map(d=>(health[d]||{}).sleep?.duration||0), color: '#7B2FFF' }], { fill: true });
  drawLineChart(document.getElementById('moodChart'), labels, [{ data: last7.map(d=>(health[d]||{}).mood||0), color: '#FFD93D' }], { minVal: 0 });
  const last30 = Array.from({length:30},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-29+i); return d.toISOString().split('T')[0]; });
  drawLineChart(document.getElementById('weightChart'), last30.map((_,i)=>i%5===0?new Date(last30[i]+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):''), [{ data: last30.map(d=>(health[d]||{}).weight||0), color: '#6BCB77' }], { fill: true });
}

function initHealthEvents() {
  document.getElementById('healthPrev')?.addEventListener('click', () => { const d=new Date(healthDate+'T12:00'); d.setDate(d.getDate()-1); healthDate=d.toISOString().split('T')[0]; renderHealth(); });
  document.getElementById('healthNext')?.addEventListener('click', () => { const d=new Date(healthDate+'T12:00'); d.setDate(d.getDate()+1); healthDate=d.toISOString().split('T')[0]; renderHealth(); });
  document.getElementById('healthToday')?.addEventListener('click', () => { healthDate=new Date().toISOString().split('T')[0]; renderHealth(); });
  document.getElementById('analyzeHealthBtn')?.addEventListener('click', async () => {
    showToast('Analyzing your health data...', 'info');
    const health = getStorage('lifeos_health') || {};
    const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().split('T')[0]; });
    const summary = last7.map(d => { const h=health[d]||{}; return `${d}: water=${h.water||0}, sleep=${h.sleep?.duration||0}h, steps=${h.steps||0}, mood=${h.mood||0}`; }).join('\n');
    const result = await askAI('You are a health coach. Provide 3 specific, actionable health insights based on the data.', `Health data:\n${summary}`);
    const el = document.getElementById('healthInsightsText');
    if (el && result) { el.innerHTML = `<div style="margin-top:12px;font-size:14px;line-height:1.7;color:var(--text-secondary)">${result.replace(/\n/g,'<br>')}</div>`; }
  });
}

// ============ BALANCE MODULE ============
const BALANCE_AREAS = [
  { key: 'health', label: 'Health', emoji: '💪', color: '#6BCB77' },
  { key: 'work', label: 'Work', emoji: '💼', color: '#00F5FF' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧', color: '#FFD93D' },
  { key: 'finances', label: 'Finances', emoji: '💰', color: '#FF6B6B' },
  { key: 'fun', label: 'Fun', emoji: '🎉', color: '#7B2FFF' },
  { key: 'learning', label: 'Learning', emoji: '📚', color: '#00F5FF' },
  { key: 'social', label: 'Social', emoji: '👥', color: '#6BCB77' },
  { key: 'mindfulness', label: 'Mindfulness', emoji: '🧘', color: '#FFD93D' },
];
let balanceScores = { health:7, work:6, family:7, finances:5, fun:6, learning:6, social:5, mindfulness:6 };

function renderBalance() {
  const history = getStorage('lifeos_balance') || [];
  if (history.length) balanceScores = { ...history[0].scores };
  renderBalanceSliders();
  drawBalanceWheel();
  renderBalanceSummary();
  renderBalanceHistory();
}

function renderBalanceSliders() {
  const el = document.getElementById('balanceSliders');
  if (!el) return;
  el.innerHTML = BALANCE_AREAS.map(a => `
    <div class="balance-slider-row">
      <div class="balance-slider-label"><span>${a.emoji}</span><span>${a.label}</span></div>
      <input type="range" class="balance-slider" min="1" max="10" value="${balanceScores[a.key]||5}" data-key="${a.key}" style="accent-color:${a.color}" aria-label="${a.label} score" />
      <span class="balance-slider-val" id="bval-${a.key}" style="color:${a.color}">${balanceScores[a.key]||5}</span>
    </div>`).join('');
  el.querySelectorAll('.balance-slider').forEach(s => {
    s.addEventListener('input', () => {
      balanceScores[s.dataset.key] = parseInt(s.value);
      document.getElementById(`bval-${s.dataset.key}`).textContent = s.value;
      drawBalanceWheel();
      renderBalanceSummary();
    });
  });
}

function drawBalanceWheel() {
  const canvas = document.getElementById('balanceWheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w/2, cy = h/2, maxR = Math.min(cx,cy) - 40;
  const n = BALANCE_AREAS.length;
  const angleStep = (Math.PI * 2) / n;

  // Grid rings
  for (let r = 2; r <= 10; r += 2) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI/2;
      const x = cx + Math.cos(angle) * (r/10) * maxR;
      const y = cy + Math.sin(angle) * (r/10) * maxR;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Score polygon
  ctx.beginPath();
  BALANCE_AREAS.forEach((a, i) => {
    const angle = i * angleStep - Math.PI/2;
    const r = ((balanceScores[a.key]||5) / 10) * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  grad.addColorStop(0, 'rgba(0,245,255,0.3)');
  grad.addColorStop(1, 'rgba(123,47,255,0.3)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,245,255,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Labels
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  BALANCE_AREAS.forEach((a, i) => {
    const angle = i * angleStep - Math.PI/2;
    const lx = cx + Math.cos(angle) * (maxR + 24);
    const ly = cy + Math.sin(angle) * (maxR + 24);
    ctx.fillStyle = a.color;
    ctx.fillText(`${a.emoji} ${a.label}`, lx, ly);
  });
}

function renderBalanceSummary() {
  const el = document.getElementById('balanceSummary');
  if (!el) return;
  const vals = Object.values(balanceScores);
  const avg = (vals.reduce((a,v)=>a+v,0)/vals.length).toFixed(1);
  const maxKey = Object.entries(balanceScores).sort((a,b)=>b[1]-a[1])[0];
  const minKey = Object.entries(balanceScores).sort((a,b)=>a[1]-b[1])[0];
  const maxArea = BALANCE_AREAS.find(a=>a.key===maxKey[0]);
  const minArea = BALANCE_AREAS.find(a=>a.key===minKey[0]);
  el.innerHTML = `
    <div class="balance-overall">${avg} / 10</div>
    <div class="balance-badges">
      <span class="balance-badge high">${maxArea?.emoji} ${maxArea?.label}: ${maxKey[1]}</span>
      <span class="balance-badge low">${minArea?.emoji} ${minArea?.label}: ${minKey[1]} — needs attention</span>
    </div>`;
}

function renderBalanceHistory() {
  const el = document.getElementById('balanceHistory');
  if (!el) return;
  const history = getStorage('lifeos_balance') || [];
  if (!history.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-sub">No history yet. Save this week!</div></div>'; return; }
  el.innerHTML = history.map((w, i) => {
    const avg = (Object.values(w.scores).reduce((a,v)=>a+v,0)/8).toFixed(1);
    return `<div class="balance-history-card" data-idx="${i}">
      <canvas width="80" height="80" id="miniWheel-${i}"></canvas>
      <div class="balance-history-date">${new Date(w.date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
      <div class="balance-history-score">${avg}/10</div>
    </div>`;
  }).join('');
  history.forEach((w, i) => {
    const c = document.getElementById(`miniWheel-${i}`);
    if (c) drawMiniWheel(c, w.scores);
  });
  el.querySelectorAll('.balance-history-card').forEach(card => {
    card.addEventListener('click', () => {
      const w = history[parseInt(card.dataset.idx)];
      balanceScores = { ...w.scores };
      renderBalanceSliders();
      drawBalanceWheel();
      renderBalanceSummary();
    });
  });
}

function drawMiniWheel(canvas, scores) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w/2, cy = h/2, maxR = Math.min(cx,cy) - 8;
  const n = BALANCE_AREAS.length;
  const angleStep = (Math.PI * 2) / n;
  ctx.beginPath();
  BALANCE_AREAS.forEach((a, i) => {
    const angle = i * angleStep - Math.PI/2;
    const r = ((scores[a.key]||5) / 10) * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,245,255,0.3)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,245,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function initBalanceEvents() {
  document.getElementById('saveBalanceBtn')?.addEventListener('click', () => {
    const history = getStorage('lifeos_balance') || [];
    history.unshift({ date: new Date().toISOString().split('T')[0], scores: { ...balanceScores }, analysis: '' });
    setStorage('lifeos_balance', history.slice(0, 12));
    renderBalanceHistory();
    showToast('Balance saved!', 'success');
  });
  document.getElementById('analyzeBalanceBtn')?.addEventListener('click', async () => {
    showToast('Analyzing your balance...', 'info');
    const scoreStr = BALANCE_AREAS.map(a=>`${a.label}: ${balanceScores[a.key]}`).join(', ');
    const result = await askAI('You are a life coach. Provide 2 strengths, 2 areas to improve, and 3 specific action steps based on life balance scores.', `Life balance scores: ${scoreStr}`);
    const el = document.getElementById('balanceAnalysis');
    if (el && result) { typewriterEffect(el, result); }
  });
}

// ============ ANALYTICS MODULE ============
let analyticsRange = 'week';

function renderAnalytics() {
  renderKPIs();
  renderAnalyticsCharts();
}

function getDateRange() {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start;
  if (analyticsRange === 'week') { const d = new Date(now); d.setDate(d.getDate()-6); start = d.toISOString().split('T')[0]; }
  else if (analyticsRange === 'month') { const d = new Date(now); d.setDate(1); start = d.toISOString().split('T')[0]; }
  else { const d = new Date(now); d.setMonth(d.getMonth()-3); start = d.toISOString().split('T')[0]; }
  return { start, end };
}

function getDaysInRange() {
  const { start, end } = getDateRange();
  const days = [];
  const cur = new Date(start+'T12:00');
  const endD = new Date(end+'T12:00');
  while (cur <= endD) { days.push(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate()+1); }
  return days;
}

function renderKPIs() {
  const el = document.getElementById('kpiGrid');
  if (!el) return;
  const days = getDaysInRange();
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const goals = getStorage('lifeos_goals') || [];
  const focus = getStorage('lifeos_focus') || { sessions: [] };
  const journal = getStorage('lifeos_journal') || [];
  const health = getStorage('lifeos_health') || {};

  const doneTasks = tasks.filter(t => t.status==='done' && days.includes(t.updated)).length;
  const totalTasks = tasks.filter(t => days.includes(t.created)).length;
  const completionRate = totalTasks > 0 ? Math.round(doneTasks/totalTasks*100) : 0;
  const focusMins = focus.sessions.filter(s=>days.includes(s.date)).reduce((a,s)=>a+(s.duration||0),0);
  const avgFocus = days.length > 0 ? Math.round(focusMins/days.length) : 0;
  const habitDays = days.map(d => habits.filter(h=>h.entries&&h.entries[d]).length);
  const habitConsistency = habits.length > 0 ? Math.round(habitDays.reduce((a,v)=>a+v,0)/(days.length*habits.length)*100) : 0;
  const goalProgress = goals.length > 0 ? Math.round(goals.reduce((a,g)=>a+(g.progress||0),0)/goals.length) : 0;
  const journalCount = journal.filter(e=>days.includes(e.date)).length;
  const productivity = Math.round(completionRate*0.4 + habitConsistency*0.3 + Math.min(100,avgFocus/25*100)*0.3);

  const kpis = [
    { label: 'Productivity Score', value: productivity, suffix: '%' },
    { label: 'Task Completion', value: completionRate, suffix: '%' },
    { label: 'Avg Daily Focus', value: avgFocus, suffix: 'min' },
    { label: 'Habit Consistency', value: habitConsistency, suffix: '%' },
    { label: 'Goals Progress', value: goalProgress, suffix: '%' },
    { label: 'Journal Entries', value: journalCount, suffix: '' },
  ];
  el.innerHTML = kpis.map((k, i) => `
    <div class="kpi-card" style="animation:fadeSlideUp 0.4s ease both;animation-delay:${i*60}ms">
      <div class="kpi-value" id="kpi-${i}">0${k.suffix}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`).join('');
  kpis.forEach((k, i) => {
    const el = document.getElementById(`kpi-${i}`);
    if (el) countUp(el, k.value, 800, '', k.suffix);
  });
}

function renderAnalyticsCharts() {
  const days = getDaysInRange();
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const focus = getStorage('lifeos_focus') || { sessions: [] };
  const health = getStorage('lifeos_health') || {};
  const finance = getStorage('lifeos_finance') || { transactions: [] };
  const labels = days.map(d => new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}));

  drawLineChart(document.getElementById('analyticsProductivity'), labels,
    [{ data: days.map(d => tasks.filter(t=>t.status==='done'&&t.updated===d).length * 20), color: '#00F5FF' }], { fill: true });

  drawBarChart(document.getElementById('analyticsFocus'), labels,
    [{ data: days.map(d => focus.sessions.filter(s=>s.date===d).reduce((a,s)=>a+(s.duration||0),0)), color: '#7B2FFF' }]);

  if (habits.length) {
    drawBarChart(document.getElementById('analyticsHabits'), labels,
      habits.slice(0,3).map((h,i) => ({ data: days.map(d => h.entries&&h.entries[d]?1:0), color: ['#00F5FF','#6BCB77','#FFD93D'][i] })));
  }

  drawLineChart(document.getElementById('analyticsMood'), labels,
    [{ data: days.map(d => (health[d]||{}).mood||0), color: '#FFD93D' }], { minVal: 0 });

  const catColors = { Food:'#FF6B6B', Transport:'#FFD93D', Health:'#6BCB77', Shopping:'#7B2FFF', Bills:'#00F5FF', Fun:'#FF6B6B', Salary:'#6BCB77', Other:'#8892A4' };
  const expenseByCat = {};
  finance.transactions.filter(t=>t.type==='expense'&&days.includes(t.date)).forEach(t => { expenseByCat[t.category]=(expenseByCat[t.category]||0)+t.amount; });
  drawDonutChart(document.getElementById('analyticsSpending'), Object.entries(expenseByCat).map(([k,v])=>({label:k,value:v,color:catColors[k]||'#8892A4'})));

  drawLineChart(document.getElementById('analyticsSleep'), labels,
    [{ data: days.map(d => (health[d]||{}).sleep?.duration||0), color: '#7B2FFF' }], { fill: true });
}

function initAnalyticsEvents() {
  document.querySelectorAll('#analyticsRange .pill').forEach(p => {
    p.addEventListener('click', () => {
      analyticsRange = p.dataset.val;
      document.querySelectorAll('#analyticsRange .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active');
      renderAnalytics();
    });
  });
  document.getElementById('exportReportBtn')?.addEventListener('click', () => {
    const days = getDaysInRange();
    const tasks = getStorage('lifeos_tasks') || [];
    const habits = getStorage('lifeos_habits') || [];
    const doneTasks = tasks.filter(t=>t.status==='done'&&days.includes(t.updated)).length;
    const report = `LifeOS Analytics Report\nGenerated: ${new Date().toLocaleDateString()}\nRange: ${days[0]} to ${days[days.length-1]}\n\nTasks Completed: ${doneTasks}\nHabits Active: ${habits.length}\n`;
    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lifeos-report.txt'; a.click();
    showToast('Report downloaded!', 'success');
  });
}

// ============ AI ASSISTANT MODULE ============
let chatConversations = [];
let activeChatId = null;

function renderAI() {
  const data = getStorage('lifeos_chat') || { conversations: [], activeId: null };
  chatConversations = data.conversations || [];
  activeChatId = data.activeId;
  if (!activeChatId) startNewChat();
  else renderChatMessages();
}

function startNewChat() {
  const conv = { id: uid(), title: 'New Chat', messages: [], created: new Date().toISOString() };
  chatConversations.unshift(conv);
  activeChatId = conv.id;
  saveChatData();
  document.getElementById('chatMessages').innerHTML = document.querySelector('.chat-suggestions')?.outerHTML || '';
  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) {
    suggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => sendChatMessage(chip.dataset.msg));
    });
  }
}

function saveChatData() {
  setStorage('lifeos_chat', { conversations: chatConversations, activeId: activeChatId });
}

function getActiveConv() {
  return chatConversations.find(c => c.id === activeChatId);
}

async function sendChatMessage(text) {
  const input = document.getElementById('chatInput');
  const msg = text || input?.value.trim();
  if (!msg) return;
  if (input) input.value = '';

  const conv = getActiveConv();
  if (!conv) return;
  if (!conv.title || conv.title === 'New Chat') conv.title = msg.slice(0, 40);
  conv.messages.push({ role: 'user', content: msg, timestamp: new Date().toISOString() });
  saveChatData();
  renderChatMessages();

  // Show typing indicator
  const messagesEl = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-msg ai';
  typing.id = 'typingIndicator';
  typing.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Build context
  const tasks = getStorage('lifeos_tasks') || [];
  const habits = getStorage('lifeos_habits') || [];
  const goals = getStorage('lifeos_goals') || [];
  const today = new Date().toISOString().split('T')[0];
  const contextStr = `User data: ${tasks.filter(t=>t.status!=='done').length} pending tasks, ${habits.filter(h=>h.entries&&h.entries[today]).length}/${habits.length} habits done today, ${goals.filter(g=>g.status==='active').length} active goals.`;

  const settings = getStorage('lifeos_settings') || {};
  const personality = settings.aiPersonality || 'friendly';
  const systemPrompts = {
    friendly: 'You are ARIA, a friendly and supportive productivity AI assistant. Be warm, encouraging, and practical.',
    professional: 'You are ARIA, a professional productivity AI assistant. Be concise, data-driven, and actionable.',
    motivational: 'You are ARIA, a motivational productivity AI coach. Be energetic, inspiring, and push the user to achieve their best.'
  };

  const result = await askAI(systemPrompts[personality] + ' ' + contextStr, msg);
  typing.remove();

  if (result) {
    conv.messages.push({ role: 'assistant', content: result, timestamp: new Date().toISOString() });
    saveChatData();
    renderChatMessages();
  }
}

function renderChatMessages() {
  const conv = getActiveConv();
  const el = document.getElementById('chatMessages');
  if (!el || !conv) return;
  if (!conv.messages.length) {
    el.innerHTML = `<div class="chat-suggestions" id="chatSuggestions"><p>How can I help you today?</p><div class="suggestion-grid">${['📅 Plan my week','💪 Suggest habits for me','🎯 Review my goals','⏱️ Help me focus better','📊 Analyze my productivity data','✅ Help me prioritize my tasks'].map(m=>`<button class="suggestion-chip" data-msg="${m}">${m}</button>`).join('')}</div></div>`;
    el.querySelectorAll('.suggestion-chip').forEach(chip => chip.addEventListener('click', () => sendChatMessage(chip.dataset.msg)));
    return;
  }
  el.innerHTML = conv.messages.map(m => `
    <div class="chat-msg ${m.role === 'user' ? 'user' : 'ai'}">
      ${m.role === 'assistant' ? '<div class="chat-avatar">🤖</div>' : ''}
      <div class="chat-bubble">${renderMarkdown(m.content)}</div>
    </div>`).join('');
  el.scrollTop = el.scrollHeight;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h4>$1</h4>')
    .replace(/^# (.*$)/gm, '<h4>$1</h4>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function initAIEvents() {
  document.getElementById('chatSendBtn')?.addEventListener('click', () => sendChatMessage());
  document.getElementById('chatInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });
  document.getElementById('chatInput')?.addEventListener('input', e => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(200, e.target.scrollHeight) + 'px';
  });
  document.getElementById('newChatBtn')?.addEventListener('click', startNewChat);
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => sendChatMessage(chip.dataset.msg));
  });
}

// ============ NOTIFICATIONS MODULE ============
function renderNotifications() {
  const notifs = getStorage('lifeos_notifications') || [];
  const filter = document.querySelector('#notifTabFilter .pill.active')?.dataset.val || 'all';
  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);
  const el = document.getElementById('notifList');
  if (!el) return;
  if (!filtered.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">All caught up!</div><div class="empty-state-sub">No notifications here.</div></div>'; return; }
  const typeIcons = { tasks: '✅', habits: '💪', goals: '🎯', system: '⚙️' };
  el.innerHTML = filtered.map(n => `
    <div class="notif-item ${n.read?'':'unread'}" data-id="${n.id}">
      <span class="notif-icon">${typeIcons[n.type]||'🔔'}</span>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-body">${n.body}</div>
        <div class="notif-time">${relativeTime(new Date(n.timestamp).toISOString())}</div>
      </div>
      <div class="notif-actions">
        <button class="btn-ghost btn-sm mark-read" data-id="${n.id}" aria-label="Mark as read">✓</button>
        <button class="btn-ghost btn-sm delete-notif" data-id="${n.id}" aria-label="Delete notification">🗑️</button>
      </div>
    </div>`).join('');

  el.querySelectorAll('.mark-read').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); markNotifRead(btn.dataset.id); });
  });
  el.querySelectorAll('.delete-notif').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteNotif(btn.dataset.id); });
  });
  el.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => { markNotifRead(item.dataset.id); const n = notifs.find(n=>n.id===item.dataset.id); if(n?.module) navigateTo(n.module); });
  });
  updateNotifBadge();
}

function markNotifRead(id) {
  const notifs = getStorage('lifeos_notifications') || [];
  const n = notifs.find(n => n.id === id);
  if (n) { n.read = true; setStorage('lifeos_notifications', notifs); renderNotifications(); }
}

function deleteNotif(id) {
  const notifs = (getStorage('lifeos_notifications') || []).filter(n => n.id !== id);
  setStorage('lifeos_notifications', notifs);
  renderNotifications();
}

function updateNotifBadge() {
  const notifs = getStorage('lifeos_notifications') || [];
  const unread = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('notifBadge');
  const dot = document.getElementById('topbarNotifDot');
  if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'inline-block' : 'none'; }
  if (dot) dot.classList.toggle('visible', unread > 0);
}

function initNotifEvents() {
  document.querySelectorAll('#notifTabFilter .pill').forEach(p => {
    p.addEventListener('click', () => { document.querySelectorAll('#notifTabFilter .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); renderNotifications(); });
  });
  document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
    const notifs = getStorage('lifeos_notifications') || [];
    notifs.forEach(n => n.read = true);
    setStorage('lifeos_notifications', notifs);
    renderNotifications();
    showToast('All marked as read', 'success');
  });
  document.getElementById('clearAllNotifBtn')?.addEventListener('click', () => {
    if (confirm('Clear all notifications?')) { setStorage('lifeos_notifications', []); renderNotifications(); showToast('Notifications cleared', 'info'); }
  });
  document.getElementById('topbarNotif')?.addEventListener('click', () => navigateTo('notifications'));
}

// ============ SETTINGS MODULE ============
function renderSettings() {
  const s = getStorage('lifeos_settings') || {};
  const user = getStorage('lifeos_user') || {};
  const el = id => document.getElementById(id);
  if (el('settingName')) el('settingName').value = user.name || '';
  if (el('settingUsername')) el('settingUsername').value = user.username || '';
  if (el('settingAvatarColor')) el('settingAvatarColor').value = user.avatar || '#7B2FFF';
  if (el('settingApiKey')) el('settingApiKey').value = s.apiKey || '';
  if (el('settingFocus')) el('settingFocus').value = s.focusDuration || 25;
  if (el('settingShort')) el('settingShort').value = (getStorage('lifeos_focus')||{}).settings?.short || 5;
  if (el('settingLong')) el('settingLong').value = (getStorage('lifeos_focus')||{}).settings?.long || 15;
  document.querySelectorAll('#themeSelector .pill').forEach(p => p.classList.toggle('active', p.dataset.val === (s.theme||'dark')));
  document.querySelectorAll('#aiProviderSelector .pill').forEach(p => p.classList.toggle('active', p.dataset.val === (s.aiProvider||'claude')));
  document.querySelectorAll('#aiPersonalitySelector .pill').forEach(p => p.classList.toggle('active', p.dataset.val === (s.aiPersonality||'friendly')));
  updateStorageMeter();
}

function updateStorageMeter() {
  let total = 0;
  for (let key in localStorage) { if (key.startsWith('lifeos_')) total += (localStorage[key]||'').length; }
  const pct = Math.min(100, (total / (5*1024*1024)) * 100);
  const fill = document.getElementById('storageFill');
  const label = document.getElementById('storageLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${(total/1024).toFixed(1)} KB used of ~5 MB`;
}

function initSettingsEvents() {
  document.querySelectorAll('.settings-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.settings-nav-item').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
      document.querySelectorAll('.settings-tab').forEach(t=>t.classList.remove('active'));
      document.getElementById(`stab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
  document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
    const user = getStorage('lifeos_user') || {};
    user.name = document.getElementById('settingName').value;
    user.username = document.getElementById('settingUsername').value;
    user.avatar = document.getElementById('settingAvatarColor').value;
    setStorage('lifeos_user', user);
    updateSidebarUser();
    showToast('Profile saved!', 'success');
  });
  document.getElementById('saveAiBtn')?.addEventListener('click', () => {
    const s = getStorage('lifeos_settings') || {};
    s.apiKey = document.getElementById('settingApiKey').value;
    s.aiProvider = document.querySelector('#aiProviderSelector .pill.active')?.dataset.val || 'claude';
    s.aiPersonality = document.querySelector('#aiPersonalitySelector .pill.active')?.dataset.val || 'friendly';
    setStorage('lifeos_settings', s);
    showToast('AI settings saved!', 'success');
  });
  document.getElementById('saveProductivityBtn')?.addEventListener('click', () => {
    const s = getStorage('lifeos_settings') || {};
    s.focusDuration = parseInt(document.getElementById('settingFocus').value) || 25;
    setStorage('lifeos_settings', s);
    const focus = getStorage('lifeos_focus') || { sessions: [], settings: {} };
    focus.settings = { focus: parseInt(document.getElementById('settingFocus').value)||25, short: parseInt(document.getElementById('settingShort').value)||5, long: parseInt(document.getElementById('settingLong').value)||15 };
    setStorage('lifeos_focus', focus);
    showToast('Productivity settings saved!', 'success');
  });
  document.getElementById('toggleApiKey')?.addEventListener('click', () => {
    const inp = document.getElementById('settingApiKey');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('testAiBtn')?.addEventListener('click', async () => {
    showToast('Testing AI connection...', 'info');
    const result = await askAI('You are a test assistant.', 'Reply with exactly: "Connection successful!"');
    if (result) showToast('✅ ' + result.slice(0,50), 'success');
  });
  document.querySelectorAll('#themeSelector .pill').forEach(p => p.addEventListener('click', () => {
    document.querySelectorAll('#themeSelector .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active');
    const s = getStorage('lifeos_settings') || {};
    s.theme = p.dataset.val;
    setStorage('lifeos_settings', s);
    document.body.classList.toggle('light-mode', p.dataset.val === 'light');
    document.body.classList.toggle('dark-mode', p.dataset.val === 'dark');
    document.getElementById('themeToggle').textContent = p.dataset.val === 'light' ? '☀️' : '🌙';
  }));
  document.querySelectorAll('#fontSizeSelector .pill').forEach(p => p.addEventListener('click', () => {
    document.querySelectorAll('#fontSizeSelector .pill').forEach(x=>x.classList.remove('active')); p.classList.add('active');
    document.documentElement.style.setProperty('--font-size-base', p.dataset.val);
    const s = getStorage('lifeos_settings') || {};
    s.fontSize = p.dataset.val;
    setStorage('lifeos_settings', s);
  }));
  document.querySelectorAll('#aiProviderSelector .pill, #aiPersonalitySelector .pill').forEach(p => {
    p.addEventListener('click', () => { const group = p.closest('.pill-group'); group.querySelectorAll('.pill').forEach(x=>x.classList.remove('active')); p.classList.add('active'); });
  });
  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    const data = {};
    for (let key in localStorage) { if (key.startsWith('lifeos_')) data[key] = getStorage(key); }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lifeos-backup.json'; a.click();
    showToast('Data exported!', 'success');
  });
  document.getElementById('importDataInput')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (confirm('This will overwrite your current data. Continue?')) {
          Object.entries(data).forEach(([k,v]) => setStorage(k, v));
          showToast('Data imported!', 'success');
          location.reload();
        }
      } catch { showToast('Invalid backup file', 'error'); }
    };
    reader.readAsText(file);
  });
  document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
    if (confirm('This will delete ALL your data. Are you sure?') && confirm('This cannot be undone. Confirm?')) {
      for (let key in localStorage) { if (key.startsWith('lifeos_')) localStorage.removeItem(key); }
      location.reload();
    }
  });
}

function updateSidebarUser() {
  const user = getStorage('lifeos_user') || {};
  const name = user.name || 'User';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarHandle').textContent = '@' + (user.username || 'user');
  document.getElementById('sidebarAvatar').textContent = name[0]?.toUpperCase() || 'U';
  document.getElementById('topbarAvatar').textContent = name[0]?.toUpperCase() || 'U';
  if (user.avatar) {
    document.getElementById('sidebarAvatar').style.background = user.avatar;
    document.getElementById('topbarAvatar').style.background = user.avatar;
  }
}

// ============ COMMAND PALETTE ============
function openCommandPalette() {
  openModal('command');
  const input = document.getElementById('commandInput');
  if (input) { input.value = ''; input.focus(); renderCommandResults(''); }
}

function renderCommandResults(query) {
  const el = document.getElementById('commandResults');
  if (!el) return;
  const commands = [
    ...SECTIONS.map((s, i) => ({ icon: ['🏠','✅','📅','💪','🎯','🏥','⏱️','🌅','📔','💰','⚖️','📊','🤖','🔔','⚙️'][i], label: SECTION_TITLES[s], action: () => { navigateTo(s); closeModal('command'); } })),
    { icon: '✅', label: 'New Task', action: () => { closeModal('command'); openAddTask(); } },
    { icon: '📔', label: 'New Journal Entry', action: () => { closeModal('command'); navigateTo('journal'); createNewJournalEntry(); } },
    { icon: '🌙', label: 'Toggle Theme', action: () => { closeModal('command'); toggleTheme(); } },
  ];
  const filtered = query ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())) : commands;
  el.innerHTML = filtered.map((c, i) => `
    <div class="command-item" data-idx="${i}" role="option" tabindex="0">
      <span class="command-item-icon">${c.icon}</span>
      <span class="command-item-label">${c.label}</span>
    </div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--text-muted)">No results found</div>';
  el.querySelectorAll('.command-item').forEach((item, i) => {
    item.addEventListener('click', () => filtered[i]?.action());
    item.addEventListener('keydown', e => { if (e.key === 'Enter') filtered[i]?.action(); });
  });
}

function initCommandPalette() {
  document.getElementById('searchBtn')?.addEventListener('click', openCommandPalette);
  document.getElementById('commandInput')?.addEventListener('input', e => renderCommandResults(e.target.value));
  document.getElementById('commandInput')?.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal('command');
    if (e.key === 'ArrowDown') { const items = document.querySelectorAll('.command-item'); const sel = document.querySelector('.command-item.selected'); const idx = sel ? [...items].indexOf(sel) : -1; items.forEach(x=>x.classList.remove('selected')); if (items[idx+1]) items[idx+1].classList.add('selected'); }
    if (e.key === 'ArrowUp') { const items = document.querySelectorAll('.command-item'); const sel = document.querySelector('.command-item.selected'); const idx = sel ? [...items].indexOf(sel) : items.length; items.forEach(x=>x.classList.remove('selected')); if (items[idx-1]) items[idx-1].classList.add('selected'); }
    if (e.key === 'Enter') { const sel = document.querySelector('.command-item.selected'); if (sel) sel.click(); }
  });
}

// ============ FAB ============
function initFAB() {
  const fab = document.getElementById('fabMain');
  const actions = document.getElementById('fabActions');
  fab?.addEventListener('click', () => {
    const open = !actions.classList.contains('hidden');
    actions.classList.toggle('hidden', open);
    fab.classList.toggle('open', !open);
  });
  document.getElementById('fabTask')?.addEventListener('click', () => { actions.classList.add('hidden'); fab.classList.remove('open'); openAddTask(); });
  document.getElementById('fabFocus')?.addEventListener('click', () => { actions.classList.add('hidden'); fab.classList.remove('open'); navigateTo('focus'); });
  document.getElementById('fabHabit')?.addEventListener('click', () => { actions.classList.add('hidden'); fab.classList.remove('open'); navigateTo('habits'); });
  document.getElementById('fabNote')?.addEventListener('click', () => { actions.classList.add('hidden'); fab.classList.remove('open'); navigateTo('journal'); createNewJournalEntry(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.fab-container')) { actions?.classList.add('hidden'); fab?.classList.remove('open'); }
  });
}

// ============ GLOBAL KEYBOARD SHORTCUTS ============
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCommandPalette(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); openAddTask(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'j') { e.preventDefault(); navigateTo('journal'); createNewJournalEntry(); }
    if (e.key === ' ' && activeSection === 'focus' && !e.target.matches('input,textarea,select')) { e.preventDefault(); startPauseTimer(); }
    if (e.key === 't' && !e.target.matches('input,textarea,select')) toggleTheme();
    if (e.key === 's' && !e.target.matches('input,textarea,select')) navigateTo('settings');
    if (e.key === '?' && !e.target.matches('input,textarea,select')) navigateTo('settings');
    if (/^[1-9]$/.test(e.key) && !e.target.matches('input,textarea,select')) navigateToIndex(parseInt(e.key)-1);
  });
}

// ============ MODAL CLOSE EVENTS ============
function initModalEvents() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAllModals(); });
  });
  document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      if (id) closeModal(id);
    });
  });
}

// ============ UTILITY ============
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ============ INIT ============
function init() {
  // Seed data on first load
  if (!getStorage('lifeos_user')) seedData();

  applyTheme();
  updateSidebarUser();
  updateNotifBadge();

  initSidebar();
  initModalEvents();
  initKeyboardShortcuts();
  initCommandPalette();
  initFAB();
  initTaskEvents();
  initPlannerEvents();
  initHabitEvents();
  initHabitModal();
  initGoalEvents();
  initFocusEvents();
  initRoutineEvents();
  initJournalEvents();
  initFinanceEvents();
  initHealthEvents();
  initBalanceEvents();
  initAnalyticsEvents();
  initAIEvents();
  initNotifEvents();
  initSettingsEvents();

  // Start on dashboard
  navigateTo('dashboard');

  // Clock update
  setInterval(updateClock, 1000);

  // Planner time line update
  setInterval(() => { if (activeSection === 'planner') renderTimeGrid(); }, 60000);
}

document.addEventListener('DOMContentLoaded', init);
