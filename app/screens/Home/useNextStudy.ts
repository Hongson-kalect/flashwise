import { findNextStudy } from "@/database/queries/nextStudy";
import { useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

/** Bộ từ nên học tiếp (Home, khi hết thẻ ôn). Khoá bắt đầu bằng "home" nên học / tải bộ xong, invalidate ["home"] là tự cập nhật. */
export const useNextStudy = (enabled: boolean) => {
  const db = useSQLiteContext();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  return useQuery({
    queryKey: ["home", "next-study", userLang],
    queryFn: () => findNextStudy(db, userLang),
    enabled,
    staleTime: 0,
  });
};
