// components/CustomBottomNav.tsx
import { useTheme } from "@/providers/Theme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ReactElement } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { Divider } from "react-native-paper";
import AppButton from "./AppButton";

const Tab = createBottomTabNavigator();

type Props = {
  header?: ReactElement;
  tabs: {
    label: string;
    icon?: ReactElement;
    activeIcon?: ReactElement;
    key: string;
    element: Function;
  }[];
};
export function AppTopNav({ tabs, header }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        // paddingHorizontal: 8,
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarPosition: "top",
          animation: "shift",
          tabBarVisibilityAnimationConfig: {
            hide: {
              animation: "timing",
              config: {
                duration: 200,
              },
            },
          },
          tabBarAccessibilityLabel: "Tab navigation",
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => <CustomNavBar header={header} {...props} />}
      >
        {tabs.map((tab) => (
          <Tab.Screen
            key={tab.key}
            name={tab.key}
            component={tab.element}
            options={{
              tabBarLabel: tab.label,
              tabBarIcon: tab.icon,
              activeTabBarIcon: tab.activeIcon,
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}

const CustomNavBar = ({ header, state, descriptors, navigation }) => {
  const { theme } = useTheme();
  return (
    <View>
      {header}
      <View style={{ paddingTop: 0 }} className="p-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // className="px-2"
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;
            const icon = options.tabBarIcon as ReactElement;
            const activeIcon = options.activeTabBarIcon as ReactElement;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <AppButton
                key={route.key}
                style={{ marginRight: 8, borderRadius: 8 }}
                onPress={onPress}
                type={isFocused ? "primary" : "disabled"}
                // outline={!isFocused}
                title={label}
                size="sm"
              />
            );
          })}
        </ScrollView>
      </View>
      <Divider />
    </View>
  );
};
