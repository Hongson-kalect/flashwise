/**
 * Nội dung thông báo nhắc học (thuần, có test). Thông báo được đặt trước nên số liệu là ước tính tại lúc đặt lịch:
 * số thẻ sẽ đến hạn tới giờ nhắc, chuỗi ngày hiện tại, và hôm nay đã học chưa.
 */
export interface ReminderFacts {
  /** Số thẻ ôn được (đủ nội dung trong máy) sẽ đến hạn tới giờ nhắc, đã tính hạn mức ôn mỗi ngày. */
  due: number;
  streak: number;
  /** Thông báo này thuộc ngày học hôm nay và hôm nay chưa học / ôn gì: chuỗi có thể đứt. */
  atRisk: boolean;
}

export interface ReminderMessage {
  title: string;
  body: string;
  /** Có thẻ cần ôn thì chạm vào mở thẳng màn ôn; không thì chỉ mở app. */
  route: string | null;
}

export const REVIEW_ROUTE = "/screens/Learning/Review/screen";

export const buildReminderMessage = ({ due, streak, atRisk }: ReminderFacts): ReminderMessage => {
  const route = due > 0 ? REVIEW_ROUTE : null;
  if (atRisk && streak >= 2) {
    return {
      title: `Chuỗi ${streak} ngày sắp đứt`,
      body: due > 0 ? `Ôn ${due} thẻ đang chờ để giữ chuỗi, chỉ vài phút thôi.` : "Học vài từ mới để giữ chuỗi ngày học của bạn.",
      route,
    };
  }
  if (due > 0) {
    return {
      title: "Đến giờ ôn từ vựng rồi",
      body: due === 1 ? "Có 1 thẻ đang chờ ôn trước khi quên." : `Có ${due} thẻ đang chờ ôn trước khi quên.`,
      route,
    };
  }
  return { title: "Đến giờ học từ vựng rồi", body: "Học thêm vài từ mới để mở rộng vốn từ nhé.", route: null };
};
