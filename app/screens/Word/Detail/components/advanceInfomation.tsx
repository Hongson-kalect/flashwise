import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { LayoutChangeEvent, View } from "react-native";
import { Divider } from "react-native-paper";

type Props = {
  mode?: "create" | "update" | "view";
  related: {
    value: string;
    tags: string[];
    id: string;
  }[];
  synonym:
    | {
        value: string;
        tags: string[];
        id: string;
      }[]
    | string[];
  antonym:
    | {
        value: string;
        tags: string[];
        id: string;
      }[]
    | string[];
  form:
    | {
        value: string;
        type: string[];
        id?: string;
      }[]
    | string[];
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openWordSelectModal: (props: { type: keyof typeof bottomSheetTitle }) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordAdvanceInformation = ({
  related,
  synonym,
  antonym,
  form,
  mode = "view",
  labelWidth,
  onLabelLayout,
  openInputModal,
  openWordSelectModal,
  openRadioModal,
}: Props) => {
  return (
    <View className="mt-2 gap-2">
      <View>
        <AppTitle title="Từ mở rộng ↗️" />
      </View>
      <Divider />

      <Related
        icon={
          <AppIcon
            branch="feather"
            name={"external-link"}
            size={12}
            color="title"
          />
        }
        title="Từ liên quan"
        values={[{ value: "day" }, { value: "month" }, { value: "abc, def" }]}
      />
      <Related
        icon={
          <AppIcon branch="feather" name={"copy"} size={12} color="title" />
        }
        title="Từ đồng nghĩa"
        values={[{ value: "day" }, { value: "month" }, { value: "abc, def" }]}
      />
      <Related
        icon={
          <AppIcon branch="antd" name={"retweet"} size={12} color="title" />
        }
        title="Từ trái nghĩa"
        values={[{ value: "day" }, { value: "month" }, { value: "abc, def" }]}
      />
      <Related
        icon={
          <AppIcon
            branch="feather"
            name={"git-branch"}
            size={12}
            color="title"
          />
        }
        title="Biến thể"
        values={[
          { value: "day" },
          { value: "month" },
          { value: "abc, def", id: "cc" },
        ]}
      />
      <Related
        icon={<AppIcon branch="feather" name={"tag"} size={12} color="title" />}
        title="Tags"
        values={[{ value: "day" }, { value: "month" }, { value: "abc, def" }]}
      />

      {/* <WordLink
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
        value={[{ value: "search" }]}
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
        value={[{ value: "search" }]}
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
        value={[{ value: "search" }]}
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
        value={[{ value: "search" }]}
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
        mode={mode}
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
        value="Rất trang trọng"
        onPress={() =>
          openRadioModal({
            field: "note",
            type: "radio",
            title: "Note",
            options: [],
          })
        }
      /> */}
    </View>
  );
};

type RelatedProp = {
  title: string;
  icon?: React.ReactNode;
  values: {
    value: string;
    tags?: string[];
    id?: string;
  }[];
};
const Related = (props: RelatedProp) => {
  return (
    <View className="py-2">
      <View className="flex-row items-center gap-1">
        <View className="w-4">
          {props.icon || (
            <AppIcon branch="antd" name={"star"} size={12} color="title" />
          )}
        </View>
        <AppText color="title" font="MulishMedium">
          {props.title}
        </AppText>
      </View>

      {props.values?.length > 0 ? (
        <View className="flex-row items-center gap-1 mt-2 ml-5">
          {props.values.map((item, index) => (
            <AppText
              color={item.id ? "primary" : "subText2"}
              key={index}
              className={item.id && "underline"}
            >
              {item.value}
              {index < 2 ? "," : ""}
            </AppText>
          ))}
        </View>
      ) : (
        <View className="flex-row items-center gap-2 ml-5 mt-2">
          <AppText size="sm" color="subText2" font="MulishLightItalic">
            Chưa có.
          </AppText>

          <AppButton
            style={{ borderRadius: 4 }}
            type="success"
            onPress={() => {}}
            size="xs"
          >
            <AppIcon branch="antd" name={"plus"} color="white" size={14} />
            <AppText color="white" size={"xs"}>
              Thêm
            </AppText>
          </AppButton>
        </View>
      )}
    </View>
  );
};

export default WordAdvanceInformation;
