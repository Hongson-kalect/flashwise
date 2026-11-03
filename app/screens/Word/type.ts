import { SenseType } from "./data";

// export type SenseType ={
//   id:string,
//   pos?:string,
//   metadata?: any,
//   image?: string, // Tạm để url, cân nhắc để json sau nếu cần lưu metadata vào db
//   contents?:{
//     definition?: WordType["definition"],
//     translates?: WordType["translates"],
//     examples?: WordType["examples"],
//     usage?: WordType["usage"],
//   }
//   note?:string
// }

export type WordState = {
  id?: string,
  value?:string,
  languageCode?: string,
  senses: {[sense_id:string]:SenseType},
  isLoading: boolean;
  status: "INITIAL" | "PARTIAL" | "COMPLETED" | "ERROR" | null;
  /** Lỗi get-word / socket: màn hình hiện thông báo thay vì spinner. */
  error?: WordError | null;
};

export type WordErrorCode =
  | "rejected" // từ không hợp lệ / bị từ chối / bị ban (404, REJECTED)
  | "throttled" // tra từ mới quá nhiều (429)
  | "failed" // lần tạo vừa lỗi (500, ERROR), có retryAfter
  | "unavailable" // hàng đợi / DB lỗi (503)
  | "offline"; // không có mạng

export type WordError = {
  code: WordErrorCode;
  message?: string;
  retryAfter?: number;
};

export const initialState: WordState = {
  id:undefined,
  value:undefined,
  languageCode:undefined,
  senses:{},
  isLoading: true,
  status: null,
  error: null,
};

