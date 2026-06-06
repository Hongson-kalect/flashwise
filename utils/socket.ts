import MD5 from "crypto-js/md5";

/**
 * Tạo ID phòng socket duy nhất dựa trên nội dung tra cứu
 * @param word - Từ cần tra
 * @param language - Ngôn ngữ gốc (ví dụ: 'en')
 * @param userLanguage - Ngôn ngữ đích (ví dụ: 'vi')
 */
export const getTranslateRoomId = (
  word: string,
  language: string,
  userLanguage: string,
): string => {
  // Chuẩn hóa từ (viết thường, bỏ khoảng trắng thừa) để đảm bảo MD5 nhất quán
  const normalizedWord = word.trim().replace(/\s+/g, " ").toLowerCase();

  const hash = MD5(normalizedWord).toString();

  // Trả về format: md5_en_vi
  return `${hash}_${language}_${userLanguage}`;
};

// socketUtil.ts
type SocketCallback = (data: any) => void;

class SocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private subscribers: Map<string, Set<SocketCallback>> = new Map();
  private isManualClose = false; // Để phân biệt giữa lỗi mạng và chủ động tắt
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private sendQueue: any[] = []; // Chứa các tin nhắn đợi gửi khi socket đang CONNECTING

  constructor(url: string) {
    this.url = url;
  }

  // 1. Kết nối với cơ chế Reconnect
  connect() {
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    )
      return;

    this.isManualClose = false;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("✅ Socket Connected");
      this.reconnectAttempts = 0;
      while (this.sendQueue.length > 0) {
        this.send(this.sendQueue.shift());
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);
        // Lấy room_id để biết tin nhắn này thuộc về từ vựng nào
        // Server cần trả về room_id trong mọi gói tin stream
        const roomId = res.room_id || res.word_room;

        console.log("nhận message", res);

        if (roomId && this.subscribers.has(roomId)) {
          this.subscribers.get(roomId)?.forEach((cb) => cb(res));

          // NẾU SERVER RA LỆNH UNSUBSCRIBE (Tự động cleanup ở phía Client)
          if (res.unsubscribe_room) {
            console.log(`🧹 Tự động cleanup group: ${res.unsubscribe_room}`);
            this.subscribers.delete(res.unsubscribe_room);
          }
        }
      } catch (e) {
        console.error("❌ Lỗi parse JSON socket:", e);
      }
    };

    this.ws.onclose = () => {
      console.log("🔌 Socket Closed");
      if (
        !this.isManualClose &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          10000,
        );
        setTimeout(() => this.connect(), delay);
      }
    };

    this.ws.onerror = (err) => this.ws?.close();
  }

  // Sửa logic Subscribe: Dùng roomId làm key chính
  subscribe(roomId: string, callback: SocketCallback) {
    if (!this.subscribers.has(roomId)) {
      this.subscribers.set(roomId, new Set());
    }
    this.subscribers.get(roomId)?.add(callback);

    // Đảm bảo socket đã mở mới gửi lệnh sub lên server
    this.send({ action: "subscribe", word_room: roomId });

    // Trả về hàm hủy sub
    return () => this.unsubscribe(roomId, callback);
  }

  unsubscribe(roomId: string, callback: SocketCallback) {
    const keySubscribers = this.subscribers.get(roomId);
    if (keySubscribers) {
      keySubscribers.delete(callback);
      if (keySubscribers.size === 0) {
        this.subscribers.delete(roomId);
        this.send({ action: "unsubscribe", word_room: roomId });
      }
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.log("⏳ Queueing message...");
      this.sendQueue.push(data);
      if (this.ws?.readyState !== WebSocket.CONNECTING) this.connect();
    }
  }

  disconnect() {
    this.isManualClose = true;
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
  }
}

export const socketRoom = (word: string, lang: string) => {
  if (!word) {
    return "";
  }

  // 1. Đưa về lowercase
  let cleanedWord = word.toLowerCase();

  // 2. Loại bỏ các ký tự đặc biệt
  // Giữ lại: chữ cái (Unicode), số (\d), khoảng trắng (\s) và các ký tự: ' - , .
  // Cờ 'g' để thay thế toàn bộ, cờ 'u' để kích hoạt chế độ Unicode \p{L}
  cleanedWord = cleanedWord.replace(/[^\p{L}\d\s'\-,\.]/gu, "");

  // 3. Xoá khoảng trắng thừa bên trong và 2 bên
  // split(/\s+/) băm chuỗi theo một hoặc nhiều khoảng trắng, lọc bỏ mảng rỗng, sau đó join lại
  cleanedWord = cleanedWord.trim().split(/\s+/).join(" ");

  return `${cleanedWord}:${lang}`;
};

export const wordSocket = new SocketManager("ws://192.168.50.64:8000/ws/word/");
