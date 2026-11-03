import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { editErrorKind } from "@/services/api/senses";
import { checkWords, WordCheck } from "@/services/api/words";
import { createAndWatchWords, ItemKind, itemsOfMetadata, saveItems, VERIFIED_KINDS } from "@/services/senseLists";
import { useAppStore } from "@/stores/appStore";
import { useContext, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, TextInput, ToastAndroid, View } from "react-native";
import { SenseContext, SenseSavedContext } from "./senseEdit";

export type { ItemKind };

const KIND: Record<ItemKind, { title: string; hint: string; placeholder: string }> = {
  collocations: { title: "Thêm cụm từ đi kèm", hint: "Các cụm thường đi với từ này", placeholder: "vd: open an account" },
  relateds: { title: "Thêm từ liên quan", hint: "Từ hoặc cụm có liên quan", placeholder: "vd: deposit" },
  synonyms: { title: "Thêm từ đồng nghĩa", hint: "Từ có nghĩa tương tự", placeholder: "vd: depository" },
  antonyms: { title: "Thêm từ trái nghĩa", hint: "Từ có nghĩa đối lập", placeholder: "vd: borrower" },
  forms: { title: "Thêm biến thể", hint: "Dạng khác của từ (số nhiều, quá khứ...)", placeholder: "vd: banks" },
  tags: { title: "Thêm tag", hint: "Nhãn chủ đề để lọc và tìm", placeholder: "vd: finance" },
};

/**
 * Kiểm tra lúc gõ (chỉ đọc, miễn phí): ok = đã có trong từ điển, new = từ mới (được tạo ngầm sau khi lưu), bad = không phải mục từ.
 * Lưu không chờ việc tạo từ: từ bị từ chối ở bước tạo sẽ tự được gỡ khỏi danh sách (xem services/senseLists).
 */
type ItemState = { s: "checking" | "new" | "ok" | "bad"; text?: string };

const BAD_TEXT: Record<string, string> = {
  sentence: "là câu, không phải từ / cụm từ",
  too_long: "quá dài cho một mục từ",
  not_a_word: "không phải một từ",
  rejected: "không phải từ hợp lệ",
};

const stateOf = (r?: WordCheck): ItemState => {
  if (!r) return { s: "new" };
  if (r.status === "exists") return { s: "ok" };
  if (r.status === "unknown" || r.status === "processing") return { s: "new" };
  if (r.status === "invalid") return { s: "bad", text: BAD_TEXT[r.reason ?? "not_a_word"] ?? BAD_TEXT.rejected };
  return { s: "bad", text: BAD_TEXT.rejected };
};

const MAX_ITEM = 50; // khớp giới hạn của server
const MAX_TOTAL = 20; // tags tối đa 20; dùng chung cho các danh sách khác cho gọn

const norm = (s: string) => s.trim().replace(/\s+/g, " ");
const SEP = /[,;\n，、]/;

/** Các mục hiện có của 1 danh sách trong nghĩa. */
export const itemsOf = (sense: any, kind: ItemKind): string[] => itemsOfMetadata(sense?.metadata, kind);

type Props = {
  kind: ItemKind;
  sense: any;
  onSaved: () => void;
};

/** Thêm nhiều từ một lần: gõ rồi Enter / dấu phẩy, hoặc dán cả danh sách ngăn cách bằng dấu phẩy hoặc xuống dòng. */
export const AddItemsSheet = ({ kind, sense, onSaved }: Props) => {
  const { theme } = useTheme();
  const { close } = useBottomSheet();
  const userLang: string = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  const wordLang: string = useAppStore((s) => s.settings?.learning_language) ?? "en";
  const verify = VERIFIED_KINDS.includes(kind);
  const cfg = KIND[kind];
  const existing = useMemo(() => itemsOf(sense, kind), [sense, kind]);
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Trạng thái kiểm tra từng mục (khoá = chữ thường); mục không có trong map coi là ok
  const [states, setStates] = useState<Record<string, ItemState>>({});

  const stateFor = (v: string): ItemState => states[v.toLowerCase()] ?? { s: "ok" };
  const patch = (next: Record<string, ItemState>) => setStates((m) => ({ ...m, ...next }));

  /** Gõ xong: kiểm tra hàng loạt chỉ-đọc (đã có / chưa có / không hợp lệ). */
  const verifyWords = async (words: string[]) => {
    if (!verify || !words.length) return;
    patch(Object.fromEntries(words.map((w) => [w.toLowerCase(), { s: "checking" } as ItemState])));
    try {
      const res = await checkWords({ lang: wordLang, words });
      patch(Object.fromEntries(words.map((w) => [w.toLowerCase(), stateOf(res[w.toLowerCase()])])));
    } catch {
      // Không kiểm tra được (mất mạng...): vẫn cho lưu, từ sẽ được kiểm tra ngầm sau
      patch(Object.fromEntries(words.map((w) => [w.toLowerCase(), { s: "new" } as ItemState])));
    }
  };

  const taken = (list: string[]) => new Set([...existing, ...list].map((x) => x.toLowerCase()));

  /** Đưa các mục trong `parts` vào danh sách; trả về danh sách mới và lý do các mục bị bỏ (quá dài / trùng / quá số lượng). */
  const merge = (current: string[], parts: string[]) => {
    const seen = taken(current);
    const next = [...current];
    const skipped = { long: 0, dup: 0, full: 0 };
    for (const raw of parts) {
      const v = norm(raw);
      if (!v) continue;
      if (v.length > MAX_ITEM) skipped.long++;
      else if (seen.has(v.toLowerCase())) skipped.dup++;
      else if (existing.length + next.length >= MAX_TOTAL) skipped.full++;
      else {
        seen.add(v.toLowerCase());
        next.push(v);
      }
    }
    return { next, skipped };
  };

  const commit = (parts: string[]) => {
    const { next, skipped } = merge(items, parts);
    setItems(next);
    verifyWords(next.filter((v) => !items.includes(v)));
    const why = [
      skipped.long && `${skipped.long} mục quá dài (tối đa ${MAX_ITEM} ký tự, một mục là từ hoặc cụm từ, không phải câu)`,
      skipped.dup && `${skipped.dup} mục đã có hoặc trùng`,
      skipped.full && `${skipped.full} mục vượt số lượng tối đa (${MAX_TOTAL})`,
    ].filter(Boolean);
    setNote(why.length ? `Đã bỏ: ${why.join("; ")}` : null);
    return next;
  };

  const onChange = (text: string) => {
    if (!SEP.test(text)) {
      setDraft(text);
      return;
    }
    const parts = text.split(SEP);
    const rest = parts.pop() ?? ""; // phần sau dấu phân cách cuối vẫn đang gõ
    commit(parts);
    setDraft(rest);
  };

  const submitDraft = () => {
    if (draft.trim()) commit([draft]);
    setDraft("");
  };

  const remove = (v: string) => setItems((l) => l.filter((x) => x !== v));

  const checking = items.some((v) => stateFor(v).s === "checking");
  const keep = items.filter((v) => stateFor(v).s !== "bad"); // từ không hợp lệ đã biết thì không lưu
  const fresh = keep.filter((v) => stateFor(v).s === "new");
  const hasDraft = !!draft.trim();
  const full = existing.length + items.length >= MAX_TOTAL;

  /** Lưu ngay (không chờ tạo từ), đóng sheet, rồi tạo và theo dõi các từ mới ở nền. */
  const save = async () => {
    if (hasDraft) {
      submitDraft(); // đưa ô đang gõ vào danh sách (và kiểm tra) trước, bấm lưu lần nữa sau khi xong
      return;
    }
    if (!keep.length || checking || saving || !sense?.id) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveItems({ sense, userLang, kind, items: keep });
      if (Platform.OS === "android") ToastAndroid.show(`Đã thêm ${keep.length} mục`, ToastAndroid.SHORT);
      close();
      onSaved();
      if (verify && fresh.length) {
        createAndWatchWords({ senseId: saved.id, kind, words: fresh, lang: wordLang, userLang });
      }
    } catch (e) {
      const k = editErrorKind(e);
      setError(
        k === "offline"
          ? "Không có kết nối. Kiểm tra mạng rồi lưu lại."
          : k === "invalid"
            ? "Nội dung chưa hợp lệ."
            : k === "not_found"
              ? "Không tìm thấy nghĩa này. Tải lại trang rồi thử lại."
              : "Chưa lưu được. Thử lại sau.",
      );
      setSaving(false);
    }
  };

  return (
    <View className="px-4 pt-3 gap-4">
      <AppText color="subText1">
        {cfg.hint}. Thêm nhiều mục cùng lúc: ngăn cách bằng dấu phẩy hoặc xuống dòng, hay dán cả danh sách.
        {verify ? " Từ chưa có trong từ điển sẽ được khởi tạo ngầm sau khi lưu." : ""}
      </AppText>

      <View className="flex-row items-center gap-2">
        <TextInput
          value={draft}
          onChangeText={onChange}
          onSubmitEditing={submitDraft}
          blurOnSubmit={false}
          returnKeyType="done"
          autoFocus
          autoCapitalize="none"
          editable={!full}
          placeholder={full ? "Đã đủ số lượng" : cfg.placeholder}
          placeholderTextColor={theme.subText3}
          style={{
            flex: 1,
            height: 52,
            color: theme.text,
            backgroundColor: theme.card,
            borderColor: theme.primary,
            borderWidth: 2,
            borderRadius: 16,
            paddingHorizontal: 14,
            fontFamily: "MulishRegular",
            fontSize: 16,
          }}
        />
        <Pressable
          onPress={submitDraft}
          disabled={!draft.trim()}
          className="h-[52px] w-[52px] rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary + "18", opacity: draft.trim() ? 1 : 0.5 }}
        >
          <AppIcon branch="feather" name="plus" size={22} color={theme.primary} />
        </Pressable>
      </View>

      {!!note && (
        <AppText size="xs" color="warning">
          {note}
        </AppText>
      )}

      {items.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {items.map((v) => {
            const st = stateFor(v);
            const tone = st.s === "bad" ? theme.error : theme.primary;
            return (
              <Pressable
                key={v}
                onPress={() => remove(v)}
                className="rounded-2xl pl-3 pr-2 py-1.5"
                style={{ backgroundColor: tone + (st.s === "ok" ? "18" : "12") }}
              >
                <View className="flex-row items-center gap-1.5">
                  {st.s === "checking" && <ActivityIndicator size="small" color={theme.primary} />}
                  <AppText size="sm" color={st.s === "bad" ? "error" : "primary"} weight="semibold">
                    {v}
                  </AppText>
                  <AppIcon branch="feather" name="x" size={14} color={tone} />
                </View>
                {st.s === "new" && (
                  <AppText size="xs" color="subText2">
                    Từ mới, sẽ được khởi tạo
                  </AppText>
                )}
                {st.s === "bad" && (
                  <AppText size="xs" color="error">
                    {st.text}
                  </AppText>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {existing.length > 0 && (
        <View>
          <AppText size="xs" color="subText3" style={{ marginBottom: 6 }}>
            Đã có ({existing.length})
          </AppText>
          <View className="flex-row flex-wrap gap-1.5">
            {existing.map((v) => (
              <View key={v} className="rounded-md px-2 py-1" style={{ backgroundColor: theme.disabled + "20" }}>
                <AppText size="xs" color="subText2" font="MulishRegularItalic">
                  {v}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!error && (
        <View className="rounded-2xl p-3" style={{ backgroundColor: theme.error + "14" }}>
          <AppText size="sm" color="error">
            {error}
          </AppText>
        </View>
      )}

      <Pressable
        disabled={(!hasDraft && keep.length === 0) || checking || saving}
        onPress={save}
        className="h-14 rounded-2xl items-center justify-center"
        style={{ backgroundColor: theme.primary, opacity: (hasDraft || keep.length > 0) && !checking ? 1 : 0.45 }}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <AppText color="white" size="lg" weight="bold">
            {checking ? "Đang kiểm tra…" : hasDraft ? (verify ? "Thêm và kiểm tra" : "Thêm") : keep.length > 0 ? `Lưu ${keep.length} mục` : "Lưu"}
          </AppText>
        )}
      </Pressable>
      <View style={{ height: 30 }} />
    </View>
  );
};

/** Mở sheet thêm từ cho nghĩa đang xem (lấy từ SenseContext). */
export const useAddItems = () => {
  const sense = useContext(SenseContext);
  const onSaved = useContext(SenseSavedContext);
  const { present } = useBottomSheet();
  const open = (kind: ItemKind) =>
    sense?.id &&
    present({
      title: KIND[kind].title,
      size: "long",
      render: () => <AddItemsSheet kind={kind} sense={sense} onSaved={onSaved} />,
    });
  return { open, canAdd: !!sense?.id, sense };
};
