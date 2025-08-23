import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

const WordListItem = () => {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        elevation: 6,
        borderRadius: 8,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        backgroundColor: theme.background,
      }}
      onPress={() => router.push(`/screens/Word/Detail/${2}`)}
      className="flex-row items-center gap-2 overflow-hidden px-3 py-2"
    >
      <View className="w-20 h-full items-center justify-center bg-gray-200 rounded"></View>
      <View className="h-full flex-1 p-2">
        <AppText font="MulishSemiBold" size={"lg"}>
          Professtional
        </AppText>
        <AppText
          numberOfLines={1}
          size={"xs"}
          font={"MulishRegularItalic"}
          color="subText2"
        >
          Chuyên nghiệp, chuyên môn, biểu diễn
        </AppText>

        <View className="mt-2 gap-2 flex-row justify-between">
          <View className="flex-row items-center gap-1">
            <AppText
              font="MulishBold"
              numberOfLines={1}
              // size={"lg"}
              color="primary"
            >
              L2
            </AppText>
            {/* <View
              style={{ backgroundColor: theme.primary }}
              className="px-2 py-0.5 rounded"
            >
              <AppText
                numberOfLines={1}
                size={"xs"}
                color="error"
                font="MulishBold"
              >
                A2
              </AppText>
            </View> */}
          </View>

          <View className="flex-row items-center gap-1">
            <View
              style={{ backgroundColor: theme.secondary }}
              className="px-2 py-0.5 bg-gray-100 rounded"
            >
              <AppText
                numberOfLines={1}
                font="MulishMedium"
                size={"xs"}
                color="white"
              >
                Noun
              </AppText>
            </View>
          </View>
        </View>
      </View>
      {/* <TouchableOpacity
        onPress={() => {}}
        className="w-12 h-full items-center justify-center"
      >
        <AppCheckbox onChange={() => {}} checked={false} />
      </TouchableOpacity>
      <AppText size={"sm"} className="flex-1 text-center">
        Từ
      </AppText>
      <AppText size={"sm"} className="w-16 text-center">
        {["n", "v", "adj"][Math.floor(Math.random() * 3)]}
      </AppText>
      <AppText size={"sm"} className="w-16 text-center">
        {Math.floor(Math.random() * 10)}
      </AppText> */}
    </TouchableOpacity>
  );
};

export default WordListItem;
