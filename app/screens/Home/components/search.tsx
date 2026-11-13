import AppIcon from "@/components/AppIcon";
import SearchBar from "@/components/SearchBar";
import AppText from "@/components/AppText";
import { useDebounce } from "@/hooks/useDebouce";
import { useTheme } from "@/providers/Theme";
import { searchWords } from "@/services/api/words";
import { useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

type Props = {
  /** Vị trí dọc của ô tìm kiếm trong nội dung cuộn + độ cuộn hiện tại: để lớp gợi ý nổi bám theo ô. */
  anchorY: number;
  scrollY: SharedValue<number>;
  /** Màn hình cha vẽ lớp gợi ý ở gốc (ngoài ScrollView) để nó nổi lên trên, không đẩy layout bên dưới. */
  setOverlay: (node: ReactNode) => void;
};

const HomeSearch = ({ anchorY, scrollY, setOverlay }: Props) => {
  const { theme } = useTheme();
  const lang = useAppStore((s) => s.settings?.learning_language ?? "en");
  const [value, setValue] = useState("");
  const [barHeight, setBarHeight] = useState(52);
  const q = useDebounce(value.trim());

  const { data = [], isFetching } = useQuery({
    queryKey: ["searchWord", q, lang],
    queryFn: () => searchWords(q, lang),
    enabled: q.length > 0,
    staleTime: 60_000,
  });

  // Từ chưa có trong hệ thống vẫn mở được: màn chi tiết sẽ nhờ AI tạo.
  const open = (word: string) => {
    setValue("");
    router.push({
      pathname: "/screens/Word/Detail/[value]",
      params: { value: word },
    });
  };

  useEffect(() => {
    setOverlay(
      q.length > 0 ? (
        <Results
          top={anchorY + barHeight + 8}
          scrollY={scrollY}
          words={data}
          loading={isFetching && !data.length}
          q={q}
          onOpen={open}
        />
      ) : null,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [q, data, isFetching, anchorY, barHeight, theme]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  useEffect(() => () => setOverlay(null), []);

  return (
    <View onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}>
      <SearchBar
        value={value}
        onChangeText={setValue}
        placeholder="Tra từ bất kỳ..."
        onSubmitEditing={() => value.trim() && open(value.trim())}
      />
    </View>
  );
};

const Results = ({
  top,
  scrollY,
  words,
  loading,
  q,
  onOpen,
}: {
  top: number;
  scrollY: SharedValue<number>;
  words: { id: string; value: string }[];
  loading: boolean;
  q: string;
  onOpen: (word: string) => void;
}) => {
  const { theme } = useTheme();
  // Nổi trên mọi thứ, theo ô tìm kiếm khi trang cuộn
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -scrollY.value }] }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left: 16,
          right: 16,
          zIndex: 50,
          elevation: 8,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
    >
      {words.map((w) => (
        <Pressable
          key={w.id}
          onPress={() => onOpen(w.value)}
          className="px-4 py-3 flex-row items-center justify-between"
        >
          <AppText font="MulishSemiBold">{w.value}</AppText>
          <AppIcon branch="feather" name="chevron-right" size={16} color={theme.subText3} />
        </Pressable>
      ))}
      <Pressable onPress={() => onOpen(q)} className="px-4 py-3 flex-row items-center gap-2">
        <AppIcon branch="feather" name="plus-circle" size={16} color={theme.primary} />
        <AppText color="primary" font="MulishSemiBold" size="sm">
          {loading ? "Đang tìm..." : `Tra "${q}"`}
        </AppText>
      </Pressable>
    </Animated.View>
  );
};

export default HomeSearch;
