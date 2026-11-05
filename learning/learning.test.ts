import assert from "node:assert/strict";
import { test } from "node:test";
import { toCard } from "./cardData";
import { checkAnswer, hintText } from "./checker";
import { currentQuestion, progressOf, reduce, resultsOf, RunState, startRun } from "./engine";
import { blendedDifficulty, makeScheduler, scheduleNew } from "./fsrsService";
import { autoGrade, clampGrade } from "./grade";
import { LearnCard, StepLog } from "./types";

const seeded = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const WORDS = ["apple", "bank", "bridge", "candle", "doctor", "engine"];
const makeCard = (word: string, i: number): LearnCard => ({
  key: `k${i}`, itemId: `i${i}`, senseId: `s${i}`, wordId: `w${i}`, word, lang: "en", pos: "noun", ipa: "", audio: null,
  imageUri: null, keywords: [], definition: `definition of ${word}`, definitionNative: "", translations: [`nghĩa ${word}`],
  example: null, globalDifficulty: 0, learnerCount: 0,
});
const cards = (n = 4) => WORDS.slice(0, n).map(makeCard);
const T0 = 1_000_000;

/** Trả lời đúng câu hiện tại. */
const right = (s: RunState, at: number) => {
  const q = currentQuestion(s)!;
  if (q.answerType === "speak") return reduce(s, { type: "speech", transcripts: [q.answer], at });
  const value = q.answerType === "choose" ? q.options.find((o) => o.correct)!.id : q.answer;
  return reduce(s, { type: "answer", value, at });
};
const wrongOne = (s: RunState, at: number) => {
  const q = currentQuestion(s)!;
  const value = q.answerType === "choose" ? q.options.find((o) => !o.correct)!.id : "zzzzzz";
  return reduce(s, { type: "answer", value, at });
};

const playAll = (s: RunState, step: (s: RunState, at: number) => RunState = right) => {
  let at = T0;
  const seen: string[] = [];
  let guard = 0;
  while (s.phase !== "summary") {
    assert.ok(guard++ < 500, "phiên không kết thúc");
    if (s.phase === "question") {
      seen.push(s.current!.cardKey);
      s = step(s, (at += 3000));
    } else s = reduce(s, { type: "next", at: (at += 500) });
  }
  return { s, seen };
};

test("checkAnswer: khớp, bỏ hoa thường / dấu, gần đúng, sai", () => {
  assert.equal(checkAnswer("  Apple! ", "apple"), "exact");
  assert.equal(checkAnswer("cafe", "café", "fr"), "exact");
  assert.equal(checkAnswer("aple", "apple"), "close");
  assert.equal(checkAnswer("ab", "at"), "wrong"); // từ ngắn không có "gần đúng"
  assert.equal(checkAnswer("orange", "apple"), "wrong");
  assert.equal(checkAnswer("", "apple"), "wrong");
  assert.equal(checkAnswer("が", "か", "ja"), "wrong"); // tiếng Nhật giữ dấu đục
  assert.equal(hintText("walk", 1), "w…");
  assert.equal(hintText("go out", 2), "g _   _ _ _");
});

test("phiên: làm đúng hết thì không bao giờ hỏi 1 thẻ 2 lần liền, mọi thẻ đủ bước, điểm Vừa / Dễ", () => {
  const start = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded() });
  assert.equal(start.queue.length + 1, 4); // 4 thẻ bắt đầu bằng bước copy
  const { s, seen } = playAll(start);
  for (let i = 1; i < seen.length; i++) assert.notEqual(seen[i], seen[i - 1]);
  assert.equal(progressOf(s), 1);
  for (const r of resultsOf(s)) {
    assert.deepEqual(r.logs.map((l) => l.kind), ["copy", "chooseMeaning", "chooseWord", "typeWord"]);
    assert.ok(r.grade >= 3);
    assert.ok(r.logs.every((l) => l.rating === 3));
  }
});

test("học tiếp phiên dở: lưu JSON giữa chừng, dựng lại rồi chạy tiếp ra cùng kết quả", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded() });
  let at = T0;
  for (let i = 0; i < 7; i++) {
    s = s.phase === "question" ? right(s, (at += 3000)) : reduce(s, { type: "next", at: (at += 500) });
  }
  const restored: RunState = JSON.parse(JSON.stringify(s));
  assert.deepEqual(restored, s);
  const a = playAll(s).s;
  const b = playAll(restored).s;
  assert.deepEqual(resultsOf(b).map((r) => [r.card.key, r.grade, r.logs.length]), resultsOf(a).map((r) => [r.card.key, r.grade, r.logs.length]));
  assert.equal(progressOf(b), 1);
});

test("sai 2 lần ở câu chọn: hiện đáp án, làm lại đúng bước đó 1 lần, thẻ bị Khó / Quên", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(3) });
  // Làm đúng bước copy của thẻ đầu, rồi cho tới khi gặp câu chọn của nó
  const target = s.current!.cardKey;
  s = right(s, T0 + 1000);
  s = reduce(s, { type: "next", at: T0 + 1500 });
  let guard = 0;
  while (!(s.current!.cardKey === target && currentQuestion(s)!.kind === "chooseMeaning")) {
    assert.ok(guard++ < 50);
    s = right(s, T0 + 2000 + guard);
    s = reduce(s, { type: "next", at: T0 + 2100 + guard });
  }
  const before = s.totalSteps;
  s = wrongOne(s, T0 + 9000);
  assert.equal(s.phase, "question"); // lần sai đầu còn được chọn lại
  s = wrongOne(s, T0 + 9500);
  assert.equal(s.phase, "feedback");
  assert.equal(s.feedback!.revealed, true);
  assert.equal(s.totalSteps, before + 1);
  assert.equal(s.queue.filter((i) => i.cardKey === target && i.pass === 2).length, 1);
  const log = s.cards[target].logs.at(-1)!;
  assert.deepEqual([log.kind, log.rating, log.attempts], ["chooseMeaning", 1, 2]);
  const done = playAll(reduce(s, { type: "next", at: T0 + 10000 })).s;
  assert.ok(done.autoGrades[target] <= 2);
});

test("câu gõ: gợi ý tăng dần, lần thứ 3 là hiện đáp án; gần đúng được nhận nhưng tính Khó", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded() });
  assert.equal(currentQuestion(s)!.kind, "copy");
  s = reduce(s, { type: "hint", at: T0 + 100 });
  s = reduce(s, { type: "hint", at: T0 + 200 });
  assert.equal(s.attempt.hints, 2);
  assert.equal(s.phase, "question");
  s = reduce(s, { type: "hint", at: T0 + 300 });
  assert.equal(s.feedback!.revealed, true);

  s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded() });
  const word = currentQuestion(s)!.answer;
  s = reduce(s, { type: "answer", value: word.slice(0, -1) + "x", at: T0 + 100 }); // sai 1 ký tự
  assert.equal(s.phase, "feedback");
  assert.equal(s.feedback!.verdict, "close");
  assert.equal(s.cards[s.current!.cardKey].logs[0].rating, 2);
});

test("'Đã biết': bỏ hết bước còn lại của thẻ, điểm Dễ, không chỉnh được", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded() });
  const key = s.current!.cardKey;
  const total = s.totalSteps;
  s = reduce(s, { type: "known", at: T0 + 100 });
  assert.equal(s.totalSteps, total - 4);
  assert.ok(!s.queue.some((i) => i.cardKey === key));
  const { s: done } = playAll(s);
  assert.equal(done.cards[key].known, true);
  assert.equal(done.grades[key], 4);
  const same = reduce(done, { type: "setGrade", key, grade: 1 });
  assert.equal(same.grades[key], 4);
});

test("cụm nhỏ (ít đáp án nhiễu): bỏ bước chọn, vẫn còn copy + gõ", () => {
  const s = startRun({ cards: cards(2), clusterSteps: 6, now: T0, rng: seeded() });
  assert.deepEqual(s.cards.k0.questions.map((q) => q.kind), ["copy", "typeWord"]);
  const { s: done } = playAll(s);
  assert.equal(done.phase, "summary");
});

test("rút ngắn số bước: giữ copy + gõ, bỏ chọn từ trước", () => {
  const s = startRun({ cards: cards(4), clusterSteps: 3, now: T0, rng: seeded() });
  assert.deepEqual(s.cards.k0.questions.map((q) => q.kind), ["copy", "chooseMeaning", "typeWord"]);
});

test("chấm điểm: Quên / Khó / Vừa / Dễ và chỉnh tối đa ±1", () => {
  const log = (over: Partial<StepLog>): StepLog => ({ kind: "chooseMeaning", rating: 3, correct: true, hintCount: 0, attempts: 1, durationMs: 2000, at: 0, ...over });
  assert.equal(autoGrade([log({}), log({ kind: "typeWord" })], 6000), 4);
  assert.equal(autoGrade([log({}), log({ kind: "typeWord", durationMs: 12000 })], 6000), 3);
  assert.equal(autoGrade([log({}), log({ hintCount: 1, rating: 2 })]), 2);
  assert.equal(autoGrade([log({ kind: "typeWord", rating: 1, correct: false })]), 1);
  assert.equal(autoGrade([log({ rating: 1 }), log({ kind: "chooseWord", rating: 1 })]), 1);
  assert.equal(autoGrade([log({ rating: 1 })]), 2);
  assert.equal(clampGrade(3, 1), 2);
  assert.equal(clampGrade(3, 4), 4);
  assert.equal(clampGrade(1, 4), 2);
});

test("FSRS thẻ mới: Quên ôn lại sau vài phút, Vừa sau 6 giờ, Dễ lên Review; độ khó trộn với server", () => {
  const sched = makeScheduler({ fuzz: false });
  const at = new Date("2026-11-05T08:00:00Z");
  const sense = { globalDifficulty: 0, learnerCount: 0 };
  const again = scheduleNew(sched, 1, at, sense);
  assert.equal(again.state, 1);
  assert.equal((again.due.getTime() - at.getTime()) / 60000, 10);
  const good = scheduleNew(sched, 3, at, sense);
  assert.equal((good.due.getTime() - at.getTime()) / 3600000, 6);
  assert.equal(good.level, 1);
  const easy = scheduleNew(sched, 4, at, sense);
  assert.equal(easy.state, 2);
  assert.ok(easy.scheduledDays >= 1);
  assert.equal(easy.level, 2);
  const known = scheduleNew(sched, 3, at, sense, true);
  assert.deepEqual([known.state, known.level], [2, 5]);

  assert.equal(blendedDifficulty(5, 8, 4), 5); // dưới 5 người học: bỏ độ khó chung
  assert.ok(Math.abs(blendedDifficulty(5, 8, 20) - (0.85 * 5 + 0.15 * 8)) < 1e-9);
  assert.ok(scheduleNew(sched, 3, at, { globalDifficulty: 9, learnerCount: 100 }).difficulty > good.difficulty);
});

test("toCard: áp delta (định nghĩa thay hẳn, bản dịch gộp) và lấy ví dụ", () => {
  const row = {
    item_id: "i", sense_id: "s", original_id: "o", word_id: "w", word_value: "bank", language_code: "en", pos: "Noun",
    ipas: "[]", word_ipas: JSON.stringify([{ value: "/bæŋk/" }]), audio: null, word_audio: null, image_preview: null,
    image_link: null, image_keywords: "[]", global_difficulty: 5, learner_count: 3,
    contents: JSON.stringify({
      definition: { en: { value: "A financial institution." }, vi: { value: "Ngân hàng." } },
      translations: { vi: ["ngân hàng"] },
      examples: [{ en: { value: "I went to the bank." }, vi: { value: "Tôi đi ngân hàng." } }],
    }),
    delta: JSON.stringify({ definition: { en: { value: "Edited." } }, translations: { vi: ["bờ sông"] } }),
  };
  const card = toCard(row, "vi");
  assert.equal(card.key, "o");
  assert.equal(card.definition, "Edited.");
  assert.equal(card.definitionNative, ""); // định nghĩa user sửa chỉ giữ ngôn ngữ trong delta
  assert.deepEqual(card.translations, ["bờ sông"]);
  assert.equal(card.example!.native, "Tôi đi ngân hàng.");
  assert.equal(card.ipa, "/bæŋk/");
  assert.equal(card.pos, "noun");
});

// ------------------------------------------------------------------ ôn tập + vuốt
import { autoGradeReview } from "./grade";
import { nextLevel, retrievability, scheduleReview } from "./fsrsService";
import { directionFor, reduceSwipe, startSwipe, swipeResults, SwipeState } from "./swipe";
import { fromDbTime, toDbTime } from "./time";

const swipeCards = () => cards(4);
const swipeTo = (s: SwipeState, dir: "remember" | "unsure", at: number) => reduceSwipe(s, { type: "swipe", direction: dir, at });

test("vuốt: nhớ ngay = Vừa, không có Dễ", () => {
  let s = startSwipe({ cards: swipeCards(), now: T0 });
  let at = T0;
  while (s.phase === "swiping") s = swipeTo(s, "remember", (at += 2000));
  const results = swipeResults(s);
  assert.equal(results.length, 4);
  assert.ok(results.every((r) => r.grade === 3 && r.steps.length === 0));
});

test("vuốt: chưa chắc +1, quay lại giữa chồng; nhớ sau đó = Khó; đủ 3 lần = Quên và xem lại 1 lần", () => {
  let s = startSwipe({ cards: swipeCards(), now: T0 });
  const first = s.current!.cardKey;
  s = swipeTo(s, "unsure", T0 + 1000); // điểm 1, chèn lại giữa
  assert.equal(s.cards[first].score, 1);
  assert.ok(s.queue.some((i) => i.cardKey === first));
  assert.notEqual(s.current!.cardKey, first);

  let at = T0 + 1000;
  let guard = 0;
  // vuốt nhớ mọi thẻ khác cho tới khi gặp lại thẻ đầu
  while (s.current!.cardKey !== first) {
    assert.ok(guard++ < 20);
    s = swipeTo(s, "remember", (at += 1000));
  }
  s = swipeTo(s, "remember", (at += 1000)); // điểm 1 → Khó
  assert.equal(s.cards[first].grade, 2);

  // thẻ khác: 3 lần "chưa chắc" = Quên, rồi được xem lại ở cuối, vuốt xem lại không chấm
  let t = startSwipe({ cards: swipeCards(), now: T0 });
  const key = t.current!.cardKey;
  let n = 0;
  while (t.cards[key].grade === null) {
    assert.ok(n++ < 40);
    t = t.current!.cardKey === key && !t.current!.review ? swipeTo(t, "unsure", (at += 1000)) : swipeTo(t, "remember", (at += 1000));
  }
  assert.equal(t.cards[key].grade, 1);
  assert.equal(t.cards[key].steps.length, 3 - 0); // 3 lần chưa chắc đều ghi lại
  while (t.phase === "swiping") t = swipeTo(t, "remember", (at += 1000));
  assert.equal(swipeResults(t).find((r) => r.card.key === key)!.grade, 1); // xem lại không đổi điểm
  assert.equal(t.finalized, 4);
});

test("vuốt: xem nghĩa = Quên ngay, hoàn tác lùi 1 bước", () => {
  let s = startSwipe({ cards: swipeCards(), now: T0 });
  const key = s.current!.cardKey;
  s = reduceSwipe(s, { type: "flip", at: T0 + 500 });
  assert.equal(s.cards[key].score, 3);
  s = swipeTo(s, "remember", T0 + 1000); // lật rồi vuốt hướng nào cũng Quên
  assert.equal(s.cards[key].grade, 1);
  assert.equal(s.finalized, 1);
  s = reduceSwipe(s, { type: "undo", at: T0 + 1500 });
  assert.equal(s.cards[key].grade, null);
  assert.equal(s.current!.cardKey, key);
  assert.equal(s.finalized, 0);
});

test("hướng vuốt theo cài đặt", () => {
  assert.equal(directionFor("left_remember", "left"), "remember");
  assert.equal(directionFor(undefined, "right"), "unsure");
  assert.equal(directionFor("right_remember", "right"), "remember");
});

test("ôn theo cụm: bỏ bước copy, điểm theo bước đầu, bước sau chỉ hạ khi sai nặng", () => {
  const s = startRun({ cards: cards(4), mode: "review", levels: { k0: 1 }, clusterSteps: 6, now: T0, rng: seeded() });
  assert.ok(!s.cards.k0.questions.some((q) => q.kind === "copy"));
  assert.equal(s.mode, "review");
  const log = (over: Partial<StepLog>): StepLog => ({ kind: "chooseMeaning", rating: 3, correct: true, hintCount: 0, attempts: 1, durationMs: 2000, at: 0, ...over });
  assert.equal(autoGradeReview([log({ rating: 1 }), log({}), log({})]), 1);
  assert.equal(autoGradeReview([log({}), log({ rating: 1 })]), 2); // sau sai nặng: hạ xuống Khó
  assert.equal(autoGradeReview([log({ rating: 2 }), log({})]), 2);
  assert.equal(autoGradeReview([log({}), log({ kind: "typeWord" })], 6000), 4);
  const { s: done } = playAll(s);
  assert.equal(done.phase, "summary");
  assert.ok(Object.values(done.autoGrades).every((g) => g >= 3));
});

test("FSRS ôn: nhớ thì khoảng ôn dài ra, quên thì ôn lại sớm; vuốt dùng mục tiêu nhớ cao nên ngắn hơn", () => {
  const sched = makeScheduler({ fuzz: false });
  const long = makeScheduler({ fuzz: false, retention: 0.93 });
  const at0 = new Date("2026-11-01T08:00:00Z");
  const base = { level: 2, state: 2, stability: 10, difficulty: 5, learningSteps: 0, repetitions: 3, forgetCount: 0, lastReviewedAt: at0, nextReviewAt: new Date("2026-11-11T08:00:00Z") };
  const at = new Date("2026-11-11T08:00:00Z");
  const good = scheduleReview(sched, base, 3, at, "normal");
  assert.equal(good.state, 2);
  assert.ok(good.scheduledDays > 10);
  assert.equal(good.level, 3);
  const quick = scheduleReview(long, base, 3, at, "quick");
  assert.ok(quick.scheduledDays < good.scheduledDays);
  const again = scheduleReview(sched, base, 1, at, "normal");
  assert.equal(again.lapsed, true);
  assert.equal(again.level, 0);
  assert.ok(again.scheduledDays < 1);
  assert.equal(nextLevel(5, 3, "quick"), 5); // vuốt không vượt cấp 5
  assert.equal(nextLevel(5, 3, "normal"), 6);
  assert.equal(nextLevel(1, 1, "normal"), 0);
  assert.equal(nextLevel(4, 2, "normal"), 4);
});

test("R giảm theo thời gian và = 0,9 khi t = S; time đọc / ghi đối xứng", () => {
  assert.ok(Math.abs(retrievability(10, 10) - 0.9) < 1e-6);
  assert.ok(retrievability(10, 30) < retrievability(10, 5));
  const d = new Date("2026-11-05T10:20:30Z");
  assert.equal(toDbTime(d), "2026-11-05 10:20:30");
  assert.equal(fromDbTime("2026-11-05 10:20:30")!.getTime(), d.getTime());
  assert.equal(fromDbTime(null), null);
});


// ------------------------------------------------------------------ nghe + nói
import { checkSpoken, normalizeAnswer, toHiragana } from "./checker";

const VOICE = { hear: true, talk: true };
const kinds = (s: RunState, key = "k0") => s.cards[key].questions.map((q) => q.kind);

test("chấm câu nói: khớp phương án nào cũng được, gần đúng chỉ khi là phương án đầu, tiếng Nhật không phân biệt hira / kata và dấu cách", () => {
  assert.equal(checkSpoken(["apple"], "apple"), "exact");
  assert.equal(checkSpoken(["apel", "apple"], "apple"), "exact"); // phương án sau khớp
  assert.equal(checkSpoken(["aple"], "apple"), "close");
  assert.equal(checkSpoken(["xyz", "aple"], "apple"), "wrong"); // gần đúng nhưng không phải phương án đầu
  assert.equal(checkSpoken(["banana"], "apple"), "wrong");
  assert.equal(checkSpoken([], "apple"), "wrong");
  assert.equal(toHiragana("ネコ"), "ねこ");
  assert.equal(checkSpoken(["ネコ"], "ねこ", "ja"), "exact");
  assert.equal(checkSpoken(["ね こ"], "ねこ", "ja"), "exact");
  assert.equal(normalizeAnswer("New York", "en"), "new york"); // tiếng Anh giữ dấu cách
});

test("khả năng nghe / nói quyết định bước: có đủ thì thêm nghe chọn, chính tả, nói (rút ngắn bỏ chọn từ trước)", () => {
  assert.deepEqual(kinds(startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(), caps: VOICE })), ["copy", "chooseMeaning", "listenChoose", "typeWord", "dictation", "speak"]);
  assert.deepEqual(kinds(startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(), caps: { hear: true, talk: false } })), ["copy", "chooseMeaning", "chooseWord", "listenChoose", "typeWord", "dictation"]);
  assert.deepEqual(kinds(startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded() })), ["copy", "chooseMeaning", "chooseWord", "typeWord"]); // mặc định không nghe / nói
});

test("bước nói: đọc đúng là xong, sai 2 lần thì hiện đáp án và hỏi lại, gần đúng tính Khó", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(), caps: VOICE });
  let guard = 0;
  while (currentQuestion(s)!.kind !== "speak") {
    assert.ok(guard++ < 80);
    s = right(s, T0 + guard * 10);
    s = reduce(s, { type: "next", at: T0 + guard * 10 + 5 });
  }
  const key = s.current!.cardKey;
  const before = s.totalSteps;
  s = reduce(s, { type: "speech", transcripts: ["zzz"], at: T0 + 9000 });
  assert.equal(s.phase, "question");
  assert.equal(s.attempt.lastVerdict, "wrong");
  s = reduce(s, { type: "speech", transcripts: ["qqq"], at: T0 + 9500 });
  assert.equal(s.feedback!.revealed, true);
  assert.equal(s.totalSteps, before + 1);
  assert.equal(s.cards[key].logs.at(-1)!.rating, 1);
  assert.equal(s.cards[key].logs.at(-1)!.kind, "speak");
  // câu nói không dùng cho bước gõ
  const typing = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(), caps: VOICE });
  assert.equal(reduce(typing, { type: "speech", transcripts: ["x"], at: T0 }), typing);
});

test("'Không nói được lúc này': bỏ mọi bước nói, tổng bước khớp, phiên vẫn xong và không có log nói", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(), caps: VOICE });
  const total = s.totalSteps;
  s = reduce(s, { type: "skipKind", kind: "speak", at: T0 + 1 }); // bước đầu là copy, các bước nói còn phía sau
  assert.equal(s.totalSteps, total - 4);
  const { s: done } = playAll(s);
  assert.equal(done.phase, "summary");
  assert.equal(done.doneSteps, done.totalSteps);
  for (const key of done.order) assert.ok(!done.cards[key].logs.some((l) => l.kind === "speak"));
  assert.ok(done.cards.k0.logs.some((l) => l.kind === "dictation"));
});

test("bỏ bước nói ngay khi đang hỏi bước nói: chuyển sang bước kế của thẻ đó", () => {
  let s = startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(), caps: VOICE });
  let guard = 0;
  while (currentQuestion(s)!.kind !== "speak") {
    assert.ok(guard++ < 80);
    s = right(s, T0 + guard * 10);
    s = reduce(s, { type: "next", at: T0 + guard * 10 + 5 });
  }
  const stuck = s.current!.cardKey;
  s = reduce(s, { type: "skipKind", kind: "speak", at: T0 + 5000 });
  assert.notEqual(currentQuestion(s)?.kind, "speak");
  const { s: done } = playAll(s);
  assert.equal(done.doneSteps, done.totalSteps);
  assert.ok(done.cards[stuck].logs.length >= 1);
});

test("tổng bước luôn khớp số bước đã làm khi xong (mọi đường: đúng hết, sai, đã biết)", () => {
  for (const make of [() => playAll(startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(5), caps: VOICE })).s, () => playAll(startRun({ cards: cards(4), clusterSteps: 6, now: T0, rng: seeded(6), caps: VOICE }), wrongOne).s]) {
    const done = make();
    assert.equal(done.doneSteps, done.totalSteps);
  }
});
