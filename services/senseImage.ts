import axios from "axios";

const PIXABAY_KEY = process.env.EXPO_PUBLIC_PIXABAY_API_KEY || "";

export interface SenseImage {
  url: string;
  /** Nguồn hiển thị làm ghi công, vd "Pixabay · tên tác giả". */
  credit: string;
}

// Cache trong RAM theo từ khoá. Lưu cả kết quả "không có"; lỗi mạng thì xoá để thử lại.
const cache = new Map<string, Promise<SenseImage | null>>();

const fromPixabay = async (q: string): Promise<SenseImage | null> => {
  const r = await axios.get("https://pixabay.com/api/", {
    timeout: 8000,
    params: {
      key: PIXABAY_KEY,
      q,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: true,
      per_page: 3,
    },
  });
  const hit = r.data?.hits?.[0];
  return hit ? { url: hit.webformatURL, credit: `Pixabay · ${hit.user}` } : null;
};

// Không cần API key. Chỉ ảnh bitmap (bỏ SVG, sơ đồ), lấy bản thu nhỏ 800px.
const fromCommons = async (q: string): Promise<SenseImage | null> => {
  const r = await axios.get("https://commons.wikimedia.org/w/api.php", {
    timeout: 8000,
    // Wikimedia chặn (403) User-Agent chung chung của HTTP client; cần tên app riêng
    headers: { "User-Agent": "Flashwise/1.0 (vocabulary learning app)" },
    params: {
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: `filetype:bitmap ${q}`,
      gsrnamespace: 6,
      gsrlimit: 5,
      prop: "imageinfo",
      iiprop: "url|user",
      iiurlwidth: 800,
    },
  });
  const pages: any[] = Object.values(r.data?.query?.pages ?? {});
  pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const info = pages.map((p) => p.imageinfo?.[0]).find((i) => i?.thumburl);
  return info ? { url: info.thumburl, credit: "Wikimedia Commons" } : null;
};

/**
 * Ảnh minh hoạ tạm cho 1 nghĩa: từ khoá AI gợi ý (`image_keywords`), không có thì dùng chính từ.
 * Pixabay nếu có EXPO_PUBLIC_PIXABAY_API_KEY, không thì Wikimedia Commons.
 * Chỉ là giải pháp tạm phía app cho tới khi server tự chọn ảnh (PARTIAL_IMAGE).
 */
const lookup = (q: string): Promise<SenseImage | null> => {
  if (!cache.has(q)) {
    const load = PIXABAY_KEY ? fromPixabay : fromCommons;
    cache.set(
      q,
      load(q).catch(() => {
        cache.delete(q);
        return null;
      }),
    );
  }
  return cache.get(q)!;
};

export const findSenseImage = async (
  keywords: string[] | undefined,
  word: string,
): Promise<SenseImage | null> => {
  // Cụ thể trước (2 từ khoá đầu), không có ảnh thì nới dần: từ khoá đầu, rồi chính từ đó
  const first = (keywords ?? []).slice(0, 2).map((k) => k.trim()).filter(Boolean);
  const queries = [...new Set([first.join(" "), first[0], word.trim()].filter(Boolean))];
  for (const q of queries) {
    const img = await lookup(q);
    if (img) return img;
  }
  return null;
};
