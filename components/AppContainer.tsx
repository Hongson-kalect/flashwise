import { View } from "react-native";

export const AppContainer = ({ children }: { children: React.ReactNode }) => {
  return <View className="flex-1 px-3">{children}</View>;
};
