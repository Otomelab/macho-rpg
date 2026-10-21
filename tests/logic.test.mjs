import assert from "node:assert/strict";
import test from "node:test";
import { allTemplates } from "../js/content.js";
import { narrate } from "../js/content.js";
import {
  activeQuests,
  addDays,
  applyWorkout,
  bossDamage,
  cleanName,
  computeStreak,
  dailyQuestIds,
  freshState,
  gainFor,
  openingKind,
  stageOf,
  streakMult,
  totalLevel,
  workoutGain,
  xpNeed,
} from "../js/logic.js";

const day = "2026-10-21";
const rng0 = () => 0;

test("default name and cleanup", () => {
  assert.equal(freshState().name, "由衣さん");
  assert.equal(cleanName("  "), "由衣さん");
  assert.equal(cleanName(" あゆみ "), "あゆみ");
  assert.equal(cleanName("あ".repeat(40)).length, 16);
});

test("more reps give more experience, zero gives none", () => {
  const ex = { id: "squat", w: { power: 1, stamina: 1, mind: 1 } };
  assert.deepEqual(gainFor(ex, 0), { power: 0, stamina: 0, mind: 0 });
  assert.ok(gainFor(ex, 10).power > gainFor(ex, 1).power);
  assert.ok(gainFor(ex, 30).power > gainFor(ex, 10).power);
  const one = workoutGain(ex, 10, 1, 1);
  const two = workoutGain(ex, 10, 2, 1);
  assert.equal(two.power, one.power * 2);
});

test("early stop still grants experience and praise", () => {
  const r = applyWorkout(freshState(), { exId: "squat", count: 4, sets: 1, early: true }, { today: day });
  assert.equal(r.events[0].type, "early");
  assert.ok(r.gain.power > 0);
  assert.equal(r.state.history.length, 1);
  const said = narrate(r.events, { you: "由衣さん", recent: [], rng: rng0 });
  assert.ok(said.lines.some((l) => l.text.includes("偉い")));
});

test("zero reps do not scold and do not record", () => {
  const start = freshState();
  const r = applyWorkout(start, { exId: "squat", count: 0, early: true }, { today: day });
  assert.equal(r.events[0].type, "zero");
  assert.equal(r.state.history.length, 0);
  assert.equal(start.history.length, 0);
  const said = narrate(r.events, { you: "由衣さん", recent: [], rng: rng0 });
  assert.equal(said.lines.length, 1);
  assert.ok(!said.lines[0].text.includes("ダメ"));
});

test("pain still counts", () => {
  const r = applyWorkout(freshState(), { exId: "plank", count: 15, pain: true }, { today: day });
  assert.equal(r.events[0].type, "pain");
  assert.ok(r.gain.stamina > 0);
});

test("first set, personal best, and level", () => {
  const first = applyWorkout(freshState(), { exId: "squat", count: 10, sets: 1 }, { today: day });
  assert.equal(first.events[0].type, "first");
  assert.ok(first.state.stats.power.level >= 1);
  const second = applyWorkout(first.state, { exId: "squat", count: 16, sets: 1 }, { today: day });
  assert.ok(second.events.some((e) => e.type === "pb"));
});

test("streak breaks, then 3 and 7 and 30 celebrate once", () => {
  let state = freshState();
  const days = [];
  for (let i = 0; i < 30; i++) days.push(addDays("2026-09-01", i));
  const hits = [];
  for (const d of days) {
    const r = applyWorkout(state, { exId: "wall", count: 5 }, { today: d });
    state = r.state;
    for (const e of r.events) if (e.type === "streak") hits.push(e.n);
  }
  assert.deepEqual(hits, [3, 7, 30]);
  assert.equal(computeStreak(state.days, days.at(-1)), 30);
  assert.ok(streakMult(30) > streakMult(7));
  assert.ok(streakMult(7) > streakMult(3));
  assert.equal(streakMult(1), 1);

  const later = addDays(days.at(-1), 3);
  assert.equal(computeStreak(state.days, later), 0);
  state.introDone = true;
  assert.equal(openingKind(state, later), "comeback");
  const again = applyWorkout(state, { exId: "wall", count: 5 }, { today: later });
  assert.equal(again.streak, 1);
  assert.equal(again.state.streakCelebrated, 0);
  assert.ok(!again.events.some((e) => e.type === "streak"));
});

test("quests are stable, unique, and claim once", () => {
  const a = dailyQuestIds(day);
  const b = dailyQuestIds(day);
  assert.deepEqual(a, b);
  assert.equal(new Set(a).size, 3);
  const other = dailyQuestIds(addDays(day, 1));
  assert.equal(other.length, 3);

  const start = activeQuests(freshState(), day);
  assert.equal(start[0].id, "tut-squat");
  assert.equal(start.length, 3);

  const done = applyWorkout(freshState(), { exId: "squat", count: 10 }, { today: day });
  assert.equal(done.state.tutorialDone, true);
  assert.ok(done.events.some((e) => e.type === "quest"));
  const again = applyWorkout(done.state, { exId: "squat", count: 1 }, { today: day });
  assert.ok(!again.events.some((e) => e.type === "quest" && e.quests.some((q) => q.id === "tut-squat")));
});

test("boss damage sticks when you stop, and a clear happens", () => {
  let state = freshState();
  const once = applyWorkout(state, { exId: "squat", count: 12, bossId: "shoulder" }, { today: day });
  state = once.state;
  const left = state.bosses.shoulder.hpLeft;
  assert.ok(left < 150);
  assert.equal(state.bosses.shoulder.cleared, false);
  assert.ok(once.events.some((e) => e.type === "hit"));
  const stopped = JSON.parse(JSON.stringify(state));
  assert.equal(stopped.bosses.shoulder.hpLeft, left);

  let guard = 0;
  while (!state.bosses.shoulder?.cleared && guard < 20) {
    const r = applyWorkout(state, { exId: "squat", count: 20, sets: 3, bossId: "shoulder" }, { today: day });
    state = r.state;
    guard += 1;
  }
  assert.equal(state.bosses.shoulder.cleared, true);
  assert.equal(state.bosses.shoulder.hpLeft, 0);
  const after = applyWorkout(state, { exId: "squat", count: 10, bossId: "shoulder" }, { today: day });
  assert.ok(!after.events.some((e) => e.type === "win" || e.type === "hit"));

  const locked = applyWorkout(freshState(), { exId: "plank", count: 20, bossId: "slime" }, { today: day });
  assert.equal(locked.state.bosses.slime, undefined);
  assert.ok(bossDamage({ favor: "stamina", recommend: ["plank"] }, { power: 1, stamina: 10, mind: 1 }, { id: "plank" }, { stamina: { level: 2 } }) > 1);
});

test("body stage advances and xp carries over", () => {
  assert.equal(stageOf(3).id, "start");
  assert.equal(stageOf(6).name, "体が動き出した");
  assert.equal(stageOf(52).name, "高瀬さん公認マッチョ");
  assert.equal(xpNeed(1), 16);
  let state = freshState();
  let guard = 0;
  while (totalLevel(state) < 6 && guard < 30) {
    state = applyWorkout(state, { exId: "pushup", count: 12 }, { today: addDays(day, guard) }).state;
    guard += 1;
  }
  assert.ok(totalLevel(state) >= 6);
  assert.notEqual(stageOf(totalLevel(state)).id, "start");
});

test("takase lines never scold", () => {
  const bad = ["サボ", "怠け", "情けない", "ダメ", "ふざけ", "怒", "根性出せ", "弱いね", "なんでできない"];
  for (const line of allTemplates()) {
    for (const word of bad) assert.ok(!line.text.includes(word), `${word} in ${line.text}`);
  }
  const exprs = new Set(allTemplates().map((l) => l.expr));
  for (const id of ["neutral", "smile", "hype", "surprise", "shy", "worried", "fun", "pout", "admire", "soft"]) {
    assert.ok(exprs.has(id), id);
  }
});
