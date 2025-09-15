import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CreateUploadHeader from "./components/header";
import UploadForm from "./components/uploadForm";

const CreateUploadCollection = () => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        extraScrollHeight={40}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: "white" }}
      >
        <View className="px-2">
          <CreateUploadHeader />
        </View>
        <View>
          <UploadForm />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CreateUploadCollection;
