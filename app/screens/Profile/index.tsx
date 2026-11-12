import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import SyncStatus from "@/components/SyncStatus";
import { useTheme } from "@/providers/Theme";
import { nextRetention } from "@/learning/fsrsService";
import { useAppStore } from "@/stores/appStore";
import { learningLanguages, motherLanguages } from "@/constants/languages";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
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

// Tên ngắn của ngôn ngữ (phần trước dấu · của danh sách chọn) để hiện ở hàng Ngôn ngữ
const LANG_NAME: Record<string, string> = Object.fromEntries(
  [...learningLanguages, ...motherLanguages].map((l) => [l.code, l.language.split(" · ")[0]]),
);

export default function ProfilePage() {
  // Các dạng click: toggle, range, list modal, new page, disable, feedback modal
  // Mũi tên, switch/ external link/ range/ modal
  const { theme } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const dbService = useAppStore((s) => s.dbService);
  const userProfile = useAppStore((s) => s.userProfile);
  const updateSetting = useAppStore((s) => s.updateSetting);

  // Công tắc các bước học: ghi user_settings (đồng bộ lên server) và RAM; phiên học sau đọc lại từ DB
  const toggleLearnSetting = async (key: "hearable" | "talkable" | "writable" | "auto_known") => {
    const next = settings?.[key] === false;
    updateSetting({ [key]: next });
    await dbService?.setSetting(key, next);
  };

  // Mục tiêu nhớ (FSRS request_retention): bấm để đổi vòng 80% → 85% → 90% → 95%
  const cycleRetention = async () => {
    const next = nextRetention(settings?.request_retention);
    updateSetting({ request_retention: next });
    await dbService?.setSetting("request_retention", next);
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      <ScrollView className="px-2" showsVerticalScrollIndicator={false}>
        <View className="pt-4">
          <SyncStatus />
        </View>
        <View style={{ marginTop: 24 }} className="">
          <View className="w-full items-center">
            {/* <View
              style={{ height: 100, width: 100 }}
              className=" rounded-full border border-border"
            ></View> */}
            <AppText
              font="MulishBold"
              size={"2xl"}
              color="error"
              style={{ paddingVertical: 32 }}
            >
              Bạn đang dùng tài khoản khách
            </AppText>
          </View>

          <View className="flex-row justify-between items-center px-2 gap-2">
            <View className="flex-row gap-2 flex-1 my-4">
              <View
                style={{ elevation: 2, borderWidth: 1, borderColor: "#ddd" }}
                className="h-14 w-14 rounded-full bg-background-2"
              ></View>
              <View>
                <AppText font="MulishSemiBold" size={10} color="primary">
                  Khách
                </AppText>
                <AppText font="MulishBold">{userProfile?.full_name || "Khách"}</AppText>
                <AppText font="MulishLightItalic" size={"xs"} color="subText2">
                  Đăng nhập để giữ tiến độ học
                </AppText>
              </View>
            </View>
            <View>
              <AppButton
                title="Đăng nhập"
                type="primary"
                onPress={() => router.push("/screens/Login/screen")}
              >
                <AppIcon
                  branch="feather"
                  name="log-in"
                  size={16}
                  color="white"
                />
                <AppText color="white">Đăng nhập</AppText>
              </AppButton>
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
          value={`${LANG_NAME[settings?.learning_language ?? "en"] ?? settings?.learning_language} · ${LANG_NAME[settings?.translate_language ?? "vi"] ?? settings?.translate_language}`}
          rightContent="newPage"
          onPress={() => router.push("/screens/Profile/Language/screen")}
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
          title="Học tập"
        />
        <SettingOption
          icon={<AppIcon branch="feather" name="headphones" size={20} color="subText3" />}
          label="Bước nghe"
          rightContent="toggle"
          value={settings?.hearable !== false}
          onPress={() => toggleLearnSetting("hearable")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="mic" size={20} color="subText3" />}
          label="Bước nói"
          rightContent="toggle"
          value={settings?.talkable !== false}
          onPress={() => toggleLearnSetting("talkable")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="edit-3" size={20} color="subText3" />}
          label="Bước viết tay (Trung, Nhật, Hàn)"
          rightContent="toggle"
          value={settings?.writable !== false}
          onPress={() => toggleLearnSetting("writable")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="check-circle" size={20} color="subText3" />}
          label="Tự đánh dấu từ đã biết theo mức"
          rightContent="toggle"
          value={settings?.auto_known !== false}
          onPress={() => toggleLearnSetting("auto_known")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="target" size={20} color="subText3" />}
          showValue
          label="Mục tiêu nhớ (cao hơn = ôn nhiều hơn)"
          value={`${Math.round((typeof settings?.request_retention === "number" ? settings.request_retention : 0.9) * 100)}%`}
          rightContent="internalModal"
          onPress={cycleRetention}
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
