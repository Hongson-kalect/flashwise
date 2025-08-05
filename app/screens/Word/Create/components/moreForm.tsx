import { LayoutChangeEvent, View } from "react-native";
import Information from "./information";
import AppText from "@/components/AppText";

type Props = {
  onLabelLayout: (event: LayoutChangeEvent) => void;
  labelWidth: number;
};

const WordCreateMoreForm = ({ onLabelLayout, labelWidth }: Props) => {
  return (
    <View className="gap-2">
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Example"
        value="Em là búp măng non, em lớn lên trong mùa cách mạng"
      />

      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Độ khó"
        value="A1"
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Độ phổ biến"
        value="Rất phổ biến"
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Chủ đề"
        value="..."
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Phong cách"
        value="Rất trang trọng"
      />

      <View>
        <AppText>Tag:</AppText>
        <View className="flex-row gap-2 flex-wrap">
          <View className="bg-gray-200 rounded-lg px-2 py-1">
            <AppText size={"xs"} color="subText2">
              1
            </AppText>
          </View>
          <View className="bg-gray-200 rounded-lg px-2 py-1">
            <AppText size={"xs"} color="subText2">
              1
            </AppText>
          </View>
          <View className="bg-gray-200 rounded-lg px-2 py-1">
            <AppText size={"xs"} color="subText2">
              1
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WordCreateMoreForm;
