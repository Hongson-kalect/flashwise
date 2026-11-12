# Nhắc học

Thông báo cục bộ bằng `expo-notifications` (không cần server, cần dev APK build lại khi thêm package). Code: `reminder/plan.ts` (lịch, thuần, có test), `services/reminder.ts` (quyền + đặt lịch), `hooks/useReminder.ts` (chọn giờ, xin quyền, hỏi sau phiên đầu), `hooks/useReminderSync.ts` (đặt lại lịch khi mở app / về foreground).

## Luồng
1. **Sau phiên học hoặc ôn đầu tiên** (màn "Đã lưu!"): hộp chọn giờ "Nhắc bạn học mỗi ngày? Chọn giờ" với 5 giờ gợi ý (7h, 12h, 18h, 20h, 21h) và "Không nhắc". Chỉ hỏi **một lần** (cờ `system_configs.reminder_prompted`, riêng từng máy); đóng hộp mà không chọn cũng tính là đã hỏi.
2. Chọn giờ thì xin quyền thông báo (hộp xin quyền của hệ điều hành). Được cấp: lưu `study_reminder_hour` + `notification_enabled = true` (đồng bộ) rồi đặt lịch. Từ chối: `notification_enabled = false` và toast hướng dẫn bật trong cài đặt máy.
3. Đổi hoặc tắt sau này ở **Cá nhân → Học tập → Nhắc học mỗi ngày** (cùng hộp chọn giờ).

## Cách đặt lịch
Không dùng 1 thông báo lặp hằng ngày (không bỏ được ngày đã học). `planReminders` đặt tối đa 3 thông báo một lần cho những ngày sắp tới lúc giờ đã chọn, bỏ mốc đã qua, và bỏ mốc thuộc ngày học hiện tại nếu hôm nay đã có học / ôn (ngày học theo `day_start_hour`). Lịch được đặt lại khi mở app, khi về foreground và ngay sau mỗi phiên học / ôn. Bỏ app vài ngày thì chỉ nhắc tối đa 3 lần rồi im.

## Hạn chế
- Nội dung thông báo cố định ("Đến giờ học từ vựng rồi"), chưa nói số thẻ đến hạn hay khiên sắp mất (thông báo đặt trước nên không biết số lúc đó).
- Chạm thông báo chỉ mở app, chưa đưa thẳng vào màn ôn.
- Chọn giờ chẵn (không chọn phút). Chưa có nhắc "sắp mất streak" riêng.
- Android 13+ cần quyền `POST_NOTIFICATIONS` (khai báo bởi thư viện); iOS chưa build thử.
- Chưa kiểm thông báo bắn thật trên máy ảo: quyền thông báo là quyền hệ điều hành nên phải tự bấm "Cho phép".
