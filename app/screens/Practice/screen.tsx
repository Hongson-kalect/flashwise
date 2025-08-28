import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import FlipCard from "react-native-flip-card";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Divider } from "react-native-paper";
import ReAnimated from "react-native-reanimated";

const cc = [
  "Học từ mới: Hiện full, trừ nghĩa, người dùng bấm vào để hiển thị nghĩa (Đoán nghĩa), sau đó gõ lại nội dung gốc",
  "Lượt 2: Hiện full, trừ từ gốc, người dùng gõ từ gốc",
  "Lượt 3: Phát âm thanh, người dùng gõ từ",
  "Lượt 4: Hiện mic, người dùng phát âm từ",
  "Lượt 5: Lặp lại lượt 2, không hiện bản dịch",
];

const other = [
  "Nhìn hình đoán từ: (Chỉ áp dụng cho từ có hình) Hiển thị hình và gõ từ hoặc chọn abcd",
  "Hiện bản dịch: Chọn or nhập or đọc từ gốc",
  "Điền từ vào chỗ trống trong ví dụ",
  "Nối từ và nghĩa, nếu có full ảnh thì nối từ với ảnh",
  "Cắt các từ trong câu và chọn như doulingo",

  "Siêu tốc: hiển thị từ gốc, chọn bản dịch. Hiện bản dịch, chọn từ gốc... Túm lại là lặp đi lặp lại 1 phương pháp, trừ nghe",
  "Câu hỏi đố với từ đó, dạng abcd, các dạng như bài tiếng anh cơ bản: Chọn từ sai trong câu, dạng đúng của từ, trọng âm, sắp xếp thứ tự từ",
];

const methods = {
  newWord: {
    1: "Hiển thị từ, nghĩa, ví dụ theo ngôn ngữ dựa vào cài đặt của người dùng",
    2: "Hiển thị từ và chỉ cần nhấn next?",
  },
  input: {
    // Thứ chương trình đưa ra cho người dùng
    1: "Hiển thị từ gốc, nghĩa, hình ảnh, định nghĩa, ví dụ",
    2: "Hiển thị hình ảnh, định nghĩa, ví dụ (lược bỏ từ gốc)",
    3: "Hiển thị hình ảnh | Định nghĩa",
    4: "Hiển thị từ gốc",
    5: "Hiển thị bản dịch của từ đó",
    6: "Phát âm thanh phát âm của từ đó",
    7: "Phát âm thanh định nghĩa của từ đó",
    8: "Hiển thị hình cái mic và từ gốc",
  },
  output: {
    // cách người dùng cần làm để trả lời
    1: {
      1: "Viết lại từ đó",
    },
    2: {
      1: "Viết lại từ đó",
      2: "Chọn hình ảnh",
      3: "Chọn từ đúng",
    },
    3: {
      1: "Viết lại từ đó",
      2: "Chọn hình ảnh",
      3: "Chọn từ đúng",
    },
    4: {
      1: "Chọn bản dịch",
      2: "Phát âm từ",
    },
    5: {
      1: "Chọn từ gốc",
      2: "Ghi lại từ gốc",
    },
  },
};
export default function PracticePage() {
  const { theme } = useTheme();
  const { height, width } = useWindowDimensions();
  const [cardHeight, setCardHeight] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const handleFlipCard = () => {
    setIsFlipping(true);

    const toValue = isFlipped ? 0 : 180;

    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      friction: 4,
      tension: 10,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "flex-end",
      }}
      enableOnAndroid={true}
      extraScrollHeight={100} // Đẩy thêm để không bị che
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-2">
            <View className="h-10 flex-row items-center gap-4 mb-2">
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.success }}
              >
                <View className="h-6 w-6 rounded-full bg-white"></View>
              </View>
              <ReAnimated.View
                className="h-5 bg-gray-200 rounded-full"
                style={{ flex: 1 }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: "50%",
                    elevation: 4,
                    backgroundColor: theme.success,
                  }}
                ></View>
              </ReAnimated.View>

              <View>
                <AppIcon
                  branch="antd"
                  name={"setting"}
                  size={28}
                  color="subText2"
                />
              </View>
            </View>

            <Divider />

            <View className="items-center mt-6">
              <FlipCard
                friction={200}
                flipHorizontal={true}
                flip={false}
                flipVertical={false}
                useNativeDriver={true}
              >
                <View
                  onLayout={(e) =>
                    setCardHeight((prev) =>
                      Math.max(prev, e.nativeEvent?.layout?.height || 0)
                    )
                  }
                  // onPress={handleFlipCard}
                  style={[
                    {
                      minHeight:
                        ((height - (StatusBar.currentHeight || 0)) / 7) * 4,
                      width: width - 48,
                      backgroundColor: theme.background,
                      elevation: 6,
                      height: cardHeight || "auto",
                    },
                  ]}
                  className="rounded-lg"
                >
                  <View className="flex-row items-center justify-between px-4 mt-4 mb-2">
                    <TouchableOpacity
                      style={{ backgroundColor: theme.primary }}
                      onPress={() => alert("hello")}
                      className="h-20 w-20 rounded-lg items-center justify-center"
                    >
                      <AppIcon
                        branch="feather"
                        color="white"
                        size={16}
                        name={"volume-2"}
                      />
                    </TouchableOpacity>

                    <View className="flex-row gap-2 justify-end">
                      <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
                        <AppIcon
                          color="subText3"
                          branch="feather"
                          size={16}
                          name={"arrow-left"}
                        />
                      </View>
                      <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
                        <AppIcon
                          color="subText3"
                          branch="feather"
                          size={16}
                          name={"arrow-right"}
                        />
                      </View>
                      <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
                        <AppIcon
                          color="subText3"
                          branch="feather"
                          size={16}
                          name={"save"}
                        />
                      </View>
                    </View>
                  </View>
                  <View className="mb-4 px-2">
                    <View className="flex-row gap-2 items-center">
                      <View>
                        <AppText
                          font="MulishBold"
                          color="primary"
                          className="text-center"
                          size={24}
                        >
                          Strauberry cake
                        </AppText>
                        <View className="flex-row items-center">
                          <AppText
                            color="subText2"
                            size={"xs"}
                            font="MulishLightItalic"
                          >
                            {"/em'la:bupclmm/"}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="w-full" style={{ height: 180 }}>
                    <Image
                      className="w-full h-full"
                      source={{ uri: "https://picsum.photos/200/300" }}
                      resizeMode="cover"
                    />
                  </View>
                  <View className="px-4 py-2 justify-between">
                    <View className="w-full">
                      <AppText font="MulishRegular" size={"sm"}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt.
                      </AppText>
                    </View>
                  </View>
                  <View className="mt-auto px-4 py-2">
                    <AppText
                      color="subText2"
                      size={"xs"}
                      font="MulishLightItalic"
                    >
                      Example: Lorem ipsum dolor sit amet, Example: Lorem ipsum
                      dolor dolor sit amet,{" "}
                      <AppText size={"xs"} font="MulishBoldItalic">
                        strauberry cake
                      </AppText>{" "}
                      adipiscing elit.
                    </AppText>
                  </View>
                </View>

                {/* BACK SIDE */}

                <View
                  onLayout={(e) =>
                    setCardHeight((prev) =>
                      Math.max(prev, e.nativeEvent?.layout?.height || 0)
                    )
                  }
                  // onPress={handleFlipCard}
                  style={[
                    {
                      minHeight:
                        ((height - (StatusBar.currentHeight || 0)) / 7) * 4,
                      width: width - 48,
                      backgroundColor: theme.background,
                      elevation: 6,
                      height: cardHeight || "auto",
                    },
                  ]}
                  className="rounded-lg"
                >
                  {/* CONTENT BACK */}
                  <AppText font="MulishBold" size={20} className="mb-2">
                    Mặt sau
                  </AppText>
                  <AppText font="MulishRegular" size="sm">
                    Đây là mặt sau của thẻ. Bạn có thể thêm định nghĩa, ghi chú,
                    ví dụ chi tiết, hoặc bất cứ thứ gì ở đây.
                  </AppText>
                </View>
              </FlipCard>
            </View>
            <View
              // style={{ marginTop: cardHeight + 28 }}
              className=" mt-8 px-4 mb-6"
            >
              <AppText
                className="mb-2"
                size={"sm"}
                font="MulishSemiBold"
                color="error"
              >
                Từ của cái của nợ thẻ này là?
              </AppText>
              <View>
                <Pressable
                  style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: theme.primary,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                  }}
                >
                  <TextInput
                    style={{
                      // color: theme.primary,
                      fontFamily: fontFamily.MulishSemiBold,
                      fontSize: 20,
                    }}
                    placeholder="Answer..."
                  />
                </Pressable>
              </View>
              {/* <View className="flex-row flex-wrap gap-y-4 mt-2">
                <View className="w-1/2 pr-2">
                  <AppButton
                    size="xl"
                    style={{
                      ...borderStyle,
                      borderRadius: 8,
                      elevation: 2,
                    }}
                    type="white"
                    onPress={() => {}}
                  >
                    <AppText
                      size={"sm"}
                      font="MulishBold"
                      className="text-center"
                    >
                      Run
                    </AppText>
                  </AppButton>
                </View>
                <View className="w-1/2 pl-2">
                  <AppButton
                    size="xl"
                    style={{ ...borderStyle, borderRadius: 8, elevation: 2 }}
                    type="white"
                    onPress={() => {}}
                  >
                    <AppText
                      size={"sm"}
                      font="MulishBold"
                      className="text-center"
                    >
                      Walking
                    </AppText>
                  </AppButton>
                </View>
                <View className="w-1/2 pr-2">
                  <AppButton
                    size="xl"
                    style={{ ...borderStyle, borderRadius: 8, elevation: 2 }}
                    type="white"
                    onPress={() => {}}
                  >
                    <AppText
                      size={"sm"}
                      font="MulishBold"
                      className="text-center"
                    >
                      Punch
                    </AppText>
                  </AppButton>
                </View>
                <View className="w-1/2 pl-2">
                  <AppButton
                    size="xl"
                    style={{ ...borderStyle, borderRadius: 8, elevation: 2 }}
                    type="white"
                    onPress={() => {}}
                  >
                    <AppText
                      size={"sm"}
                      font="MulishBold"
                      className="text-center"
                    >
                      Drive
                    </AppText>
                  </AppButton>
                </View>
              </View> */}
            </View>
            <View className="h-8"></View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({});
