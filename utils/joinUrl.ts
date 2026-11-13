/** Nối `base` và khoá file với đúng 1 dấu "/" giữa; `base` rỗng thì trả khoá nguyên (chưa có media_base_url). */
export const joinUrl = (base: string, key: string) => {
  if (!base) return key;
  return `${base.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
};
