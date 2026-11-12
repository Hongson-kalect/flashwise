import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { RunState } from "@/learning/engine";
import { clampGrade, GRADE_LABEL } from "@/learning/grade";
import { glossOf, Grade } from "@/learning/types";
import { useTheme } from "@/providers/Theme";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

type Props = {
  state: RunState;
  saving: boolean;
  onGrade: (key: string, grade: Grade) => void;
  onSave: () => void;
};

const GRADES: Grade[] = [1, 2, 3, 4];

/** Tổng kết cụm: mỗi nghĩa chọn sẵn điểm theo kết quả, user chỉnh tối đa ±1 nấc rồi lưu. */
const SummaryView = ({ state, saving, onGrade, onSave }: Props) => {
  const { theme } = useTheme();
  const tone: Record<Grade, string> = { 1: theme.error, 2: theme.warning, 3: theme.primary, 4: theme.success };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        <View className="items-center gap-1 pb-2">
          <AppText size="2xl" weight="bold" color="title">
            Xong cụm này!
          </AppText>
          <AppText color="subText1" textAlign="center">
            Mình đã chọn sẵn mức nhớ cho từng từ theo cả cụm (từ sai hoặc xem đáp án ở lần đầu vẫn tính là Khó / Quên dù sau đó bạn làm đúng). Nếu thấy chưa đúng, bạn chỉnh được 1 nấc; mức này quyết định khi nào từ quay lại ôn.
          </AppText>
        </View>
        {state.order.map((key) => {
          const run = state.cards[key];
          const auto = state.autoGrades[key];
          const chosen = state.grades[key];
          return (
            <View key={key} className="p-3 rounded-2xl gap-3" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <AppText size="lg" weight="bold" color="title">
                    {run.card.word}
                  </AppText>
                  <AppText size="sm" color="subText2" numberOfLines={1}>
                    {glossOf(run.card)}
                  </AppText>
                </View>
                {run.known && (
                  <View className="flex-row items-center gap-1 px-2.5 h-7 rounded-full" style={{ backgroundColor: theme.success + "1F" }}>
                    <AppIcon branch="feather" name="check-circle" size={13} color={theme.success} />
                    <AppText size="xs" weight="semibold" style={{ color: theme.success }}>
                      {run.auto ? "Tự đánh dấu đã biết" : "Đã biết"}
                    </AppText>
                  </View>
                )}
              </View>
              {!run.known && (
                <View className="flex-row gap-2">
                  {GRADES.map((g) => {
                    const active = chosen === g;
                    const allowed = clampGrade(auto, g) === g;
                    return (
                      <Pressable
                        key={g}
                        disabled={!allowed}
                        onPress={() => onGrade(key, g)}
                        className="flex-1 h-10 rounded-xl items-center justify-center"
                        style={{
                          backgroundColor: active ? tone[g] : "transparent",
                          borderWidth: 1.5,
                          borderColor: active ? tone[g] : theme.border,
                          opacity: allowed ? 1 : 0.35,
                        }}
                      >
                        <AppText size="sm" weight="bold" style={{ color: active ? "white" : theme.text }}>
                          {GRADE_LABEL[g]}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <View className="px-4 pb-4 pt-2">
        <Pressable
          onPress={onSave}
          disabled={saving}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{ backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <ActivityIndicator color="white" /> : <AppIcon branch="feather" name="check" size={18} color="white" />}
          <AppText color="white" size="lg" weight="bold">
            {saving ? "Đang lưu..." : "Lưu kết quả"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default SummaryView;
