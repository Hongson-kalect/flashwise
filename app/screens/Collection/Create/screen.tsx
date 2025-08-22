import AppButton from "@/components/AppButton";
import { AppContainer } from "@/components/AppContainer";
import { AppDivider } from "@/components/AppDivider";
import AppIcon from "@/components/AppIcon";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import AppSearch from "@/components/input/AppSearch";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import WordSelectForm from "../../Word/Create/components/wordSelectForm";
import WordItem from "../components/wordItem";
import CreateCollectionHeader from "./components/header";

const CreateCollection = () => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();

  const handleOpenBottomSheet = () => {
    present({
      render: () => <WordSelectForm />,
      title: "Add word",
      size: "full",
    });
  };
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="h-full" style={{ backgroundColor: theme.background }}>
        <View className="px-2">
          <CreateCollectionHeader />
        </View>
        <Divider style={{ marginTop: 8 }} />

        <View className="flex-1">
          <ScrollView>
            <AppContainer className="gap-4 mt-8">
              <AppInput label="Name" />
              <AppInput
                inputStyle={{ height: 100 }}
                label="Description"
                multiline
                numberOfLines={4}
              />
              <View>
                <AppText
                  weight="bold"
                  size={"md"}
                  color="subText2"
                  className="mb-1"
                >
                  Tags
                </AppText>
                <View className="flex-row gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((item, index) => (
                    <View className="px-2 py-1 rounded bg-gray-200" key={item}>
                      <AppText size={"xs"} color="subText2">
                        {item}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Word list */}
              <AppDivider style={{ marginTop: 16 }} />
              <View>
                <View className="flex-row items-center justify-between">
                  <AppTitle title="Word list" />
                  <AppButton
                    onPress={() => {
                      handleOpenBottomSheet();
                    }}
                    type={"primary"}
                  >
                    <AppIcon branch="feather" name="plus" color="white" />
                    <AppText color="white">Add</AppText>
                  </AppButton>
                </View>
                <View className="mt-4">
                  <AppSearch />
                </View>

                <View className="flex-row items-center justify-between mt-4">
                  <AppText>Total: 0</AppText>
                  <View className="flex-row gap-2 items-center">
                    <AppText color="subText2" weight="600">
                      Sắp xếp:
                    </AppText>
                    <AppText color="primary">Thời gian thêm</AppText>
                  </View>
                </View>
                <View className="mt-4 gap-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <WordItem key={index} />
                  ))}
                </View>
              </View>
            </AppContainer>
            <View className="h-10"></View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateCollection;
