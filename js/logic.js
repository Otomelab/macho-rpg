import {
  BOSSES,
  EXERCISES,
  QUESTS,
  STATS,
  STAGES,
  TUTORIAL,
} from "./content.js";

export { STATS };

const EX_BY_ID = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
const BOSS_BY_ID = Object.fromEntries(BOSSES.map((b) => [b.id, b]));
const QUEST_BY_ID = Object.fromEntries([TUTORIAL, ...QUESTS].map((q) => [q.id, q]));

export const STREAK_BONUS = {
  3: { power: 0, stamina: 0, mind: 12 },
  7: { power: 8, stamina: 0, mind: 24 },
  30: { power: 20, stamina: 20, mind: 40 },
};

export function freshState() {
  return {
    v: 1,
    name: "由衣さん",
    stats: {
      power: { level: 1, xp: 0 },
      stamina: { level: 1, xp: 0 },
      mind: { level: 1, xp: 0 },
    },
    days: [],
    history: [],
    bosses: {},
    best: {},
    questClaimed: {},
    recentLines: [],
    streakCelebrated: 0,
    tutorialDone: false,
    introDone: false,
    closedOn: "",
  };
}

export function cleanName(name) {
  const t = String(name ?? "").trim().slice(0, 16);
  return t || "由衣さん";
}

export function normalize(raw) {
  const s = raw && typeof raw === "object" ? raw : {};
  const stats = {};
  for (const k of STATS) {
    const lv = Number(s.stats?.[k]?.level);
    const xp = Number(s.stats?.[k]?.xp);
    stats[k] = {
      level: Number.isFinite(lv) ? Math.min(99, Math.max(1, Math.floor(lv))) : 1,
      xp: Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0,
    };
  }
  const days = Array.isArray(s.days)
    ? [...new Set(s.days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort()
    : [];
  const history = Array.isArray(s.history)
    ? s.history.filter((h) => h && h.ex && h.day).slice(0, 300)
    : [];
  return {
    v: 1,
    name: cleanName(s.name),
    stats,
    days,
    history,
    bosses: s.bosses && typeof s.bosses === "object" ? { ...s.bosses } : {},
    best: s.best && typeof s.best === "object" ? { ...s.best } : {},
    questClaimed: s.questClaimed && typeof s.questClaimed === "object" ? { ...s.questClaimed } : {},
    recentLines: Array.isArray(s.recentLines) ? s.recentLines.slice(0, 40) : [],
    streakCelebrated: [0, 3, 7, 30].includes(s.streakCelebrated) ? s.streakCelebrated : 0,
    tutorialDone: !!s.tutorialDone,
    introDone: !!s.introDone,
    closedOn: typeof s.closedOn === "string" ? s.closedOn : "",
  };
}

export function todayString(date = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
}

export function parseDay(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s, n) {
  const d = parseDay(s);
  d.setDate(d.getDate() + n);
  return todayString(d);
}

export function dayDiff(a, b) {
  return Math.round((parseDay(b) - parseDay(a)) / 86400000);
}

export function formatJa(day) {
  const [, m, d] = day.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

export function clampCount(n) {
  const x = Math.floor(Number(n));
  if (!Number.isFinite(x) || x <= 0) return 0;
  return Math.min(999, x);
}

export function clampSets(n) {
  const x = Math.floor(Number(n));
  if (!Number.isFinite(x) || x <= 0) return 1;
  return Math.min(10, x);
}

export function blankGain() {
  return { power: 0, stamina: 0, mind: 0 };
}

export function xpNeed(level) {
  return 16 + (level - 1) * 14;
}

export function addXp(level, xp, gain) {
  let l = Math.min(99, Math.max(1, level));
  let x = Math.max(0, xp) + Math.max(0, Math.floor(gain));
  let ups = 0;
  while (l < 99 && x >= xpNeed(l)) {
    x -= xpNeed(l);
    l += 1;
    ups += 1;
  }
  if (l >= 99) {
    l = 99;
    x = Math.min(x, xpNeed(99));
  }
  return { level: l, xp: x, ups };
}

export function totalLevel(state) {
  return STATS.reduce((sum, k) => sum + state.stats[k].level, 0);
}

export function stageOf(total) {
  let cur = STAGES[0];
  for (const s of STAGES) if (total >= s.min) cur = s;
  return cur;
}

export function stageProgress(total) {
  const cur = stageOf(total);
  const i = STAGES.findIndex((s) => s.id === cur.id);
  const next = STAGES[i + 1] || null;
  if (!next) return { cur, next: null, ratio: 1, remain: 0 };
  const span = next.min - cur.min;
  return {
    cur,
    next,
    ratio: Math.min(1, Math.max(0, (total - cur.min) / span)),
    remain: next.min - total,
  };
}

export function streakMult(streak) {
  if (streak >= 30) return 1.3;
  if (streak >= 7) return 1.15;
  if (streak >= 3) return 1.08;
  return 1;
}

export function computeStreak(days, today) {
  const set = new Set(days);
  let n = 0;
  let d = today;
  if (!set.has(d)) d = addDays(d, -1);
  while (set.has(d)) {
    n += 1;
    d = addDays(d, -1);
  }
  return n;
}

export function gainFor(ex, count) {
  const n = clampCount(count);
  const g = blankGain();
  if (n <= 0) return g;
  const vol = Math.pow(n, 0.72);
  for (const k of STATS) g[k] = Math.min(250, Math.round(ex.w[k] * vol * 3.2));
  return g;
}

export function workoutGain(ex, count, sets, mult = 1) {
  const one = gainFor(ex, count);
  const s = clampSets(sets);
  const g = blankGain();
  for (const k of STATS) g[k] = Math.min(180, Math.round(one[k] * s * mult));
  return g;
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailyQuestIds(day, pool = QUESTS, n = 3) {
  const ids = [];
  let x = hashString(`quest:${day}`);
  let steps = 0;
  while (ids.length < n && steps < pool.length * 6) {
    steps += 1;
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    const id = pool[x % pool.length].id;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function activeQuests(state, today) {
  const daily = dailyQuestIds(today).map((id) => QUEST_BY_ID[id]);
  if (!state.tutorialDone) return [TUTORIAL, daily[0], daily[1]];
  return daily;
}

export function summarizeDay(state, today) {
  const counts = {};
  let sets = 0;
  let volume = 0;
  const kinds = new Set();
  for (const h of state.history) {
    if (h.day !== today) continue;
    const c = (h.count || 0) * (h.sets || 1);
    counts[h.ex] = (counts[h.ex] || 0) + c;
    sets += h.sets || 1;
    volume += c;
    kinds.add(h.ex);
  }
  return { counts, sets, volume, kinds: [...kinds] };
}

export function noteStreak(state, today) {
  const prev = state.days.filter((d) => d < today).sort();
  const last = prev.at(-1) || null;
  let celebrated = state.streakCelebrated || 0;
  const broken = !last || dayDiff(last, today) > 1;
  if (broken) celebrated = 0;
  const days = state.days.includes(today) ? state.days : [...state.days, today];
  const streak = computeStreak(days, today);
  let hit = null;
  for (const m of [3, 7, 30]) {
    if (streak >= m && celebrated < m) hit = m;
  }
  if (hit) celebrated = hit;
  return { streak, celebrated, hit, broken };
}

export function openingKind(state, today) {
  if (!state.introDone) return "intro";
  const last = [...state.days].sort().at(-1) || null;
  if (last && last !== today && dayDiff(last, today) >= 2) return "comeback";
  return "hello";
}

export function bossUnlocked(state, boss) {
  if (!boss) return false;
  if (boss.order === 1) return true;
  const prev = BOSSES.find((b) => b.order === boss.order - 1);
  return !!state.bosses[prev.id]?.cleared;
}

export function bossDamage(boss, gain, ex, stats) {
  let dmg = gain.power + gain.stamina + gain.mind;
  if (boss.favor && gain[boss.favor] != null) {
    dmg += Math.round(gain[boss.favor] * 0.35);
    dmg += (stats[boss.favor]?.level || 1) * 2;
  }
  if (boss.recommend?.includes(ex.id)) dmg = Math.round(dmg * 1.15);
  return Math.max(1, dmg);
}

function addBucket(bucket, extra) {
  for (const k of STATS) bucket[k] += extra[k] || 0;
}

function claimQuests(next, today, bucket) {
  const hits = [];
  let guard = 0;
  while (guard < 3) {
    guard += 1;
    const summary = summarizeDay(next, today);
    const quests = activeQuests(next, today);
    const claimed = new Set(next.questClaimed[today] || []);
    let changed = false;
    for (const q of quests) {
      if (claimed.has(q.id) || !q.check(summary)) continue;
      claimed.add(q.id);
      addBucket(bucket, q.reward);
      hits.push(q);
      if (q.id === TUTORIAL.id) next.tutorialDone = true;
      changed = true;
    }
    next.questClaimed[today] = [...claimed];
    if (!changed) break;
  }
  return hits;
}

function applyBucket(next, bucket) {
  const ups = {};
  for (const k of STATS) {
    const r = addXp(next.stats[k].level, next.stats[k].xp, bucket[k]);
    next.stats[k] = { level: r.level, xp: r.xp };
    if (r.ups > 0) ups[k] = r.level;
  }
  return ups;
}

export function settleQuests(state, today) {
  const next = normalize(structuredClone(state));
  const before = stageOf(totalLevel(next)).id;
  const bucket = blankGain();
  const hits = claimQuests(next, today, bucket);
  if (!hits.length) return { state: next, events: [] };
  const ups = applyBucket(next, bucket);
  const events = [];
  if (Object.keys(ups).length) events.push({ type: "level", ups });
  const stage = stageOf(totalLevel(next));
  if (stage.id !== before) events.push({ type: "stage", stage });
  events.push({ type: "quest", quests: hits });
  return { state: next, events };
}

export function applyWorkout(state, input, ctx) {
  const today = ctx?.today;
  const ex = EX_BY_ID[input?.exId];
  const base = normalize(structuredClone(state));
  if (!ex || !/^\d{4}-\d{2}-\d{2}$/.test(today || "")) {
    return { state: base, events: [], gain: blankGain(), streak: computeStreak(base.days, today || "1970-01-01") };
  }

  const count = clampCount(input.count);
  const sets = clampSets(input.sets ?? 1);
  if (count <= 0) {
    return {
      state: base,
      events: [{ type: input.pain ? "pain" : "zero", count: 0, sets: 1, gain: blankGain() }],
      gain: blankGain(),
      streak: computeStreak(base.days, today),
    };
  }

  const next = base;
  const beforeStage = stageOf(totalLevel(next)).id;
  const hadHistory = next.history.length > 0;
  const bestBefore = next.best[ex.id] || 0;
  const beforeStats = structuredClone(next.stats);
  const streakInfo = noteStreak(next, today);
  const gain = workoutGain(ex, count, sets, streakMult(streakInfo.streak));
  const bucket = { ...gain };

  if (streakInfo.hit) addBucket(bucket, STREAK_BONUS[streakInfo.hit]);
  if (streakInfo.hit || streakInfo.broken) next.streakCelebrated = streakInfo.celebrated;

  if (!next.days.includes(today)) next.days.push(today);
  next.days.sort();
  next.history.unshift({
    day: today,
    t: ctx.now || 0,
    ex: ex.id,
    count,
    sets,
    early: !!input.early,
    pain: !!input.pain,
  });
  next.history = next.history.slice(0, 300);
  if (count > bestBefore) next.best[ex.id] = count;

  const questHits = claimQuests(next, today, bucket);

  let bossResult = null;
  if (input.bossId) {
    const boss = BOSS_BY_ID[input.bossId];
    if (boss && bossUnlocked(next, boss)) {
      const rec = { hpLeft: boss.hp, cleared: false, ...(next.bosses[boss.id] || {}) };
      if (rec.hpLeft <= 0) rec.cleared = true;
      if (!rec.cleared) {
        const dmg = bossDamage(boss, gain, ex, beforeStats);
        rec.hpLeft = Math.max(0, rec.hpLeft - dmg);
        if (rec.hpLeft === 0) {
          rec.cleared = true;
          bucket[boss.favor] += 30;
          if (boss.favor !== "mind") bucket.mind += 12;
          bossResult = { type: "win", boss, dmg };
        } else {
          bossResult = { type: "hit", boss, dmg, hpLeft: rec.hpLeft };
        }
        next.bosses[boss.id] = rec;
      }
    }
  }

  const ups = applyBucket(next, bucket);
  const events = [];
  const payload = { ex, count, sets, gain: bucket };
  if (input.pain) events.push({ type: "pain", ...payload });
  else if (input.early) events.push({ type: "early", ...payload });
  else if (!hadHistory) events.push({ type: "first", ...payload });
  else events.push({ type: "set", ...payload });

  if (count > bestBefore && bestBefore > 0) events.push({ type: "pb", ex, n: count - bestBefore, count });
  if (streakInfo.hit) events.push({ type: "streak", n: streakInfo.hit });
  if (Object.keys(ups).length) events.push({ type: "level", ups });
  const stage = stageOf(totalLevel(next));
  if (stage.id !== beforeStage) events.push({ type: "stage", stage });
  if (questHits.length) events.push({ type: "quest", quests: questHits });
  if (bossResult) events.push(bossResult);

  return { state: next, events, gain: bucket, streak: streakInfo.streak };
}

export function exerciseById(id) {
  return EX_BY_ID[id] || null;
}

export function bossById(id) {
  return BOSS_BY_ID[id] || null;
}

export { BOSSES, EXERCISES, QUESTS, TUTORIAL };
