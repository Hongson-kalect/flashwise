import AppButton from "@/components/AppButton";
import AppCheckbox from "@/components/AppCheckbox";
import { AppContainer } from "@/components/AppContainer";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import EditIcon from "@/components/icons/editIcon";
import AppSearch from "@/components/input/AppSearch";
import TagItem from "@/components/TagItem";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { pickImage } from "@/utils/pickImage";
import { ImageResult } from "expo-image-manipulator";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import WordSelectForm from "../../Word/Create/components/wordSelectForm";
import WordListItem from "../../Word/List/components/listItem";
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
  const handleOpenBottomSheet = () => {
    present({
      render: () => <WordSelectForm />,
      title: "Add word",
      size: "full",
    });
  };

  const handleSelectTag = () => {
    present({
      render: () => <WordSelectForm />,
      title: "Collection tags",
      size: "full",
    });
  };

  const handleCancel = () => {
    setIsSelectingWord(false);
    setSelectedWord([]);
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
                <AppTitle title="Tags" />

                <TouchableOpacity
                  onPress={handleSelectTag}
                  className="flex-row gap-2 items-center"
                >
                  <View className="flex-row gap-2 flex-wrap p-2 flex-1">
                    {[1, 2, 3, 4].map((item, index) => (
                      <TagItem key={index}>{"item " + item}</TagItem>
                    ))}
                  </View>

                  <View className="w-8">
                    <EditIcon />
                  </View>
                </TouchableOpacity>
              </View>

              {/* <CollectionCreateOptions /> */}

              {/* Word list */}
              {/* <AppDivider style={{ marginTop: 16 }} /> */}
              <View className="mt-8">
                <View className="flex-row items-center justify-between">
                  <AppTitle title="Word list" />
                  {isSelectingWord ? (
                    <AppButton
                      onPress={() => {
                        handleOpenBottomSheet();
                      }}
                      type={"error"}
                      size="sm"
                    >
                      <AppIcon
                        branch="antd"
                        name="delete"
                        color="white"
                        size={18}
                      />
                      <AppText color="white">Delete</AppText>
                    </AppButton>
                  ) : (
                    <AppButton
                      onPress={() => {
                        handleOpenBottomSheet();
                      }}
                      type={"primary"}
                      size="sm"
                    >
                      <AppIcon
                        branch="antd"
                        name="plus"
                        color="white"
                        size={18}
                      />
                      <AppText color="white">Add</AppText>
                    </AppButton>
                  )}
                </View>

                {/* <View className="flex-row items-center h-16">
                  <View
                    style={{ backgroundColor: theme.primary + "20" }}
                    className="px-2 py-1 rounded-lg"
                  >
                    <AppText color="subText1" size={"xs"}>
                      Tag 1
                    </AppText>
                  </View>
                </View> */}
                <View className="mt-4">
                  <AppSearch />
                </View>

                <View className="flex-row items-center justify-between mt-8 ml-1 h-10">
                  {isSelectingWord ? (
                    <>
                      <TouchableOpacity className="flex-row items-center gap-2">
                        <AppCheckbox checked={false} scale={1} />

                        <AppText font="MulishMedium">200 seleted</AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ backgroundColor: theme.disabled }}
                        onPress={handleCancel}
                      >
                        <AppIcon
                          branch="antd"
                          name="close"
                          color="white"
                          size={16}
                        />
                        <AppText size={"sm"} color="white" font="MulishMedium">
                          Cancel
                        </AppText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <AppText font="MulishMedium">200 card(s)</AppText>
                      <AppText color="subText2" size={"sm"}>
                        Sắp xếp:{" "}
                        <AppText
                          size={"sm"}
                          style={{ textDecorationLine: "underline" }}
                          color="link"
                          font="MulishMediumItalic"
                        >
                          Chữ cái
                        </AppText>
                      </AppText>
                    </>
                  )}
                </View>

                <View className="mt-4 gap-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Pressable
                      key={index}
                      className="flex-row items-center gap-2"
                    >
                      {isSelectingWord && (
                        <Animated.View
                          // entering={FadeIn}
                          // exiting={FadeOut}
                          className={"absolute top-2 left-2 z-10"}
                        >
                          <AppCheckbox checked={true} scale={1.4} />
                        </Animated.View>
                      )}
                      <Animated.View
                        className={"flex-1"}
                        style={{
                          borderColor: isSelectingWord
                            ? theme.primary
                            : "transparent",
                          borderWidth: 1,
                          borderRadius: 8,
                        }}
                        layout={LinearTransition.springify().mass(0.5)}
                      >
                        <WordListItem
                          disabled={isSelectingWord}
                          onLongPress={() => setSelectedWord([1])}
                          key={index}
                        />
                      </Animated.View>
                    </Pressable>
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
