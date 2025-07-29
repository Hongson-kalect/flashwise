import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  value: { value: string; link_to?: string }[];
  editable?: boolean;
  onPress?: () => void;
};
const WordLink = ({ label, editable, onPress, value }: Props) => {
  const { theme } = useTheme();
  return (
    <View className="flex-row gap-2">
      <AppText
        weight="bold"
        //   style={{ textDecorationLine: editable ? "underline" : "none" }}
      >
        {label}:
      </AppText>
      <View className="flex-1 flex-row flex-wrap gap-1">
        {value?.length ? (
          value.map((item, index) => (
            <LinkElement
              isLast={index === value.length - 1}
              key={index}
              value={item.value}
              link_to={item.link_to}
            />
          ))
        ) : (
          <AppText color="subText3">Chưa có</AppText>
        )}
        {editable && (
          <TouchableOpacity
            style={{ backgroundColor: theme.success }}
            className="px-3 items-center justify-center rounded ml-2"
          >
            <AppIcon
              onPress={() => alert("vv")}
              branch="antd"
              name={"plus"}
              size={14}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const LinkElement = ({
  value,
  link_to,
  isLast,
}: {
  value: string;
  link_to?: string;
  isLast?: boolean;
}) => {
  const { routerPush } = useAppNavigation();
  const router = useRouter();

  const render = () => {
    if (!link_to) return <AppText color="subText1">{value}</AppText>;

    return (
      <TouchableOpacity
        onPress={() => {
          console.log(1111);
          router.push(`/screens/Card/Word/${link_to}`);
        }}
      >
        <AppText color="link">{value}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-row">
      {render()}
      <AppText color="subText1">{isLast ? "." : ","}</AppText>
    </View>
  );
};

export default WordLink;
