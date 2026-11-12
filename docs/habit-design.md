# Streak, khiên, habit

Mô hình lấy từ Fastfast (`D:\Code\Fastfast`: `src/database/schema/habit_logs.ts`, `fast_sessions.ts#reconcileStreak`). Lấy **cơ chế**, không lấy công thức cứng (số liệu của nhịn ăn). Code: `habit/engine.ts` (thuần, có test), `database/queries/habit.ts` (SQLite), `hooks/useHabitCheck.ts` (mở app), `app/screens/Home/components/habitCard.tsx` + `habitChart.tsx`.

## Luật
- **Ngày học** theo `day_start_hour` (mặc định 4h sáng). Ngày có học hoặc ôn (`saveLearnResult` / `saveReviewResult`) thì streak +1 (một lần mỗi ngày).
- **Habit** 0-100%, thước đo độ chăm chỉ: mỗi ngày có học cộng `gainMin` (2) tới `gainMax` (5) tuỳ số thẻ so với `daily_goal`; nhiều phiên cùng ngày chỉ cộng phần chênh (state giữ `todayGain`). Giảm khi nghỉ mà không khiên che. **Habit không đổi ra khiên.**
- **Stack và khiên**: ngày làm đủ `shieldDailyTarget` (20) thẻ học + ôn được 1 stack (mỗi ngày một lần). Mục tiêu này cố định, không theo `daily_goal`, để cài đặt không làm đổi tốc độ kiếm khiên và để "vào app một lúc" không đủ. Đủ `stacksPerShield` (7) stack đổi 1 khiên (tối đa `shieldLimit` = 3, khiên thừa tính vào `shieldWasted`). Stack không cần liên tiếp và không mất khi nghỉ hay mất streak.
- **Nghỉ n ngày** (tính khi mở app hoặc trước khi ghi phiên): trừ n khiên; đủ khiên thì streak giữ, các ngày nghỉ ghi là "ngày khiên che". Thiếu khiên: khiên còn lại vẫn bị dùng hết (như Fastfast), phần ngày thiếu làm mất streak và habit giảm `penaltyBase + penaltyPerDay * số ngày thiếu`.
- `reconcile` chạy lại cùng ngày không phạt hai lần (mốc `streakDate` dời tới hôm qua, mọi thay đổi trong 1 giao dịch).
- Người đã học trước khi có tính năng: state dựng từ `day_learn_log` (`stateFromDays`), streak là chuỗi ngày liền, habit, stack và khiên từ 0, không phạt ngược.

## Giao diện
- Chip streak / khiên / XP ở đầu Home. Thẻ Thói quen: streak, 3 khiên, thanh habit, thanh 7 stack tới khiên kế.
- Chạm thẻ: bottom sheet có biểu đồ area habit 30 ngày (`getHabitSeries`: chấm đỏ = ngày mất streak, chấm xanh = ngày khiên che), cách kiếm khiên và lịch sử `habit_log`.

## Dữ liệu
| Nơi | Nội dung |
|---|---|
| `user_settings.habit_state` (JSON, đồng bộ) | habit, shield, stack, stackDate, streak, maxStreak, streakDate, todayDate, todayGain, activeDays, shieldUsed, shieldWasted |
| `habit_log` (chỉ máy) | mỗi lần đổi: type `active` / `shield` / `lapse`, delta + snap của habit và khiên, số ngày nghỉ, ghi chú; nguồn của biểu đồ |
| `day_learn_log.is_shield` (đồng bộ) | 1 = ngày nghỉ được khiên che, không có học |
| `user_profile.current_streak / max_streak / total_xp` | cập nhật ở máy mỗi lần `trackHabit` (khách / offline vẫn có số) |

Server (`flashwise_api/tracking/sync.py`): `DayLearnLog.is_shield` (migration 0006); `refresh_stats` tính ngày `is_shield` như ngày có học nên streak server = streak máy. Server không biết khiên / habit / stack (chỉ streak và XP).

## Khác Fastfast
- Điều kiện đủ ngày là "có học / ôn" (Fastfast: thời lượng nhịn). Điểm habit theo số thẻ, không theo giờ.
- Không có thanh retain và mốc habit đổi khiên: Fastfast cần vì nghỉ để hồi phục sau phiên nhịn dài là nhu cầu thật, học từ thì không. Khiên kiếm bằng stack ngày hoàn thành mục tiêu, không có tiền tệ.
- Nhật ký chỉ ở máy; trạng thái đồng bộ qua `user_settings` thay vì bảng `habit_logs` có `sync_status`.
- Khiên phải ghi vào `day_learn_log` để server không tính đứt chuỗi (Fastfast không có đồng bộ streak).

## Hạn chế đã biết
- Trạng thái habit đồng bộ kiểu ghi đè theo thời gian (`user_settings`): hai máy cùng học một lúc thì bản ghi sau thắng. Cài lại máy rồi học trước khi sync xong thì state mới có thể đè state cũ trên server. Nhật ký `habit_log` không đồng bộ nên cài lại máy thì biểu đồ phần trước đó phẳng.
- Đổi giờ máy có thể làm sai ngày; server tính lại streak từ `day_learn_log` nên chỉ lệch ở habit / khiên.
- Streak server tính theo múi giờ profile, máy theo giờ máy và `day_start_hour`; ranh giới ngày có thể lệch vài giờ.
- Chưa có chế độ "ôn nhẹ" khi bỏ lâu quay lại (số thẻ đến hạn dồn lại). Chưa có nhắc học.
- Hằng số (`HABIT_CONFIG`: 20 thẻ, 7 stack, điểm habit, mức phạt) chưa chỉnh bằng dữ liệu người học thật. Khi mục tiêu ngày ở cài đặt khác 20, vòng "Mục tiêu hôm nay" ở Home và mục tiêu của stack lệch nhau.
