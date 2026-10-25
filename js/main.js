(function () {
  'use strict';
  const app = document.getElementById('app');
  const QUIZ_SIZE = 10;
  const stateKey = 'dream_progress_v1';
  const authKey = 'dream_auth_code';
  let state = null;
  let timer;
  let report;
  let posterURL;
  let storageOK = true;
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  function read(key) {
    try { return sessionStorage.getItem(key); } catch (_) { storageOK = false; return null; }
  }
  function write(key, value) {
    try { sessionStorage.setItem(key, value); return true; } catch (_) { storageOK = false; return false; }
  }
  function validateCode(code) { return /^EMO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(code).trim().toUpperCase()); }
  window.validateCode = validateCode;
  function authorized() { return validateCode(read(authKey) || ''); }
  function bankById(id) { return window.DreamQuestions.find(q => q.id === id) || null; }
  function questions() { return state ? state.picked.map(bankById).filter(Boolean) : []; }
  function answered(q) { return q.options.some(o => o.key === state.answers[q.id]); }
  function complete() { return questions().length === QUIZ_SIZE && questions().every(answered); }
  function save() {
    if (!write(stateKey, JSON.stringify(state))) {
      app.innerHTML = '<div class="notice storage-error">浏览器未能保存进度，请允许此网站使用会话存储后刷新。为避免丢失答案，测试已暂停。</div>';
      return false;
    }
    return true;
  }
  function validStoredState(stored) {
    if (!stored || !Array.isArray(stored.picked) || stored.picked.length !== QUIZ_SIZE) return null;
    const unique = new Set(stored.picked);
    if (unique.size !== QUIZ_SIZE || stored.picked.some(id => !bankById(id))) return null;
    if (!stored.answers || typeof stored.answers !== 'object' || Array.isArray(stored.answers)) return null;
    const answers = {};
    state = { picked: stored.picked, answers: {}, index: 0 };
    questions().forEach(q => {
      if (Object.hasOwn(stored.answers, q.id) && q.options.some(o => o.key === stored.answers[q.id])) {
        answers[q.id] = stored.answers[q.id];
      }
    });
    return { picked: stored.picked, answers, index: Number.isInteger(stored.index) ? Math.max(0, Math.min(QUIZ_SIZE - 1, stored.index)) : 0 };
  }
  try {
    const restored = validStoredState(JSON.parse(read(stateKey)));
    if (restored) state = restored;
  } catch (_) { /* 损坏的会话进度不用于恢复。 */ }
  function go(route) {
    if (location.hash === '#' + route) render();
    else location.hash = route;
  }
  function top(right) { return '<div class="page-top"><button class="back" data-home>← 返回首页</button><span>' + escape(right) + '</span></div>'; }
  function home() {
    const count = state ? questions().filter(answered).length : 0;
    app.innerHTML = '<section class="hero"><p class="eyebrow">YOUR DREAMS WILL CONFESS</p><h1>睡着的你，<br>其实<em>藏不住</em>。</h1><p class="intro">梦是潜意识走漏的风声。<br>十道随机梦境选择题，鉴定你藏在白天之下的隐藏人格。</p><div class="weather" aria-hidden="true"><div class="sun"></div><div class="hill"></div><div class="hill second"></div></div><div class="section-heading"><h2>开始梦境鉴定</h2><span>跟着直觉选，别想太久</span></div><div class="mode-grid"><button class="mode-card full" id="start"><span class="mode-symbol" aria-hidden="true">☾</span><div><strong>进入梦境鉴定</strong><p>百题题库随机抽取 10 题 · 约 3 分钟 · 测完才知道你是哪一种</p></div><span class="arrow" aria-hidden="true">↗</span></button></div><div class="privacy"><span>娱乐向趣味自测</span><span>本地计算</span><span>不收集身份信息</span></div>' + (count && authorized() ? '<div class="resume"><span>上次的梦境 · 已答 ' + count + '/' + QUIZ_SIZE + ' 题</span><button class="text-button" id="resume">' + (complete() ? '查看结果' : '继续作答') + '</button></div>' : '') + '</section>';
    const start = document.getElementById('start');
    if (start) start.onclick = () => {
      if (state && count && !complete() && !window.confirm('开始新测试会清除当前答题进度，确定继续吗？')) return;
      state = { picked: window.DreamPick(QUIZ_SIZE).map(q => q.id), answers: {}, index: 0 };
      if (save()) go(authorized() ? 'prepare' : 'auth');
    };
    const resume = document.getElementById('resume');
    if (resume) resume.onclick = () => go(complete() ? 'result' : 'quiz');
  }
  function auth() {
    app.innerHTML = top('梦境鉴定') + '<section><h1 class="page-heading">入梦，<br>需要一张门票。</h1><p class="intro">输入订单中的授权码，就可以开始鉴定了。</p><form id="auth-form" class="panel" novalidate><label for="code-input" class="auth-label">你的专属授权码</label><input class="code-input" id="code-input" name="code" placeholder="EMO-XXXX-XXXX" maxlength="14" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="auth-error code-help"><p id="auth-error" class="error" role="alert"></p><button class="button primary" type="submit">开始测试 →</button><p class="helper" id="code-help">授权码在你的小红书订单消息中查看。<br>英文字母大小写均可，请保留中间的短横线。</p></form><div class="note">题目没有标准答案，选"更像自己会做的事"那一项。<br>梦境越离谱，选择越真实。<br>答案仅保存在当前浏览器会话中，关闭标签页后可能清除。</div></section>';
    document.getElementById('auth-form').onsubmit = event => {
      event.preventDefault();
      const input = document.getElementById('code-input');
      const code = input.value.trim().toUpperCase();
      const error = document.getElementById('auth-error');
      if (!validateCode(code)) { error.textContent = '授权码无效或格式错误'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      if (!write(authKey, code)) { error.textContent = '无法保存授权状态，请允许会话存储后重试。'; return; }
      input.removeAttribute('aria-invalid');
      go('prepare');
    };
  }
  function loading(isResult) {
    app.innerHTML = '<section class="loading" role="status"><div class="loading-orbit" aria-hidden="true"></div><h1>' + (isResult ? '正在解读你的潜意识…' : '正在潜入你的梦境…') + '</h1><p>' + (isResult ? '梦不会说谎，它只是爱绕弯。' : '放轻松，跟着第一直觉走。') + '</p></section>';
    timer = setTimeout(() => go(isResult ? 'result' : 'quiz'), 1000);
  }
  function quiz() {
    const list = questions();
    const q = list[state.index];
    const count = list.filter(answered).length;
    app.innerHTML = top('梦境鉴定') + '<div class="progress-head"><span>梦境鉴定 · 跟着直觉选</span><span>' + count + ' / ' + list.length + '</span></div><div class="progress-track" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="' + list.length + '" aria-valuenow="' + count + '"><div class="progress-fill" style="width:' + (count / list.length * 100) + '%"></div></div><section class="question-section"><span class="question-number">DREAM ' + String(state.index + 1).padStart(2, '0') + '</span><h1 class="question-title">' + escape(q.title) + '</h1><div role="group" aria-label="选出更像你会做的事">' + q.options.map(o => '<button class="option" data-option="' + o.key + '" aria-pressed="' + (state.answers[q.id] === o.key) + '"><span class="option-key">' + o.key + '</span><span>' + escape(o.text) + '</span></button>').join('') + '</div><div class="question-nav"><button class="back" id="previous" ' + (state.index === 0 ? 'disabled' : '') + '>← 上一题</button><button class="button primary" id="next" ' + (!answered(q) ? 'disabled' : '') + '>' + (state.index === list.length - 1 ? '生成报告' : '下一题 →') + '</button></div><p class="quiet">每轮随机抽题 · 已选答案自动保存 · 可以返回修改<br>选择后自动进入下一题，最后一题请点击"生成报告"</p></section>';
    app.querySelectorAll('[data-option]').forEach(button => button.onclick = () => {
      state.answers[q.id] = button.dataset.option;
      if (state.index < list.length - 1) {
        state.index++;
        if (save()) { quiz(); focusPage(); bindHome(); }
        return;
      }
      if (!save()) return;
      app.querySelectorAll('[data-option]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      document.getElementById('next').disabled = false;
      const updatedCount = list.filter(answered).length;
      app.querySelector('.progress-head span:last-child').textContent = updatedCount + ' / ' + list.length;
      app.querySelector('[role=progressbar]').setAttribute('aria-valuenow', updatedCount);
      app.querySelector('.progress-fill').style.width = updatedCount / list.length * 100 + '%';
    });
    document.getElementById('previous').onclick = () => { state.index--; if (save()) { quiz(); focusPage(); bindHome(); } };
    document.getElementById('next').onclick = () => {
      if (!answered(q)) return;
      if (state.index === list.length - 1) { go('calculating'); return; }
      state.index++;
      if (save()) { quiz(); focusPage(); bindHome(); }
    };
  }
  function profileIcon(index) {
    const paths = [
      '<path d="M3 13h4l3-7 4 13 3-7h4"/>',
      '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/>',
      '<path d="M4 18V7a2 2 0 0 1 2-2h5l2 3h5a2 2 0 0 1 2 2v8H4ZM8 12h8M8 15h5"/>'
    ];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths[index % paths.length] + '</svg>';
  }
  function profileEvidence(evidence) {
    if (!evidence.length) return '';
    return '<details class="profile-evidence"><summary>查看实际梦境与回答依据（' + evidence.length + ' 条）</summary><ul>' + evidence.map(item => '<li><p>' + escape(item.title) + '</p><p class="evidence-answer">你的选择：' + escape(item.answer) + '</p></li>').join('') + '</ul></details>';
  }
  function profileChart(dimensions) {
    const point = (index, score) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
      return [250 + Math.cos(angle) * 120 * score / 100, 170 + Math.sin(angle) * 120 * score / 100];
    };
    const coords = (index, score) => point(index, score).map(n => n.toFixed(2)).join(',');
    const chartDescription = dimensions.map(d => d.label + '：浓度 ' + d.score + '（命中 ' + d.count + '/' + d.total + '）').join('；') + '。中心为0，外圈为100，越向外该人格浓度越高。';
    const background = '<polygon class="radar-background" points="' + dimensions.map((_, i) => coords(i, 100)).join(' ') + '"/>';
    const grid = [20, 40, 60, 80, 100].map(score => '<polygon class="radar-grid" points="' + dimensions.map((_, i) => coords(i, score)).join(' ') + '"/>').join('');
    const axes = dimensions.map((_, i) => '<line class="radar-axis" x1="250" y1="170" x2="' + point(i, 100)[0].toFixed(2) + '" y2="' + point(i, 100)[1].toFixed(2) + '"/>').join('');
    const area = '<polygon class="radar-area" points="' + dimensions.map((d, i) => coords(i, d.score)).join(' ') + '"/>';
    const dots = dimensions.map((d, i) => '<circle class="radar-dot" cx="' + point(i, d.score)[0].toFixed(2) + '" cy="' + point(i, d.score)[1].toFixed(2) + '" r="4.5"/>').join('');
    const textPositions = [[250, 26, 'middle'], [376, 136, 'start'], [325, 297, 'start'], [175, 297, 'end'], [124, 136, 'end']];
    const text = dimensions.map((d, i) => '<text class="radar-label" text-anchor="' + textPositions[i][2] + '" x="' + textPositions[i][0] + '" y="' + textPositions[i][1] + '">' + escape(d.short) + '(' + escape(d.score) + '%)</text>').join('');
    const note = '中心为 0，外圈为 100；越向外，该隐藏人格浓度越高。';
    const icons = [
      '<path d="M3 8c3-6 6 6 9 0s6 6 9 0M3 16c3-6 6 6 9 0s6 6 9 0"/>',
      '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
      '<path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/>',
      '<path d="M4 9a8 8 0 1 1 1 9M4 3v6h6"/>',
      '<path d="M12 3v18M5 6h14M8 21h8M5 6l-3 7h6L5 6ZM19 6l-3 7h6l-3-7Z"/>'
    ];
    const scoreCards = dimensions.map((d, i) => '<article class="profile-score-card"><h3><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + icons[i] + '</svg>' + escape(d.short) + '</h3><div class="profile-score-row"><div class="profile-score-track" role="meter" aria-label="' + escape(d.label) + '浓度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + escape(d.score) + '"><span style="width:' + escape(d.score) + '%"></span></div><strong class="profile-score-value">' + escape(d.score) + '%</strong></div><p class="profile-score-count">命中 ' + escape(d.count) + '/' + escape(d.total) + ' 题</p></article>').join('');
    return '<figure class="profile-radar"><svg viewBox="0 0 500 330" role="img" aria-labelledby="profile-radar-title profile-radar-desc"><title id="profile-radar-title">隐藏人格五维图谱</title><desc id="profile-radar-desc">' + escape(chartDescription) + '</desc>' + background + grid + axes + area + dots + text + '</svg><figcaption>' + escape(note) + '</figcaption></figure><div class="profile-score-grid">' + scoreCards + '</div>';
  }
  function renderProfile(profile) {
    const dimensions = profile.dimensions;
    const type = profile.type;
    const dimensionCards = dimensions.map(d => '<article class="profile-dimension"><div class="profile-dimension-heading"><h3>' + escape(d.label) + '</h3><span><strong>' + escape(d.score) + '</strong><small> %</small> · ' + escape(d.level) + '</span></div><p>' + escape(d.description) + '</p><p class="profile-count">命中 ' + escape(d.count) + ' / ' + escape(d.total) + ' 道梦境题的回答</p>' + profileEvidence(d.evidence) + '</article>').join('');
    const replayItems = profile.replay.map(item => '<li><span class="replay-index">' + String(item.order + 1).padStart(2, '0') + '</span><div><p class="replay-q">' + escape(item.title) + '</p><p class="replay-a">你选择了：' + escape(item.answer) + '<em> → ' + escape(item.typeLabel) + ' +1</em></p></div></li>').join('');
    return '<section class="profile-section profile-map" aria-labelledby="profile-chart-heading"><h2 id="profile-chart-heading">隐藏人格图谱<span>' + escape(profile.modeLabel) + ' · 五型浓度</span></h2>' + profileChart(dimensions) + '<p class="profile-map-note">浓度＝该人格选项的命中比例（命中票数÷10）。分数仅为本轮答题指标，不是人群百分位，也不是诊断。</p></section>' +
      '<section class="profile-section profile-type" aria-labelledby="profile-type-heading"><p class="eyebrow">YOUR HIDDEN ARCHETYPE</p><h2 id="profile-type-heading">你的隐藏人格</h2><h3 class="profile-type-name">' + escape(type.name) + '</h3><p class="profile-type-en">' + escape(type.en) + '</p><p class="profile-type-tagline">' + escape(type.tagline) + '</p><p class="profile-type-description">' + escape(type.description) + '</p><p class="profile-type-scene">' + escape(type.scene) + '</p><ul class="profile-type-tags" aria-label="人格标签">' + type.tags.map(tag => '<li>' + escape(tag) + '</li>').join('') + '</ul><dl class="profile-fields"><dt>为什么是这个人格</dt><dd>' + escape(type.reason) + '</dd><dt>镜像人格</dt><dd>' + escape(type.shadow) + '</dd><dt>给你的小提示</dt><dd>' + escape(type.tip) + '</dd><dt>人格编号</dt><dd>' + escape(type.id) + '</dd></dl><p class="profile-type-note">这是本轮随机梦境题目的趣味画像，不是固定人格，也不是心理诊断。</p></section>' +
      '<section class="profile-section" aria-labelledby="profile-dimensions-heading"><h2 id="profile-dimensions-heading">五型浓度解读与回答依据</h2><div class="profile-dimensions">' + dimensionCards + '</div><div class="profile-summary"><h3>把这些线索放在一起</h3><p>' + escape(profile.summary) + '</p></div><details class="profile-method"><summary>这些结果是怎样得出的？</summary><div class="profile-method-text">' + escape(profile.method) + '</div></details></section>' +
      '<section class="profile-section" aria-labelledby="profile-replay-heading"><p class="eyebrow">DREAM REPLAY</p><h2 id="profile-replay-heading">梦境回放 · 十道选择</h2><p class="profile-lead">回看你在本轮梦境里走过的每条岔路——每一票，都是潜意识投的。</p><ol class="replay-list">' + replayItems + '</ol></section>';
  }
  function result() {
    report = { profile: DreamProfile.analyze(questions(), state.answers) };
    app.innerHTML = renderProfile(report.profile) +
      '<div class="result-actions"><button class="button primary" id="save-poster">保存我的隐藏人格海报 ↓</button><button class="button" id="restart">再测一次（重新抽题）</button></div><p class="error" id="poster-error" role="alert"></p><p class="quiet">本轮十题为随机抽取，再测一次会进入新的梦境，结果可能不同。<br>潜意识也是流动的，别给自己贴死标签。</p>';
    document.getElementById('restart').onclick = () => go('home');
    document.getElementById('save-poster').onclick = savePoster;
  }
  async function savePoster() {
    if (!authorized()) { go('auth'); return; }
    const button = document.getElementById('save-poster');
    const error = document.getElementById('poster-error');
    button.disabled = true;
    button.textContent = '正在绘制结果图片…';
    error.textContent = '';
    try {
      const blob = await DreamPoster.create(report);
      if (!button.isConnected || !authorized()) return;
      if (posterURL) URL.revokeObjectURL(posterURL);
      posterURL = URL.createObjectURL(blob);
      document.getElementById('poster-image').src = posterURL;
      document.getElementById('poster-download').href = posterURL;
      document.getElementById('poster-dialog').showModal();
    } catch (_) { error.textContent = '图片生成失败，请重试；也可以使用手机截屏保存。'; }
    finally { button.disabled = false; button.textContent = '保存我的隐藏人格海报 ↓'; }
  }
  function focusPage() { app.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  function bindHome() { app.querySelectorAll('[data-home]').forEach(button => button.onclick = () => go('home')); }
  function render() {
    clearTimeout(timer);
    let route = location.hash.slice(1) || 'home';
    if (!['home', 'auth', 'prepare', 'quiz', 'calculating', 'result'].includes(route)) route = 'home';
    document.querySelector('.site-header').hidden = route === 'result';
    if (!storageOK) { app.innerHTML = '<div class="notice storage-error">此浏览器暂不支持会话存储，请允许网站存储后刷新，或换用系统浏览器打开。</div>'; return; }
    if (['prepare', 'quiz', 'calculating', 'result'].includes(route) && !authorized()) { go('auth'); return; }
    if (['prepare', 'quiz', 'calculating', 'result'].includes(route) && !state) { route = 'home'; }
    if (['calculating', 'result'].includes(route) && !complete()) {
      state.index = questions().findIndex(q => !answered(q));
      if (state.index === -1) state.index = QUIZ_SIZE - 1;
      if (save()) go('quiz');
      return;
    }
    if (route === 'home') home();
    else if (route === 'auth') auth();
    else if (route === 'prepare') loading(false);
    else if (route === 'calculating') loading(true);
    else if (route === 'quiz') quiz();
    else result();
    bindHome();
    focusPage();
  }
  document.getElementById('close-poster').onclick = () => document.getElementById('poster-dialog').close();
  window.addEventListener('hashchange', render);
  // 从浏览器历史缓存恢复时，重新检查授权而不是使用旧页面。
  window.addEventListener('pageshow', event => { if (event.persisted) render(); });
  render();
}());
