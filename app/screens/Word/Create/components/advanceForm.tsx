import Arccodion from "@/components/AppArccodion";
import { LayoutChangeEvent, View } from "react-native";
import Information from "./information";
import WordLink from "./wordLink";

type Props = {
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
};
const WordCreateAdvanceForm = ({ labelWidth, onLabelLayout }: Props) => {
  return (
    <Arccodion title="Nâng cao">
      {/* <AppTitle title="Từ liên quan " /> */}

      <View className="mt-4 gap-2">
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Liên quan"
          value={[{ value: "search" }]}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Đồng nghĩa"
          value={[{ value: "search" }]}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Trái nghĩa"
          value={[{ value: "search" }]}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Đồng âm"
          value={[{ value: "search" }]}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Biến thể"
          value={[
            { value: "ceck" },
            { value: "ceck", link_to: "bruh" },
            { value: "ceck", link_to: "broh" },
          ]}
        />

        <Information
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Cụm từ"
          value="Úm ba la xì bùa"
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          editable
          label="Note"
          value="Rất trang trọng"
        />
      </View>

      {/* Form bản dịch */}
    </Arccodion>
  );
};

export default WordCreateAdvanceForm;
