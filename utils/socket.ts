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
  userLanguage: string
): string => {
  // Chuẩn hóa từ (viết thường, bỏ khoảng trắng thừa) để đảm bảo MD5 nhất quán
  const normalizedWord = word.trim().replace(/\s+/g, ' ').toLowerCase();

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
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;

    this.isManualClose = false;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("✅ Socket Connected");
      this.reconnectAttempts = 0;
      // Gửi toàn bộ tin nhắn đang đợi trong hàng đợi
      while (this.sendQueue.length > 0) {
        const data = this.sendQueue.shift();
        this.send(data);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const key = data.word || data.type; // Lấy "nhãn" để phân phối (word hoặc type)
        
        if (this.subscribers.has(key)) {
          this.subscribers.get(key)?.forEach(callback => callback(data));
        }
      } catch (e) {
        console.error("❌ Lỗi parse JSON socket:", e);
      }
    };

    this.ws.onclose = (e) => {
      console.log("🔌 Socket Closed");
      // Nếu không phải chủ động tắt, hãy thử kết nối lại
      if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000); // Exponential backoff
        console.log(`🔄 Reconnecting in ${delay/1000}s... (Lần ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      }
    };

    this.ws.onerror = (err) => {
      console.error("❌ Socket Error:", err);
      this.ws?.close();
    };
  }

  // 2. Subscribe (Theo từ vựng hoặc Type)
  subscribe(key: string, callback: SocketCallback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)?.add(callback);

    // Gửi lệnh subscribe lên server (nếu cần server join group)
    this.send({ action: "subscribe", word: key });

    // Trả về hàm Unsubscribe để dùng trong cleanup của useEffect
    return () => this.unsubscribe(key, callback);
  }

  // 3. Unsubscribe
  unsubscribe(key: string, callback: SocketCallback) {
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.delete(callback);
      if (keySubscribers.size === 0) {
        this.subscribers.delete(key);
        // Có thể gửi lệnh unsubscribe lên server để rời group (tùy logic backend)
        this.send({ action: "unsubscribe", word: key });
      }
    }
  }

  // 4. Gửi dữ liệu (Có hàng đợi)
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log("⏳ Socket is connecting, queuing message...");
      this.sendQueue.push(data);
    } else {
      console.warn("⚠️ Socket chưa được kết nối. Vui lòng gọi .connect() trước.");
    }
  }

  // 5. Ngắt kết nối chủ động
  disconnect() {
    this.isManualClose = true;
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
    this.sendQueue = [];
  }
}

export const wordSocket = new SocketManager("ws://192.168.1.10:8000/ws/word/");