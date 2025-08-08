// components/BottomSheetProvider.tsx
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  createContext,
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppText from "@/components/AppText";
import { AntDesign } from "@expo/vector-icons";
import {
  BackHandler,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";

type SheetSize = "short" | "medium" | "long" | "full";

const BottomSheetContext = createContext<{
  present: (options: {
    render: () => React.ReactNode;
    title: string;
    scrollable?: boolean;
    size?: "short" | "medium" | "long" | "full";
    onClose?: () => void;
  }) => void;
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
  const [activeSheet, setActiveSheet] = useState<
    "short" | "medium" | "long" | "full" | null
  >(null);

  const shortSheetRef = useRef<BottomSheetModal>(null);
  const mediumSheetRef = useRef<BottomSheetModal>(null);
  const longSheetRef = useRef<BottomSheetModal>(null);
  const fullSheetRef = useRef<BottomSheetModal>(null);

  const sheetMap = useMemo<{
    [key in SheetSize]: {
      ref: React.RefObject<BottomSheetModal | null>;
      snapPoint: `${number}%`;
    };
  }>(() => {
    return {
      short: {
        ref: shortSheetRef,
        snapPoint: "30%",
      },
      medium: {
        ref: mediumSheetRef,
        snapPoint: "50%",
      },
      long: {
        ref: longSheetRef,
        snapPoint: "75%",
      },
      full: {
        ref: fullSheetRef,
        snapPoint: "90%",
      },
    };
  }, []);

  const contentRef = useRef<() => React.ReactNode>(() => null);
  const isOpen = useRef(false);
  const [isPresent, setIsPresent] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const [title, setTitle] = useState("");
  const [onClose, setOnClose] = useState<(() => void) | null>(null);

  const present = useCallback(
    ({
      render,
      onClose,
      scrollable,
      size,
      title,
    }: {
      render: () => React.ReactNode;
      title?: string;
      scrollable?: boolean;
      size?: "short" | "medium" | "long" | "full";
      onClose?: () => void;
    }) => {
      isOpen.current = true;
      setIsPresent(true);
      contentRef.current = render;
      setActiveSheet(size || "medium");
      setTitle(title || "");
      setScrollable(scrollable || false);
      setOnClose(() => onClose || null);
      sheetMap[size || "medium"].ref.current?.present();
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
    sheetMap[activeSheet || "medium"].ref.current?.dismiss();
  }, [activeSheet]);

  const backAction = () => {
    if (sheetMap[activeSheet || "medium"].ref.current?.dismiss) {
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
      {children}
      <BottomSheetModalProvider>
        {isOpen.current && (
          <Pressable
            onPress={backAction}
            style={{ width, height, opacity: 0.5 }}
            className="bg-black absolute top-0 left-0"
          ></Pressable>
        )}
        {Object.entries(sheetMap).map(([key, { ref, snapPoint }], index) => (
          <BottomSheetInstance
            key={key}
            ref={ref}
            content={contentRef.current}
            scrollable={scrollable}
            title={title}
            backAction={backAction}
            onSheetChanges={handleSheetChanges}
            snappoints={snapPoint}
          />
        ))}
      </BottomSheetModalProvider>
    </BottomSheetContext.Provider>
  );
};

type BottomSheetProps = {
  snappoints: number | `${number}%`;
  backAction?: () => void;
  scrollable?: boolean;
  content: () => React.ReactNode;
  onSheetChanges?: (index: number) => void;
  title: string;
};

const BottomSheetInstance = forwardRef<BottomSheetModal, BottomSheetProps>(
  (
    {
      title,
      content,
      onSheetChanges,
      backAction = () => {},
      snappoints,
      scrollable,
    }: BottomSheetProps,
    ref
  ) => {
    const { height } = useWindowDimensions();
    const contentHeight =
      typeof snappoints === "number"
        ? snappoints
        : (height * Number(snappoints.replace("%", ""))) / 100;

    return (
      <BottomSheetModal
        enableContentPanningGesture={false}
        ref={ref}
        snapPoints={[snappoints || "70%"]}
        enableDynamicSizing={false}
        onChange={onSheetChanges}
        onDismiss={() => (content = () => null)}
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
                <AppText weight="bold" size={"2xl"}>
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
          <View style={{ height: contentHeight, width: "100%" }}>
            {scrollable ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {content?.()}
                <View style={{ height: 80 }}></View>
              </ScrollView>
            ) : (
              content?.()
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheetInstance.displayName = "BottomSheetInstance";
