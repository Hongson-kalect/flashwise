import { PostAPI } from "../axios";

export interface FsrsFitResult {
  /** not_enough: ít dữ liệu · up_to_date: chưa có thêm lượt ôn · kept: tham số mới không tốt hơn · updated: đã có tham số riêng. */
  status: "not_enough" | "up_to_date" | "kept" | "updated";
  n_items?: number;
  loss_before?: number;
  loss_after?: number;
}

/** Nhờ server tối ưu tham số FSRS riêng từ review_log đã đồng bộ (flashwise_api tracking/fsrs_params.py). Tham số mới về máy qua sync/pull. */
export const optimizeFsrs = async (): Promise<FsrsFitResult> => {
  const res = await PostAPI("learn/fsrs/", {}, { timeout: 60_000 });
  return res.data;
};
