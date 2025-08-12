import AppIcon from "@/components/AppIcon";
import AppTitle from "@/components/AppTitle";
import { LayoutChangeEvent, View } from "react-native";
import Information from "../../Create/components/information";
import WordLink from "../../Create/components/wordLink";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../../Create/screen";

type Props = {
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openWordSelectModal: (props: { type: keyof typeof bottomSheetTitle }) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordAdvanceInformation = ({
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
        mode="create"
        icon={
          <AppIcon
            branch="feather"
            name={"external-link"}
            size={12}
            color="subText2"
          />
        }
        label="Liên quan"
        value={[{ value: "search" }]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode="create"
        icon={
          <AppIcon branch="feather" name={"copy"} size={12} color="subText2" />
        }
        label="Đồng nghĩa"
        value={[{ value: "search" }]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode="create"
        icon={
          <AppIcon branch="antd" name={"retweet"} size={12} color="subText2" />
        }
        label="Trái nghĩa"
        value={[{ value: "search" }]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode="create"
        icon={
          <AppIcon
            branch="feather"
            name={"volume-2"}
            size={12}
            color="subText2"
          />
        }
        label="Đồng âm"
        value={[{ value: "search" }]}
        onPress={() => openWordSelectModal({ type: "related" })}
      />
      <WordLink
        labelWidth={labelWidth}
        onLabelLayout={onLabelLayout}
        mode="create"
        icon={
          <AppIcon
            branch="fa6"
            name={"code-branch"}
            size={12}
            color="subText2"
          />
        }
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
        icon={<AppIcon branch="fa6" name={"pen"} size={12} color="subText2" />}
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
        icon={
          <AppIcon
            branch="fa6"
            name={"sticky-note"}
            size={12}
            color="subText2"
          />
        }
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
  );
};

export default WordAdvanceInformation;
