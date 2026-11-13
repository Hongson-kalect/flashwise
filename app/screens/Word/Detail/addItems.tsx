import AppIcon from "@/components/AppIcon";
import { useWordLangs } from "./wordLang";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { AddItemsResult, addSenseItems, editErrorKind, proposeErrorKind, VerifiedItemKind } from "@/services/api/senses";
import { ItemKind, itemsOfMetadata, saveItems, VERIFIED_KINDS } from "@/services/senseLists";

import { router } from "expo-router";
import { useContext, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { SenseContext, SenseSavedContext } from "./senseEdit";
import { toast } from "@/utils/toast";

export type { ItemKind };

const KIND: Record<ItemKind, { title: string; hint: string; placeholder: string }> = {
  collocations: { title: "Thêm cụm từ đi kèm", hint: "Các cụm thường đi với từ này", placeholder: "vd: open an account" },
  relateds: { title: "Thêm từ liên quan", hint: "Từ hoặc cụm có liên quan", placeholder: "vd: deposit" },
  synonyms: { title: "Thêm từ đồng nghĩa", hint: "Từ có nghĩa tương tự", placeholder: "vd: depository" },
  antonyms: { title: "Thêm từ trái nghĩa", hint: "Từ có nghĩa đối lập", placeholder: "vd: borrower" },
  forms: { title: "Thêm biến thể", hint: "Dạng khác của từ (số nhiều, quá khứ...)", placeholder: "vd: banks" },
  tags: { title: "Thêm tag", hint: "Nhãn chủ đề để lọc và tìm", placeholder: "vd: finance" },
};

const MAX_ITEM = 50; // khớp giới hạn của server
const MAX_TOTAL = 20; // tags tối đa 20; dùng chung cho các danh sách khác cho gọn
const MAX_ROUND = 10; // số từ tối đa mỗi lượt thêm vào danh sách có AI kiểm tra (khớp SENSE_ITEMS_MAX_WORDS của server)
const MAX_LIST = 50; // số từ tối đa của cả danh sách có AI kiểm tra (khớp SENSE_ITEMS_MAX_TOTAL của server)

const REASON_TEXT: Record<string, string> = {
  sentence: "là câu, không phải từ / cụm từ",
  too_long: "quá dài cho một mục từ",
  not_a_word: "không phải một từ",
  list_full: "danh sách đã đầy",
};

const norm = (s: string) => s.trim().replace(/\s+/g, " ");
const SEP = /[,;\n，、]/;

/** Các mục hiện có của 1 danh sách trong nghĩa. */
export const itemsOf = (sense: any, kind: ItemKind): string[] => itemsOfMetadata(sense?.metadata, kind);

type Props = {
  kind: ItemKind;
  sense: any;
  onSaved: () => void;
  /** Ngôn ngữ dịch của trang từ đang mở (sheet vẽ ngoài trang nên không đọc được context). */
  userLang: string;
};

/**
 * Thêm nhiều từ một lần: gõ rồi Enter / dấu phẩy, hoặc dán cả danh sách ngăn cách bằng dấu phẩy hoặc xuống dòng.
 * Đồng nghĩa / trái nghĩa / liên quan: bấm Lưu thì server nhờ 2 AI kiểm tra, chỉ từ cả hai chấp nhận mới được thêm
 * (chỉ thêm, không xoá); từ bị loại hiện kèm lý do. Các danh sách khác lưu thẳng thành bản riêng của người dùng.
 */
export const AddItemsSheet = ({ kind, sense, onSaved, userLang }: Props) => {
  const { theme } = useTheme();
  const { close } = useBottomSheet();
  const verify = VERIFIED_KINDS.includes(kind);
  const cfg = KIND[kind];
  const existing = useMemo(() => itemsOf(sense, kind), [sense, kind]);
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AddItemsResult | null>(null);

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
      else if (verify ? next.length >= MAX_ROUND || existing.length + next.length >= MAX_LIST : existing.length + next.length >= MAX_TOTAL) skipped.full++;
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
    const why = [
      skipped.long && `${skipped.long} mục quá dài (tối đa ${MAX_ITEM} ký tự, một mục là từ hoặc cụm từ, không phải câu)`,
      skipped.dup && `${skipped.dup} mục đã có hoặc trùng`,
      skipped.full && `${skipped.full} mục vượt số lượng tối đa (${verify ? `${MAX_ROUND} mỗi lượt, ${MAX_LIST} cho cả danh sách` : MAX_TOTAL})`,
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

  const hasDraft = !!draft.trim();
  const full = verify
    ? items.length >= MAX_ROUND || existing.length + items.length >= MAX_LIST
    : existing.length + items.length >= MAX_TOTAL;

  const saveVerified = async () => {
    const res = await addSenseItems({ senseId: sense.id, kind: kind as VerifiedItemKind, words: items });
    if (res.added.length) onSaved(); // danh sách đã đổi trên server: trang tải lại 1 lần
    if (!res.rejected.length) {
      if (res.added.length) toast.success(`Đã thêm ${res.added.length} mục`);
      else toast.info("Các mục này đã có trong danh sách");
      close();
      return;
    }
    setResult(res); // có từ bị loại: giữ sheet mở để người dùng đọc lý do
    setSaving(false);
  };

  const saveOwn = async () => {
    await saveItems({ sense, userLang, kind, items });
    toast.success(`Đã thêm ${items.length} mục`);
    close();
    onSaved();
  };

  const save = async () => {
    if (hasDraft) {
      submitDraft(); // đưa ô đang gõ vào danh sách trước, bấm lưu lần nữa sau khi xong
      return;
    }
    if (!items.length || saving || !sense?.id) return;
    setSaving(true);
    setError(null);
    try {
      await (verify ? saveVerified() : saveOwn());
    } catch (e) {
      const k = verify ? proposeErrorKind(e) : editErrorKind(e);
      setError(
        k === "offline"
          ? "Không có kết nối. Kiểm tra mạng rồi lưu lại."
          : k === "throttled"
            ? "Bạn thêm hơi nhiều. Thử lại sau ít phút."
            : k === "unavailable"
              ? "Hệ thống kiểm tra đang bận. Thử lại sau."
              : k === "account_required"
                ? "Cần tài khoản để thêm từ cho mọi người."
                : k === "invalid"
                  ? "Nội dung chưa hợp lệ."
                  : k === "not_found"
                    ? "Không tìm thấy nghĩa này. Tải lại trang rồi thử lại."
                    : "Chưa lưu được. Thử lại sau.",
      );
      if (k === "account_required") {
        close();
        router.push("/screens/Login/screen");
        return;
      }
      setSaving(false);
    }
  };

  if (result) {
    return (
      <View className="px-4 pt-3 gap-4">
        {result.added.length > 0 && (
          <AppText color="success" weight="semibold">
            Đã thêm {result.added.length} mục: {result.added.join(", ")}
          </AppText>
        )}
        <View className="rounded-2xl p-3 gap-2" style={{ backgroundColor: theme.error + "14" }}>
          <AppText color="error" weight="semibold">
            {result.rejected.length} mục không được thêm
          </AppText>
          {result.rejected.map((r) => (
            <AppText key={r.word} size="sm" color="subText1">
              <AppText size="sm" weight="semibold">
                {r.word}
              </AppText>
              {": "}
              {REASON_TEXT[r.reason] ?? `không phù hợp (${r.reason})`}
            </AppText>
          ))}
        </View>
        <Pressable onPress={close} className="h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: theme.primary }}>
          <AppText color="white" size="lg" weight="bold">
            Xong
          </AppText>
        </Pressable>
        <View style={{ height: 30 }} />
      </View>
    );
  }

  return (
    <View className="px-4 pt-3 gap-4">
      <AppText color="subText1">
        {cfg.hint}. Thêm nhiều mục cùng lúc: ngăn cách bằng dấu phẩy hoặc xuống dòng, hay dán cả danh sách.
        {verify ? ` Tối đa ${MAX_ROUND} mục mỗi lượt; hệ thống sẽ kiểm tra rồi chỉ thêm các từ phù hợp.` : ""}
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
          {items.map((v) => (
            <Pressable
              key={v}
              onPress={() => remove(v)}
              disabled={saving}
              className="rounded-2xl pl-3 pr-2 py-1.5"
              style={{ backgroundColor: theme.primary + "18" }}
            >
              <View className="flex-row items-center gap-1.5">
                <AppText size="sm" color="primary" weight="semibold">
                  {v}
                </AppText>
                <AppIcon branch="feather" name="x" size={14} color={theme.primary} />
              </View>
            </Pressable>
          ))}
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
        disabled={(!hasDraft && items.length === 0) || saving}
        onPress={save}
        className="h-14 rounded-2xl items-center justify-center"
        style={{ backgroundColor: theme.primary, opacity: hasDraft || items.length > 0 ? 1 : 0.45 }}
      >
        {saving ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="white" />
            {verify && (
              <AppText color="white" weight="semibold">
                Đang kiểm tra…
              </AppText>
            )}
          </View>
        ) : (
          <AppText color="white" size="lg" weight="bold">
            {hasDraft ? "Thêm" : items.length > 0 ? `Lưu ${items.length} mục` : "Lưu"}
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
  const { userLang } = useWordLangs();
  const open = (kind: ItemKind) =>
    sense?.id &&
    present({
      title: KIND[kind].title,
      size: "long",
      render: () => <AddItemsSheet kind={kind} sense={sense} onSaved={onSaved} userLang={userLang} />,
    });
  return { open, canAdd: !!sense?.id, sense };
};
