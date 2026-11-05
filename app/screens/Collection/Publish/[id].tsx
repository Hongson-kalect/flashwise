import AppIcon from "@/components/AppIcon";
import AppImage from "@/components/AppImage";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { getMyCollection } from "@/database/queries/collections";
import { useTheme } from "@/providers/Theme";
import { publishErrorKind } from "@/services/api/collections";
import { publish } from "@/services/collections";
import { uploadErrorKind, uploadImage } from "@/services/media";
import { useAppStore } from "@/stores/appStore";
import { Skeleton } from "@/ui";
import { pickImage } from "@/utils/pickImage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import CollectionCover from "../components/collectionCover";

const ERROR_TEXT = {
  no_changes: "Bộ chưa có nghĩa nào để phát hành. Thêm nghĩa vào bộ rồi thử lại.",
  banned: "Tài khoản của bạn đang bị hạn chế nên chưa phát hành được.",
  invalid: "Thông tin chưa hợp lệ. Kiểm tra lại tên, mô tả và ảnh.",
  offline: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
  unknown: "Có lỗi xảy ra, thử lại sau.",
} as const;

const UPLOAD_TEXT = {
  quota: "Hôm nay bạn đã tải lên đủ số ảnh cho phép.",
  too_large: "Ảnh quá lớn, chọn ảnh khác.",
  invalid: "Không dùng được ảnh này, chọn ảnh khác.",
  offline: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
  unknown: "Có lỗi xảy ra, thử lại sau.",
} as const;

const inputStyle = (theme: any) => ({
  color: theme.text,
  backgroundColor: theme.card,
  borderColor: theme.border,
  borderWidth: 1.5,
  borderRadius: 16,
  paddingHorizontal: 16,
  fontFamily: "MulishSemiBold",
  fontSize: 16,
});

/**
 * Phát hành bộ: xem lại tên / mô tả / ảnh bìa rồi phát hành công khai. Lần đầu là phiên bản 1; các lần sau chỉ những thay đổi
 * (nghĩa thêm / đổi / xoá) so với bản đã phát hành. Người khác tải được bản đã phát hành, bản nháp của bạn vẫn chỉ mình bạn thấy.
 */
export default function PublishCollection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const userLang: string = useAppStore((s) => s.settings?.translate_language) ?? "vi";

  const info = useQuery({ queryKey: ["collections", "detail", id], queryFn: () => getMyCollection(db, id) });
  const c = info.data;

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [image, setImage] = useState<{ key: string; preview: string } | null>(null);
  const [picking, setPicking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Điền sẵn tên / mô tả hiện có, chỉ lần đầu (không ghi đè khi người dùng đang gõ)
  useEffect(() => {
    if (c && !loaded) {
      setTitle(c.name);
      setDesc(c.description);
      setLoaded(true);
    }
  }, [c, loaded]);

  const changeImage = async () => {
    setError(null);
    setPicking(true);
    try {
      const picked = await pickImage([16, 9]);
      if (!picked?.uri) return;
      const media = await uploadImage(picked.uri);
      setImage({ key: media.key, preview: picked.uri });
    } catch (e) {
      setError(UPLOAD_TEXT[uploadErrorKind(e)]);
    } finally {
      setPicking(false);
    }
  };

  const submit = async () => {
    if (!c) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await publish(db, id, userLang, { title: title.trim(), desc: desc.trim(), image: image?.key });
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      try {
        ToastAndroid.show(
          result.changed ? `Đã phát hành phiên bản ${result.current_version}` : c.publishState === "revoked" ? "Bộ đã công khai trở lại" : "Đã cập nhật thông tin bộ",
          ToastAndroid.SHORT,
        );
      } catch {}
      router.back();
    } catch (e) {
      setError(ERROR_TEXT[publishErrorKind(e)]);
      setSubmitting(false);
    }
  };

  const ready = !!c && title.trim().length > 0 && !submitting && !picking;
  const hasChanges = (c?.draftCount ?? 0) > 0;
  const nextVersion = (c?.version ?? 0) + (hasChanges ? 1 : 0);
  const heading = !c || c.publishState === "draft" ? "Phát hành bộ" : c.publishState === "revoked" ? "Tiếp tục phát hành" : "Cập nhật bộ";

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader title={heading} />
      {info.isLoading || !c ? (
        <View className="px-4 gap-4 pt-2">
          <Skeleton width="100%" height={160} radius={20} />
          <Skeleton width="100%" height={52} radius={16} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 18 }}
          >
            <View className="p-4 rounded-2xl gap-2" style={{ backgroundColor: theme.primary + "14" }}>
              <View className="flex-row items-center gap-2">
                <AppIcon branch="feather" name="upload-cloud" size={18} color={theme.primary} />
                <AppText weight="bold" color="primary">
                  {c.publishState === "draft"
                    ? "Phát hành lần đầu"
                    : hasChanges
                      ? `Phát hành phiên bản ${nextVersion}`
                      : c.publishState === "revoked"
                        ? `Công khai lại phiên bản ${c.version}`
                        : `Cập nhật thông tin phiên bản ${c.version}`}
                </AppText>
              </View>
              <AppText size="sm" color="subText1">
                {hasChanges
                  ? `${c.draftCount} ${c.publishState === "draft" ? "nghĩa" : "thay đổi"} sẽ được phát hành. `
                  : "Không có nghĩa nào đổi nên phiên bản giữ nguyên. "}
                Bộ hiện công khai trong Khám phá, ai cũng tải và học được. Các nghĩa trong bản phát hành được cố định: bạn sửa nghĩa về
                sau thì bộ của người khác không đổi theo.
              </AppText>
              {c.pendingWords.length > 0 && (
                <AppText size="sm" style={{ color: theme.warning }}>
                  Còn {c.pendingWords.length} từ đang được tạo, chúng chưa có trong bản này và sẽ vào bản sau.
                </AppText>
              )}
            </View>

            <View className="gap-2">
              <AppText size="sm" weight="semibold" color="subText1">
                Ảnh bìa
              </AppText>
              <Pressable onPress={changeImage} disabled={picking || submitting}>
                {image ? (
                  <View style={{ height: 160, borderRadius: 20, overflow: "hidden" }}>
                    <AppImage source={{ uri: image.preview }} style={{ width: "100%", height: "100%" }} />
                  </View>
                ) : (
                  <CollectionCover collection={c} radius={20} style={{ height: 160, width: "100%" }} />
                )}
                <View
                  className="absolute flex-row items-center gap-1.5 px-3 h-9 rounded-full"
                  style={{ right: 12, bottom: 12, backgroundColor: theme.card + "E6", borderWidth: 1, borderColor: theme.border }}
                >
                  {picking ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <AppIcon branch="feather" name="camera" size={15} color={theme.text} />
                  )}
                  <AppText size="xs" weight="semibold" color="title">
                    {picking ? "Đang tải ảnh..." : "Đổi ảnh"}
                  </AppText>
                </View>
              </Pressable>
            </View>

            <View className="gap-2">
              <AppText size="sm" weight="semibold" color="subText1">
                Tên bộ
              </AppText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                maxLength={255}
                placeholderTextColor={theme.subText3}
                style={[inputStyle(theme), { height: 52 }]}
              />
            </View>

            <View className="gap-2">
              <AppText size="sm" weight="semibold" color="subText1">
                Mô tả
              </AppText>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                maxLength={2000}
                multiline
                placeholder="Giới thiệu ngắn để người khác biết bộ này dành cho ai"
                placeholderTextColor={theme.subText3}
                style={[inputStyle(theme), { minHeight: 96, paddingTop: 14, textAlignVertical: "top" }]}
              />
            </View>

            {!!error && (
              <View className="flex-row gap-2 items-start p-3 rounded-2xl" style={{ backgroundColor: theme.error + "14" }}>
                <AppIcon branch="feather" name="alert-circle" size={16} color={theme.error} style={{ marginTop: 2 }} />
                <AppText size="sm" style={{ flex: 1, color: theme.error }}>
                  {error}
                </AppText>
              </View>
            )}

            <Pressable
              disabled={!ready}
              onPress={submit}
              className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: theme.primary, opacity: ready ? 1 : 0.45 }}
            >
              {submitting ? <ActivityIndicator color="white" /> : <AppIcon branch="feather" name="upload-cloud" size={18} color="white" />}
              <AppText color="white" size="lg" weight="bold">
                {submitting ? "Đang xử lý..." : c.publishState === "live" ? "Cập nhật" : "Phát hành công khai"}
              </AppText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
