import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission denied", "We need access to your photos!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,

    quality: 1,
  });

  const image = result.assets?.[0];
  if (!image) return;

  const compress = await compressImage(image);

  if (!result.canceled) {
    return image;
  }
};
export const compressImage = async (image: ImagePicker.ImagePickerAsset) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    image.uri,
    [{ resize: { width: 720 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult;
};

export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = (await FileSystem.getInfoAsync(uri)) as {
      exists: false;
      uri: string;
      isDirectory: false;
      size: number;
    };
    return fileInfo.size || 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};
