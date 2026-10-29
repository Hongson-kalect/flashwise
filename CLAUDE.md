# Flashwise (app)

App học từ vựng bằng flashcard, Expo 53 + React Native 0.79 + expo-router + NativeWind + zustand. Local-first: dữ liệu học nằm trong SQLite trên máy, sync lên backend Django ở `D:\Code\flashwise_api` (xem CLAUDE.md bên đó).

## Cấu trúc
- `app/`: route expo-router, màn hình trong `app/screens/<Tên>` (Collection, Home, Learning, Practice, Profile, Start, Word, Policy)
- `database/schema/*.ts`: câu `CREATE TABLE` SQLite từng bảng, gộp trong `index.ts`. `initDatabase` hiện xoá và tạo lại DB mỗi lần mở app (đang dev) nên sửa schema chỉ cần sửa file, chưa có migration.
- `services/axios.ts`: `serverInstance` gắn Bearer token, tự gọi `${baseURL}/refresh-token` khi 401. `stores/useAuthStore.ts`: token trong SecureStore.
- `hooks/` (useDatabase, useWebSocket, useSSE...), `providers/`, `interfaces/`, `locales/`

## Quy ước
- Tên cột bảng nào sync với server phải giống tên trường model Django (vd `user_sense_progress`: state, stability, difficulty, next_review_at; `collection_items.display_order`).
- Lặp ngắt quãng dùng FSRS.
- Repo lưu file dạng LF: commit bình thường, không dùng `core.autocrlf=false`.

## Còn dở
- Chưa gọi `POST /api/auth/device-login/` khi mở app.
- `app/screens/Word/Detail/[value].tsx` gọi get-word bằng `fetch` với IP ghi cứng, cần chuyển sang `serverInstance`; `baseURL` trong `services/axios.ts` cũng ghi cứng IP.
