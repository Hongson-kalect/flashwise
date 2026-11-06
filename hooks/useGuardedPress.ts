import { createPressGuard } from "@/utils/pressGuard";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Bọc handler bấm nút: không chạy lại khi lần trước chưa xong (xem utils/pressGuard).
 * `busy` = đang chờ Promise của handler (dùng cho vòng xoay / làm mờ nút).
 */
export const useGuardedPress = <A extends unknown[]>(fn: ((...args: A) => unknown) | undefined, cooldownMs = 0) => {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const guard = useRef(
    createPressGuard({
      cooldownMs,
      onBusyChange: (b) => {
        if (mounted.current) setBusy(b);
      },
    }),
  ).current;

  const press = useCallback((...args: A) => guard.run(() => fnRef.current?.(...args)), [guard]);
  return { press, busy };
};
