import { createContext, useContext } from "react";

/** true khi từ còn đang được tạo / dịch: các ô chưa có nội dung hiện skeleton thay vì "trống". */
export const WordLoadingContext = createContext(false);
export const useWordLoading = () => useContext(WordLoadingContext);
