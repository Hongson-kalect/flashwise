// components/BottomSheetProvider.tsx
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AntDesign } from "@expo/vector-icons";
import {
  BackHandler,
  Pressable,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import AppText from "@/components/AppText";

const BottomSheetContext = createContext<{
  present: (
    render: () => React.ReactNode,
    title: string,
    onClose?: () => void
  ) => void;
  isPresent: boolean;
  close: () => void;
  setOnClose: Dispatch<SetStateAction<(() => void) | null>>;
}>({
  present: () => {},
  isPresent: false,
  close: () => {},
  setOnClose: () => {},
});

export const useBottomSheet = () => useContext(BottomSheetContext);
export const BottomSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const contentRef = useRef<() => React.ReactNode>(() => null);
  const isOpen = useRef(false);
  const [version, setVersion] = useState(0);
  const [isPresent, setIsPresent] = useState(false);
  const [title, setTitle] = useState("");
  const [onClose, setOnClose] = useState<(() => void) | null>(null);

  const present = useCallback(
    (render: () => React.ReactNode, title?: string, onClose?: () => void) => {
      isOpen.current = true;
      setIsPresent(true);
      contentRef.current = render;
      bottomSheetRef.current?.present();
      setVersion((v) => v + 1);
      setTitle(title || "");

      setOnClose(() => onClose || null);
    },
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      backAction();
    }
  }, []);

  const close = useCallback(() => {
    isOpen.current = false;
    setIsPresent(false);
    setVersion((v) => v + 1);
    bottomSheetRef.current?.dismiss();
  }, []);

  const backAction = () => {
    if (bottomSheetRef.current?.dismiss) {
      if (isOpen.current) {
        if (onClose) onClose();
        else {
          close();
        }
        return true;
      }
      return false;
    }
  };

  const backHandler = useRef<any>(null);
  useEffect(() => {
    if (isPresent) {
      backHandler.current = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => {
        backHandler.current?.remove();
      };
    }
  }, [isPresent]);

  // console.log("isPresent", isPresent, backHandler);

  const { width, height } = useWindowDimensions();

  return (
    <BottomSheetContext.Provider
      value={{ present, close, isPresent, setOnClose }}
    >
      <BottomSheetModalProvider>
        {children}
        {isOpen.current && (
          <Pressable
            onPress={backAction}
            style={{ width, height, opacity: 0.5 }}
            className="bg-black absolute top-0 left-0"
          ></Pressable>
        )}

        <BottomSheetModal
          enableContentPanningGesture={false}
          ref={bottomSheetRef}
          snapPoints={["70%"]}
          enableDynamicSizing={false}
          onChange={handleSheetChanges}
          onDismiss={() => (contentRef.current = () => null)}
        >
          <BottomSheetView>
            <TouchableOpacity
              onPress={backAction}
              style={{ right: 16, top: 0 }}
              className=" absolute"
            >
              <AntDesign name="closecircle" size={24} color="#aaa" />
            </TouchableOpacity>
            {title && (
              <>
                <View className="items-center flex-row px-4 mb-2">
                  <AppText
                    style={{ fontFamily: "PlaypenSans-Semibold" }}
                    className="text-xl"
                  >
                    {title}
                  </AppText>
                  <TouchableOpacity
                    onPress={backAction}
                    style={{ right: 16, top: 0 }}
                    className=" absolute"
                  >
                    <AntDesign name="closecircle" size={24} color="#aaa" />
                  </TouchableOpacity>
                </View>
                <Divider />
              </>
            )}
            <View style={{ height: "100%", width: "100%" }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  padding: 16,
                  flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
              >
                {contentRef.current?.()}
                <View style={{ height: 80 }}></View>
              </ScrollView>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </BottomSheetContext.Provider>
  );
};
