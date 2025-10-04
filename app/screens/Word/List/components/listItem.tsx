import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";

type Props = {
  onLongPress?: () => void;
  onPress?: () => void;
  disabled?: boolean;
};
const WordListItem = (props: Props) => {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onLongPress={() => {
        props.onLongPress?.();
      }}
      disabled={props.disabled}
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
      onPress={() =>
        props.onPress?.() || router.push(`/screens/Word/Detail/${2}`)
      }
      className="flex-row items-center gap-3 overflow-hidden p-3"
    >
      <View
        style={{ height: 68, width: 110 }}
        className="items-center justify-center bg-gray-200 rounded"
      >
        <Image
          className="w-full h-full rounded"
          source={{ uri: "https://picsum.photos/900/1200" }}
          style={{ resizeMode: "cover" }}
        />
      </View>
      <View className="h-full flex-1">
        {/* <AppText font="MulishSemiBold" size={"lg"}>
          Professional */}
        <AppText numberOfLines={1} font="MulishSemiBold" color="text">
          Parazicmonobenzen
        </AppText>
        <AppText
          numberOfLines={1}
          size={"xs"}
          font={"MulishRegularItalic"}
          color="subText2"
        >
          Chuyên nghiệp, chuyên môn, biểu diễn
        </AppText>
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-2 flex-1">
            <TouchableOpacity
              className=" rounded h-7 w-7 items-center justify-center"
              style={{
                backgroundColor: props.disabled
                  ? theme.disabled
                  : theme.primary,
              }}
              onPress={() => {}}
            >
              <AppIcon
                branch="feather"
                name={"volume-2"}
                size={14}
                color="white"
              />
            </TouchableOpacity>

            <AppText
              style={{ flexShrink: 1 }}
              numberOfLines={1}
              size={"xs"}
              color="subText2"
            >
              /las:jky/
            </AppText>
          </View>

          <View className="gap-2 flex-row justify-between">
            <View className="flex-row items-center gap-1">
              <AppText
                font="MulishSemiBold"
                numberOfLines={1}
                size={"sm"}
                color="primary"
              >
                L2
              </AppText>
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
