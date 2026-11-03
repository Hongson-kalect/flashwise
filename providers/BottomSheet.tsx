import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SheetSize = "short" | "medium" | "long" | "full";

const SNAP: Record<SheetSize, `${number}%`> = {
  short: "30%",
  medium: "50%",
  long: "75%",
  full: "92%",
};

export type PresentOptions = {
  render: () => React.ReactNode;
  title?: string;
  /** true (mặc định): nội dung cuộn được. false: nội dung tự quản lý cuộn (FlatList...). */
  scrollable?: boolean;
  /** Chiều cao cố định theo % màn hình. Bỏ trống: sheet tự co theo nội dung. */
  size?: SheetSize;
  onClose?: () => void;
};

type Ctx = {
  present: (options: PresentOptions) => void;
  isPresent: boolean;
  close: () => void;
  setOnClose: Dispatch<SetStateAction<(() => void) | null>>;
};

const BottomSheetContext = createContext<Ctx>({
  present: () => {},
  isPresent: false,
  close: () => {},
  setOnClose: () => {},
});

export const useBottomSheet = () => useContext(BottomSheetContext);

/**
 * Một sheet dùng chung (không mount 4 sheet như trước): backdrop, kéo xuống để đóng,
 * nút Back Android, bàn phím đẩy sheet lên. Chuyển từ app Fastfast, giữ API present({...}).
 */
export const BottomSheetProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const { top } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [isPresent, setIsPresent] = useState(false);
  const [render, setRender] = useState<(() => React.ReactNode) | null>(null);
  const [title, setTitle] = useState("");
  const [scrollable, setScrollable] = useState(true);
  const [size, setSize] = useState<SheetSize | undefined>("medium");
  const [onClose, setOnClose] = useState<(() => void) | null>(null);
  const onCloseRef = useRef<(() => void) | null>(null);
  onCloseRef.current = onClose;

  const present = useCallback((o: PresentOptions) => {
    setRender(() => o.render);
    setTitle(o.title ?? "");
    setScrollable(o.scrollable ?? true);
    setSize(o.size ?? "medium");
    setOnClose(() => o.onClose ?? null);
    setIsPresent(true);
    // đợi state áp xong rồi mới mở để sheet có đúng snap point
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);

  const close = useCallback(() => sheetRef.current?.dismiss(), []);

  const handleDismiss = useCallback(() => {
    setIsPresent(false);
    setRender(null);
    const cb = onCloseRef.current;
    onCloseRef.current = null;
    cb?.();
  }, []);

  useEffect(() => {
    if (!isPresent) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [isPresent, close]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => (size ? [SNAP[size]] : undefined), [size]);
  const value = useMemo(
    () => ({ present, close, isPresent, setOnClose }),
    [present, close, isPresent],
  );

  const header = title ? (
    <View
      className="flex-row items-center px-5 pb-3"
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.subText3 + "66",
      }}
    >
      <AppText numberOfLines={1} className="flex-1" font="MulishBold" size="xl">
        {title}
      </AppText>
      <Pressable
        hitSlop={10}
        onPress={close}
        className="h-8 w-8 rounded-full items-center justify-center"
        style={{ backgroundColor: theme.card }}
      >
        <AppIcon branch="feather" name="x" size={18} color={theme.subText2} />
      </Pressable>
    </View>
  ) : null;

  return (
    <BottomSheetContext.Provider value={value}>
      <BottomSheetModalProvider>
        {children}
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={!snapPoints}
          maxDynamicContentSize={undefined}
          topInset={top + 24}
          enablePanDownToClose
          // nội dung có thể có danh sách/slider riêng: chỉ kéo sheet bằng tay nắm + header
          enableContentPanningGesture={false}
          backdropComponent={renderBackdrop}
          onDismiss={handleDismiss}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
          handleIndicatorStyle={{
            backgroundColor: theme.subText3,
            width: 44,
            height: 5,
          }}
        >
          {size ? (
            <View style={{ flex: 1 }}>
              {header}
              {scrollable ? (
                <BottomSheetScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {render?.()}
                </BottomSheetScrollView>
              ) : (
                <View style={{ flex: 1 }}>{render?.()}</View>
              )}
            </View>
          ) : (
            <BottomSheetView style={{ paddingBottom: 32 }}>
              {header}
              {render?.()}
            </BottomSheetView>
          )}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </BottomSheetContext.Provider>
  );
};
