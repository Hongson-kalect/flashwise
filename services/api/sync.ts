import { SyncApi } from "../sync/engine";
import { PostAPI, serverInstance } from "../axios";

/** Gọi sync/push và sync/pull của backend (flashwise_api/tracking/sync.py). Mạng / server lỗi thì ném, engine giữ nguyên hàng đợi. */
export const syncApi: SyncApi = {
  async push(changes) {
    const res = await PostAPI("sync/push/", { changes }, { timeout: 60_000 });
    return res.data;
  },
  async pull({ tables, cursors, limit }) {
    const res = await serverInstance.get("sync/pull/", {
      params: { tables: tables.join(","), limit, cursors: JSON.stringify(cursors) },
      timeout: 60_000,
    });
    return res.data;
  },
};
