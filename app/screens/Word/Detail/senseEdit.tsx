import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { editErrorKind, EditErrorKind, SenseDelta, updateSense } from "@/services/api/senses";
import { useAppStore } from "@/stores/appStore";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, TextInput, ToastAndroid, View } from "react-native";

/** Mục được nhấn giữ. Không truyền = mở form đầy đủ (3 chấm → Sửa nghĩa này). */
export type EditFocus = "definition" | "translation" | "usage" | `example:${number}`;

/** Nghĩa đang hiển thị (SenseInfo cung cấp) để các phần tử con nhấn giữ là sửa được đúng nghĩa đó. */
export const SenseContext = createContext<any | null>(null);
/** Gọi sau khi lưu để trang từ tải lại. */
export const SenseSavedContext = createContext<() => void>(() => {});

const MAX = 500;
const ERROR_TEXT: Record<EditErrorKind, string> = {
  offline: "Không có kết nối. Kiểm tra mạng rồi lưu lại.",
  invalid: "Nội dung chưa hợp lệ. Kiểm tra lại các ô rồi lưu.",
  not_found: "Không tìm thấy nghĩa này (có thể đã bị xoá). Tải lại trang rồi thử lại.",
  unknown: "Chưa lưu được. Thử lại sau.",
};

const TITLE: Record<string, string> = {
  definition: "Sửa định nghĩa",
  translation: "Sửa bản dịch",
  usage: "Sửa cách dùng",
  example: "Sửa ví dụ",
  full: "Sửa nghĩa",
};

const textOf = (node: any, lang: string) => node?.[lang]?.value ?? "";

type Props = {
  sense: any;
  wordLang: string;
  userLang: string;
  focus?: EditFocus;
  onSaved: () => void;
};

type Form = {
  def: string;
  defT: string;
  trans: string;
  usage: string;
  usageT: string;
  examples: { v: string; t: string }[];
};

const initialForm = (sense: any, wl: string, ul: string): Form => ({
  def: textOf(sense?.contents?.definition, wl),
  defT: wl === ul ? "" : textOf(sense?.contents?.definition, ul),
  trans: (sense?.contents?.translations?.[ul] ?? []).join(", "),
  usage: textOf(sense?.contents?.usage, wl),
  usageT: wl === ul ? "" : textOf(sense?.contents?.usage, ul),
  examples: (sense?.contents?.examples ?? []).map((ex: any) => ({
    v: textOf(ex, wl),
    t: wl === ul ? "" : textOf(ex, ul),
  })),
});

const splitList = (s: string) =>
  s.split(/[,;，、]/).map((x) => x.trim()).filter(Boolean);

/** Chỉ gửi những mục đã đổi; definition / usage / examples gửi đủ cả hai ngôn ngữ vì server giữ đúng ngôn ngữ có trong delta. */
const buildDelta = (a: Form, b: Form, wl: string, ul: string): SenseDelta => {
  const delta: SenseDelta = {};
  const pair = (v: string, t: string) => ({
    [wl]: { value: v.trim() },
    ...(t.trim() && wl !== ul ? { [ul]: { value: t.trim() } } : {}),
  });
  if (a.def !== b.def || a.defT !== b.defT) delta.definition = pair(b.def, b.defT);
  if (a.usage !== b.usage || a.usageT !== b.usageT) delta.usage = pair(b.usage, b.usageT);
  if (a.trans !== b.trans) delta.translations = { [ul]: splitList(b.trans) };
  if (JSON.stringify(a.examples) !== JSON.stringify(b.examples)) {
    delta.examples = b.examples.filter((e) => e.v.trim()).map((e) => pair(e.v, e.t));
  }
  return delta;
};

export const EditSenseSheet = ({ sense, wordLang, userLang, focus, onSaved }: Props) => {
  const { theme } = useTheme();
  const { close } = useBottomSheet();
  const initial = useMemo(() => initialForm(sense, wordLang, userLang), [sense, wordLang, userLang]);
  const [form, setForm] = useState<Form>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kind = focus?.split(":")[0] ?? "full";
  const exIndex = focus?.startsWith("example:") ? Number(focus.split(":")[1]) : -1;
  const show = (k: string) => !focus || kind === k;
  const showTranslated = userLang !== wordLang;

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const setExample = (i: number, patch: Partial<{ v: string; t: string }>) =>
    setForm((f) => ({ ...f, examples: f.examples.map((e, k) => (k === i ? { ...e, ...patch } : e)) }));

  const delta = useMemo(() => buildDelta(initial, form, wordLang, userLang), [initial, form, wordLang, userLang]);
  const changed = Object.keys(delta).length > 0;
  const defEmpty = show("definition") && !form.def.trim();
  const tooLong = [form.def, form.defT, form.usage, form.usageT, ...form.examples.flatMap((e) => [e.v, e.t])].some(
    (s) => s.length > MAX,
  );
  const valid = changed && !defEmpty && !tooLong && !!sense?.id;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateSense({ senseId: sense.id, userLang, delta });
      const forked = saved?.id && saved.id !== sense.id;
      const msg = forked ? "Đã lưu thành bản riêng của bạn" : "Đã lưu";
      if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
      close();
      onSaved();
    } catch (e) {
      setError(ERROR_TEXT[editErrorKind(e)]);
      setSaving(false);
    }
  };

  const reset = () => setForm(initial);

  return (
    <View className="px-4 pt-3 gap-4">
      <View className="flex-row gap-2 items-start rounded-2xl p-3" style={{ backgroundColor: theme.primary + "12" }}>
        <AppIcon branch="feather" name="info" size={16} color={theme.primary} style={{ marginTop: 2 }} />
        <AppText size="sm" color="subText1" style={{ flex: 1 }}>
          Bản sửa được lưu thành bản riêng của bạn. Nghĩa gốc và người khác không bị ảnh hưởng.
        </AppText>
      </View>

      {show("definition") && (
        <Field
          label={`Định nghĩa (${wordLang.toUpperCase()})`}
          value={form.def}
          onChange={(v) => set({ def: v })}
          autoFocus={kind === "definition"}
          error={defEmpty ? "Định nghĩa không được để trống" : undefined}
        />
      )}
      {show("translation") && showTranslated && (
        <>
          <Field
            label={`Bản dịch định nghĩa (${userLang.toUpperCase()})`}
            value={form.defT}
            onChange={(v) => set({ defT: v })}
            autoFocus={kind === "translation"}
          />
          <Field
            label="Nghĩa ngắn"
            hint="Ngăn cách bằng dấu phẩy"
            value={form.trans}
            onChange={(v) => set({ trans: v })}
            single
          />
        </>
      )}
      {show("usage") && (
        <>
          <Field
            label={`Cách dùng (${wordLang.toUpperCase()})`}
            value={form.usage}
            onChange={(v) => set({ usage: v })}
            autoFocus={kind === "usage"}
            optional
          />
          {showTranslated && (
            <Field
              label={`Cách dùng (${userLang.toUpperCase()})`}
              value={form.usageT}
              onChange={(v) => set({ usageT: v })}
              optional
            />
          )}
        </>
      )}
      {(show("example") || !focus) &&
        form.examples.map((ex, i) =>
          exIndex >= 0 && exIndex !== i ? null : (
            <View key={i} className="gap-3">
              <View className="flex-row items-center justify-between">
                <AppText size="sm" weight="bold" color="title">
                  Ví dụ {i + 1}
                </AppText>
                {!focus && (
                  <Pressable
                    hitSlop={10}
                    onPress={() => set({ examples: form.examples.filter((_, k) => k !== i) })}
                  >
                    <AppText size="xs" color="error" weight="semibold">
                      Xoá
                    </AppText>
                  </Pressable>
                )}
              </View>
              <Field
                label={wordLang.toUpperCase()}
                value={ex.v}
                onChange={(v) => setExample(i, { v })}
                autoFocus={exIndex === i}
                compact
              />
              {showTranslated && (
                <Field label={userLang.toUpperCase()} value={ex.t} onChange={(t) => setExample(i, { t })} compact optional />
              )}
            </View>
          ),
        )}
      {!focus && (
        <Pressable
          onPress={() => set({ examples: [...form.examples, { v: "", t: "" }] })}
          className="h-12 rounded-2xl flex-row items-center justify-center gap-2"
          style={{ borderWidth: 1, borderColor: theme.border, borderStyle: "dashed" }}
        >
          <AppIcon branch="feather" name="plus" size={18} color={theme.primary} />
          <AppText color="primary" weight="semibold">
            Thêm ví dụ
          </AppText>
        </Pressable>
      )}

      {!!error && (
        <View className="rounded-2xl p-3" style={{ backgroundColor: theme.error + "14" }}>
          <AppText size="sm" color="error">
            {error}
          </AppText>
        </View>
      )}

      <Pressable
        disabled={!valid || saving}
        onPress={save}
        className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: theme.primary, opacity: valid ? 1 : 0.45 }}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <AppText color="white" size="lg" weight="bold">
            Lưu thay đổi
          </AppText>
        )}
      </Pressable>
      {changed && !saving && (
        <Pressable onPress={reset} hitSlop={8} className="items-center">
          <AppText color="subText1" weight="semibold">
            Hoàn tác
          </AppText>
        </Pressable>
      )}
      <View style={{ height: 40 }} />
    </View>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  autoFocus?: boolean;
  single?: boolean;
  compact?: boolean;
  optional?: boolean;
};

const Field = ({ label, value, onChange, hint, error, autoFocus, single, compact, optional }: FieldProps) => {
  const { theme } = useTheme();
  return (
    <View>
      <View className="flex-row items-center justify-between" style={{ marginBottom: 6 }}>
        <AppText size={compact ? "xs" : "sm"} weight="bold" color={compact ? "subText2" : "title"}>
          {label}
          {optional ? " (tuỳ chọn)" : ""}
        </AppText>
        {value.length > MAX * 0.8 ? (
          <AppText size="xs" color={value.length > MAX ? "error" : "subText3"}>
            {value.length}/{MAX}
          </AppText>
        ) : !!hint ? (
          <AppText size="xs" color="subText3">
            {hint}
          </AppText>
        ) : null}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={!single}
        autoFocus={autoFocus}
        textAlignVertical="top"
        placeholderTextColor={theme.subText3}
        style={{
          minHeight: single ? 48 : compact ? 52 : 72,
          color: theme.text,
          backgroundColor: theme.card,
          borderColor: error || value.length > MAX ? theme.error : theme.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: "MulishRegular",
          fontSize: 16,
        }}
      />
      {!!error && (
        <AppText size="xs" color="error" style={{ marginTop: 4 }}>
          {error}
        </AppText>
      )}
    </View>
  );
};

/** Mở sheet sửa nghĩa: nhấn giữ 1 phần tử (có `focus`) hoặc form đầy đủ (không có `focus`). */
export const useSenseEditor = (override?: { sense?: any; onSaved?: () => void }) => {
  const ctxSense = useContext(SenseContext);
  const ctxSaved = useContext(SenseSavedContext);
  const { present } = useBottomSheet();
  const settings = useAppStore((s) => s.settings);
  const sense = override?.sense ?? ctxSense;
  const onSaved = override?.onSaved ?? ctxSaved;
  const wordLang: string = settings?.learning_language ?? "en";
  const userLang: string = settings?.translate_language ?? "vi";

  const edit = useCallback(
    (focus?: EditFocus) => {
      if (!sense?.id) return;
      present({
        title: TITLE[focus ? focus.split(":")[0] : "full"],
        size: focus ? "medium" : "full",
        render: () => (
          <EditSenseSheet sense={sense} wordLang={wordLang} userLang={userLang} focus={focus} onSaved={onSaved} />
        ),
      });
    },
    [sense, wordLang, userLang, onSaved, present],
  );
  return { edit, canEdit: !!sense?.id };
};
