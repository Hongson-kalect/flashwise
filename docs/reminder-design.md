# Nhắc học

Thông báo cục bộ bằng `expo-notifications` (không cần server, cần dev APK build lại khi thêm package). Code: `reminder/plan.ts` (lịch, thuần, có test), `services/reminder.ts` (quyền + đặt lịch), `hooks/useReminder.ts` (chọn giờ, xin quyền, hỏi sau phiên đầu), `hooks/useReminderSync.ts` (đặt lại lịch khi mở app / về foreground).

## Luồng
1. **Sau phiên học hoặc ôn đầu tiên** (màn "Đã lưu!"): hộp chọn giờ "Nhắc bạn học mỗi ngày? Chọn giờ" với 5 giờ gợi ý (7h, 12h, 18h, 20h, 21h) và "Không nhắc". Chỉ hỏi **một lần** (cờ `system_configs.reminder_prompted`, riêng từng máy); đóng hộp mà không chọn cũng tính là đã hỏi.
2. Chọn giờ thì xin quyền thông báo (hộp xin quyền của hệ điều hành). Được cấp: lưu `study_reminder_hour` + `notification_enabled = true` (đồng bộ) rồi đặt lịch. Từ chối: `notification_enabled = false` và toast hướng dẫn bật trong cài đặt máy.
3. Đổi hoặc tắt sau này ở **Cá nhân → Học tập → Nhắc học mỗi ngày** (cùng hộp chọn giờ).

## Cách đặt lịch
Không dùng 1 thông báo lặp hằng ngày (không bỏ được ngày đã học). `planReminders` đặt tối đa 3 thông báo một lần cho những ngày sắp tới lúc giờ đã chọn, bỏ mốc đã qua, và bỏ mốc thuộc ngày học hiện tại nếu hôm nay đã có học / ôn (ngày học theo `day_start_hour`). Lịch được đặt lại khi mở app, khi về foreground và ngay sau mỗi phiên học / ôn. Bỏ app vài ngày thì chỉ nhắc tối đa 3 lần rồi im.

## Nội dung thông minh (2026-11-13)
`reminder/message.ts#buildReminderMessage` (thuần, có test) dựng tiêu đề / nội dung từ 3 số liệu tính lúc đặt lịch (`services/reminder.ts`): số thẻ ôn được sẽ đến hạn tới giờ nhắc (`countReadyDue` với `now = giờ nhắc`, đã theo `review_limit`), chuỗi ngày hiện tại, và "chuỗi có thể đứt" (thông báo thuộc ngày học hôm nay mà hôm nay chưa học / ôn gì, chuỗi ≥ 2). Có thẻ cần ôn: "Có N thẻ đang chờ ôn trước khi quên" và `data.route` = màn ôn; không có thì gợi ý học từ mới và chạm chỉ mở app. Chạm thông báo (kể cả mở app nguội): `hooks/useReminderSync.ts` đọc `useLastNotificationResponse` rồi `router.push(data.route)` một lần cho mỗi thông báo.

## Hạn chế
- Số thẻ là ước tính lúc đặt lịch (đặt lại khi mở app, về foreground, sau mỗi phiên); thông báo ngày xa có thể lệch vài thẻ.
- Chọn giờ chẵn (không chọn phút). Chưa có nhắc "sắp mất streak" ở giờ riêng.
- Android 13+ cần quyền `POST_NOTIFICATIONS` (khai báo bởi thư viện); iOS chưa build thử.
- Lịch đã kiểm trên máy ảo (AlarmManager có mốc 20:00 các ngày kế); chưa kiểm nội dung hiện ra và chạm vào mở màn ôn bằng thông báo bắn thật.
