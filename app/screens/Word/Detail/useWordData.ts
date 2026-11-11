import { useAppStore } from "@/stores/appStore";
import { GetAPI } from "@/services/axios";
import { normalizeWord } from "@/utils/normalizeText";
import { wordSocket } from "@/utils/socket";
import { loadLocalWord, needsRefresh, saveWord } from "@/database/queries/words";
import { LOCAL_WORDS_ENABLED } from "@/configs/local";
import { onSenseChanged } from "@/services/senseLists";
import { useSQLiteContext } from "expo-sqlite";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { initialState, WordError, WordState } from "../type";
import { senseDataReducer } from "./utils";

type Action = Parameters<typeof senseDataReducer>[1];
const reducer = (s: WordState, a: Action) => senseDataReducer(s, a);

/** HTTP lỗi của get-word → WordError (APP_INTEGRATION mục 4). */
const toWordError = (e: any): WordError => {
  const status = e?.response?.status;
  const data = e?.response?.data;
  if (!e?.response) return { code: "offline" };
  if (status === 400 && data?.errorCode === "not_a_dictionary_entry")
    return { code: "rejected", message: "Chỉ tra được từ, cụm từ, thành ngữ hoặc tục ngữ, không tra được câu." };
  if (status === 404) return { code: "rejected" }; // lời giải thích tiếng Việt nằm ở WordStatus
  if (status === 429) return { code: "throttled" };
  if (status === 500)
    return { code: "failed", retryAfter: data?.data?.retry_after ?? data?.retry_after };
  return { code: "unavailable" };
};

/**
 * Tra 1 từ: đăng ký phòng socket TRƯỚC khi gọi get-word (khỏi lỡ tin), rồi gộp
 * kết quả HTTP + các tin socket vào 1 state. Từ có sẵn (200) hiện ngay; từ mới (201/202)
 * hiện dần qua PARTIAL_*, FULL_SENSE là bản cuối.
 */
export const useWordData = (word: string) => {
  const settings = useAppStore((s) => s.settings);
  const lang: string | undefined = settings?.learning_language;
  const userLang: string | undefined = settings?.translate_language;

  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [attempt, setAttempt] = useState(0);
  const startRef = useRef(0);
  // Tăng khi vừa nhận bản mới từ server (kể cả khi status vốn đã COMPLETED từ local) để kích hoạt lưu lại
  const [serverTick, setServerTick] = useState(0);
  const [log, setLog] = useState<{ type: string; at: number }[]>([]);
  // Từ đã có trong SQLite: làm mới nền (nếu có) không cần báo "đang khởi tạo"
  const [hadLocal, setHadLocal] = useState(false);
  // Chuỗi tra là dạng biến cách (killed) của từ gốc chưa có trong DB: get-word trả `redirect`, ta tra tiếp từ gốc (server tạo online như từ mới)
  // và giữ `form_of` để trang hiện "là dạng … của kill" cùng ví dụ riêng của dạng đã tra. Chỉ theo 1 bước, và chỉ cho đúng chuỗi đã tra.
  const [redirect, setRedirect] = useState<{ from: string; lemma: string; formOf: any } | null>(null);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  // Sau khi thêm nghĩa mới: bỏ qua bản local, hỏi lại server để thấy nghĩa vừa thêm (server đã xoá cache từ)
  const forceRefresh = useRef(false);
  // Làm mới âm thầm: giữ nguyên nội dung đang hiện (không RESET, không nạp lại local) rồi thay bằng bản server khi về,
  // để trang không nháy qua "Đang tải…"; lỗi mạng thì giữ nội dung cũ
  const silentRefresh = useRef(false);
  const refresh = useCallback(() => {
    forceRefresh.current = true;
    silentRefresh.current = true;
    setAttempt((n) => n + 1);
  }, []);

  // Danh sách của nghĩa đổi ở nền (vd từ bị từ chối được gỡ): tải lại nếu nghĩa đó đang hiện ở trang này
  const senseIds = useRef<Set<string>>(new Set());
  senseIds.current = new Set(Object.keys(state.senses ?? {}));
  useEffect(() => onSenseChanged((id) => senseIds.current.has(id) && refresh()), [refresh]);

  // true khi dữ liệu đang hiện chỉ đến từ SQLite (chưa có bản mới từ server): không cần ghi lại
  const localOnly = useRef(false);

  useEffect(() => {
    if (!word || !lang || !userLang) return;
    let alive = true;
    const silent = silentRefresh.current;
    silentRefresh.current = false;
    if (!silent) {
      dispatch({ type: "RESET", payload: {} });
      setLog([]);
      setHadLocal(false);
    }
    startRef.current = Date.now();
    localOnly.current = false;
    const force = forceRefresh.current;
    forceRefresh.current = false;

    const followed = redirect && redirect.from === word ? redirect : null;
    const target = followed?.lemma ?? word;
    const room = normalizeWord(target, lang);
    let unsubscribe: (() => void) | null = null;

    (async () => {
      // 1) Local trước: hiện ngay + dùng được khi offline
      const local = silent || !LOCAL_WORDS_ENABLED ? null : await loadLocalWord(db, target, lang).catch(() => null);
      if (!alive) return;
      if (local) {
        localOnly.current = true;
        setHadLocal(true);
        dispatch({ type: "FULL_SENSE", payload: local });
        // Bản đã refine / verified và có đủ bản dịch: không cần hỏi server
        if (!force && !needsRefresh(local, userLang)) return;
      }

      // 2) Server: từ mới (hiện dần qua socket) hoặc làm mới nền bản draft / thiếu dịch
      unsubscribe = wordSocket.subscribe(room, (msg) => {
        if (!alive || !msg?.type) return; // tin xác nhận subscribe không có type
        localOnly.current = false;
        setLog((l) => [...l, { type: msg.type, at: Date.now() - startRef.current }]);
        dispatch({ type: msg.type, payload: msg.payload });
      });

      try {
        const res = await GetAPI("ai-words/get-word/", {
          value: target,
          lang,
          user_lang: userLang,
        });
        if (!alive) return;
        const next = res.data?.data?.redirect;
        if (next && !followed && next !== word) {
          setRedirect({ from: word, lemma: next, formOf: res.data.data.form_of ?? null });
          return; // effect chạy lại với từ gốc (RESET, đăng ký phòng của từ gốc, get-word từ gốc)
        }
        localOnly.current = false;
        // 200: đủ rồi. 206: đủ nghĩa, bản dịch thiếu sẽ về qua socket. 201 / 202: còn chờ socket.
        dispatch({
          type: "INITIAL",
          payload: {
            data: res.data?.data,
            complete: res.status === 200 || res.status === 206,
            formOf: followed?.formOf ?? undefined,
          },
        });
        setServerTick((t) => t + 1);
      } catch (e) {
        if (!alive) return;
        // Đã có bản local (hoặc đang làm mới âm thầm) thì lỗi mạng chỉ làm chưa làm mới được: giữ nội dung cũ, không báo lỗi
        if (!local && !silent) dispatch({ type: "FAILED", payload: toWordError(e) });
      }
    })();

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [word, lang, userLang, attempt, redirect]);

  // Từ đã đủ dữ liệu thì lưu vào SQLite (tab Từ vựng, xem lại khi offline). Lưu lại cả khi tin socket
  // muộn (vd PARTIAL_TRANSLATE sau HTTP 206) làm dữ liệu đổi.
  useEffect(() => {
    if (!LOCAL_WORDS_ENABLED) return;
    if (state.status !== "COMPLETED" || !state.id || !state.value) return;
    if (localOnly.current) return;
    saveWord(db, {
      id: state.id,
      value: state.value,
      languageCode: state.languageCode,
      senses: state.senses,
    })
      .then(() => queryClient.invalidateQueries({ queryKey: ["words"] }))
      .catch((e) => console.log("saveWord lỗi", e));
  }, [state.status, state.id, log.length, serverTick]);

  return { state, retry, refresh, log, hadLocal };
};
