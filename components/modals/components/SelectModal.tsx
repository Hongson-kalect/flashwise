import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import {
  BasicModalOptions,
  CheckboxModalOptions,
  RadioModalOptions,
  SelectOption,
  SelectValue,
} from "@/providers/Modal";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import ModalButton from "../ModalButton";

/** Một dòng lựa chọn, dùng chung cho radio và checkbox. */
const OptionRow = ({
  option,
  selected,
  shape,
  onPress,
}: {
  option: SelectOption;
  selected: boolean;
  shape: "radio" | "checkbox";
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const isRadio = shape === "radio";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="min-h-14 flex-row items-center gap-3 rounded-2xl px-4 py-3"
      style={{ backgroundColor: selected ? theme.tertiary + "66" : "transparent" }}
    >
      {option.icon}
      <View className="flex-1">
        <AppText
          font={selected ? "MulishBold" : "MulishMedium"}
          color={selected ? "primary" : "text"}
          numberOfLines={2}
        >
          {option.label}
        </AppText>
        {option.description && (
          <AppText size="xs" color="subText2" className="mt-0.5">
            {option.description}
          </AppText>
        )}
      </View>

      {/* Chỉ báo: dấu tick cho radio, ô vuông bo góc cho checkbox */}
      {isRadio ? (
        selected && <AppIcon branch="feather" name="check" size={18} color={theme.primary} />
      ) : (
        <View
          className="h-5 w-5 items-center justify-center rounded-md"
          style={{
            borderWidth: selected ? 0 : 1.5,
            borderColor: theme.subText3,
            backgroundColor: selected ? theme.primary : "transparent",
          }}
        >
          {selected && <AppIcon branch="feather" name="check" size={13} color="white" />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const Header = ({ title, message }: { title?: string; message?: string }) => (
  <>
    {title && (
      <AppText className="px-1" font="MulishBold" size="xl" color="title">
        {title}
      </AppText>
    )}
    {message && (
      <AppText className="mt-1 px-1" color="subText1">
        {message}
      </AppText>
    )}
  </>
);

/** Chọn một: bấm là chọn và đóng luôn. */
export const RadioModal = (modal: RadioModalOptions & BasicModalOptions) => {
  const closeCurrentModal = useModalStore((state) => state.closeCurrentModal);

  const select = (value: SelectValue) => {
    if (value !== modal.value) modal.onSelect(value);
    closeCurrentModal();
  };

  return (
    <View>
      <Header title={modal.title} message={modal.message} />
      <ScrollView className="mt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
        {modal.options.map((option) => (
          <OptionRow
            key={String(option.value)}
            option={option}
            shape="radio"
            selected={option.value === modal.value}
            onPress={() => select(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

/** Chọn nhiều: đánh dấu xong bấm nút xác nhận; `min` / `max` giới hạn số lựa chọn. */
export const CheckboxModal = (modal: CheckboxModalOptions & BasicModalOptions) => {
  const closeCurrentModal = useModalStore((state) => state.closeCurrentModal);
  const [values, setValues] = useState<SelectValue[]>(modal.values ?? []);

  // Provider giữ nguyên instance giữa các modal cùng loại → nạp lại khi mở modal mới
  useEffect(() => {
    setValues(modal.values ?? []);
  }, [modal.values, modal.options]);

  const min = modal.min ?? 0;
  const max = modal.max ?? Infinity;
  const canConfirm = values.length >= min;

  // Đã đủ `max` thì không đánh dấu thêm, phải bỏ bớt trước
  const toggle = (value: SelectValue) =>
    setValues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : current.length >= max ? current : [...current, value],
    );

  const cancel = () => {
    modal.onCancel?.();
    closeCurrentModal();
  };

  const confirm = () => {
    if (!canConfirm) return;
    modal.onConfirm(values);
    closeCurrentModal();
  };

  return (
    <View>
      <Header title={modal.title} message={modal.message} />
      {max !== Infinity && (
        <AppText size="xs" color="subText2" className="mt-1 px-1">
          Đã chọn {values.length}/{max}
        </AppText>
      )}
      <ScrollView className="mt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
        {modal.options.map((option) => (
          <OptionRow
            key={String(option.value)}
            option={option}
            shape="checkbox"
            selected={values.includes(option.value)}
            onPress={() => toggle(option.value)}
          />
        ))}
      </ScrollView>

      <View className="flex-row gap-3 mt-5">
        <ModalButton variant="ghost" label={modal.cancelText || "Huỷ"} onPress={cancel} />
        <ModalButton label={modal.okText || "OK"} onPress={confirm} disabled={!canConfirm} />
      </View>
    </View>
  );
};
