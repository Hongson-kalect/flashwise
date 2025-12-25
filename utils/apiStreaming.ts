import EventSource from "react-native-sse";

let es: EventSource | null = null;
let retry = 0;
const MAX_RETRY = 5;

export function connect(url: string) {
  es = new EventSource(url);

  es.addEventListener("open", () => {
    console.log("SSE connected");
    retry = 0;
  });

  es.addEventListener("message", (e) => {
    console.log("data:", e.data);
  });

  es.addEventListener("error", (e) => {
    console.warn("SSE error", e);

    es?.close();
    es = null;

    if (retry < MAX_RETRY) {
      const delay = Math.min(1000 * 2 ** retry, 15000);
      retry++;
      setTimeout(connect, delay);
    } else {
      console.error("SSE failed permanently");
    }
  });
}
