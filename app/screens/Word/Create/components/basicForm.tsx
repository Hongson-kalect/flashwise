import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import Information from "./information";

type Props = {
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
};

const WordCreateBasicForm = ({ labelWidth, onLabelLayout }: Props) => {
  return (
    <View>
      <AppTitle title="Định nghĩa " />
      <TouchableOpacity className="flex-row gap-1 mt-1">
        <View className="flex-1">
          <AppText className="flex-1">
            Cái này là mô phỏng của chức năng định nghĩa
          </AppText>
        </View>
        <View>
          <View className="px-3 py-1.5 items-center justify-center rounded">
            <AppIcon name="edit" branch="antd" size={16} color="grey" />
          </View>
        </View>
      </TouchableOpacity>

      <View className="mt-8 gap-1">
        <Information
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Loại từ"
          value=""
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          editable
          label="Phiên âm"
          value="Phiên âm"
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          editable
          label="Phát âm"
          value="Chọn file âm thanh (Giới hạn dung lượng và thời gian)"
        />
      </View>

      <View className="mt-6 items-center justify-center">
        <View className="h-40 w-40 border border-dashed border-gray-400 rounded-lg p-4">
          <AppText color="subText2" size={"xs"}>
            Chọn hình minh hoạ
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default WordCreateBasicForm;
