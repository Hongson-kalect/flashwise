import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value: { value: string; link_to?: string }[];
  editable?: boolean;
  onPress?: () => void;
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
};
const WordLink = ({
  label,
  editable,
  onPress,
  value,
  labelWidth,
  onLabelLayout,
}: Props) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!editable}
      className="flex-row gap-2"
    >
      <AppText
        weight="100"
        color="subText2"
        size={"sm"}
        style={
          labelWidth
            ? {
                width: labelWidth,
              }
            : {}
        }
        onLayout={onLabelLayout}
      >
        {label}
      </AppText>
      <AppText weight="bold" color="subText2" size={"sm"}>
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
              isEditable={editable}
            />
          ))
        ) : (
          <AppText color="subText3">Chưa có</AppText>
        )}
      </View>
      {editable && (
        <View>
          <TouchableOpacity
            className="px-3 py-1.5 items-center justify-center rounded"
            style={{ backgroundColor: theme.background }}
          >
            <AppIcon
              onPress={onPress}
              name="edit"
              branch="antd"
              size={16}
              color={theme.secondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
      </View>
      <AppText>{isLast ? "." : ","}</AppText>
    </View>
  );
};

export default WordLink;
