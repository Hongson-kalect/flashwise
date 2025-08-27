import AppText from "@/components/AppText";
import AppCarousel from "@/components/output/carousel";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, useWindowDimensions, View } from "react-native";

const DiscoverSuggesstion = () => {
  const width = useWindowDimensions().width;
  return (
    <View className="rounded-lg">
      <AppCarousel
        width={width - 21}
        renderItem={(value) => <SuggesstionItem item={value} />}
      />

      {/* Thêm gradient đen phía dưới hình để ghi thông tin, copy mọe từ app routine sang cũng oke */}
    </View>
  );
};

type SuggesstionItemProps = {
  item: any;
};
const SuggesstionItem = ({ item }: SuggesstionItemProps) => {
  return (
    <Pressable
      onPress={() => router.push("/screens/Collection/Discover/Detail/[id]")}
      style={{
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ddd",
      }}
      className="rounded-t-lg overflow-hidden"
    >
      <Image
        className="h-full w-full"
        source={{ uri: "https://picsum.photos/200/300" }}
        style={{ resizeMode: "cover", backgroundColor: "white" }}
      ></Image>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
        style={{
          position: "absolute",
          height: 56,
          left: 0,
          padding: 4,
          // paddingHorizontal: 4,
          justifyContent: "flex-end",
          right: 0,
          bottom: 0,
        }}
      >
        <AppText color="white" font="MulishBold" size={"xl"} numberOfLines={1}>
          Mụ nội nhà nó
        </AppText>
      </LinearGradient>
    </Pressable>
  );
};

export default DiscoverSuggesstion;
