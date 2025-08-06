import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import Information from "./information";
import {
  CreateWordInputModalProps,
  CreateWordRadioModalProps,
} from "../screen";

type Props = {
  labelWidth: number;
  onLabelLayout: (event: LayoutChangeEvent) => void;
  openInputModal: (props: CreateWordInputModalProps) => void;
  openRadioModal: (props: CreateWordRadioModalProps) => void;
};

const WordCreateBasicForm = ({
  labelWidth,
  onLabelLayout,
  openInputModal,
  openRadioModal,
}: Props) => {
  const { theme } = useTheme();

  return (
    <View>
      <AppTitle title="Định nghĩa " />
      <TouchableOpacity
        onPress={() =>
          openInputModal({ type: "prompt", title: "Định nghĩa", field: "" })
        }
        className="flex-row gap-1 mt-1"
      >
        <View className="flex-1">
          <AppText>Cái này là mô phỏng của chức năng định nghĩa</AppText>
        </View>
        <View>
          <View className="px-3 py-1.5 items-center justify-center rounded">
            <AppIcon
              name="edit"
              branch="antd"
              size={16}
              color={theme.secondary}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className="mt-6 items-center justify-center">
        <View className="h-40 w-40 border border-dashed border-gray-400 rounded-lg p-4">
          <AppText color="subText2" size={"xs"}>
            Chọn hình minh hoạ
          </AppText>
        </View>
      </View>

      <View className="mt-8 gap-1">
        <Information
          labelWidth={labelWidth}
          onLabelLayout={onLabelLayout}
          editable
          label="Loại từ"
          value=""
          onPress={() =>
            openRadioModal({
              title: "Loại từ",
              field: "",
              options: [
                { label: "Động từ", value: "1" },
                { label: "Danh từ", value: "2" },
              ],
            })
          }
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          editable
          label="Phiên âm"
          value="Phiên âm"
          onPress={() => openInputModal({ title: "Phiên âm", field: "" })}
        />
        <Information
          onLabelLayout={onLabelLayout}
          labelWidth={labelWidth}
          editable
          label="Phát âm"
          value={
            <View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  style={{ backgroundColor: theme.secondary }}
                  className=" border-gray-400 rounded-lg px-3 py-2"
                >
                  <AppText color="white" size={"xs"}>
                    Chọn file
                  </AppText>
                </TouchableOpacity>
                <View
                  style={{ borderRightWidth: 0.5, borderColor: theme.subText3 }}
                ></View>

                <TouchableOpacity
                  style={{ borderWidth: 0.5, borderColor: theme.secondary }}
                  className="rounded-lg items-center justify-center w-16 py-1"
                >
                  <AppIcon
                    name={"mic"}
                    branch="feather"
                    size={16}
                    color={theme.secondary}
                  />
                </TouchableOpacity>
              </View>

              <View className="mt-2 flex-row gap-2 items-end">
                <TouchableOpacity
                  style={{ backgroundColor: theme.primary }}
                  className=" border-gray-400 rounded-lg h-16 w-16 items-center justify-center"
                >
                  <AppIcon
                    name={"volume-2"}
                    branch="feather"
                    color="white"
                    size={32}
                  />
                </TouchableOpacity>
                <AppText
                  className="mb-1 flex-1"
                  numberOfLines={2}
                  size={"xs"}
                  color="subText2"
                >
                  Nhạc sập sình là nhạc sập sình. ấu dề
                </AppText>
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default WordCreateBasicForm;
