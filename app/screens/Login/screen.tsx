import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { GOOGLE_ENABLED } from "@/configs/server";
import { useTheme } from "@/providers/Theme";
import {
  authErrorMessage,
  emailLogin,
  emailRegister,
  forgotPassword,
  LoginResult,
  resetPassword,
  socialLogin,
} from "@/services/api/auth";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

// Chỉ nạp khi đã có client id, tránh lỗi hook Google khi thiếu cấu hình.
// Nạp lười: module Google native chỉ có khi bật đăng nhập Google
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GoogleButton = GOOGLE_ENABLED ? require("./GoogleButton").default : null;

type Mode = "login" | "register" | "forgot" | "reset";

const TITLES: Record<Mode, [string, string]> = {
  login: ["Chào mừng trở lại", "Đăng nhập để giữ tiến độ học và đồng bộ giữa các máy."],
  register: ["Tạo tài khoản", "Tiến độ học hiện tại của bạn sẽ được giữ nguyên."],
  forgot: ["Quên mật khẩu", "Nhập email, chúng mình gửi mã 6 số (hiệu lực 15 phút)."],
  reset: ["Đặt lại mật khẩu", "Nhập mã trong email và mật khẩu mới."],
};

const LoginScreen = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const goMode = (m: Mode) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const leave = () =>
    router.canGoBack() ? router.back() : router.replace("/tabs");

  const onSuccess = (r: LoginResult) => {
    // switched_from_guest: dữ liệu khách còn ở SQLite, worker sync sẽ đẩy lại (chưa làm).
    if (r.switched_from_guest) console.log("switched_from_guest");
    leave();
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      const mail = email.trim();
      if (mode === "login" || mode === "register") {
        if (!mail || !password) throw { response: { data: { detail: "Nhập email và mật khẩu." } } };
      }
      if (mode === "login") onSuccess(await emailLogin(mail, password));
      else if (mode === "register")
        onSuccess(await emailRegister(mail, password, name.trim() || undefined));
      else if (mode === "forgot") {
        if (!mail) throw { response: { data: { detail: "Nhập email của bạn." } } };
        await forgotPassword(mail);
        setMode("reset");
        setInfo("Nếu email tồn tại, mã đã được gửi.");
      } else {
        if (!code || !password) throw { response: { data: { detail: "Nhập mã và mật khẩu mới." } } };
        await resetPassword(mail, code.trim(), password);
        setMode("login");
        setPassword("");
        setInfo("Đã đổi mật khẩu. Hãy đăng nhập lại.");
      }
    });

  const cta = { login: "Đăng nhập", register: "Tạo tài khoản", forgot: "Gửi mã", reset: "Đổi mật khẩu" }[mode];
  const [title, subtitle] = TITLES[mode];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-row items-center justify-between px-5 pt-3 h-12">
        <Pressable
          hitSlop={12}
          onPress={mode === "login" ? leave : () => goMode("login")}
        >
          <AppIcon
            branch="feather"
            name={mode === "login" ? "x" : "arrow-left"}
            size={24}
            color={theme.text}
          />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        <View
          className="h-16 w-16 rounded-2xl items-center justify-center mb-6"
          style={{ backgroundColor: theme.primary }}
        >
          <AppIcon branch="feather" name="book-open" size={30} color="white" />
        </View>
        <Animated.View key={mode} entering={FadeIn.duration(200)}>
          <AppText size="3xl" font="MulishBold" color="title">
            {title}
          </AppText>
          <AppText color="subText2" className="mt-1 mb-6">
            {subtitle}
          </AppText>
        </Animated.View>

        <View className="gap-3">
          {mode === "register" && (
            <Field icon="user" placeholder="Tên hiển thị (tuỳ chọn)" value={name} onChangeText={setName} />
          )}
          <Field
            icon="mail"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={mode !== "reset"}
          />
          {mode === "reset" && (
            <Field
              icon="hash"
              placeholder="Mã 6 số"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}
          {mode !== "forgot" && (
            <Field
              icon="lock"
              placeholder={mode === "reset" ? "Mật khẩu mới" : "Mật khẩu"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              right={
                <Pressable hitSlop={10} onPress={() => setShowPw(!showPw)}>
                  <AppIcon
                    branch="feather"
                    name={showPw ? "eye-off" : "eye"}
                    size={18}
                    color={theme.subText2}
                  />
                </Pressable>
              }
            />
          )}
        </View>

        {mode === "login" && (
          <Pressable className="self-end mt-3" hitSlop={8} onPress={() => goMode("forgot")}>
            <AppText size="sm" color="primary" font="MulishSemiBold">
              Quên mật khẩu?
            </AppText>
          </Pressable>
        )}

        {!!error && (
          <View className="flex-row gap-2 items-start mt-4 p-3 rounded-xl" style={{ backgroundColor: theme.error + "18" }}>
            <AppIcon branch="feather" name="alert-circle" size={16} color={theme.error} />
            <AppText size="sm" color="error" className="flex-1">
              {error}
            </AppText>
          </View>
        )}
        {!!info && (
          <AppText size="sm" color="success" className="mt-4">
            {info}
          </AppText>
        )}

        <Pressable
          disabled={busy}
          onPress={submit}
          className="h-14 rounded-2xl items-center justify-center mt-6"
          style={{ backgroundColor: theme.primary, opacity: busy ? 0.7 : 1 }}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <AppText color="white" size="lg" font="MulishBold">
              {cta}
            </AppText>
          )}
        </Pressable>

        {(mode === "login" || mode === "register") && GoogleButton && (
          <View className="mt-6 gap-4">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px" style={{ backgroundColor: theme.subText3 }} />
              <AppText size="sm" color="subText2">
                hoặc
              </AppText>
              <View className="flex-1 h-px" style={{ backgroundColor: theme.subText3 }} />
            </View>
            <GoogleButton
              disabled={busy}
              onError={setError}
              onIdToken={(t: string) =>
                run(async () => onSuccess(await socialLogin("google", t)))
              }
            />
          </View>
        )}

        {(mode === "login" || mode === "register") && (
          <View className="flex-row justify-center gap-1 mt-8">
            <AppText color="subText2">
              {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            </AppText>
            <Pressable onPress={() => goMode(mode === "login" ? "register" : "login")}>
              <AppText color="primary" font="MulishBold">
                {mode === "login" ? "Đăng ký" : "Đăng nhập"}
              </AppText>
            </Pressable>
          </View>
        )}

        {mode === "login" && (
          <Pressable className="mt-4 items-center" onPress={leave}>
            <AppText size="sm" color="subText2">
              Để sau, tiếp tục với tài khoản khách
            </AppText>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

type FieldProps = React.ComponentProps<typeof TextInput> & {
  icon: React.ComponentProps<typeof AppIcon<"feather">>["name"];
  right?: React.ReactNode;
};

const Field = ({ icon, right, style, ...props }: FieldProps) => {
  const { theme } = useTheme();
  return (
    <View
      className="flex-row items-center gap-3 px-4 h-14 rounded-2xl"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: props.editable === false ? 0.6 : 1,
      }}
    >
      <AppIcon branch="feather" name={icon} size={18} color={theme.subText2} />
      <TextInput
        placeholderTextColor={theme.subText3}
        style={[{ flex: 1, color: theme.text, fontFamily: "MulishRegular", fontSize: 16 }, style]}
        {...props}
      />
      {right}
    </View>
  );
};

export default LoginScreen;
