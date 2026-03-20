import NetInfo from "@react-native-community/netinfo";
import { SQLiteDatabase } from "expo-sqlite";

export const processSyncQueue = async (db: SQLiteDatabase) => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return; // Không có mạng thì nghỉ

  // 1. Lấy danh sách các row đang đợi (PENDING) từ SQLite
  const pendingActions = await db.getAllAsync(
    "SELECT * FROM SyncQueue WHERE status = 'PENDING' ORDER BY timestamp ASC"
  );

  if (pendingActions.length === 0) return;

  console.log(`🔄 Đang đồng bộ ${pendingActions.length} thay đổi...`);

  for (const action of pendingActions) {
    try {
      // Đánh dấu là đang xử lý để tránh gửi trùng
      await db.runAsync("UPDATE SyncQueue SET status = 'SYNCING' WHERE id = ?", [action.id]);

      const data = JSON.parse(action.payload);

      // 2. Gửi yêu cầu lên Server API của bạn (Vultr)
      const response = await fetch(`https://api.flashwise.vn/sync/${action.table_name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action.action_type, data }),
      });

      if (response.ok) {
        // 3. Nếu thành công -> Xóa row trong queue
        await db.runAsync("DELETE FROM SyncQueue WHERE id = ?", [action.id]);
      } else {
        throw new Error("Server rejected");
      }
    } catch (error) {
      console.error(`❌ Lỗi sync ID ${action.id}:`, error);
      // Nếu lỗi, trả về PENDING để lần sau thử lại (hoặc đánh dấu ERROR)
      await db.runAsync("UPDATE SyncQueue SET status = 'PENDING' WHERE id = ?", [action.id]);
      break; // Dừng vòng lặp để bảo toàn thứ tự, thử lại sau
    }
  }
};