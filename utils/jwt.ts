/** Id tài khoản trong access token JWT (claim `user_id` của simplejwt, hoặc `sub`); không đọc được thì null. */
export const accountIdFromToken = (token: string | null | undefined): string | null => {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
    const id = payload.user_id ?? payload.sub;
    return id == null ? null : String(id);
  } catch {
    return null;
  }
};
