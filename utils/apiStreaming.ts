interface StreamOptions {
  url: string;
  method?: "GET" | "POST";
  body?: any;
  onStart?: () => void;
  onChunk: (chunk: string) => void;
  onFinish?: (fullResult: string) => void;
  onError?: (error: any) => void;
  setStreamingType?: (isStreaming: boolean) => void;
  maxRetries?: number;
}

export const streamRequest = (options: StreamOptions, retryCount = 0) => {
  const {
    url,
    method = "GET",
    body,
    onStart,
    onChunk,
    onFinish,
    onError,
    maxRetries = 3,
  } = options;

  let seenBytes = 0;
  let fullRes = "";
  let isFinished = false;

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Content-Type", "application/json");

  // Kích hoạt callback khi bắt đầu (chỉ ở lần thử đầu tiên)
  if (retryCount === 0) onStart?.();

  xhr.onreadystatechange = () => {
    if (xhr.readyState >= 2) {
      const isStreaming = xhr.getResponseHeader("X-Is-Streaming");
      const source = xhr.getResponseHeader("X-Word-Source");
      options.setStreamingType?.(isStreaming === "true");
      // Bạn có thể dùng biến này để quyết định tốc độ gõ chữ (queue)
    }

    // readyState 3: Đang nhận dữ liệu, 4: Hoàn thành
    if (xhr.readyState === 3 || xhr.readyState === 4) {
      try {
        const responseText = xhr.responseText; // Dùng responseText chuẩn hơn response
        const newData = responseText.substring(seenBytes);

        if (newData) {
          seenBytes = responseText.length;
          fullRes += newData;
          onChunk(newData);
        }

        if (xhr.readyState === 4 && !isFinished) {
          isFinished = true;
          if (xhr.status >= 200 && xhr.status < 300) {
            onFinish?.(fullRes);
          } else {
            handleError();
          }
        }
      } catch (e) {
        handleError(e);
      }
    }
  };

  const handleError = (error?: any) => {
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Backoff: 1s, 2s, 4s...
      console.log(`Retry lần ${retryCount + 1} sau ${delay}ms...`);
      setTimeout(() => streamRequest(options, retryCount + 1), delay);
    } else {
      onError?.(error || `Lỗi server: ${xhr.status}`);
    }
  };

  xhr.onerror = () => handleError("Lỗi mạng (Network Error)");

  xhr.send(body ? JSON.stringify(body) : null);

  // Trả về hàm abort để có thể hủy stream nếu cần (ví dụ user thoát màn hình)
  return () => xhr.abort();
};
