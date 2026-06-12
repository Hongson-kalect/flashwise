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
  status: "INITIAL" | "PARTIAL" | "COMPLETED" | null;
};

export const initialState: WordState = {
  id:undefined,
  value:undefined,
  languageCode:undefined,
  senses:{},
  isLoading: true,
  status: null,
};

