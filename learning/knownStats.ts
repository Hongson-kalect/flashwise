/**
 * Thống kê "Tôi biết từ này" theo mức từ (cấp CEFR / JLPT / TOPIK / HSK của nghĩa), để tự đánh dấu "đã biết" những từ ở mức mà
 * user luôn biết và luôn nhớ đúng khi kiểm tra. Thuần (không SQLite): dòng thô lấy từ review_log ở database/queries/knownStats.ts.
 *
 * Một mức được tự bỏ qua khi, tính theo lựa chọn của chính user (không kể thẻ tự đánh dấu):
 *  - đã học ít nhất MIN_LEARNED từ ở mức đó và bấm "biết" ở ít nhất MIN_CLAIM_RATE trong số đó;
 *  - ít nhất MIN_VERIFIED lời khai đã được kiểm tra (lần ôn đầu sau khi khai) và ít nhất MIN_ACCURACY trong số đó nhớ đúng;
 *  - và các thẻ đã tự đánh dấu ở mức đó (nếu đã đủ MIN_AUTO_CHECKED lần kiểm tra) vẫn nhớ đúng ít nhất MIN_AUTO_ACCURACY
 *    (tự bỏ qua mà sai nhiều thì tắt lại, khỏi tự củng cố sai).
 */
export const MIN_LEARNED = 10;
export const MIN_CLAIM_RATE = 0.8;
export const MIN_VERIFIED = 5;
export const MIN_ACCURACY = 0.9;
export const MIN_AUTO_CHECKED = 5;
export const MIN_AUTO_ACCURACY = 0.85;

/** Dòng thô: một thẻ mới được học, kèm điểm của lần chấm FSRS kế tiếp (null = chưa ôn lại). */
export interface LearnedRow {
  level: string | null;
  mode: "learn:known" | "learn:known_auto" | "learn:normal" | string;
  next_rating: number | null;
}

export interface BandStats {
  band: string;
  /** Số từ user tự học ở mức này (đã biết + học bình thường), không kể thẻ tự đánh dấu. */
  decided: number;
  claims: number;
  verifiedOk: number;
  verifiedBad: number;
  autoOk: number;
  autoBad: number;
}

export const UNKNOWN_BAND = "?";

/** "b1 " → "B1", "HSK 1" → "HSK 1"; không có mức thì "?" (không bao giờ tự bỏ qua). */
export const bandOf = (level: string | null | undefined) => {
  const text = (level ?? "").trim().toUpperCase().replace(/\s+/g, " ");
  return text || UNKNOWN_BAND;
};

export const tallyBands = (rows: LearnedRow[]): Map<string, BandStats> => {
  const bands = new Map<string, BandStats>();
  for (const row of rows) {
    const band = bandOf(row.level);
    const s = bands.get(band) ?? { band, decided: 0, claims: 0, verifiedOk: 0, verifiedBad: 0, autoOk: 0, autoBad: 0 };
    const checked = row.next_rating != null;
    const ok = (row.next_rating ?? 0) > 1;
    if (row.mode === "learn:known_auto") {
      if (checked) ok ? s.autoOk++ : s.autoBad++;
    } else {
      s.decided++;
      if (row.mode === "learn:known") {
        s.claims++;
        if (checked) ok ? s.verifiedOk++ : s.verifiedBad++;
      }
    }
    bands.set(band, s);
  }
  return bands;
};

export const shouldAutoKnown = (s: BandStats | undefined) => {
  if (!s || s.band === UNKNOWN_BAND) return false;
  const verified = s.verifiedOk + s.verifiedBad;
  if (s.decided < MIN_LEARNED || s.claims / s.decided < MIN_CLAIM_RATE) return false;
  if (verified < MIN_VERIFIED || s.verifiedOk / verified < MIN_ACCURACY) return false;
  const auto = s.autoOk + s.autoBad;
  return auto < MIN_AUTO_CHECKED || s.autoOk / auto >= MIN_AUTO_ACCURACY;
};

/** Tỉ lệ nhớ đúng của các lời khai đã kiểm tra (để nhắc user khi khai nhầm nhiều); null khi chưa đủ dữ liệu. */
export const claimAccuracy = (bands: Iterable<BandStats>) => {
  let ok = 0;
  let bad = 0;
  for (const s of bands) {
    ok += s.verifiedOk;
    bad += s.verifiedBad;
  }
  return ok + bad >= MIN_VERIFIED ? ok / (ok + bad) : null;
};
