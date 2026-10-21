// 高瀬さんの口調と、サロンの設定。
// 非公開の slot-096 は読んでいない。ここにある文章は、公開されている高瀬航の設定
// （プライベートサロン、都度払い、褒め方）をこのゲーム用に書き起こしたもの。

export const STATS = ["power", "stamina", "mind"];

export const STAT_LABEL = {
  power: "筋力",
  stamina: "体力",
  mind: "メンタル",
};

export const EXERCISES = [
  {
    id: "squat",
    name: "スクワット",
    unit: "回",
    part: "脚・体幹",
    hint: "目安 10回×3。少なくても記録になります",
    w: { power: 1.05, stamina: 0.7, mind: 0.25 },
    cues: ["膝とつま先、同じ向きで", "お尻を後ろに引いて、背中まっすぐ", "息を吐きながら沈む"],
  },
  {
    id: "pushup",
    name: "腕立て",
    unit: "回",
    part: "胸・腕",
    hint: "目安 8回×3。膝をついても、ちゃんとした1回です",
    w: { power: 1.2, stamina: 0.4, mind: 0.3 },
    cues: ["体は一直線", "胸から床に近づける", "肘、開きすぎないで"],
  },
  {
    id: "plank",
    name: "プランク",
    unit: "秒",
    part: "体幹",
    hint: "目安 20〜30秒。呼吸は止めない",
    w: { power: 0.35, stamina: 1.15, mind: 0.55 },
    cues: ["お尻、上がりすぎてないっすよ", "お腹に力を入れて", "呼吸は止めない"],
  },
  {
    id: "crunch",
    name: "腹筋",
    unit: "回",
    part: "お腹",
    hint: "目安 12回×3。反動はいらないっす",
    w: { power: 0.75, stamina: 0.45, mind: 0.4 },
    cues: ["おへそを覗き込む感じで", "反動は使わずに", "息を吐きながら上がる"],
  },
  {
    id: "lunge",
    name: "ランジ",
    unit: "回",
    part: "脚",
    hint: "目安 左右あわせて10回。ふらついたら壁に手を",
    w: { power: 0.9, stamina: 0.85, mind: 0.3 },
    cues: ["前の膝はつま先より前に出しすぎない", "上体は起こしたまま", "一歩分の幅で、ゆっくり"],
  },
  {
    id: "bridge",
    name: "ヒップリフト",
    unit: "回",
    part: "裏腿・お尻",
    hint: "目安 12回×3。上で一呼吸",
    w: { power: 0.85, stamina: 0.4, mind: 0.35 },
    cues: ["かかとで床を押す", "上でお尻を締めすぎない、一呼吸", "腰を反らない"],
  },
  {
    id: "superman",
    name: "背筋",
    unit: "回",
    part: "背中",
    hint: "目安 10回。うつ伏せで、手足を少し浮かせる",
    w: { power: 0.8, stamina: 0.4, mind: 0.5 },
    cues: ["首は反らず、視線は床", "手足は力みすぎない", "下ろすときもゆっくり"],
  },
  {
    id: "jack",
    name: "ジャンピングジャック",
    unit: "回",
    part: "全身",
    hint: "目安 20回。ジャンプが厳しければ、足踏みでも",
    w: { power: 0.35, stamina: 1.1, mind: 0.3 },
    cues: ["着地は静かっす", "膝を軽く柔らかく", "腕は耳の横まででいい"],
  },
  {
    id: "wall",
    name: "壁腕立て",
    unit: "回",
    part: "胸・腕",
    hint: "目安 10回。壁から一歩下がるほど効きます",
    w: { power: 0.9, stamina: 0.35, mind: 0.4 },
    cues: ["手は肩の高さ", "かかとから頭まで一直線", "肘を曲げて、胸を壁に近づける"],
  },
];

export const TUTORIAL = {
  id: "tut-squat",
  name: "まずはスクワットを10回",
  detail: "最初の依頼。1セットでも、分けても、合計10回で届きます",
  max: 10,
  progress: (s) => s.counts.squat || 0,
  check: (s) => (s.counts.squat || 0) >= 10,
  reward: { power: 10, stamina: 0, mind: 14 },
};

export const QUESTS = [
  {
    id: "sq15",
    name: "スクワットを15回",
    detail: "合計15回。セットは分けていいっす",
    max: 15,
    progress: (s) => s.counts.squat || 0,
    check: (s) => (s.counts.squat || 0) >= 15,
    reward: { power: 16, stamina: 6, mind: 8 },
  },
  {
    id: "pu10",
    name: "腕立てを10回",
    detail: "膝つきでも壁でも、腕立ての仲間です",
    max: 10,
    progress: (s) => (s.counts.pushup || 0) + (s.counts.wall || 0),
    check: (s) => (s.counts.pushup || 0) + (s.counts.wall || 0) >= 10,
    reward: { power: 16, stamina: 0, mind: 8 },
  },
  {
    id: "pl30",
    name: "プランクを30秒",
    detail: "一気でも、10秒を3回でも",
    max: 30,
    progress: (s) => s.counts.plank || 0,
    check: (s) => (s.counts.plank || 0) >= 30,
    reward: { power: 0, stamina: 16, mind: 10 },
  },
  {
    id: "cr15",
    name: "腹筋を15回",
    detail: "反動なしで、合計15回",
    max: 15,
    progress: (s) => s.counts.crunch || 0,
    check: (s) => (s.counts.crunch || 0) >= 15,
    reward: { power: 12, stamina: 0, mind: 10 },
  },
  {
    id: "lg12",
    name: "ランジを12回",
    detail: "左右あわせて12回でいいっす",
    max: 12,
    progress: (s) => s.counts.lunge || 0,
    check: (s) => (s.counts.lunge || 0) >= 12,
    reward: { power: 12, stamina: 12, mind: 6 },
  },
  {
    id: "kinds3",
    name: "3種目やる",
    detail: "今日のなかで、違う動きを3つ",
    max: 3,
    progress: (s) => s.kinds.length,
    check: (s) => s.kinds.length >= 3,
    reward: { power: 6, stamina: 6, mind: 18 },
  },
  {
    id: "vol40",
    name: "ボリュームを40まで",
    detail: "回数と秒数の合計が40",
    max: 40,
    progress: (s) => s.volume,
    check: (s) => s.volume >= 40,
    reward: { power: 8, stamina: 14, mind: 8 },
  },
  {
    id: "br12",
    name: "ヒップリフトを12回",
    detail: "上で止められたら、それも上手い",
    max: 12,
    progress: (s) => s.counts.bridge || 0,
    check: (s) => (s.counts.bridge || 0) >= 12,
    reward: { power: 14, stamina: 0, mind: 8 },
  },
  {
    id: "su10",
    name: "背筋を10回",
    detail: "首を反らさないのが上手さです",
    max: 10,
    progress: (s) => s.counts.superman || 0,
    check: (s) => (s.counts.superman || 0) >= 10,
    reward: { power: 12, stamina: 0, mind: 12 },
  },
  {
    id: "jk30",
    name: "ジャンピングジャックを30回",
    detail: "足踏みに変えても、30の数で届きます",
    max: 30,
    progress: (s) => s.counts.jack || 0,
    check: (s) => (s.counts.jack || 0) >= 30,
    reward: { power: 0, stamina: 18, mind: 8 },
  },
  {
    id: "sets2",
    name: "2セット記録する",
    detail: "種目は同じでも、違っても",
    max: 2,
    progress: (s) => s.sets,
    check: (s) => s.sets >= 2,
    reward: { power: 6, stamina: 6, mind: 14 },
  },
  {
    id: "wa8",
    name: "壁腕立てを8回",
    detail: "今日は壁で十分、立派なトレーニングっす",
    max: 8,
    progress: (s) => s.counts.wall || 0,
    check: (s) => (s.counts.wall || 0) >= 8,
    reward: { power: 12, stamina: 0, mind: 12 },
  },
];

export const BOSSES = [
  {
    id: "shoulder",
    order: 1,
    name: "肩こりデーモン",
    subtitle: "デスクの呪い",
    hp: 150,
    favor: "power",
    recommend: ["squat", "superman", "wall"],
    intro: "今日の相手は、肩こりデーモンっす。デスクの呪いって名前を付けただけ。下半身から、一緒にほどきましょう",
    blurb: "長いデスクワークが、肩に居座ったイメージっす。スクワットと背筋がよく効きます",
  },
  {
    id: "slime",
    order: 2,
    name: "重力スライム",
    subtitle: "床に吸い付くやつ",
    hp: 200,
    favor: "stamina",
    recommend: ["plank", "jack"],
    intro: "重力スライムっす。体を一本の線にして、プランクで引き剥がしましょう",
    blurb: "体幹と息が長いほど、よく削れます。秒数も、ちゃんと攻撃です",
  },
  {
    id: "golem",
    order: 3,
    name: "巻き肩ゴーレム",
    subtitle: "丸まった背中",
    hp: 240,
    favor: "power",
    recommend: ["pushup", "wall", "superman"],
    intro: "巻き肩ゴーレムっす。胸を開く動きで、前に押し出しましょう",
    blurb: "腕立て、壁腕立て、背筋。肩甲骨が動くと、こいつは弱い",
  },
  {
    id: "wyvern",
    order: 4,
    name: "三日坊主ワイバーン",
    subtitle: "続かない気持ち",
    hp: 280,
    favor: "mind",
    recommend: ["squat", "plank", "jack", "wall"],
    intro: "三日坊主ワイバーンっす。でも今日フロアにいる時点で、半分勝ってるっすよ",
    blurb: "どの種目でも削れます。来たこと、続けたことが、そのまま攻撃力です",
  },
  {
    id: "stairs",
    order: 5,
    name: "階段の番人",
    subtitle: "何階でも足が重い",
    hp: 340,
    favor: "stamina",
    recommend: ["lunge", "squat"],
    intro: "階段の番人っす。ランジとスクワットで、一段ずつ上がりましょう",
    blurb: "脚のセットがよく効きます。休みながらでいいっす",
  },
  {
    id: "night",
    order: 6,
    name: "深夜の疲労霊",
    subtitle: "残業のあと",
    hp: 400,
    favor: "stamina",
    recommend: ["jack", "plank", "crunch"],
    intro: "深夜の疲労霊っす。残業のあとに来たなら、それだけで十分えらい。軽くいきましょう",
    blurb: "息が上がる動きと、体幹。短く刻んでいいっす",
  },
  {
    id: "mirror",
    order: 7,
    name: "鏡の中の昔の自分",
    subtitle: "比べなくていい相手",
    hp: 480,
    favor: "mind",
    recommend: ["squat", "pushup", "plank", "bridge"],
    intro: "比べる相手は、昨日の自分だけでいいっす。鏡の中は、もう過去っすよ",
    blurb: "メンタルが乗る相手です。どのセットも、昔の自分への一歩になります",
  },
  {
    id: "closing",
    order: 8,
    name: "店じまい前の大魔神",
    subtitle: "最後の試験",
    hp: 600,
    favor: "power",
    recommend: ["squat", "pushup", "lunge", "plank"],
    intro: "最後の試験っす。終わったら、ちゃんと店じまいしましょう。俺がついてます",
    blurb: "高瀬さんの最終クエスト。大きなセットほどよく削れます。分けても、勝ちです",
  },
];

export const STAGES = [
  { id: "start", min: 3, name: "これから", expr: "smile", line: "ここからっす。{you}の体は、今日から変わり始めます" },
  { id: "awake", min: 6, name: "体が動き出した", expr: "fun", line: "{you}、体が動き出してますよ。最初の変化は自分では気づきにくいけど、俺は見てます" },
  { id: "posture", min: 9, name: "姿勢が変わってきた", expr: "smile", line: "姿勢、前より楽になってません？ 首の位置、きれいになってきてますよ" },
  { id: "bud", min: 12, name: "筋肉の芽", expr: "fun", line: "筋肉の芽、出てますよ。ここからが、楽しいところっす" },
  { id: "tone", min: 16, name: "引き締まってきた", expr: "admire", line: "引き締まってきましたね。服のライン、変わってきてるんじゃないっすか" },
  { id: "line", min: 21, name: "筋肉の輪郭", expr: "smile", line: "輪郭が出てきました。フォームがきれいだから、狙ったところに乗ってます" },
  { id: "solid", min: 27, name: "がっしりしてきた", expr: "fun", line: "がっしりしてきましたね。肩の感じ、昨日より頼もしいっす" },
  { id: "change", min: 34, name: "見違える体", expr: "surprise", line: "見違えるっすよ。通い始めた頃の{you}に、今の姿を見せてあげたい" },
  { id: "cand", min: 42, name: "マッチョ候補", expr: "hype", line: "もうマッチョ候補っす。胸を張っていい。キレてる！" },
  { id: "macho", min: 52, name: "高瀬さん公認マッチョ", expr: "soft", line: "公認っす。{you}は、もうマッチョです。俺が保証します" },
];

const L = (text, expr) => ({ text, expr });

export const INTRO = [
  L("あ、いらっしゃい。{you}ですね？ どうぞ、上がってください", "fun"),
  L("高瀬航です。雑居ビルの3階、入会金も月額もなしのサロンっす。気楽にやりましょう", "smile"),
  L("デスクワーク、続いてますよね。今日からマッチョへのクエストっす。俺がちゃんと見ますから", "smile"),
];

export const HELLO = [
  L("{you}、待ってましたよ。今日もいきましょう", "fun"),
  L("{you}、来てくれてうれしいっす。自分のペースで大丈夫っすよ", "smile"),
  L("お疲れさまっす。フロア、空いてますよ", "smile"),
  L("今日もよろしくお願いします。フォームは俺が見ます", "neutral"),
  L("{you}、デスクのあとでも来てくれた。それだけで十分っす", "soft"),
];

export const COMEBACK = [
  L("{you}、おかえりなさい。待ってましたよ", "fun"),
  L("おかえりっす。空いた日のことは気にしなくて大丈夫。今日からまた一緒にやりましょう", "smile"),
  L("久しぶりっすね。戻ってきてくれたのが、一番えらいっす", "soft"),
  L("また来てくれましたね。体も喜んでますよ", "fun"),
];

export const SET_END = [
  L("{you}、今のセットよかったっすよ。ほんとに", "smile"),
  L("フォーム、きれいっすよ。見とれそうになりました", "admire"),
  L("ナイスっす。最後まで丁寧でしたよ", "smile"),
  L("呼吸、止まってないっす。それ、地味にすごい", "neutral"),
  L("ペース、崩れてないっす。さすがっす", "fun"),
  L("{you}、ちゃんとやりきるところ、好きっすよ。トレーナーとして", "smile"),
  L("最後の数回、粘れてたの見てましたよ", "admire"),
  L("その真剣な顔、かっこいいっすよ", "shy"),
  L("いい汗っすね。ちゃんと効いてる証拠っす", "fun"),
  L("文句なしっす。少し休んで、また一緒にいきましょう", "smile"),
];

export const FIRST_SET = [
  L("最初の1セットっす。来てくれて、動いてくれて、それが一番すごいっす", "fun"),
  L("{you}、はじめの一歩、きれいに出ましたよ", "smile"),
];

export const EARLY = [
  L("今日やっただけで偉いっすよ", "soft"),
  L("{you}、今日やっただけで偉い。続きはまた今度でいいっす", "smile"),
  L("途中まででも、今日やっただけで偉いっすよ。ちゃんと残ってます", "soft"),
  L("体の声を聞いて止めた。それも偉いっす。今日やった分は、無駄じゃない", "smile"),
  L("ゼロじゃないっす。今日やっただけで偉い。俺はそう思います", "soft"),
  L("無理しないの、正解っす。今日やっただけで偉いっすよ", "smile"),
];

export const ZERO = [
  L("了解っす。今日は休む日にしましょう", "smile"),
  L("やろうと思えただけで十分っす。またいつでも", "soft"),
  L("休むのもトレーニングのうちっす。ちょっとだけ、さみしい顔しときますね。また来てくれたら、その分褒めます", "pout"),
  L("大丈夫っすよ。フロアは、明日もあさっても開いてます", "worried"),
];

export const PAIN = [
  L("痛みが出たら、そこまでっす。体の声を聞けるの、大事な力っすよ", "worried"),
  L("よく止めました。痛いのを我慢するのは、トレーニングじゃないっす", "worried"),
  L("{you}、やめた判断、正しいっす。冷やして、無理なら次でいい", "soft"),
];

export const PB = [
  L("自己ベストっすよ。前回より{n}{unit}多い。{you}、ちょっと強くなりすぎじゃないっすか", "surprise"),
  L("記録更新っす。+{n}{unit}。前の自分、超えましたね", "surprise"),
  L("ちょっと待って、ベスト更新っす。+{n}{unit}、ちゃんと強くなってますよ", "fun"),
];

export const CALLS = [
  L("キレてる！", "hype"),
  L("肩にでっかい重機乗せてんのかい！", "hype"),
  L("仕上がってる！", "hype"),
  L("脚、仕上がってますよ！", "hype"),
];

export const SESSION_END = [
  L("今日はこれで店じまいっす。{you}、水分たくさん取って、湯船に浸かってくださいね", "soft"),
  L("店じまいっす。今日の{you}、ちゃんと見てましたよ。ゆっくり休んでください", "smile"),
  L("お疲れさまっす。今日はこれで店じまい。続けてる自分を、ちゃんと褒めてあげてくださいね", "fun"),
  L("やりきった顔、いいっすね。店じまいなんで、あとは体をいたわってください", "shy"),
];

export const STREAK_LINES = {
  3: [
    L("3日連続っす。いい流れ、できてますよ", "fun"),
    L("3日続きましたね。習慣の芽、出てますよ", "smile"),
  ],
  7: [
    L("1週間連続っす。これはほんとにすごいっすよ", "fun"),
    L("7日連続。もう立派な習慣っすね", "surprise"),
  ],
  30: [
    L("30日連続っす。肩にでっかい重機乗せてんのかい、ってくらい誇っていいっすよ", "hype"),
    L("1か月連続。{you}、ほんとにかっこいいっす。俺、ちょっと感動してます", "shy"),
  ],
};

export const FACES = {
  neutral: "assets/expressions/takase/01_真顔.png",
  smile: "assets/expressions/takase/02_笑顔.png",
  hype: "assets/expressions/takase/03_怒り.png",
  surprise: "assets/expressions/takase/04_驚き.png",
  shy: "assets/expressions/takase/05_照れ.png",
  worried: "assets/expressions/takase/06_困り.png",
  fun: "assets/expressions/takase/07_楽しみ.png",
  pout: "assets/expressions/takase/08_不機嫌.png",
  admire: "assets/expressions/takase/09_色気.png",
  soft: "assets/expressions/takase/10_甘え.png",
};

export const FACE_ORDER = Object.keys(FACES);

export function allTemplates() {
  const lists = [INTRO, HELLO, COMEBACK, SET_END, FIRST_SET, EARLY, ZERO, PAIN, PB, CALLS, SESSION_END];
  for (const n of [3, 7, 30]) lists.push(STREAK_LINES[n]);
  lists.push(STAGES.map((s) => L(s.line, s.expr)));
  lists.push(BOSSES.map((b) => L(b.intro, "fun")));
  return lists.flat();
}

export function fill(text, vars = {}) {
  return String(text)
    .replaceAll("{you}", vars.you || "由衣さん")
    .replaceAll("{ex}", vars.ex || "")
    .replaceAll("{n}", vars.n ?? "")
    .replaceAll("{unit}", vars.unit || "")
    .replaceAll("{stat}", vars.stat || "")
    .replaceAll("{boss}", vars.boss || "")
    .replaceAll("{quest}", vars.quest || "")
    .replaceAll("{hp}", vars.hp ?? "");
}

export function pickFrom(pool, recent, rng) {
  const used = new Set(recent || []);
  const fresh = pool.filter((line) => !used.has(line.text));
  const src = fresh.length ? fresh : pool;
  const line = src[Math.floor(rng() * src.length) % src.length];
  const nextRecent = [line.text, ...(recent || []).filter((t) => t !== line.text)].slice(0, 36);
  return { line, recent: nextRecent };
}

function detail(ev) {
  const { ex, count, sets, gain } = ev;
  const what = sets > 1 ? `${ex.name} ${count}${ex.unit}×${sets}セット` : `${ex.name} ${count}${ex.unit}`;
  const parts = STATS.filter((k) => gain[k] > 0).map((k) => `${STAT_LABEL[k]}+${gain[k]}`);
  if (!parts.length) return what;
  return `${what}で、${parts.join("、")}っす`;
}

function withDetail(text, ev) {
  return `${String(text).replace(/。$/u, "")}。${detail(ev)}`;
}

export function narrateOpening(kind, state, rng = Math.random) {
  const you = state.name || "由衣さん";
  if (kind === "intro") {
    return {
      lines: INTRO.map((line) => ({ expr: line.expr, text: fill(line.text, { you }), intro: true })),
      recent: state.recentLines || [],
    };
  }
  const pool = kind === "comeback" ? COMEBACK : HELLO;
  const picked = pickFrom(pool, state.recentLines || [], rng);
  return {
    lines: [{ expr: picked.line.expr, text: fill(picked.line.text, { you }) }],
    recent: picked.recent,
  };
}

export function narrateClose(trained, second, state, rng = Math.random) {
  const you = state.name || "由衣さん";
  if (second) {
    return {
      lines: [{ expr: "smile", text: fill("もう店じまいっす。{you}、ゆっくり休んでくださいね", { you }) }],
      recent: state.recentLines || [],
    };
  }
  if (!trained) {
    const picked = pickFrom(ZERO, state.recentLines || [], rng);
    return {
      lines: [{ expr: picked.line.expr, text: fill(picked.line.text, { you }) }],
      recent: picked.recent,
    };
  }
  const picked = pickFrom(SESSION_END, state.recentLines || [], rng);
  return {
    lines: [{ expr: picked.line.expr, text: fill(picked.line.text, { you }) }],
    recent: picked.recent,
  };
}

export function narrate(events, ctx) {
  const rng = ctx.rng || Math.random;
  let recent = [...(ctx.recent || [])];
  const you = ctx.you || "由衣さん";
  const lines = [];
  const say = (pool, extra, exprOverride) => {
    const picked = pickFrom(pool, recent, rng);
    recent = picked.recent;
    lines.push({
      expr: exprOverride || picked.line.expr,
      text: fill(picked.line.text, { you, ...extra }),
    });
  };

  for (const ev of events) {
    if (ev.type === "zero") {
      say(ZERO);
    } else if (ev.type === "pain") {
      say(PAIN);
      if (ev.count > 0) {
        lines[lines.length - 1].text = `${withDetail(lines[lines.length - 1].text, ev)}。そこまでやったのも、偉いっす`;
      }
    } else if (ev.type === "early" || ev.type === "first" || ev.type === "set") {
      say(ev.type === "early" ? EARLY : ev.type === "first" ? FIRST_SET : SET_END);
      lines[lines.length - 1].text = withDetail(lines[lines.length - 1].text, ev);
    } else if (ev.type === "pb") {
      say(PB, { n: ev.n, unit: ev.ex.unit });
    } else if (ev.type === "streak") {
      say(STREAK_LINES[ev.n] || STREAK_LINES[3]);
    } else if (ev.type === "level") {
      const bits = Object.entries(ev.ups).map(([k, lv]) => `${STAT_LABEL[k]}がレベル${lv}`);
      lines.push({
        expr: "surprise",
        text: fill(`${bits.join("、")}。前より、ちゃんと強くなってますよ`, { you }),
      });
    } else if (ev.type === "stage") {
      lines.push({ expr: ev.stage.expr || "fun", text: fill(ev.stage.line, { you }) });
    } else if (ev.type === "quest") {
      const names = ev.quests.map((q) => q.name).join("、");
      lines.push({
        expr: "fun",
        text: fill(`依頼、達成っす。${names}。報酬も乗せときましたよ`, { you }),
      });
    } else if (ev.type === "hit") {
      lines.push({
        expr: "smile",
        text: `${ev.boss.name}、残り${ev.hpLeft}っす。削れ方、きれいっすよ`,
      });
    } else if (ev.type === "win") {
      lines.push({
        expr: "surprise",
        text: fill(`${ev.boss.name}、クリアっす！ {you}、ほんとに強い。ごほうびの経験値、入れときました`, { you }),
      });
    }
  }

  const main = events[0];
  const bonus = events.some((e) => e.type === "pb" || e.type === "win" || e.type === "streak");
  if (main && (main.type === "set" || main.type === "first") && !bonus && rng() < 0.16) {
    say(CALLS);
  }
  return { lines, recent };
}

export function cueFor(ex, day) {
  let h = 2166136261;
  const s = `${day}:${ex.id}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ex.cues[(h >>> 0) % ex.cues.length];
}
