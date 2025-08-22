import { View } from "react-native";

export const AppContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <View className={"px-3 " + className}>{children}</View>;
};
