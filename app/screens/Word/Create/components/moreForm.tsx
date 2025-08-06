import AppText from "@/components/AppText";
import { LayoutChangeEvent, View } from "react-native";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../screen";
import Information from "./information";

type Props = {
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordCreateMoreForm = ({
  onLabelLayout,
  labelWidth,
  openInputModal,
  openRadioModal,
}: Props) => {
  return (
    <View className="gap-2">
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Example"
        value="Em là búp măng non, em lớn lên trong mùa cách mạng"
        onPress={() =>
          openInputModal({ type: "prompt", title: "Example", field: "" })
        }
      />

      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Độ khó"
        value="A1"
        onPress={() =>
          openRadioModal({
            field: "difficulty",
            type: "radio",
            title: "Độ khó",
            options: [
              { label: "A1", value: "A1" },
              { label: "A2", value: "A2" },
              { label: "B1", value: "B1" },
              { label: "B2", value: "B2" },
              { label: "C1", value: "C1" },
              { label: "C2", value: "C2" },
            ],
          })
        }
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Độ phổ biến"
        value="Rất phổ biến"
        onPress={() =>
          openRadioModal({
            field: "",
            title: "Độ phổ biến",
            options: [
              { label: "Rất phổ biến", value: "1" },
              { label: "Phổ biến", value: "2" },
              { label: "Trung bình", value: "3" },
              { label: "Không phổ biến", value: "4" },
              { label: "Rất Không phổ biến", value: "5" },
            ],
          })
        }
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Chủ đề"
        value="..."
        onPress={() => openInputModal({ title: "Chủ đề", field: "" })}
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        editable
        label="Phong cách"
        value="Rất trang trọng"
        onPress={() =>
          openRadioModal({
            field: "",
            title: "Phong cách",
            options: [
              { label: "Dân dã", value: "1" },
              { label: "Trang trọng", value: "2" },
              { label: "Bình dân", value: "3" },
              { label: "Quê mùa", value: "4" },
              { label: "Châm chọc", value: "5" },
            ],
          })
        }
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
