import { AppContainer } from "@/components/AppContainer";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { pickImage } from "@/utils/pickImage";
import { ImageResult } from "expo-image-manipulator";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import CollectionTags from "../components/tags";
import CollectionWordList from "../components/wordList";
import CreateCollectionHeader from "./components/header";

const CreateCollection = () => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();
  const [collectionInfo, setCollectionInfo] = useState({
    name: "",
    tags: [],
  });
  const [words, setWords] = useState([]);
  const [image, setImage] = useState<ImageResult | null>(null);
  const [nameFocus, setNameFocus] = useState(false);
  const [isSelectingWord, setIsSelectingWord] = useState(false);
  const [selectedWord, setSelectedWord] = useState<number[]>([]);
  useEffect(() => {
    if (selectedWord.length > 0 && !isSelectingWord) {
      setIsSelectingWord(true);
    }

    if (selectedWord.length === 0 && isSelectingWord) {
      setIsSelectingWord(false);
    }
  }, [selectedWord]);

  const handlePickImage = async () => {
    const result = (await pickImage()) as ImageResult;
    if (result) {
      setImage(result);
    }
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
            <AppContainer className="mt-4">
              <View>
                <View className="mt-6 items-center justify-center">
                  {image?.uri ? (
                    <TouchableOpacity
                      onPress={handlePickImage}
                      style={{
                        elevation: 4,
                        overflow: "hidden",
                        backgroundColor: theme.background,
                      }}
                      className="h-40 w-40  rounded-lg"
                    >
                      <Image
                        source={{ uri: image?.uri }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handlePickImage}
                      style={{
                        borderColor: theme.secondary,
                        backgroundColor: theme.secondary + "10",
                      }}
                      className="h-40 w-60 border border-dashed  rounded-lg p-4"
                    >
                      <AppText color="subText2" size={"xs"}>
                        Hình minh họa
                      </AppText>
                    </TouchableOpacity>
                    //  </TouchableOpacity>
                  )}
                </View>
              </View>
              <TextInput
                value={collectionInfo.name}
                multiline
                // submitBehavior="done"
                returnKeyType="done"
                placeholder="Collection Name"
                onChangeText={(name) =>
                  setCollectionInfo(() => ({
                    ...collectionInfo,
                    name,
                  }))
                }
                style={{
                  fontSize: 32,
                  fontFamily: "MulishBold",
                  color: theme.primary,
                  textAlign: "center",
                  borderBottomWidth: 2,
                  borderColor: nameFocus ? theme.primary : "transparent",
                }}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                placeholderTextColor={"#C4C4C4"}
              />

              <View className="mt-4">
                <CollectionTags />
              </View>

              {/* <CollectionCreateOptions /> */}

              {/* Word list */}
              {/* <AppDivider style={{ marginTop: 16 }} /> */}
              <View className="mt-8">
                <CollectionWordList />
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
