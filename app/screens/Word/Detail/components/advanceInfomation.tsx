import AppIcon from "@/components/AppIcon";
import { useWordLangs, useWordRouteParams } from "../wordLang";
import AppText from "@/components/AppText";
import {
  bottomSheetTitle,
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "@/interfaces/word";
import { useTheme } from "@/providers/Theme";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import { ItemKind, useAddItems } from "../addItems";
import { useWordForms } from "../formsContext";
import { useWordExists } from "../useWordExists";

import type { WordChecks } from "@/services/api/words";
import { formPos, formTagLabel } from "@/utils/formTags";
import SectionHeader from "./sectionHeader";

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
  const { lang } = useWordLangs();
  // Một lần hỏi cho cả ba danh sách: từ nào đã có ở server, từ nào chưa
  const exists = useWordExists([...(relateds ?? []), ...(synonyms ?? []), ...(antonyms ?? [])], lang);
  return (
    <View className="gap-5">
      <SectionHeader
        icon={<AppIcon branch="fa6" name="compass" size={14} color="title" />}
        title="Discover"
      />

      <Related
        icon={
          <FontAwesome
            name="link"
            size={14}
            style={{ color: theme.subText2 }}
          />
        }
        kind="relateds"
        title="Từ liên quan"
        values={relateds || []}
        exists={exists}
      />
      <Related
        icon={
          <Ionicons
            name="copy"
            size={14}
            style={{ color: theme.subText2 }}
          />
        }
        kind="synonyms"
        title="Từ đồng nghĩa"
        values={synonyms || []}
        exists={exists}
      />
      <Related
        icon={
          <MaterialIcons
            name="swap-horizontal-circle"
            size={14}
            style={{ color: theme.subText2 }}
          />
        }
        kind="antonyms"
        title="Từ trái nghĩa"
        values={antonyms || []}
        exists={exists}
      />
      <FormsSection />
      <Related
        icon={
          <AppIcon
            branch="fa6"
            name={"tag"}
            size={14}
            color="subText2"
          />
        }
        kind="tags"
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

/**
 * Biến thể (số nhiều, thì, so sánh...) của loại từ đang xem. Dữ liệu từ bảng dạng của server (sinh bằng thư viện biến cách),
 * người dùng không thêm tay. Mỗi dạng kèm tên dạng; ẩn cả mục khi từ không có dạng nào (vd tiếng Trung, thành ngữ).
 */
const FormsSection = () => {
  const { theme } = useTheme();
  const { sense } = useAddItems();
  const data = useWordForms();
  const pos = formPos(sense?.pos);
  const rows = (data?.forms ?? []).filter((r) => !pos || r.pos === pos || !r.pos);
  const merged = new Map<string, { tags: string[]; irregular: boolean }>();
  for (const r of rows) {
    const m = merged.get(r.form) ?? { tags: [], irregular: false };
    const label = formTagLabel(r.tag);
    if (!m.tags.includes(label)) m.tags.push(label);
    m.irregular = m.irregular || r.irregular;
    merged.set(r.form, m);
  }
  if (!merged.size) return null;
  return (
    <View>
      <SectionHeader
        level="sub"
        icon={<AppIcon branch="fa6" name={"code-branch"} size={14} color="subText2" />}
        title="Biến thể"
      />
      <View className="flex-row items-center gap-2 flex-wrap">
        {[...merged].map(([form, m]) => (
          <TouchableOpacity
            key={form}
            onPress={() => router.push({ pathname: "/screens/Word/Detail/[value]", params: { value: form } })}
            className="px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          >
            <AppText size="sm" color="subText1" font="MulishRegularItalic">
              {form}
              <AppText size="xs" color="subText3">
                {"  "}
                {m.tags.join(" / ")}
                {m.irregular ? " · bất quy tắc" : ""}
              </AppText>
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

type RelatedProp = {
  kind: ItemKind;
  /** Kết quả kiểm tra từ có ở server (khoá chữ thường); thiếu khoá = coi như đã có. */
  exists?: WordChecks;
  title: string;
  icon?: React.ReactNode;
  values: string[];
};
const Related = (props: RelatedProp) => {
  const { theme } = useTheme();
  const { open, canAdd, sense } = useAddItems();
  const routeLangs = useWordRouteParams();
  const add = canAdd ? () => open(props.kind) : undefined;
  return (
    <View>
      <SectionHeader
        level="sub"
        icon={props.icon || <AppIcon branch="antd" name={"star"} size={14} color="subText2" />}
        title={props.title}
        onAdd={add}
      />
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
        <View className="flex-row items-center gap-2 flex-wrap">
          {props.values.map((item, index) => {
            // Từ chưa có ở server (chạm vào mới tạo): chỉ mờ đi một chút. Bị từ chối: gạch ngang, màu lỗi
            const status = props.exists?.[item.trim().toLowerCase()]?.status;
            const pending = status === "unknown";
            const bad = status === "rejected" || status === "invalid";
            return (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: `/screens/Word/Detail/[value]`,
                    // from / kind: nếu từ này bị từ chối khi mở thì trang từ gỡ nó khỏi danh sách nguồn
                    params: { value: item, valueId: item, ...routeLangs, ...(sense?.id ? { from: sense.id, kind: props.kind } : {}) },
                  });
                }}
                key={item}
                className="px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: bad ? theme.error + "14" : theme.card,
                  borderWidth: 1,
                  borderColor: bad ? theme.error + "33" : theme.border,
                  opacity: pending ? 0.55 : 1,
                }}
              >
                <AppText
                  size={"sm"}
                  color={bad ? "error" : "subText1"}
                  font="MulishRegularItalic"
                  numberOfLines={1}
                  style={[{ paddingRight: 2 }, bad ? { textDecorationLine: "line-through" } : null]}
                >
                  {item}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <AppText size="sm" color="subText3" font="MulishRegularItalic">
          Chưa có.
        </AppText>
      )}
    </View>
  );
};

export default WordAdvanceInformation;
