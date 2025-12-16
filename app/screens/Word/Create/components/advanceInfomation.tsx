import AppIcon from "@/components/AppIcon";
import AppTitle from "@/components/AppTitle";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { LayoutChangeEvent, View } from "react-native";
import Information from "../../../../../components/output/information";
import WordLink from "../../../../../components/output/wordLink";

type Props = {
  mode?: "create" | "update" | "view";
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openWordSelectModal: (props: { type: keyof typeof bottomSheetTitle }) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordAdvanceInformation = ({
  mode = "view",
  labelWidth,
  onLabelLayout,
  openInputModal,
  openWordSelectModal,
  openRadioModal,
}: Props) => {
  return (
    <View className="mt-2 gap-2">
      <View className="mb-2">
        <AppTitle title="Từ liên quan 🔗" />
      </View>
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode={mode}
        icon={
          <AppIcon
            branch="feather"
            name={"external-link"}
            size={12}
            color="subText2"
          />
        }
        label="Liên quan"
        value={[]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode={mode}
        icon={
          <AppIcon branch="feather" name={"copy"} size={12} color="subText2" />
        }
        label="Đồng nghĩa"
        value={[]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode={mode}
        icon={
          <AppIcon branch="antd" name={"retweet"} size={12} color="subText2" />
        }
        label="Trái nghĩa"
        value={[]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode={mode}
        icon={
          <AppIcon
            branch="feather"
            name={"volume-2"}
            size={12}
            color="subText2"
          />
        }
        label="Đồng âm"
        value={[]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode={mode}
        icon={
          <AppIcon
            branch="fa6"
            name={"code-branch"}
            size={12}
            color="subText2"
          />
        }
        label="Biến thể"
        value={[]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />

      <Information
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode={mode}
        icon={<AppIcon branch="fa6" name={"pen"} size={12} color="subText2" />}
        label="Cụm từ"
        // value="Úm ba la xì bùa"
        placeholder="Không có"
        onPress={() =>
          openInputModal({ type: "input", title: "Cụm từ", field: "" })
        }
      />
      <Information
        onLabelLayout={onLabelLayout}
        labelWidth={labelWidth}
        mode={mode}
        icon={
          <AppIcon
            branch="fa6"
            name={"sticky-note"}
            size={12}
            color="subText2"
          />
        }
        label="Note"
        value=""
        placeholder="Nhập ghi chú"
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
  );
};

export default WordAdvanceInformation;
