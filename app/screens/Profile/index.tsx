import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import React from "react";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-paper";

export default function ProfilePage() {
  // Các dạng click: toggle, range, list modal, new page, disable, feedback modal
  // Mũi tên, switch/ external link/ range/ modal
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View style={{ marginTop: 24 }} className="">
        <View className="w-full items-center">
          <View
            style={{ height: 100, width: 100 }}
            className=" rounded-full border border-gray-300"
          ></View>
        </View>

        <View className="flex-row gap-2 px-2 my-4">
          <View className="h-14 w-14 rounded-full bg-gray-100"></View>
          <View>
            <AppText font="MulishLight" size={"xs"}>
              Member
            </AppText>
            <AppText font="MulishBold">Huy Pham</AppText>
            <AppText size={"xs"} color="subText3">
              huyphamclmm@gmail.com
            </AppText>
          </View>
        </View>
      </View>
      <Divider />
      <SettingOption
        icon={
          <AppIcon branch="mui" name="color-lens" size={20} color="subText3" />
        }
        showValue
        label="Theme"
        value="light"
        rightContent="newPage"
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
        rightContent="internalModal"
      />

      <Divider />
      <AppText>Cài đặt</AppText>
      <AppText>Ngôn ngữ</AppText>
      <AppText>Quản lý dữ liệu</AppText>
      <AppText>Phiên bản</AppText>

      <Divider />
      <AppText>Thông tin</AppText>
      <AppText>Phản hồi</AppText>
      <AppText>Về chúng tôi</AppText>
      <AppText>Điều khoản / Chính sách</AppText>
    </View>
  );
}

type SettingOptionProps = {
  icon?: React.ReactNode;
  label: string;
  showValue?: boolean;
  value?: string | boolean;
  rightContent?:
    | "toggle"
    | "range"
    | "internalModal"
    | "externalModal"
    | "newPage";
  onPress?: () => void;
};
const SettingOption = (props: SettingOptionProps) => {
  const rightIcon = () => {
    if (props.rightContent === "toggle")
      return <Switch value={!!props.value} onValueChange={props.onPress} />;
    if (props.rightContent === "internalModal")
      return <AppIcon branch="antd" name="right" size={12} color="subText2" />;
    if (props.rightContent === "externalModal")
      return <AppIcon branch="feather" name="external-link" />;
    if (props.rightContent === "newPage")
      return <AppIcon branch="antd" name="right" size={12} color="subText2" />;
  };
  return (
    <TouchableOpacity
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
        style={{ marginRight: props.rightContent === "toggle" ? 0 : 12 }}
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
