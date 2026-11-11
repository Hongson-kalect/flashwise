# TODO front-end (nhặt sạn 2026-11-11)

Quét bằng đọc code + `tsc --noEmit` + `eslint` + chạy test có sẵn. Chưa sửa gì. Chưa chạy app thật nên mục nào ghi "nghi" là suy ra từ code, cần tái hiện trước khi sửa.

Hiện trạng công cụ:
- `npx tsc --noEmit`: **74 lỗi**, gần hết ở màn cũ (`app/screens/Word/Create`, `Word/Detail/Sense`, `Word/utils`), thêm `components/AppTopNav.tsx`, `hooks/useWebSocket.ts`, `services/s3/*`, `utils/audioRecord.ts`.
- `npx eslint` (bỏ `kaikkitype`): **265 vấn đề** (150 biến thừa, 65 `exhaustive-deps`, 2 `rules-of-hooks`).
- Test có sẵn (`modalStore`, `pressGuard`, `pronunciation`, `sync`, `learning`, `knownStats`): **67 / 67 qua**.

## P1: sập app hoặc mất dữ liệu (nên sửa trước)

1. **Hook gọi sau `return` sớm → crash "Rendered fewer/more hooks".**
   - `app/screens/Word/Detail/components/addSenseSheet.tsx:177`: `useFocused()` đặt sau các nhánh `if (step.kind === ...) return`. Chuyển từ form sang màn kết quả / lỗi làm số hook đổi. Đây là luồng "Thêm nghĩa mới" đang dùng. Sửa: đưa `useFocused` lên đầu component cùng các hook khác.
   - `components/AppRecording.tsx:59`: `useEffect` đặt sau `if (!onRecording) return null`. Bật / tắt ghi âm đổi số hook. Sửa: gộp effect lên trước `return null`.
2. **Đồng bộ có thể bỏ sót ghi đè trong lúc kéo dữ liệu** (`services/sync/engine.ts:270`, `pullChanges`). Trigger bị tắt bằng dòng `sync_applying` trong `system_configs` suốt giao dịch kéo; `withTransactionAsync` của expo-sqlite không độc quyền nên một ghi khác trên cùng kết nối (chấm thẻ, `review_log`) chen vào lúc đó cũng bị trigger bỏ qua, không vào `sync_queue`, không bao giờ đẩy lên. Sửa: dùng `withExclusiveTransactionAsync`, hoặc bỏ cờ và sau khi áp dữ liệu thì xoá đúng các mục queue của những dòng vừa áp.
3. **Refresh token thất bại do lỗi mạng cũng xoá token** (`services/axios.ts:102`, khối `catch`). Chỉ nên `logout()` khi server trả 400/401 cho refresh; timeout / mất mạng thì giữ token. Với tài khoản khách, mất token nghĩa là lần sau `device-login` có thể ra tài khoản khác. Cần kiểm hành vi thật phía backend.
4. **Lỗi tạo trigger đồng bộ bị nuốt im** (`providers/Sync.tsx`, `ensureSyncTracking(db).then(refreshPending, () => {})`). Nếu tạo trigger hỏng thì không dòng nào vào `sync_queue` mà UI vẫn báo bình thường. Sửa: ghi lỗi và hiện trạng thái `error` ở `SyncStatus`.
5. **Polling bộ từ tự dừng khi mạng chậm** (`app/screens/Collection/Detail/[id].tsx:148`). `if (busy || ++tries > 20) return clearInterval(timer)`: nếu một lượt hỏi lâu hơn 6 giây thì lượt kế tiếp thấy `busy` và **xoá luôn timer**, từ chờ AI không bao giờ tự vào bộ. Sửa: `busy` thì chỉ bỏ qua tick (`return`), không `clearInterval`.

## P2: logic sai hoặc dễ sai

6. **`socket.ts` mất đăng ký sau khi tự nối lại** (`utils/socket.ts`): `onopen` chỉ xả `sendQueue`; các `subscribe` đã gửi trước khi rớt không được gửi lại, nên lượt tra từ đang chờ treo. Sửa: khi `onopen`, gửi lại `subscribe` cho mọi key trong `subscribers`. Thêm: `setTimeout(() => this.connect())` ở `onclose` vẫn chạy sau `disconnect()` (kiểm `isManualClose` lúc timer nổ); `console.log` in cả gói tin tra từ.
7. **Số thẻ ôn ở Home không khớp màn Ôn tập.** `getDueCount` (`database/queries/home.ts:33`) có thêm `is_mastered = 0` mà `pickReviewBatch` (`database/queries/review.ts`) không có; thẻ chưa có nghĩa / bản dịch trong máy thì `pickReviewBatch` bỏ qua nhưng `getDueCount` vẫn đếm. Kết quả: Home báo N thẻ mà vào chỉ ra ít hơn hoặc rỗng, nhất là sau khi kéo tiến độ từ máy khác. Comment "khớp" ở `DUE_SQL` chưa đúng hẳn.
8. **Không thử lại `device-login` khi mở app lúc offline** (`components/AppWrapper.tsx`): `ensureSession` chỉ chạy trong effect `[db]`, offline lúc mở thì không bao giờ có token tới khi mở lại app, nên `SyncProvider` không đồng bộ dù sau đó có mạng. Sửa: gọi lại khi NetInfo báo có mạng.
9. **`user_settings` đẩy lên với `updated_at = bây giờ`** (`services/sync/engine.ts`, `toPayload`): bản cài đặt cũ đẩy muộn sẽ đè bản mới hơn từ máy khác. Cần cột `updated_at` thật ở máy.
10. **Đồng bộ chạy với `accountId = "me"` rồi đổi sang id thật** (`providers/Sync.tsx`): con trỏ kéo lưu theo tài khoản nên lần đầu bị kéo lại từ đầu; và `running.current` làm lượt thứ hai bị bỏ nếu lượt đầu chưa xong (chờ mốc 5 phút).
11. **Dòng bị server từ chối bị xoá khỏi hàng đợi vĩnh viễn** (`services/sync/engine.ts`, `pushChanges`). Cần xác nhận phía backend: lý do kiểu "nghĩa chưa có" là tạm thời nên xoá sẽ mất tiến độ.
12. **`ensureSyncTracking` dùng `CREATE TRIGGER IF NOT EXISTS`**: đổi định nghĩa trigger sau này sẽ không áp lên máy đã có. Nên `DROP TRIGGER` rồi tạo lại, hoặc đặt tên theo phiên bản.
13. **Polling dịch ở `learning/useLearnRun.ts` (`status === "empty"`)** không có cờ bận: lượt trước chưa xong mà tick sau đã gọi `prefetch` → `downloadBundle` chồng nhau (tối đa 6).
14. **`utils/pressGuard.ts`**: Promise bị từ chối chỉ `console.warn`, không cho nơi gọi biết; handler không tự `toast.error` thì lỗi bị nuốt.
15. **`AppWrapper`**: dải giả status bar iOS cố định 40 (sai với máy có tai thỏ, nên dùng safe-area); `useAppStore()` không selector khiến render lại khi bất kỳ state nào đổi.
16. **`app/_layout.tsx`**: `SplashScreen.preventAutoHideAsync()` nằm trong thân component (chạy mỗi lần render), nên đưa lên cấp module.

## P3: code chết / dọn dẹp

17. **File không được import ở đâu** (kiểm bằng quét import, nên xác nhận lại từng file trước khi xoá): `hooks/useDatabase.ts` (294 dòng, còn gọi `https://your-api.com/...` và bảng `server_pendings`, đồng thời `softDelete` / `hardDelete` dạng mảng sinh SQL **thiếu `)`** ở dòng 107 và 121 và nối chuỗi id thẳng vào SQL), `hooks/useWebSocket.ts`, `hooks/useSSE.ts`, `hooks/useNetwork.ts`, `hooks/useTypingText.ts`, `utils/apiStreaming.ts`, `utils/socketSimulation.ts`, `database/schema-old.ts`, `database/excuse.ts`, `language-en.ts`, `language-json*.ts`, `services/s3/*` (còn import hàm không tồn tại trong `axios.ts`), `constants/Colors.ts`, `configs/asyncStorage.ts`, nhiều file trong `components/` (`AppArccodion`, `AppTopNav`, `AppSwitch`, `AppLabel`, `AppContainer`, `chart/*`, `output/carousel`, `skeleton/WordSkeleton`, `card/ansers/WordSelect`...) và các `interfaces/*.ts` 1 dòng.
18. **Mock còn trong code sống**: `app/screens/Word/Detail/utils.ts` có `getSenseData`, `getTranslate` (dữ liệu giả `table`, ảnh unsplash cứng, `setTimeout`) và `isTranslationCompleted` (type sai `SenseType`) đều không được gọi. Xoá. `textToSpeech` trùng chức năng với `utils/speak.ts`.
19. **Màn cũ sinh hầu hết lỗi `tsc`**: `app/screens/Practice` (demo, đã không nối), `Word/Create/*`, `Word/Detail/Sense/*`, `Word/data.ts` (1.352 dòng, không export `WordType`). Quyết định xoá hoặc sửa kiểu; hiện chúng làm `tsc` đỏ nên che lỗi mới.
20. **`console.log` thừa** ở `stores/appStore.ts` (in cả `settings` mỗi lần mở), `services/axios.ts` (`GetAPI` in url + params mọi request), `utils/socket.ts`, `app/_layout.tsx`, `utils/audioRecord.ts`, `utils/pickaudio.tsx`. Bọc `__DEV__` hoặc xoá.
21. **`eslint`**: 150 biến / import thừa (nhiều nhất ở `Word/Detail/components/basicInformation.tsx` 22, `learning/learning.test.ts` 15, `Practice/screen.tsx` 12), 65 `exhaustive-deps` (đáng xem: `Collection/Create/components/chooseSenses.tsx:113,125`, `Collection/Detail/[id].tsx:140,158`, `Collection/Detail/components/senseRow.tsx:42`), 11 `import/no-duplicates`, 8 `import/first`. Cài `eslint-formatter-unix` thì bật được `-f unix` cho gọn.
22. **`key={index}`** ở danh sách có thể đổi thứ tự: `Collection/components/wordList.tsx:141,165`, `Word/Detail/Sense/*`. Dùng id.

## P4: cấu hình / hướng đi

23. **Giao diện chưa đa ngôn ngữ**: có `locales/en.json`, `vi.json` nhưng **không nơi nào gọi `t()`**; 146 file `.tsx` chứa chữ tiếng Việt viết cứng. Cần quyết định trước khi mở thêm ngôn ngữ giao diện.
24. `EXPO_PUBLIC_PIXABAY_API_KEY` (`services/senseImage.ts`) bị nhúng vào bundle; chỉ dùng khi `EXPO_PUBLIC_EXTERNAL_IMAGE_FALLBACK=true` (mặc định tắt). Nếu bật thật thì nên gọi qua backend.
25. **`mediaUrl`** (`stores/appStore.ts`) nối `mediaBaseUrl + key` thẳng: thiếu / thừa dấu `/` giữa hai vế sẽ ra URL hỏng. Chuẩn hoá một dấu `/`.
26. `components/AppPressable.tsx:29` còn `TODO: Vibration`.

## Việc nên làm trước tiên

Thứ tự đề xuất: 1 (hai crash hook) → 5 (polling) → 2 (đồng bộ độc quyền) → 3 (refresh) → 6 (socket) → 7 (số thẻ) → dọn mục 17–19 để `tsc` xanh rồi mới bật kiểm `tsc` trong CI.
