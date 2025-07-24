import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageKey = {
  userLang: "userLang",
  targetLang: "targetLang",
  studyMode: "studyMode",
  learningGoal: "learningGoal",
  theme: "theme",
  lastSession: "lastSession",
  streak: "streak",
  seenTutorial: "seenTutorial",
  appVersion: "appVersion",
  setting: "setting",
};

export const getStorage = async <T>(key: string): Promise<T | null> => {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const setStorage = async <T>(key: string, value: T): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};
