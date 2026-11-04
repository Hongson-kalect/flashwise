import { createContext, useContext } from "react";
import type { WordForms } from "@/services/api/words";

/** Dạng biến cách của từ đang xem (phần "Biến thể") và gợi ý "cũng là dạng của …"; rỗng khi chưa tải xong. */
export const WordFormsContext = createContext<WordForms | null>(null);
export const useWordForms = () => useContext(WordFormsContext);
