import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { ScrollView, View } from "react-native";

const PolicyScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <View>
        <AppReturnHeader title="Return" />
      </View>

      <View>
        <ScrollView
          // style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <AppText size="2xl" font="MulishBold" className="mb-2">
            Điều khoản sử dụng
          </AppText>

          <AppText
            size="sm"
            font="MulishLight"
            className="mb-6 opacity-70 text-right"
          >
            Cập nhật lần cuối: 2026
          </AppText>

          {/* Section 1 */}
          <AppText size="lg" font="MulishSemiBold" className="mb-2">
            1. Mục đích và phạm vi dịch vụ
          </AppText>

          <AppText size="sm" className="mb-4 leading-5 opacity-90">
            Ứng dụng được xây dựng nhằm hỗ trợ người dùng học từ vựng hiệu quả
            thông qua hệ thống thẻ từ, ví dụ, phát âm, bài học và các chức năng
            mở rộng. Ứng dụng cho phép người dùng tự tạo nội dung từ các từ vựng
            có sẵn, bao gồm các hình ảnh minh họa, định nghĩa, ví dụ và chia sẻ
            cho cộng đồng.
          </AppText>

          {/* Section 2 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            2. Quyền sở hữu & bản quyền nội dung
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            <AppText font="MulishSemiBold">2.1 Nội dung hệ thống: </AppText>
            Tất cả nội dung có sẵn trong ứng dụng thuộc quyền sở hữu của nhà
            phát triển. Người dùng không được sao chép hoặc phân phối nếu chưa
            được cho phép.
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            <AppText font="MulishSemiBold">
              2.2 Nội dung do người dùng tạo:{" "}
            </AppText>
            Khi bạn tải lên hình ảnh hoặc văn bản, bạn tự xác nhận rằng bạn sở
            hữu bản quyền hoặc có quyền hợp pháp để sử dụng. Bạn hoàn toàn chịu
            trách nhiệm với nội dung của mình, bao gồm hình ảnh cá nhân, người
            khác hoặc bất kỳ tài liệu riêng tư nào.
          </AppText>

          {/* Section 3 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            3. Rủi ro khi chia sẻ nội dung
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Ứng dụng cho phép bạn chia sẻ bộ từ vựng hoặc hình ảnh cho cộng đồng
            (nếu bạn tự bật tính năng chia sẻ). Khi chia sẻ, bạn hiểu và chấp
            nhận những rủi ro sau:
          </AppText>

          <AppText size="sm" className="mb-3 leading-5">
            <AppText font="MulishSemiBold">
              ⚠ 3.1 Rủi ro về hình ảnh cá nhân:{" "}
            </AppText>
            Hình ảnh chứa khuôn mặt, gia đình hoặc thông tin riêng tư có thể bị
            người khác xem, lưu hoặc sử dụng theo cách bạn không kiểm soát. Nhà
            phát triển không chịu trách nhiệm cho việc phát tán hình ảnh bởi bên
            thứ ba.
          </AppText>

          <AppText size="sm" className="mb-3 leading-5">
            <AppText font="MulishSemiBold">⚠ 3.2 Rủi ro về ngôn từ: </AppText>
            Một số người dùng có thể đăng tải nội dung phản cảm, kích động hoặc
            không phù hợp. Dù hệ thống có cơ chế lọc, nhưng hoàn toàn không thể
            đảm bảo loại bỏ 100%.
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            <AppText font="MulishSemiBold">
              ⚠ 3.3 Trách nhiệm khi chia sẻ:{" "}
            </AppText>
            Khi bật chia sẻ, bạn xác nhận đã xem xét nội dung kỹ lưỡng và chịu
            trách nhiệm nếu nội dung gây hiểu lầm, vi phạm bản quyền hoặc chứa
            hình ảnh nhạy cảm.
          </AppText>

          {/* Section 4 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            4. Quyền sử dụng của ứng dụng đối với nội dung người dùng
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Khi tải nội dung lên, bạn cấp quyền cho ứng dụng được lưu trữ, xử
            lý, nén và hiển thị nội dung trong tài khoản của bạn. Ứng dụng chỉ
            hiển thị cho người khác khi bạn bật chế độ chia sẻ. Chúng tôi không
            dùng nội dung của bạn cho mục đích quảng cáo hoặc bán cho bên thứ
            ba.
          </AppText>

          {/* Section 5 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            5. Hành vi bị cấm
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Người dùng không được đăng tải nội dung vi phạm bản quyền, hình ảnh
            cá nhân người khác không được phép, nội dung khiêu dâm, kích động
            thù hằn, bạo lực, phân biệt đối xử hoặc trái pháp luật.
          </AppText>

          {/* Section 6 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            6. Quyền xử lý của nhà phát triển
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Chúng tôi có quyền ẩn, khóa hoặc xóa nội dung vi phạm; khóa tài
            khoản tạm thời hoặc vĩnh viễn; từ chối hiển thị nội dung nguy hiểm
            hoặc không phù hợp; và có thể thực hiện mà không cần thông báo
            trước.
          </AppText>

          {/* Section 7 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            7. Dữ liệu & Quyền riêng tư
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Chúng tôi chỉ thu thập dữ liệu tối thiểu để vận hành ứng dụng. Bạn
            có quyền yêu cầu tải về hoặc xóa toàn bộ dữ liệu. Sau khi xóa, dữ
            liệu sẽ bị gỡ khỏi giao diện và API, chỉ có thể truy cập bởi hệ
            thống cho mục đích pháp lý trong vòng 45 ngày. Sau thời gian đó, dữ
            liệu sẽ bị gỡ hoàn toàn và không thể phục hồi.
          </AppText>

          {/* Section 8 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            8. Giới hạn trách nhiệm
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Ứng dụng không chịu trách nhiệm đối với nội dung do người dùng tự
            chia sẻ; hình ảnh hoặc thông tin cá nhân bị sao chép bởi bên thứ ba;
            hay bất kỳ thiệt hại phát sinh từ việc chia sẻ nội dung công khai.
          </AppText>

          {/* Section 9 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            9. Thay đổi điều khoản
          </AppText>

          <AppText size="sm" className="mb-4 leading-5">
            Nhà phát triển có thể cập nhật điều khoản theo thời gian. Những thay
            đổi quan trọng sẽ được thông báo.
          </AppText>

          {/* Section 10 */}
          <AppText size="lg" font="MulishSemiBold" className="mt-4 mb-2">
            10. Liên hệ
          </AppText>

          <AppText size="sm" className="mb-10 leading-5 opacity-80">
            Nếu có câu hỏi về điều khoản, vui lòng liên hệ trong mục “Cài đặt”.
          </AppText>
        </ScrollView>
      </View>
    </View>
  );
};

export default PolicyScreen;
