import Arccodion from "@/components/AppArccodion";
import { LayoutChangeEvent, View } from "react-native";
import Information from "../../../../../components/output/information";
import WordLink from "../../../../../components/output/wordLink";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../screen";

type Props = {
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openWordSelectModal: (props: { type: keyof typeof bottomSheetTitle }) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordCreateAdvanceForm = ({
  labelWidth,
  onLabelLayout,
  openInputModal,
  openWordSelectModal,
  openRadioModal,
}: Props) => {
  return (
    <Arccodion title="Nâng cao">
      {/* <AppTitle title="Từ liên quan " /> */}

      <View className="mt-4 gap-2">
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          mode="create"
          label="Liên quan"
          value={[{ value: "search" }]}
          onPress={() => openWordSelectModal({ type: "related" })}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          mode="create"
          label="Đồng nghĩa"
          value={[{ value: "search" }]}
          onPress={() => openWordSelectModal({ type: "related" })}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          mode="create"
          label="Trái nghĩa"
          value={[{ value: "search" }]}
          onPress={() => openWordSelectModal({ type: "related" })}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          mode="create"
          label="Đồng âm"
          value={[{ value: "search" }]}
          onPress={() => openWordSelectModal({ type: "related" })}
        />
        <WordLink
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          mode="create"
          label="Biến thể"
          value={[
            { value: "ceck" },
            { value: "ceck", link_to: "bruh" },
            { value: "ceck", link_to: "broh" },
          ]}
          onPress={() => openWordSelectModal({ type: "related" })}
        />

        <Information
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          mode="create"
          label="Cụm từ"
          value="Úm ba la xì bùa"
          onPress={() =>
            openInputModal({ type: "input", title: "Cụm từ", field: "" })
          }
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          mode="create"
          label="Note"
          value="Rất trang trọng"
          onPress={() =>
            openRadioModal({
              field: "note",
              type: "radio",
              title: "Note",
              options: [],
            })
          }
        />
      </View>

      {/* Form bản dịch */}
    </Arccodion>
  );
};

export default WordCreateAdvanceForm;
