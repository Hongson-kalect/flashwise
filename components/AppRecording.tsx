import { useTheme } from "@/providers/Theme";
import useRecordingStore from "@/stores/recordingStore";
import { stopRecording } from "@/utils/audioRecord";
import { useEffect, useState } from "react";
import {
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import AppButton from "./AppButton";
import AppIcon from "./AppIcon";
import AppText from "./AppText";

const AppRecording = () => {
  const { onRecording, setOnRecording } = useRecordingStore();
  const { theme } = useTheme();
  const [recordTime, setRecordTime] = useState(0);
  const { width } = useWindowDimensions();
  const [recordInterval, setRecordInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const startInterval = () => {
    const interval = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);
    setRecordInterval(interval);
    // return interval;
  };

  const stopInterval = () => {
    recordInterval && clearInterval(recordInterval);
  };

  useEffect(() => {
    if (onRecording) startInterval();
    return () => stopInterval();
  }, [onRecording]);

  const endRecord = () => {
    setOnRecording(null);
    setRecordTime(0);
    stopInterval();
  };

  const handleFinishRecording = async () => {
    await stopRecording();
    endRecord();
  };

  const handleDismiss = () => {
    stopRecording(false);
    endRecord();
  };

  if (!onRecording) return null;
  return (
    <Animated.View
      entering={FadeIn}
      // exiting={FadeOut}
      style={{
        backgroundColor: "#00000066",
        zIndex: 1000,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      className="absolute insect-0 items-center justify-end"
    >
      <Pressable
        onPress={handleDismiss}
        className="h-full w-full items-center justify-end pb-8"
      >
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          className="items-center"
        >
          <TouchableOpacity
            disabled
            className="rounded-xl mb-14 items-center justify-center"
            style={{
              backgroundColor: theme.primary,
              height: width / 2,
              width: width / 2,
            }}
          >
            <AppIcon
              branch="fa6"
              name={"microphone"}
              color={"white"}
              size={96}
            />

            <View className="flex-row items-center gap-2">
              <AppText color="white" weight="bold" size={"xl"}>
                {recordTime}{" "}
              </AppText>
              <AppText color="white" weight="bold" size={"xl"}>
                seconds
              </AppText>
            </View>
          </TouchableOpacity>

          <View className="items-center justify-center gap-4">
            <AppButton
              onPress={handleFinishRecording}
              type="white"
              //   size=""
              style={{ paddingHorizontal: 50, paddingVertical: 10 }}
              containerStyle={{ paddingVertical: 12 }}
            >
              <AppIcon
                branch="antd"
                name={"check"}
                color={theme.success}
                size={32}
              />
              <AppText color={"success"} weight="bold" size={"xl"}>
                OK
              </AppText>
            </AppButton>

            <TouchableOpacity
              style={{
                backgroundColor: "white",
                elevation: 4,
                shadowColor: "white",
                borderWidth: 0.5,
                borderColor: theme.error,
                shadowOffset: { width: 0, height: 2 },
              }}
              onPress={() => handleDismiss()}
              className="rounded-full h-12 w-20 items-center justify-center"
            >
              <AppIcon branch="antd" name={"close"} color={"error"} size={28} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default AppRecording;
