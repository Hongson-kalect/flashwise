import AppAddIcon from "@/components/AppAddIcon";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useTheme } from "@/providers/Theme";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-paper";

type Props = {
  mode?: "create" | "update" | "view";
  relateds?: string[];
  synonyms?: string[];
  antonyms?: string[];
  forms?: string[];
  tags?: string[];
  labelWidth?: number;
  onLabelLayout?: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openWordSelectModal: (props: { type: keyof typeof bottomSheetTitle }) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordAdvanceInformation = ({
  relateds,
  synonyms,
  antonyms,
  forms,
  tags,
  mode = "view",
  labelWidth,
  onLabelLayout,
  openInputModal,
  openWordSelectModal,
  openRadioModal,
}: Props) => {
  const { theme } = useTheme();
  return (
    <View className="mt-2 gap-2">
      <View>
        <View>
          <AppText size="md" font="MulishBlack" color="title">
            Discover
          </AppText>
          {/* <AppTitle title="Từ mở rộng ↗️" /> */}
        </View>
        <Divider />
      </View>

      <Related
        icon={
          <FontAwesome
            name="link"
            size={14}
            style={{ color: theme.title, width: 14 }}
          />
        }
        title="Từ liên quan"
        values={relateds || []}
      />
      <Related
        icon={
          <Ionicons
            name="copy"
            size={14}
            style={{ color: theme.title, width: 14 }}
          />
        }
        title="Từ đồng nghĩa"
        values={synonyms || []}
      />
      <Related
        icon={
          <MaterialIcons
            name="swap-horizontal-circle"
            size={14}
            style={{ color: theme.title, width: 14 }}
          />
        }
        title="Từ trái nghĩa"
        values={antonyms || []}
      />
      <Related
        icon={
          <AppIcon
            branch="fa6"
            name={"code-branch"}
            style={{ width: 14 }}
            size={14}
            color="title"
          />
        }
        title="Biến thể"
        values={forms || []}
      />
      <Related
        icon={
          <AppIcon
            branch="fa6"
            name={"tag"}
            size={14}
            style={{ width: 14 }}
            color="title"
          />
        }
        title="Tags"
        values={tags || []}
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
  values: string[];
};
const Related = (props: RelatedProp) => {
  const { theme } = useTheme();
  return (
    <View className="py-2">
      <View className="flex-row items-center gap-2">
        {props.icon || (
          <AppIcon branch="antd" name={"star"} size={14} color="title" />
        )}
        <AppTitle title={props.title} />
      </View>
      {/* <View className="flex-row items-center gap-1">

        
        <View className="w-4">
          {props.icon || (
            <AppIcon branch="antd" name={"star"} size={12} color="title" />
          )}
        </View>
        <AppText color="title" font="MulishMedium">
          {props.title}
        </AppText>
      </View> */}

      {props.values?.length > 0 ? (
        <View className="flex-row items-center gap-1 ml-2 flex-wrap">
          {props.values.map((item, index) => (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: `/screens/Word/Detail/[value]`,
                  params: { value: item, valueId: item },
                });
              }}
              key={item}
              className="px-2 py-1 rounded"
              style={{ backgroundColor: theme.disabled + "20" }}
            >
              <AppText
                size={"sm"}
                color={"subText1"}
                font="MulishRegularItalic"
                key={index}
              >
                {item}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="flex-row items-center justify-between gap-2 ml-5 mt-2">
          <AppText size="sm" color="subText2" font="MulishLightItalic">
            Chưa có.
          </AppText>

          <AppAddIcon size="sm" />
          {/* <AppButton
            style={{ borderRadius: 4 }}
            type="success"
            onPress={() => {}}
            size="xs"
          >
            <AppIcon branch="antd" name={"plus"} color="white" size={14} />
            <AppText color="white" size={"xs"}>
              Thêm
            </AppText>
          </AppButton> */}
        </View>
      )}
    </View>
  );
};

export default WordAdvanceInformation;
