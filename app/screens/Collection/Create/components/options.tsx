import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import Information from "@/components/output/information";
import { useBottomSheet } from "@/providers/BottomSheet";
import useModalStore from "@/stores/modalStore";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { RadioButton } from "react-native-paper";

const CollectionCreateOptions = () => {
  const { setListModal } = useModalStore();
  const { present } = useBottomSheet();
  const [scope, setScope] = useState("Close");
  const openScopeModal = () => {
    present({
      render: () => <ScopeModal value={scope} onChange={setScope} />,
      title: "Scope",
      size: "long",
    });
  };

  return (
    <View className="mt-4">
      <AppTitle title="Options" />
      <View className="mt-4">
        <Information
          // alignItem="flex-end"
          label="Scope"
          value="Close"
          mode="create"
          icon={
            <AppIcon branch="antd" name="lock" size={12} color="subText2" />
          }
          onPress={openScopeModal}
        />
      </View>
    </View>
  );
};

export default CollectionCreateOptions;

const scope = [
  {
    title: "Close",
    detail: "Only you can modify this collection",
  },
  {
    title: "Protected",
    detail:
      "Everyone can request to modify this collection, but need your approval",
  },
  {
    title: "Open",
    detail: "Everyone can modify this collection",
  },
];
const ScopeModal = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <View className="gap-4 mt-8 px-4">
      {scope.map((item, index) => {
        return (
          <View key={index} className="gap-4">
            <TouchableOpacity onPress={() => onChange(item.title)} key={index}>
              <View className="flex-row justify-between items-center gap-4">
                <View className="flex-1">
                  <AppText font="MulishBold" size={"xl"} color="primary">
                    {item.title}
                  </AppText>
                  <View>
                    <AppText font="MulishLight" color="subText2">
                      {item.detail}
                    </AppText>
                  </View>
                </View>
                <RadioButton
                  status={item.title === value ? "checked" : "unchecked"}
                  onPress={() => onChange(item.title)}
                  value={item.title}
                />
              </View>
            </TouchableOpacity>
            {index !== scope.length - 1 && <AppDivider />}
          </View>
        );
      })}
    </View>
  );
};
