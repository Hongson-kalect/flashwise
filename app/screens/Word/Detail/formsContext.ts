import { createContext, useContext } from "react";
import type { WordForms } from "@/services/api/words";

/** Dạng biến cách của từ đang xem (phần "Biến thể") và gợi ý "cũng là dạng của …"; rỗng khi chưa tải xong. */
export const WordFormsContext = createContext<WordForms | null>(null);
export const useWordForms = () => useContext(WordFormsContext);

/**
 * Trang đang mở bằng 1 dạng biến cách chưa có mục riêng (gõ buying -> hiện nghĩa của buy): dạng đó, tên dạng, và các loại từ
 * (đã chuẩn hoá noun | verb | adj | adv) mà nó là dạng của. null khi mở thẳng từ gốc.
 */
export type FormFocus = { form: string; tags: string[]; pos: string[] };
export const FormFocusContext = createContext<FormFocus | null>(null);
export const useFormFocus = () => useContext(FormFocusContext);
