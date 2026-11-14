import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import SyncStatus from "@/components/SyncStatus";
import { ThemeMode, useTheme } from "@/providers/Theme";
import { useReminder } from "@/hooks/useReminder";
import { nextRetention } from "@/learning/fsrsService";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { requestSync } from "@/services/sync/bus";
import { learningLanguages, motherLanguages } from "@/constants/languages";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import React from "react";
import { Switch, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";

// Tên ngắn của ngôn ngữ (phần trước dấu · của danh sách chọn) để hiện ở hàng Ngôn ngữ
const LANG_NAME: Record<string, string> = Object.fromEntries(
  [...learningLanguages, ...motherLanguages].map((l) => [l.code, l.language.split(" · ")[0]]),
);

const MODE_LABEL: Record<string, string> = { light: "Sáng", dark: "Tối", system: "Theo hệ thống" };

export default function ProfilePage() {
  // Các dạng click: toggle, range, list modal, new page, disable, feedback modal
  // Mũi tên, switch/ external link/ range/ modal
  const { theme } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const dbService = useAppStore((s) => s.dbService);
  const userProfile = useAppStore((s) => s.userProfile);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const reminder = useReminder();
  const { mode, setMode } = useTheme();
  const chooseTheme = () =>
    useModalStore.getState().addModal({
      type: "radio",
      title: "Giao diện",
      value: mode,
      options: [
        { label: "Sáng", value: "light" },
        { label: "Tối", value: "dark" },
        { label: "Theo hệ thống", value: "system" },
      ],
      onSelect: (v) => setMode(v as ThemeMode),
    });
  const toggleHaptics = async () => {
    const next = settings?.haptics === false;
    updateSetting({ haptics: next });
    await dbService?.setSetting("haptics", next);
  };

  // Công tắc các bước học: ghi user_settings (đồng bộ lên server) và RAM; phiên học sau đọc lại từ DB
  const toggleLearnSetting = async (key: "hearable" | "talkable" | "writable" | "auto_known" | "ask_review_mode") => {
    // ask_review_mode mặc định tắt (thiếu khoá = tắt), các công tắc kia mặc định bật
    const next = key === "ask_review_mode" ? settings?.ask_review_mode !== true : settings?.[key] === false;
    updateSetting({ [key]: next });
    await dbService?.setSetting(key, next);
  };

  // Hiện nội dung thô tục (mặc định tắt): bật thì gợi ý từ và Khám phá có từ / bộ thô tục. Ghi user_settings để server cũng lọc theo
  const addModal = useModalStore((s) => s.addModal);
  const applyOffensive = async (next: boolean) => {
    updateSetting({ show_offensive: next });
    await dbService?.setSetting("show_offensive", next);
    requestSync();
  };
  const toggleOffensive = () => {
    if (settings?.show_offensive === true) return applyOffensive(false);
    addModal({
      type: "confirm",
      title: "Hiện nội dung thô tục?",
      message: "Gợi ý từ và Khám phá sẽ có thêm từ thô tục và các bộ chứa chúng. Chỉ bật nếu bạn từ 18 tuổi trở lên.",
      okText: "Bật",
      onOk: () => applyOffensive(true),
    });
  };

  // Mục tiêu nhớ (FSRS request_retention): bấm để đổi vòng 80% → 85% → 90% → 95%
  const cycleRetention = async () => {
    const next = nextRetention(settings?.request_retention);
    updateSetting({ request_retention: next });
    await dbService?.setSetting("request_retention", next);
  };

  // Chọn số cho phần học (số từ mỗi cụm, số bước, số thẻ vuốt, mục tiêu ngày, giới hạn ôn): hộp chọn một, ghi user_settings
  const pickNumber = (key: string, title: string, options: number[], fallback: number, unit: string, zeroLabel?: string) => {
    const current = typeof settings?.[key] === "number" ? (settings[key] as number) : fallback;
    addModal({
      type: "radio",
      title,
      value: current,
      options: options.map((n) => ({ label: n === 0 && zeroLabel ? zeroLabel : `${n} ${unit}`, value: n })),
      onSelect: async (v) => {
        updateSetting({ [key]: Number(v) });
        await dbService?.setSetting(key, Number(v));
        requestSync();
      },
    });
  };
  const numValue = (key: string, fallback: number, unit: string, zeroLabel?: string) => {
    const v = typeof settings?.[key] === "number" ? (settings[key] as number) : fallback;
    return v === 0 && zeroLabel ? zeroLabel : `${v} ${unit}`;
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      <ScrollView className="px-2" showsVerticalScrollIndicator={false}>
        <View className="pt-2">
          <SyncStatus />
        </View>
        <View style={{ marginTop: 8 }}>
          <View className="flex-row justify-between items-center px-2 gap-2">
            <View className="flex-row items-center gap-3 flex-1 my-3">
              <View
                style={{ elevation: 2, borderWidth: 1, borderColor: "#ddd" }}
                className="h-12 w-12 rounded-full bg-background-2"
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
        <AppTitle style={{ marginTop: 20, marginBottom: 4, paddingLeft: 8 }} title="Giao diện và ngôn ngữ" />
        <SettingOption
          icon={<AppIcon branch="mui" name="color-lens" size={20} color="subText3" />}
          showValue
          label="Giao diện"
          value={MODE_LABEL[mode]}
          rightContent="internalModal"
          onPress={chooseTheme}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="mui" name="vibration" size={20} color="subText3" />}
          label="Rung khi chạm"
          rightContent="toggle"
          value={settings?.haptics !== false}
          onPress={toggleHaptics}
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
        <AppTitle style={{ marginTop: 20, marginBottom: 4, paddingLeft: 8 }} title="Mục tiêu và nhắc nhở" />
        <SettingOption
          icon={<AppIcon branch="feather" name="bell" size={20} color="subText3" />}
          label="Nhắc học mỗi ngày"
          showValue
          value={reminder.label}
          rightContent="internalModal"
          onPress={() => reminder.chooseHour()}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="flag" size={20} color="subText3" />}
          showValue
          label="Mục tiêu học mỗi ngày"
          value={numValue("daily_goal", 20, "từ")}
          rightContent="internalModal"
          onPress={() => pickNumber("daily_goal", "Mục tiêu học mỗi ngày", [5, 10, 15, 20, 30, 50], 20, "từ")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="clock" size={20} color="subText3" />}
          showValue
          label="Giới hạn thẻ ôn mỗi ngày"
          value={numValue("review_limit", 0, "thẻ", "Không giới hạn")}
          rightContent="internalModal"
          onPress={() => pickNumber("review_limit", "Giới hạn thẻ ôn mỗi ngày", [0, 20, 50, 100, 200], 0, "thẻ", "Không giới hạn")}
        />
        <AppTitle style={{ marginTop: 20, marginBottom: 4, paddingLeft: 8 }} title="Cách học" />
        <SettingOption
          icon={<AppIcon branch="feather" name="hash" size={20} color="subText3" />}
          showValue
          label="Số từ mỗi cụm học"
          value={numValue("cluster_size", 6, "từ")}
          rightContent="internalModal"
          onPress={() => pickNumber("cluster_size", "Số từ mỗi cụm học", [3, 4, 5, 6, 7, 8, 10, 12], 6, "từ")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="list" size={20} color="subText3" />}
          showValue
          label="Số bước mỗi từ (từ mới, cụm)"
          value={numValue("cluster_steps", 6, "bước")}
          rightContent="internalModal"
          onPress={() => pickNumber("cluster_steps", "Số bước mỗi từ (từ mới, cụm)", [3, 4, 5, 6, 7, 8, 10], 6, "bước")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="chevrons-left" size={20} color="subText3" />}
          showValue
          label="Số thẻ mỗi lượt ôn vuốt"
          value={numValue("swipe_count", 30, "thẻ")}
          rightContent="internalModal"
          onPress={() => pickNumber("swipe_count", "Số thẻ mỗi lượt ôn vuốt", [10, 20, 30, 40, 50, 60], 30, "thẻ")}
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="feather" name="layers" size={20} color="subText3" />}
          label="Hỏi kiểu ôn khi có từ cấp cao"
          rightContent="toggle"
          value={settings?.ask_review_mode === true}
          onPress={() => toggleLearnSetting("ask_review_mode")}
        />
        <Divider />
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
        <AppTitle style={{ marginTop: 20, marginBottom: 4, paddingLeft: 8 }} title="Nâng cao" />
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
        <SettingOption
          icon={<AppIcon branch="feather" name="eye-off" size={20} color="subText3" />}
          label="Hiện nội dung thô tục"
          rightContent="toggle"
          value={settings?.show_offensive === true}
          onPress={toggleOffensive}
        />
        <AppTitle style={{ marginTop: 20, marginBottom: 4, paddingLeft: 8 }} title="Thông tin" />
        <SettingOption
          icon={<AppIcon branch="mui" name="apps" size={20} color="subText3" />}
          showValue
          label="Phiên bản ứng dụng"
          value="1.0.0"
        />
        <Divider />
        <SettingOption
          icon={<AppIcon branch="mui" name="file-present" size={20} color="subText3" />}
          label="Điều khoản"
          rightContent="newPage"
          onPress={() => router.push("/screens/Policy/screen")}
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
      style={{ height: 52 }}
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


