import { useEffect, useState } from "react";

/** Giá trị trễ `delay` ms sau lần đổi cuối: dùng cho ô tìm kiếm gọi API. */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
