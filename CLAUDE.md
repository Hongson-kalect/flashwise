# Flashwise (app)

App học từ vựng bằng flashcard, Expo 53 + React Native 0.79 + expo-router + NativeWind + zustand. Local-first: dữ liệu học nằm trong SQLite trên máy, sync lên backend Django ở `D:\Code\flashwise_api` (xem CLAUDE.md bên đó).

## Kết nối backend
Đọc `D:\Codelashwise_api\docs\APP_INTEGRATION.md` trước khi làm phần gọi API: cách chạy backend để test, đăng nhập, tra từ + websocket, sync, bundle, học, upload file, mã lỗi.

## Cấu trúc
- `app/`: route expo-router, màn hình trong `app/screens/<Tên>` (Collection, Home, Learning, Practice, Profile, Start, Word, Policy)
- `database/schema/*.ts`: câu `CREATE TABLE` SQLite từng bảng, gộp trong `index.ts`. `initDatabase` hiện xoá và tạo lại DB mỗi lần mở app (đang dev) nên sửa schema chỉ cần sửa file, chưa có migration.
- `services/axios.ts`: `serverInstance` gắn Bearer token, tự gọi `${baseURL}/refresh-token` khi 401. `stores/useAuthStore.ts`: token trong SecureStore.
- `hooks/` (useDatabase, useWebSocket, useSSE...), `providers/`, `interfaces/`, `locales/`

## Quy ước
- Tên cột bảng nào sync với server phải giống tên trường model Django (vd `user_sense_progress`: state, stability, difficulty, next_review_at; `collection_items.display_order`).
- Lặp ngắt quãng dùng FSRS.
- Repo lưu file dạng LF: commit bình thường, không dùng `core.autocrlf=false`.

## Phần học từ vựng
Thiết kế (phương pháp học cụm / vuốt / giọng nói, cách ghi `review_log`, `learn_session`, setting) và hiện trạng màn Practice: `docs/learning-design.md`. Đọc trước khi làm màn học.

## Còn dở
- Cập nhật, tồn đọng và bước tiếp của phiên gần nhất: `docs/SESSION_2026-11-03.md`.
- Địa chỉ backend đặt qua `EXPO_PUBLIC_API_ORIGIN` (xem `.env.example`, `configs/server.ts`). Lúc mở app `AppWrapper` gọi `device-login` + `app-config` (`services/auth.ts`). Màn đăng nhập ở `app/screens/Login` (email + Google native qua `@react-native-google-signin`, nút Google chỉ hiện khi có `EXPO_PUBLIC_GOOGLE_CLIENT_ID`; chưa có Apple). Ảnh minh hoạ tạm phía app: `services/senseImage.ts` (Pixabay nếu có key, không thì Wikimedia Commons). Bottom sheet dùng `providers/BottomSheet.tsx` (1 sheet, `present({render,title,size})`).
- Từ đã tra được lưu vào SQLite (`ai_word`, `ai_sense`, `sense_metadata`) chỉ khi là bản cuối (get-word 200 hoặc `FULL_SENSE`, không lưu `PARTIAL_*`). Mở từ: đọc local trước; còn `quality_status = draft` hoặc thiếu bản dịch ngôn ngữ hiện tại thì làm mới nền qua get-word (tối đa 1 lần / 10 phút / từ), còn lại không gọi server (`database/queries/words.ts`, `useWordData.ts`).
- Thêm nghĩa mới: ba chấm → "Thêm nghĩa mới" mở `Word/Detail/components/addSenseSheet.tsx` (chỉ gõ định nghĩa + từ loại tuỳ chọn) → `POST ai-senses/propose/` (`services/api/senses.ts`). Kết quả 4 trạng thái: official (từ tải lại qua `useWordData().refresh`), pending (chờ admin, chỉ mình thấy), duplicate, rejected; lỗi 403 `account_required` (tài khoản khách) mở màn Login. Sheet sửa nghĩa cũ (`createSenseSheet`) chỉ còn dùng cho "Sửa nghĩa này".
- Backend đã có `POST /api/sync/push/`, `GET /api/sync/pull/`, `GET/PATCH /api/me/`, `GET /api/app-config/`, like / report / feedback (chi tiết trong CLAUDE.md của flashwise_api). App chưa gọi: cần worker đọc bảng `sync_queue` gửi lên push, lưu con trỏ từng bảng vào `system_configs.sync_cursor`.
