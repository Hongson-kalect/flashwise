import { serverInstance } from "./axios";

export type UploadedMedia = { id: string; key: string; url: string; width: number | null; height: number | null };

/**
 * Tải 1 ảnh (file trên máy, vd kết quả của utils/pickImage) lên server: POST media/ (multipart). Server thu nhỏ, đổi WebP,
 * trả `key` để gửi kèm khi đặt ảnh bìa / ảnh nghĩa. Tối đa 5MB, 50 file / người / ngày.
 */
export const uploadImage = async (uri: string): Promise<UploadedMedia> => {
  const form = new FormData();
  form.append("file", { uri, name: "image.jpg", type: "image/jpeg" } as any);
  form.append("kind", "image");
  const res = await serverInstance.post("media/", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
    transformRequest: (data) => data, // giữ nguyên FormData, không để axios chuyển thành JSON
  });
  return res.data as UploadedMedia;
};

export type UploadErrorKind = "quota" | "too_large" | "invalid" | "offline" | "unknown";

export const uploadErrorKind = (e: any): UploadErrorKind => {
  if (!e?.response) return "offline";
  const status = e.response.status;
  if (status === 429) return "quota";
  if (status === 413) return "too_large";
  if (status === 400) return "invalid";
  return "unknown";
};
