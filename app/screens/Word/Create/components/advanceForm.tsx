import Arccodion from "@/components/AppArccodion";
import { useBottomSheet } from "@/providers/BottomSheet";
import { LayoutChangeEvent, View } from "react-native";
import Information from "./information";
import WordLink from "./wordLink";
import WordSelectForm from "./wordSelectForm";

type Props = {
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
};

const bottomSheetTitle = {
  related: "Từ liên quan",
  synonym: "Từ đồng nghĩa",
  antonym: "Từ trái nghĩa",
};

const WordCreateAdvanceForm = ({ labelWidth, onLabelLayout }: Props) => {
  const { present } = useBottomSheet();
  const openWordSelectForm = ({
    type,
  }: {
    type: keyof typeof bottomSheetTitle;
  }) => {
    present({
      size: "full",
      title: bottomSheetTitle[type],
      render: () => (
        <View className="px-4">
          <WordSelectForm />
        </View>
      ),
    });
  };

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
          onPress={() => openWordSelectForm({ type: "related" })}
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
