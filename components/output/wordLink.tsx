import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import EditIcon from "@/components/icons/editIcon";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  label: string;
  value: { value: string; link_to?: string }[];
  mode?: "create" | "update" | "view";
  onPress?: () => void;
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  icon?: React.ReactNode;
};
const WordLink = ({
  label,
  mode = "view",
  onPress,
  value,
  labelWidth,
  onLabelLayout,
  icon,
}: Props) => {
  const { theme } = useTheme();
  return (
    <Animated.View layout={LinearTransition.springify()}>
      <TouchableOpacity
        onPress={onPress}
        disabled={mode === "view"}
        style={{
          minHeight: 28,
        }}
        className="flex-row gap-2"
      >
        <View className="flex-row gap-1 items-center h-6">
          {icon && <View style={{ width: 14 }}>{icon}</View>}

          <AppText
            font="MulishLight"
            color="subText2"
            size={"sm"}
            style={
              labelWidth
                ? {
                    width: labelWidth || "auto",
                  }
                : {}
            }
            onLayout={onLabelLayout}
          >
            {label}
          </AppText>
        </View>

        <AppText font="MulishBold" color="subText2" size={"sm"}>
          :
        </AppText>
        <View className="flex-1 flex-row flex-wrap gap-1">
          {value?.length ? (
            value.map((item, index) => (
              <LinkElement
                key={index}
                isLast={index === value.length - 1}
                value={item.value}
                link_to={item.link_to}
                isEditable={mode === "create"}
              />
            ))
          ) : (
            <AppText color="subText3">Chưa có</AppText>
          )}
        </View>
        {mode !== "view" && (
          <View>
            <TouchableOpacity
              disabled
              className="px-3 py-1.5 items-center justify-center rounded"
              // style={{ backgroundColor: theme.background }}
            >
              <EditIcon opacity={1} />
              {/* Nếu có dữ liệu rồi thì giảm opacity */}
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const LinkElement = ({
  value,
  link_to,
  isLast,
  isEditable,
}: {
  value: string;
  link_to?: string;
  isLast?: boolean;
  isEditable?: boolean;
}) => {
  const { routerPush } = useAppNavigation();
  const router = useRouter();

  const render = () => {
    if (!link_to) return <AppText>{value}</AppText>;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/screens/Word/Detail/${link_to}`);
        }}
      >
        <AppText color="link">{value}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-row">
      <View style={{ paddingRight: isEditable ? 14 : 0 }} className="pr-4">
        {render()}
        {isEditable && (
          <View className="absolute -top-0.5 right-0">
            <AppIcon
              onPress={() => {
                alert("delete");
              }}
              branch="antd"
              name="closecircle"
              size={13}
              color="#b3b3b3"
            />
          </View>
        )}
      </View>
      <AppText>{isLast ? "." : ","}</AppText>
    </View>
  );
};

export default WordLink;
