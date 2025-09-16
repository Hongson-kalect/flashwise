import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import Slider from "@react-native-community/slider";
import React from "react";
import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";

export default function ProfilePage() {
  // Các dạng click: toggle, range, list modal, new page, disable, feedback modal
  // Mũi tên, switch/ external link/ range/ modal
  const { theme } = useTheme();

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 24 }} className="">
          <View className="w-full items-center">
            {/* <View
              style={{ height: 100, width: 100 }}
              className=" rounded-full border border-gray-300"
            ></View> */}
            <AppText
              font="MulishBold"
              size={"xl"}
              color="warning"
              style={{ paddingVertical: 16 }}
            >
              Bạn chưa đăng nhập
            </AppText>
          </View>

          <View className="flex-row justify-between items-center px-2 gap-2">
            <View className="flex-row gap-2 flex-1 my-4">
              <View className="h-14 w-14 rounded-full bg-gray-100"></View>
              <View>
                <AppText font="MulishLight" size={10} color="primary">
                  Guess
                </AppText>
                <AppText font="MulishBold">Guess#1042011</AppText>
                <AppText size={"xs"} color="subText3">
                  Login to keep your progress
                </AppText>
              </View>
            </View>
            <View>
              <AppButton title="Login" type="primary" onPress={() => {}} />
            </View>
          </View>
        </View>
        <Divider />
        <SettingOption
          icon={
            <AppIcon
              branch="mui"
              name="color-lens"
              size={20}
              color="subText3"
            />
          }
          showValue
          label="Theme"
          value="light"
        />

        <Divider />
        <SettingOption
          icon={
            <AppIcon
              branch="mui"
              name="font-download"
              size={20}
              color="subText3"
            />
          }
          label="Text font"
          rightContent="toggle"
        />
        <Divider />
        <SettingOption
          icon={
            <AppIcon branch="mui" name="vibration" size={20} color="subText3" />
          }
          label="Rung"
          value={false}
          rightContent="toggle"
        />
        <Divider />
        <SettingOption
          icon={
            <AppIcon
              branch="feather"
              name="volume-2"
              size={20}
              color="subText3"
            />
          }
          label="Âm lượng"
          showValue
          rightContent="range"
        />
        <Divider />

        <SettingOption
          icon={
            <AppIcon branch="mui" name="language" size={20} color="subText3" />
          }
          showValue
          label="Ngôn ngữ"
          value="Tiếng Việt"
        />
        <Divider />

        <SettingOption
          icon={
            <AppIcon
              branch="feather"
              name="database"
              size={20}
              color="subText3"
            />
          }
          showValue
          label="Quản lý dữ liệu"
          rightContent="newPage"
        />

        <Divider />

        <AppTitle
          style={{ marginVertical: 16, paddingLeft: 4 }}
          title="Thông tin"
        />
        <SettingOption
          icon={<AppIcon branch="mui" name="apps" size={20} color="subText3" />}
          showValue
          label="Phiên bản ứng dụng"
          value="1.0.0"
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="fa6" name="flag" size={20} color="subText3" />}
          label="Phản hồi, góp ý"
          // rightContent="internalModal"
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="mui" name="star" size={20} color="subText3" />}
          label="Đánh giá ứng dụng"
        />
        <Divider />
        <SettingOption
          icon={
            <AppIcon
              branch="mui"
              name="file-present"
              size={20}
              color="subText3"
            />
          }
          label="Điều khoản"
        />
        <Divider />
        <SettingOption
          icon={
            <AppIcon branch="mui" name="person" size={20} color="subText3" />
          }
          label="Về chúng tôi"
        />

        <View className="h-10"></View>
      </ScrollView>
    </View>
  );
}

type SettingOptionProps = {
  icon?: React.ReactNode;
  label: string;
  showValue?: boolean;
  value?: string | boolean | number;
  setValue?: (val: string | boolean | number) => void;
  rightContent?:
    | "toggle"
    | "range"
    | "internalModal"
    | "externalModal"
    | "newPage";
  onPress?: () => void;
};
const SettingOption = (props: SettingOptionProps) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const rightIcon = () => {
    if (props.rightContent === "toggle")
      return <Switch value={!!props.value} onValueChange={props.onPress} />;
    if (props.rightContent === "range")
      return (
        <Slider
          style={{ width: width / 2 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={Number(props.value)}
          onValueChange={(val) => props.setValue?.(val)}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.disabled}
          thumbTintColor={theme.primary}
          shouldRasterizeIOS
        />
      );
    if (props.rightContent === "internalModal")
      return <AppIcon branch="antd" name="right" size={12} color="subText2" />;
    if (props.rightContent === "externalModal")
      return <AppIcon branch="feather" name="external-link" />;
    if (props.rightContent === "newPage")
      return <AppIcon branch="antd" name="right" size={12} color="subText2" />;
  };
  return (
    <TouchableOpacity
      disabled={!props.onPress}
      onPress={props.onPress}
      style={{ height: 64 }}
      className="flex-row justify-between items-center px-2"
    >
      <View className="flex-row items-center gap-2 flex-1">
        <View className="w-6">{props.icon}</View>
        <View>
          <AppText color="subText1" font="MulishSemiBold">
            {props.label}
          </AppText>
        </View>
      </View>

      <View
        style={{
          marginRight: ["toggle", "range"].includes(props.rightContent || "")
            ? 0
            : 12,
        }}
        className="flex-row items-center gap-2"
      >
        {props.showValue && (
          <AppText size={"xs"} color="subText3">
            {props.value}
          </AppText>
        )}
        {props.rightContent && rightIcon()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
