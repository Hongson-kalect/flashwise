# Streak, khiên, habit

Mô hình lấy từ Fastfast (`D:\Code\Fastfast`: `src/database/schema/habit_logs.ts`, `fast_sessions.ts#reconcileStreak`, `calculateFastReward`). Lấy **cơ chế**, không lấy công thức cứng (số liệu của nhịn ăn). Code: `habit/engine.ts` (thuần, có test), `database/queries/habit.ts` (SQLite), `hooks/useHabitCheck.ts` (mở app), `app/screens/Home/components/habitCard.tsx`.

## Luật
- **Ngày học** theo `day_start_hour` (mặc định 4h sáng). Ngày có học hoặc ôn (`saveLearnResult` / `saveReviewResult`) thì streak +1 (một lần mỗi ngày).
- **Habit** 0-100%. Mỗi ngày có học cộng `gainMin` (2) tới `gainMax` (5) tuỳ số thẻ so với `daily_goal`; nhiều phiên cùng ngày chỉ cộng phần chênh (state giữ `todayGain`).
- **Khiên** tối đa 3. Kiếm: qua mốc habit 35 / 70 / 100% (mỗi mốc 1 lần; mốc bị tụt xuống dưới mốc trước thì nhận lại được); habit đã đầy thì điểm thưởng dồn vào thanh **retain** (25 điểm = 1 khiên).
- **Nghỉ n ngày** (tính khi mở app hoặc trước khi ghi phiên): trừ n khiên; đủ khiên thì streak giữ, các ngày nghỉ ghi là "ngày khiên che". Thiếu khiên: khiên còn lại vẫn bị dùng hết (như Fastfast), phần ngày thiếu làm mất streak, habit giảm `penaltyBase + penaltyPerDay * số ngày thiếu`, retain về 0.
- `reconcile` chạy lại cùng ngày không phạt hai lần (mốc `streakDate` dời tới hôm qua, mọi thay đổi trong 1 giao dịch).
- Người đã học trước khi có tính năng: state dựng từ `day_learn_log` (`stateFromDays`), streak là chuỗi ngày liền, habit và khiên từ 0, không phạt ngược.

## Dữ liệu
| Nơi | Nội dung |
|---|---|
| `user_settings.habit_state` (JSON, đồng bộ) | habit, retain, shield, streak, maxStreak, streakDate, claim[3], todayDate, todayGain, activeDays, shieldUsed, shieldWasted |
| `habit_log` (chỉ máy) | mỗi lần đổi: type `active` / `shield` / `lapse`, delta + snap của habit, khiên, retain, số ngày nghỉ, ghi chú |
| `day_learn_log.is_shield` (đồng bộ) | 1 = ngày nghỉ được khiên che, không có học |
| `user_profile.current_streak / max_streak / total_xp` | cập nhật ở máy mỗi lần `trackHabit` (khách / offline vẫn có số) |

Server (`flashwise_api/tracking/sync.py`): `DayLearnLog.is_shield` (migration 0006); `refresh_stats` tính ngày `is_shield` như ngày có học nên streak server = streak máy. Server không biết khiên / habit (chỉ streak và XP).

## Khác Fastfast
- Điều kiện đủ ngày là "có học / ôn" (Fastfast: thời lượng nhịn). Điểm habit theo số thẻ, không theo giờ.
- Nhật ký chỉ ở máy; trạng thái đồng bộ qua `user_settings` thay vì bảng `habit_logs` có `sync_status`.
- Fastfast không có đồng bộ streak với server; ở đây khiên phải ghi vào `day_learn_log` để server không tính đứt chuỗi.

## Hạn chế đã biết
- Trạng thái habit đồng bộ kiểu ghi đè theo thời gian (`user_settings`): hai máy cùng học một lúc thì bản ghi sau thắng. Cài lại máy rồi học trước khi sync xong thì state mới có thể đè state cũ trên server.
- Đổi giờ máy có thể làm sai ngày; server tính lại streak từ `day_learn_log` nên chỉ lệch ở habit / khiên.
- Streak server tính theo múi giờ profile, máy theo giờ máy và `day_start_hour`; ranh giới ngày có thể lệch vài giờ.
- Chưa có chế độ "ôn nhẹ" khi bỏ lâu quay lại (số thẻ đến hạn dồn lại). Chưa có nhắc học.
- Hằng số (`HABIT_CONFIG`) chưa chỉnh bằng dữ liệu người học thật.
