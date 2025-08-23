import AppText from "@/components/AppText";
import EditIcon from "@/components/icons/editIcon";
import { useTheme } from "@/providers/Theme";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

type Props = {
  label?: string;
  value?: React.ReactNode;
  onPress?: () => void;
  labelWidth?: number;
  mode?: "create" | "update" | "view";
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  placeholder?: string;
  icon?: React.ReactNode;
};
const Information = ({
  label,
  mode = "view",
  onPress,
  value,
  labelWidth,
  onLabelLayout,
  placeholder,
  icon,
}: Props) => {
  const { theme } = useTheme();

  return (
    <Animated.View layout={LinearTransition.springify().mass(0.6)}>
      <TouchableOpacity
        onPress={onPress}
        disabled={mode === "view"}
        style={{
          minHeight: 28,
        }}
        className="flex-row gap-2"
      >
        {(icon || label) && (
          <>
            <View className="flex-row gap-1 items-center h-6">
              {icon && <View style={{ width: 14 }}>{icon}</View>}

              {label && (
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
              )}
            </View>

            {label && (
              <AppText font="MulishBold" color="subText2" size={"sm"}>
                :
              </AppText>
            )}
          </>
        )}

        <View className="flex-1">
          {value ? (
            typeof value === "string" ? (
              <AppText>{value}</AppText>
            ) : (
              value
            )
          ) : (
            <AppText color="subText3">{placeholder || "Chưa có"}</AppText>
          )}
        </View>

        {mode !== "view" && (
          <View>
            <TouchableOpacity
              onPress={onPress}
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
export default Information;
