import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import {
  proposeErrorKind,
  ProposeErrorKind,
  proposeSense,
  ProposeResult,
} from "@/services/api/senses";
import { useAppStore } from "@/stores/appStore";
import { Chip, Skeleton } from "@/ui";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

const POS = ["noun", "verb", "adjective", "adverb"] as const;
const MIN = 8;
const MAX = 500;

type Props = {
  word: string;
  /** Chưa có khi từ còn đang tạo. */
  wordId?: string;
  /** Các nghĩa đang có (trong state trang từ) để người dùng đối chiếu, tránh thêm trùng. */
  senses?: Record<string, any>;
  /** Gọi khi nghĩa được thêm (official / pending) để trang từ tải lại. */
  onAdded?: () => void;
};

type Step =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "result"; data: ProposeResult }
  | { kind: "error"; error: ProposeErrorKind };

const ERROR_TEXT: Record<ProposeErrorKind, { title: string; hint: string; retry: boolean }> = {
  offline: { title: "Không có kết nối", hint: "Kiểm tra mạng rồi thử lại.", retry: true },
  throttled: { title: "Bạn gửi hơi nhiều", hint: "Mỗi giờ chỉ gửi được một số nghĩa. Thử lại sau ít phút.", retry: false },
  account_required: { title: "Cần tài khoản", hint: "Hãy đăng ký hoặc đăng nhập để đề xuất nghĩa cho mọi người.", retry: false },
  banned: { title: "Tài khoản đang bị hạn chế", hint: "Bạn chưa thể đề xuất nghĩa lúc này.", retry: false },
  unsupported: { title: "Chưa hỗ trợ ngôn ngữ này", hint: "Thêm nghĩa cho ngôn ngữ này sẽ có sau.", retry: false },
  unavailable: { title: "Hệ thống đang bận", hint: "Dịch vụ kiểm tra tạm thời chưa phản hồi. Thử lại sau.", retry: true },
  invalid: { title: "Nội dung chưa hợp lệ", hint: "Kiểm tra lại định nghĩa (8–500 ký tự) rồi gửi lại.", retry: true },
  unknown: { title: "Có lỗi xảy ra", hint: "Thử lại sau.", retry: true },
};

const short = (s: string, n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** Định nghĩa hiển thị của 1 nghĩa theo ngôn ngữ người học, rơi về ngôn ngữ của từ. */
const defOf = (sense: any, userLang?: string, wordLang?: string) =>
  sense?.contents?.definition?.[userLang ?? ""]?.value ??
  sense?.contents?.definition?.[wordLang ?? ""]?.value ??
  "";

/**
 * Thêm nghĩa mới: chỉ cần gõ định nghĩa. Server (cổng AI) quyết định: chính thức ngay / chờ admin duyệt /
 * đã có nghĩa tương tự / từ chối. Các nghĩa đang có hiện sẵn để đối chiếu trước khi gửi.
 */
const AddSenseSheet = ({ word, wordId, senses, onAdded }: Props) => {
  const { theme } = useTheme();
  const { close } = useBottomSheet();
  const settings = useAppStore((s) => s.settings);
  const userLang: string = settings?.translate_language ?? "vi";
  const wordLang: string = settings?.learning_language ?? "en";

  const [text, setText] = useState("");
  const [pos, setPos] = useState<string | null>(null);
  const [showExisting, setShowExisting] = useState(false);
  const [step, setStep] = useState<Step>({ kind: "form" });
  // Hook phải gọi trước mọi return sớm bên dưới (các màn kết quả), nếu không bấm Gửi sẽ crash "Rendered fewer hooks than expected"
  const focused = useFocused();

  const existing = useMemo(
    () =>
      Object.values(senses ?? {})
        .filter((s: any) => !pos || (s.pos ?? "").toLowerCase() === pos)
        .map((s: any) => ({ id: s.id, pos: s.pos, def: defOf(s, userLang, wordLang) }))
        .filter((s) => s.def),
    [senses, pos, userLang, wordLang],
  );

  const length = text.trim().length;
  const valid = length >= MIN && length <= MAX && !!wordId;

  const submit = async () => {
    if (!valid || !wordId) return;
    setStep({ kind: "loading" });
    try {
      const data = await proposeSense({ wordId, userLang, definition: text.trim(), pos: pos ?? "" });
      if (data.result === "official" || data.result === "pending") onAdded?.();
      setStep({ kind: "result", data });
    } catch (e) {
      setStep({ kind: "error", error: proposeErrorKind(e) });
    }
  };

  const edit = () => setStep({ kind: "form" });

  if (step.kind === "loading") return <Checking />;

  if (step.kind === "error") {
    const t = ERROR_TEXT[step.error];
    return (
      <Outcome
        tone="error"
        icon="alert-circle"
        title={t.title}
        body={t.hint}
        primary={
          step.error === "account_required"
            ? { label: "Đăng nhập", onPress: () => { close(); router.push("/screens/Login/screen"); } }
            : t.retry
              ? { label: "Thử lại", onPress: submit }
              : { label: "Đóng", onPress: close }
        }
        secondary={t.retry && step.error !== "offline" ? { label: "Sửa nội dung", onPress: edit } : undefined}
      />
    );
  }

  if (step.kind === "result") {
    const d = step.data;
    if (d.result === "official") {
      const def = defOf(d.sense, userLang, wordLang);
      return (
        <Outcome
          tone="success"
          icon="check-circle"
          title="Đã thêm nghĩa mới"
          body="Nghĩa đã được kiểm tra và điền sẵn ví dụ, bản dịch và thông tin liên quan. Nghĩa này hiện cho mọi người."
          preview={def}
          primary={{ label: "Xem nghĩa", onPress: close }}
        />
      );
    }
    if (d.result === "pending") {
      return (
        <Outcome
          tone="warning"
          icon="clock"
          title="Đã gửi, đang chờ duyệt"
          body="Nghĩa này cần người xem lại trước khi hiện cho mọi người. Trong lúc đó chỉ mình bạn thấy nó."
          preview={defOf(d.sense, userLang, wordLang)}
          primary={{ label: "Xong", onPress: close }}
        />
      );
    }
    if (d.result === "duplicate") {
      return (
        <Outcome
          tone="info"
          icon="copy"
          title="Từ này đã có nghĩa tương tự"
          body="Không cần thêm lại. Đây là nghĩa đã có:"
          preview={defOf(d.sense, userLang, wordLang)}
          primary={{ label: "Đã hiểu", onPress: close }}
          secondary={{ label: "Sửa lại nội dung", onPress: edit }}
        />
      );
    }
    return (
      <Outcome
        tone="error"
        icon="x-circle"
        title={d.abuse ? "Nội dung không được chấp nhận" : "Chưa thêm được nghĩa này"}
        body={
          d.abuse
            ? "Nội dung có dấu hiệu spam hoặc cố điều khiển hệ thống. Hãy chỉ mô tả nghĩa của từ."
            : "Đây chưa phải một nghĩa đúng của từ này."
        }
        quote={d.reason}
        primary={{ label: "Sửa lại", onPress: edit }}
        secondary={{ label: "Đóng", onPress: close }}
      />
    );
  }

  return (
    <View className="px-4 pt-3 gap-5">
      {/* Ô nhập là trọng tâm: lớn, tự focus, viền nổi khi đang gõ */}
      <View>
        <View className="flex-row items-center justify-between" style={{ marginBottom: 10 }}>
          <AppText size="lg" weight="bold" color="title">
            Nghĩa này là gì?
          </AppText>
          <AppText size="xs" color={length > MAX ? "error" : "subText3"}>
            {length}/{MAX}
          </AppText>
        </View>
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={focused.onFocus}
          onBlur={focused.onBlur}
          multiline
          autoFocus
          placeholder={`Mô tả một nghĩa của "${word}" (tiếng Anh hoặc tiếng Việt)`}
          placeholderTextColor={theme.subText3}
          textAlignVertical="top"
          style={{
            minHeight: 150,
            color: theme.text,
            backgroundColor: theme.card,
            borderColor: length > MAX ? theme.error : focused.on ? theme.primary : theme.border,
            borderWidth: 2,
            borderRadius: 20,
            padding: 16,
            fontFamily: "MulishRegular",
            fontSize: 17,
          }}
        />
        {length > 0 && length < MIN && (
          <AppText size="xs" color="subText2" style={{ marginTop: 6 }}>
            Viết thêm một chút (ít nhất {MIN} ký tự).
          </AppText>
        )}
      </View>

      <View>
        <AppText size="sm" weight="semibold" color="subText1" style={{ marginBottom: 8 }}>
          Từ loại (tuỳ chọn)
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {POS.map((p) => (
            <Chip key={p} label={p} selected={pos === p} onPress={() => setPos(pos === p ? null : p)} />
          ))}
        </View>
      </View>

      {!wordId && (
        <AppText size="sm" color="warning">
          Từ đang được tạo, chờ xong rồi mới thêm nghĩa được.
        </AppText>
      )}

      <Pressable
        disabled={!valid}
        onPress={submit}
        className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: theme.primary, opacity: valid ? 1 : 0.45 }}
      >
        <AppIcon branch="feather" name="send" size={18} color="white" />
        <AppText color="white" size="lg" weight="bold">
          Gửi nghĩa
        </AppText>
      </Pressable>
      <AppText size="xs" color="subText3" textAlign="center" style={{ marginTop: -8 }}>
        Nghĩa hợp lệ sẽ hiện cho mọi người. Nội dung chưa rõ sẽ chờ người duyệt.
      </AppText>

      {/* Nghĩa đã có: phụ, thu gọn ở cuối để đối chiếu khi cần */}
      {existing.length > 0 && (
        <Pressable onPress={() => setShowExisting((v) => !v)} className="items-center" hitSlop={8}>
          <View className="flex-row items-center gap-1">
            <AppText size="sm" color="subText2" weight="semibold">
              Xem {existing.length} nghĩa đã có
            </AppText>
            <AppIcon branch="feather" name={showExisting ? "chevron-up" : "chevron-down"} size={16} color={theme.subText2} />
          </View>
        </Pressable>
      )}
      {showExisting && (
        <View className="gap-2" style={{ marginTop: -6 }}>
          {existing.map((s) => (
            <View key={s.id} className="flex-row gap-2">
              <AppText size="xs" color="primary" weight="semibold" style={{ width: 62 }}>
                {s.pos}
              </AppText>
              <AppText size="sm" color="subText2" style={{ flex: 1 }}>
                {short(s.def)}
              </AppText>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 30 }} />
    </View>
  );
};

const useFocused = () => {
  const [on, setOn] = useState(true);
  return { on, onFocus: () => setOn(true), onBlur: () => setOn(false) };
};

const STEPS = ["Đang kiểm tra nghĩa…", "Đang viết ví dụ và cách dùng…", "Đang dịch và hoàn thiện…"];

/** Trạng thái đang chờ kiểm tra (3–6 giây): đổi câu theo thời gian để người dùng thấy tiến triển. */
const Checking = () => {
  const { theme } = useTheme();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => Math.min(n + 1, STEPS.length - 1)), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <View className="px-4 pt-10 items-center gap-5">
      <ActivityIndicator size="large" color={theme.primary} />
      <AppText size="lg" weight="bold" color="title">
        {STEPS[i]}
      </AppText>
      <View className="w-full gap-2 mt-2">
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="70%" />
        <Skeleton height={14} width="80%" />
      </View>
    </View>
  );
};

type OutcomeProps = {
  tone: "success" | "warning" | "error" | "info";
  icon: React.ComponentProps<typeof AppIcon<"feather">>["name"];
  title: string;
  body: string;
  /** Nội dung xem trước (nghĩa vừa thêm / nghĩa đã có). */
  preview?: string;
  /** Lý do ngắn do AI trả về (giữ nguyên văn). */
  quote?: string;
  primary: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
};

const Outcome = ({ tone, icon, title, body, preview, quote, primary, secondary }: OutcomeProps) => {
  const { theme } = useTheme();
  const color = { success: theme.success, warning: theme.warning, error: theme.error, info: theme.primary }[tone];
  return (
    <View className="px-4 pt-6 items-center gap-3">
      <View
        className="h-16 w-16 rounded-full items-center justify-center"
        style={{ backgroundColor: color + "1F" }}
      >
        <AppIcon branch="feather" name={icon} size={30} color={color} />
      </View>
      <AppText size="xl" weight="bold" color="title" textAlign="center">
        {title}
      </AppText>
      <AppText color="subText1" textAlign="center">
        {body}
      </AppText>
      {!!preview && (
        <View
          className="w-full rounded-2xl p-4"
          style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        >
          <AppText weight="semibold" color="title">
            {preview}
          </AppText>
        </View>
      )}
      {!!quote && (
        <View className="w-full rounded-2xl p-4" style={{ backgroundColor: color + "12" }}>
          <AppText size="xs" color="subText2" style={{ marginBottom: 2 }}>
            Lý do
          </AppText>
          <AppText size="sm" color="subText1">
            {quote}
          </AppText>
        </View>
      )}
      <Pressable
        onPress={primary.onPress}
        className="w-full h-14 rounded-2xl items-center justify-center mt-2"
        style={{ backgroundColor: theme.primary }}
      >
        <AppText color="white" size="lg" weight="bold">
          {primary.label}
        </AppText>
      </Pressable>
      {secondary && (
        <Pressable onPress={secondary.onPress} hitSlop={8} className="py-2">
          <AppText color="subText1" weight="semibold">
            {secondary.label}
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

export default AddSenseSheet;
