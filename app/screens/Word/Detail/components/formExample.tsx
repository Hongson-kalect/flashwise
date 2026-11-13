import { useWordLangs } from "../wordLang";
import AppText from "@/components/AppText";
import { BoldText } from "@/components/output/BoldText";
import { SkeletonReact } from "@/components/skeleton/ReactSkeleton";
import { useTheme } from "@/providers/Theme";
import { fetchFormExample } from "@/services/api/words";
import { useAppStore } from "@/stores/appStore";
import { formPos } from "@/utils/formTags";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { View } from "react-native";
import { useFormFocus } from "../formsContext";
import { SenseContext } from "../senseEdit";

const cap = (s?: string) => `${s?.[0]?.toUpperCase() || ""}${s?.slice(1) || ""}`;

/**
 * Ví dụ riêng của dạng biến cách đang mở (gõ buying -> nghĩa của buy), đặt trên các ví dụ của từ gốc. Chưa có thì server nhờ AI
 * viết 1 câu (chỉ giữ câu chứa đúng dạng đó), lần sau mọi người dùng chung. Lỗi hay hết lượt: ẩn, các ví dụ của từ gốc vẫn hiện.
 */
const FormExample = () => {
  const { theme } = useTheme();
  const focus = useFormFocus();
  const sense = useContext(SenseContext);
  const { userLang } = useWordLangs();
  const showTranslation = useAppStore((s) => s.settings?.show_translation);
  const eligible = !!focus && !!sense?.id && focus.pos.includes(formPos(sense.pos));

  const { data, isLoading } = useQuery({
    queryKey: ["form-example", sense?.id, focus?.form, userLang],
    queryFn: () => fetchFormExample({ senseId: sense.id, form: focus!.form, userLang }),
    enabled: eligible,
    staleTime: Infinity,
    retry: false,
  });
  if (!eligible || (!isLoading && !data)) return null;

  return (
    <View
      style={{
        borderLeftWidth: 2,
        borderLeftColor: theme.primary,
        backgroundColor: theme.primary + "0D",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <View className="px-3 pt-2">
        <AppText size="xs" color="primary" weight="semibold">
          {focus!.form}
          {focus!.tags.length ? ` · ${focus!.tags.join(" / ")}` : ""}
        </AppText>
      </View>
      {data ? (
        <>
          <View className="pt-1 pb-2 px-3">
            <BoldText
              key={data.text}
              size={"sm"}
              color="subText1"
              boldColor="text"
              font="MulishRegular"
              boldFont="MulishBoldItalic"
              text={cap(data.text)}
              bold={focus!.form}
            />
          </View>
          {showTranslation && data.translate ? (
            <AppText font="MulishLightItalic" size={"xs"} color="subText2" className="pb-2.5 px-3">
              {cap(data.translate)}
            </AppText>
          ) : null}
        </>
      ) : (
        <View className="px-3 pt-2 pb-3">
          <SkeletonReact width="80%" height={14} style={{ borderRadius: 6 }} />
          <SkeletonReact width="50%" height={12} style={{ borderRadius: 6, marginTop: 6 }} />
        </View>
      )}
    </View>
  );
};

export default FormExample;
