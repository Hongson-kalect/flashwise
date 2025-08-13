import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { Entypo } from "@expo/vector-icons";
import { LayoutChangeEvent, View } from "react-native";
import Information from "../../../../../components/output/information";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../../Create/screen";

type Props = {
  mode?: "create" | "update" | "view";
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordMoreInformation = ({
  mode = "view",
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
}: Props) => {
  const { theme } = useTheme();
  return (
    <View className="gap-2">
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        mode={mode}
        label="Example"
        icon={<AppIcon branch="fa6" name={"book"} size={12} color="subText2" />}
        value="Em là búp măng non, em lớn lên trong mùa cách mạng"
        onPress={() =>
          openInputModal({ type: "prompt", title: "Example", field: "" })
        }
      />

      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        mode={mode}
        icon={<Entypo name="gauge" size={12} color={theme.subText2} />}
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
        mode={mode}
        label="Độ phổ biến"
        icon={<AppIcon branch="fa6" name={"fire"} size={12} color="subText2" />}
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
        mode={mode}
        icon={
          <AppIcon branch="feather" name={"image"} size={12} color="subText2" />
        }
        label="Chủ đề"
        value="..."
        onPress={() => openInputModal({ title: "Chủ đề", field: "" })}
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        mode={mode}
        icon={
          <AppIcon
            branch="fa6"
            name={"paintbrush"}
            size={12}
            color="subText2"
          />
        }
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
        <AppText color="title" weight="bold" size={"lg"}>
          Tag 🏷️
        </AppText>
        <View className="flex-row gap-2 flex-wrap mt-2 px-2">
          <View className="bg-gray-200 rounded-lg px-2 py-1">
            <AppText size={"xs"} color="subText2">
              tag 1
            </AppText>
          </View>
          <View className="bg-gray-200 rounded-lg px-2 py-1">
            <AppText size={"xs"} color="subText2">
              y a y e
            </AppText>
          </View>
          <View className="bg-gray-200 rounded-lg px-2 py-1">
            <AppText size={"xs"} color="subText2">
              bum ba la bum
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WordMoreInformation;
