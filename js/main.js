import {
  BOSSES,
  EXERCISES,
  FACES,
  STAT_LABEL,
  cueFor,
  narrate,
  narrateClose,
  narrateOpening,
} from "./content.js";
import {
  activeQuests,
  addDays,
  applyWorkout,
  bossById,
  bossUnlocked,
  cleanName,
  computeStreak,
  exerciseById,
  formatJa,
  freshState,
  normalize,
  openingKind,
  settleQuests,
  stageProgress,
  summarizeDay,
  todayString,
  totalLevel,
  xpNeed,
  STATS,
} from "./logic.js";

const SAVE_KEY = "machoRpg.v1";
const GREET_KEY = "machoRpg.greet";
const HOLD_MS = 1600;

const $ = (id) => document.getElementById(id);

let state = load() || freshState();
let ui = { view: "home", ex: "squat", mode: "count", count: 0, bossId: null };
let queue = [];
let current = null;
let lineShownAt = 0;
let timerId = 0;
let confirmAction = null;

const layers = [$("faceA"), $("faceB")];
let front = 0;
let currentExpr = "smile";
let lastSwitch = 0;
let pendingTimer = 0;
let pendingExpr = null;

for (const src of Object.values(FACES)) {
  const img = new Image();
  img.src = src;
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function crossfade(expr) {
  const src = FACES[expr] || FACES.smile;
  if (expr === currentExpr && layers[front].getAttribute("src") === src) return;
  const back = layers[1 - front];
  const go = () => {
    back.classList.add("on");
    layers[front].classList.remove("on");
    front = 1 - front;
    currentExpr = expr;
    lastSwitch = performance.now();
  };
  if (back.getAttribute("src") !== src) {
    back.src = src;
    if (back.decode) back.decode().then(go, go);
    else go();
  } else go();
}

function setExpr(expr) {
  clearTimeout(pendingTimer);
  pendingExpr = null;
  if (!expr || !FACES[expr]) expr = "smile";
  if (expr === currentExpr) return;
  const since = performance.now() - lastSwitch;
  if (since >= HOLD_MS || lastSwitch === 0) crossfade(expr);
  else {
    pendingExpr = expr;
    pendingTimer = setTimeout(() => {
      if (pendingExpr && pendingExpr !== currentExpr) crossfade(pendingExpr);
      pendingExpr = null;
    }, HOLD_MS - since);
  }
}

function paintNext() {
  $("nextLine").hidden = queue.length === 0;
}

function showLine(line) {
  current = line;
  lineShownAt = performance.now();
  setExpr(line.expr || "smile");
  $("bubble").textContent = line.text;
  if (line.intro && queue.length === 0) {
    state.introDone = true;
    save();
  }
  paintNext();
}

function present(lines) {
  if (!lines?.length) return;
  // いま起きたことの最初の一文はすぐ出す。表情だけは短時間に連打しない。
  const [first, ...rest] = lines;
  queue = [...rest, ...queue].slice(0, 8);
  showLine(first);
}

function nextLine() {
  if (!queue.length) return;
  showLine(queue.shift());
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = 0;
}

function speak(lines) {
  present(lines);
  save();
  renderAll();
}

function applyAndTalk(input) {
  stopTimer();
  const result = applyWorkout(state, { bossId: ui.bossId || undefined, ...input }, {
    today: todayString(),
    now: Date.now(),
  });
  state = result.state;
  const said = narrate(result.events, {
    you: state.name,
    recent: state.recentLines,
    rng: Math.random,
  });
  state.recentLines = said.recent;
  if ((input.count || 0) > 0) ui.count = 0;
  if (result.events.some((e) => e.type === "win")) {
    ui.bossId = null;
    ui.view = "boss";
  }
  speak(said.lines);
}

function commitEntry({ early = false, pain = false, fromForm = false } = {}) {
  let count = ui.count;
  let sets = 1;
  if (fromForm) {
    count = Number($("reps")?.value);
    sets = Number($("sets")?.value || 1);
    if ($("earlyFlag")?.checked) early = true;
  }
  applyAndTalk({
    exId: ui.ex,
    count,
    sets,
    early: early && !pain,
    pain,
  });
}

function closeShop() {
  const today = todayString();
  const trained = summarizeDay(state, today).sets > 0;
  const second = state.closedOn === today;
  const said = narrateClose(trained, second, state, Math.random);
  state.recentLines = said.recent;
  state.closedOn = today;
  speak(said.lines);
}

function startFight(id) {
  const boss = bossById(id);
  if (!boss || !bossUnlocked(state, boss)) return;
  ui.bossId = id;
  ui.view = "train";
  const rec = state.bosses[id];
  const full = !rec || rec.hpLeft === boss.hp;
  const line = full
    ? { expr: "fun", text: boss.intro }
    : { expr: "smile", text: `${state.name}、続きからっす。${boss.name}は残り${rec.hpLeft}。焦らなくて大丈夫っすよ` };
  present([line]);
  renderAll();
}

function saveName() {
  const name = cleanName($("nameInput")?.value);
  const changed = name !== state.name;
  state.name = name;
  save();
  renderAll();
  if (changed) present([{ expr: "smile", text: `${name}、了解っす。そう呼びますね` }]);
}

function ask(text, onYes) {
  confirmAction = onYes;
  $("modalText").textContent = text;
  $("modal").hidden = false;
}

function showTitle() {
  stopTimer();
  $("play").hidden = true;
  $("title").hidden = false;
  $("nameField").value = state.name || "由衣さん";
  const saved = !!localStorage.getItem(SAVE_KEY);
  $("continue").hidden = !saved;
  $("start").classList.toggle("primary", !saved);
  $("start").classList.toggle("ghost", saved);
  $("start").textContent = saved ? "はじめから" : "はじめる";
}

function beginPlay() {
  $("title").hidden = true;
  $("play").hidden = false;
  ui.view = "home";
  ui.bossId = null;
  const today = todayString();
  const settled = settleQuests(state, today);
  state = settled.state;
  const kind = openingKind(state, today);
  const greetKey = `${today}:${kind}`;
  if (kind !== "intro" && sessionStorage.getItem(GREET_KEY) === greetKey) {
    const text = sessionStorage.getItem(`${GREET_KEY}.text`) || `${state.name}、今日もいきましょう`;
    showLine({ expr: "smile", text });
  } else {
    const said = narrateOpening(kind, state, Math.random);
    state.recentLines = said.recent;
    if (kind !== "intro") {
      sessionStorage.setItem(GREET_KEY, greetKey);
      sessionStorage.setItem(`${GREET_KEY}.text`, said.lines[0].text);
    }
    present(said.lines, { force: true });
  }
  if (settled.events.length) {
    const extra = narrate(settled.events, { you: state.name, recent: state.recentLines, rng: Math.random });
    state.recentLines = extra.recent;
    queue.push(...extra.lines);
    paintNext();
  }
  save();
  renderAll();
}

function startNew() {
  const name = cleanName($("nameField").value);
  const go = () => {
    state = freshState();
    state.name = name;
    ui = { view: "home", ex: "squat", mode: "count", count: 0, bossId: null };
    queue = [];
    current = null;
    sessionStorage.removeItem(GREET_KEY);
    sessionStorage.removeItem(`${GREET_KEY}.text`);
    save();
    beginPlay();
  };
  if (localStorage.getItem(SAVE_KEY)) {
    ask("いまの記録を消して、新しいサロン通いを始めますか？", go);
  } else go();
}

function resetAll() {
  ask("記録を消して、最初からにしますか？ 消しても、誰にも責められません。", () => {
    localStorage.removeItem(SAVE_KEY);
    sessionStorage.removeItem(GREET_KEY);
    state = freshState();
    ui = { view: "home", ex: "squat", mode: "count", count: 0, bossId: null };
    queue = [];
    current = null;
    showTitle();
  });
}

function go(view) {
  stopTimer();
  ui.view = view;
  ui.bossId = view === "train" ? ui.bossId : null;
  if (view !== "train") ui.bossId = null;
  renderAll();
}

function renderHeader() {
  const prog = stageProgress(totalLevel(state));
  const streak = computeStreak(state.days, todayString());
  $("who").textContent = state.name;
  $("stageName").textContent = prog.cur.name;
  $("streak").textContent = streak > 0 ? `連続${streak}日` : "連続は今日から";
}

function renderStrip() {
  $("strip").innerHTML = STATS.map((k) => {
    const st = state.stats[k];
    const ratio = Math.min(1, st.xp / xpNeed(st.level));
    return `<div class="stat stat-${k}"><div class="stat-top"><span>${STAT_LABEL[k]}</span><b>Lv${st.level}</b></div><div class="bar"><span style="width:${(ratio * 100).toFixed(1)}%"></span></div></div>`;
  }).join("");
}

function homeHtml() {
  const today = todayString();
  const prog = stageProgress(totalLevel(state));
  const sum = summarizeDay(state, today);
  const quests = activeQuests(state, today);
  const claimed = new Set(state.questClaimed[today] || []);
  const streak = computeStreak(state.days, today);
  const nextMark = [3, 7, 30].find((n) => streak < n);
  const questLis = quests.map((q) => {
    const cur = Math.min(q.max, q.progress(sum));
    const done = claimed.has(q.id);
    return `<li class="${done ? "done" : ""}"><span>${esc(q.name)}</span><b>${done ? "達成" : `${cur}/${q.max}`}</b></li>`;
  }).join("");
  const stageNote = prog.next
    ? `次は「${esc(prog.next.name)}」。合計レベルがあと ${prog.remain}`
    : "高瀬さん公認。ここが、いまの頂点っす";
  const todayNote = sum.sets
    ? `今日 ${sum.sets}セット、ボリューム ${sum.volume}`
    : "今日のセットは、まだないっす";
  const streakNote = streak === 0
    ? "連続は、今日の1回から。3日でごほうび"
    : nextMark
      ? `連続${streak}日。次のごほうびは${nextMark}日`
      : `連続${streak}日。30日まで届いてます`;
  return `
    <section class="card">
      <div class="stat-top"><h2>${esc(prog.cur.name)}</h2><span>${formatJa(today)}</span></div>
      <p class="muted">${stageNote}</p>
      <div class="bar thick"><span style="width:${(prog.ratio * 100).toFixed(1)}%"></span></div>
      <p class="muted">${todayNote}。${streakNote}</p>
      <ul class="quest-mini">${questLis}</ul>
    </section>
    <div class="actions">
      <button type="button" class="primary" data-action="go" data-view="train">トレーニングする</button>
      <div class="row">
        <button type="button" data-action="go" data-view="boss">ボスに挑む</button>
        <button type="button" class="ghost" data-action="close-shop">今日はここまで</button>
      </div>
    </div>`;
}

function countControls(ex) {
  const verb = ui.bossId ? "このセットで攻撃" : "セットを記録";
  const timerLabel = timerId ? "計測ストップ" : "秒を計測";
  const seconds = ex.unit === "秒"
    ? `<div class="row"><button type="button" data-action="timer">${timerLabel}</button></div>`
    : "";
  return `
    <div class="count" id="countNum">${ui.count}</div>
    <button type="button" class="primary" data-action="add" data-n="1">+1${esc(ex.unit)}</button>
    <div class="row" style="margin-top:8px">
      <button type="button" class="primary" data-action="commit">${verb}</button>
      <button type="button" class="ghost" data-action="early">今日はここまで</button>
    </div>
    <div class="row" style="margin-top:8px">
      <button type="button" data-action="add" data-n="5">+5</button>
      <button type="button" data-action="add" data-n="10">+10</button>
      <button type="button" data-action="undo">戻す</button>
      <button type="button" class="ghost warn" data-action="pain">痛み</button>
    </div>
    ${seconds}`;
}

function formControls() {
  const verb = ui.bossId ? "この記録で攻撃" : "記録する";
  return `
    <label class="field">回数・秒数
      <input id="reps" type="number" min="0" max="999" inputmode="numeric" placeholder="10">
    </label>
    <label class="field">セット数
      <input id="sets" type="number" min="1" max="10" inputmode="numeric" value="1">
    </label>
    <label class="check"><input id="earlyFlag" type="checkbox"> 予定より早くやめた（それでも記録する）</label>
    <div class="actions">
      <button type="button" class="primary" data-action="commit-form">${verb}</button>
      <button type="button" class="ghost warn" data-action="pain-form">痛みが出たので、この回数でやめる</button>
    </div>`;
}

function trainHtml() {
  const today = todayString();
  const ex = exerciseById(ui.ex) || EXERCISES[0];
  const boss = ui.bossId ? bossById(ui.bossId) : null;
  const rec = boss ? state.bosses[boss.id] : null;
  const hpLeft = rec ? rec.hpLeft : boss?.hp;
  const best = state.best[ex.id];
  const bossCard = boss ? `
    <section class="card boss-banner">
      <h2>${esc(boss.name)}</h2>
      <p class="muted">${esc(boss.subtitle)} ・ 残り ${hpLeft}</p>
      <div class="bar thick hp"><span style="width:${Math.max(0, (hpLeft / boss.hp) * 100).toFixed(1)}%"></span></div>
    </section>` : "";
  const grid = EXERCISES.map((item) => `
    <button type="button" class="ex ${item.id === ex.id ? "on" : ""}" data-action="pick-ex" data-ex="${item.id}">
      <b>${esc(item.name)}</b><small>${esc(item.part)}</small>
    </button>`).join("");
  return `
    ${bossCard}
    <div class="ex-row">${grid}</div>
    <section class="card">
      <h2>${esc(ex.name)}</h2>
      <p class="muted">${esc(cueFor(ex, today))}。${esc(ex.hint)}${best ? ` / 自己ベスト ${best}${esc(ex.unit)}` : ""}</p>
      <div class="seg">
        <button type="button" data-action="mode" data-mode="count" class="${ui.mode === "count" ? "on" : ""}">数えながら</button>
        <button type="button" data-action="mode" data-mode="form" class="${ui.mode === "form" ? "on" : ""}">まとめて記録</button>
      </div>
      ${ui.mode === "count" ? countControls(ex) : formControls()}
    </section>
    <p class="safety">実際に動いた数を入れてください。痛みや違和感が出たら、そこでやめて大丈夫です。</p>`;
}

function questHtml() {
  const today = todayString();
  const sum = summarizeDay(state, today);
  const claimed = new Set(state.questClaimed[today] || []);
  const cards = activeQuests(state, today).map((q) => {
    const cur = Math.min(q.max, q.progress(sum));
    const done = claimed.has(q.id);
    const rewards = Object.entries(q.reward).filter(([, n]) => n > 0).map(([k, n]) => `${STAT_LABEL[k]}+${n}`).join(" ");
    return `<section class="card ${done ? "cleared" : ""}">
      <h2>${esc(q.name)}</h2>
      <p>${esc(q.detail)}</p>
      <div class="bar thick"><span style="width:${(cur / q.max * 100).toFixed(1)}%"></span></div>
      <p class="muted">${done ? "達成。報酬は入ってます" : `${cur} / ${q.max} ・ 報酬 ${esc(rewards)}`}</p>
    </section>`;
  }).join("");
  return `<p class="muted">日付が変わると、依頼は入れ替わります。達成すると高瀬さんが報告を受けて、経験値を乗せます。</p>${cards}`;
}

function bossHtml() {
  return BOSSES.map((b) => {
    const open = bossUnlocked(state, b);
    const rec = state.bosses[b.id];
    const cleared = !!rec?.cleared;
    const hpLeft = rec ? rec.hpLeft : b.hp;
    if (!open) {
      return `<article class="card locked"><h2>${esc(b.name)}</h2><p class="muted">${esc(b.subtitle)}</p><p>前の相手をクリアすると、出ます。今の相手を一緒に終わらせてからでいいっす。</p></article>`;
    }
    return `<article class="card ${cleared ? "cleared" : ""}">
      <h2>${esc(b.name)}</h2>
      <p class="muted">${esc(b.subtitle)}</p>
      <div class="bar thick hp"><span style="width:${cleared ? 0 : (hpLeft / b.hp * 100).toFixed(1)}%"></span></div>
      <p>${cleared ? "クリア済み。よくやりました" : `残り ${hpLeft}`}</p>
      <p>${esc(b.blurb)}</p>
      ${cleared ? "" : `<button type="button" class="primary" data-action="fight" data-boss="${b.id}">挑む</button>`}
    </article>`;
  }).join("");
}

function logHtml() {
  const today = todayString();
  const dots = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    dots.push(`<i class="${state.days.includes(d) ? "on" : ""}" title="${d}"></i>`);
  }
  const rows = state.history.slice(0, 20).map((h) => {
    const ex = exerciseById(h.ex);
    const name = ex ? ex.name : h.ex;
    const unit = ex ? ex.unit : "";
    const mark = h.pain ? "（痛みで中止）" : h.early ? "（途中）" : "";
    const sets = h.sets > 1 ? `×${h.sets}` : "";
    return `<li><span>${formatJa(h.day)} ${esc(name)}</span><b>${h.count}${esc(unit)}${sets}${mark}</b></li>`;
  }).join("");
  return `
    <section class="card profile">
      <img src="assets/takase_main.png" alt="高瀬航の全身" width="1024" height="1536">
      <div>
        <h2>高瀬 航</h2>
        <p class="muted">たかせ わたる・32歳</p>
        <p>雑居ビル3階のプライベートサロンで、トレーニングを見ている。入会金も月額の縛りもなく、支払いは都度払い。チャコールのポロ。右の頬に、浅いえくぼ。一人称は「俺」。呼ばれ方は「高瀬さん」。</p>
      </div>
    </section>
    <section class="card">
      <h2>呼び名</h2>
      <p class="muted">初期値は由衣さん。空にすると、由衣さんに戻ります。</p>
      <label class="field">呼び名
        <input id="nameInput" maxlength="16" value="${esc(state.name)}" autocomplete="off">
      </label>
      <button type="button" class="primary" data-action="save-name">呼び名を保存</button>
    </section>
    <section class="card">
      <h2>この14日</h2>
      <div class="cal">${dots.join("")}</div>
    </section>
    <section class="card">
      <h2>最近の記録</h2>
      ${rows ? `<ul class="hist">${rows}</ul>` : "<p>まだ記録はないっす。最初の1回が、一番えらい。</p>"}
    </section>
    <button type="button" class="ghost danger" data-action="reset">記録を消してはじめる</button>`;
}

function renderPanel() {
  const html = {
    home: homeHtml,
    train: trainHtml,
    quest: questHtml,
    boss: bossHtml,
    log: logHtml,
  }[ui.view] || homeHtml;
  $("panel").innerHTML = html();
  $("play").classList.toggle("mode-train", ui.view === "train");
}

function renderNav() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    const on = ui.bossId ? btn.dataset.nav === "boss" : btn.dataset.nav === ui.view;
    btn.classList.toggle("active", on);
    if (on) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
}

function renderAll() {
  renderHeader();
  renderStrip();
  renderPanel();
  renderNav();
}

function onClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "start") startNew();
  else if (action === "continue") beginPlay();
  else if (action === "go" || action === "nav") go(btn.dataset.view || btn.dataset.nav);
  else if (action === "pick-ex") {
    ui.ex = btn.dataset.ex;
    renderPanel();
  } else if (action === "mode") {
    ui.mode = btn.dataset.mode;
    renderPanel();
  } else if (action === "add") {
    ui.count = Math.min(999, ui.count + Number(btn.dataset.n || 1));
    const num = $("countNum");
    if (num) num.textContent = String(ui.count);
  } else if (action === "undo") {
    ui.count = Math.max(0, ui.count - 1);
    const num = $("countNum");
    if (num) num.textContent = String(ui.count);
  } else if (action === "timer") {
    if (timerId) stopTimer();
    else {
      timerId = setInterval(() => {
        ui.count = Math.min(999, ui.count + 1);
        const num = $("countNum");
        if (num) num.textContent = String(ui.count);
      }, 1000);
    }
    renderPanel();
  } else if (action === "commit") commitEntry({ fromForm: false });
  else if (action === "commit-form") commitEntry({ fromForm: true });
  else if (action === "early") commitEntry({ early: true });
  else if (action === "pain") commitEntry({ pain: true });
  else if (action === "pain-form") commitEntry({ pain: true, fromForm: true });
  else if (action === "close-shop") closeShop();
  else if (action === "fight") startFight(btn.dataset.boss);
  else if (action === "save-name") saveName();
  else if (action === "reset") resetAll();
  else if (action === "next") nextLine();
  else if (action === "yes") {
    $("modal").hidden = true;
    const fn = confirmAction;
    confirmAction = null;
    fn?.();
  } else if (action === "no") {
    $("modal").hidden = true;
    confirmAction = null;
  }
}

document.body.addEventListener("click", onClick);
$("speech").addEventListener("click", (e) => {
  if (e.target.closest("button")) return;
  if (queue.length) nextLine();
});

if (location.protocol === "file:") {
  const note = document.createElement("p");
  note.className = "banner";
  note.textContent = "フォルダを直接開くと動きません。python3 -m http.server で開くか、GitHub Pages のURLを使ってください。";
  document.body.prepend(note);
}

showTitle();
