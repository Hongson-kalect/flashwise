import AlertModal from "@/components/modals/components/AlertModal";
import ConfirmModal from "@/components/modals/components/ConfirmModal";
import CustomModal from "@/components/modals/components/CustomModal";
import InputModal from "@/components/modals/components/InputModal";
import MenuModal from "@/components/modals/components/MenuModal";
import PromptModal from "@/components/modals/components/PromptModal";
import {
  CheckboxModal,
  RadioModal,
} from "@/components/modals/components/SelectModal";
import TabsModal from "@/components/modals/components/TabModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import useModalStore from "@/stores/modalStore";
import { toast } from "@/utils/toast";
import React, { memo, useEffect, useState } from "react";
import { View } from "react-native";
import { useShallow } from "zustand/react/shallow";

export type AlertModalOptions = {
  type: "alert";
  title?: string;
  message?: string;
  subMessage?: string;
  okText?: string;
  onOk?: () => void | Promise<void>;
  onClose?: () => void;
};
export type ConfirmModalOptions = {
  type: "confirm";
  title?: string;
  message?: string;
  subMessage?: string;
  okText?: string;
  cancelText?: string;
  /** Hành động phá huỷ (xoá, thu hồi, thoát mất dữ liệu): nút đồng ý màu đỏ. */
  destructive?: boolean;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
};
export type InputModalOptions = {
  type: "input";
  defaultValue?: string;
  placeholder?: string;
  isShowCancelButton?: boolean;
  textInnerHeader?: React.ReactNode;
  textOuterHeader?: React.ReactNode;
  textInnerFooter?: React.ReactNode;
  textOuterFooter?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
};

export type PromptModalOptions = {
  type: "prompt";
  defaultValue?: string;
  placeholder?: string;
  isShowCancelButton?: boolean;
  textInnerHeader?: React.ReactNode;
  textOuterHeader?: React.ReactNode;
  textInnerFooter?: React.ReactNode;
  textOuterFooter?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: (value: string) => void | Promise<void>;
  onCancel?: () => void;
};

export type MenuOption = {
  key?: string;
  icon?: React.ReactNode;
  label: string;
  rightContent?: React.ReactNode;
  value?: string | number;
  isCloseAfterPress?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /** Hành động phá huỷ (xoá...): hiện tông đỏ nhạt. */
  destructive?: boolean;
  color?: string;
  backgroundColor?: string;
};

export type MenuModalOptions = {
  type: "menu";
  menuOptions: MenuOption[];
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
};

export type TabsModalOptions = {
  type: "tabs";
  tabs: React.ReactNode[];
  okText?: string;
  cancelText?: string;
  isShowCancelButton?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
};

export type SelectValue = string | number;

export type SelectOption = {
  label: string;
  value: SelectValue;
  description?: string;
  icon?: React.ReactNode;
};

/** Chọn một: bấm vào lựa chọn là gọi onSelect (khi đổi giá trị) và đóng modal. */
export type RadioModalOptions = {
  type: "radio";
  options: SelectOption[];
  value?: SelectValue;
  onSelect: (value: SelectValue) => void | Promise<void>;
};

/** Chọn nhiều: đánh dấu rồi bấm OK để gọi onConfirm. */
export type CheckboxModalOptions = {
  type: "checkbox";
  options: SelectOption[];
  values?: SelectValue[];
  // Số lựa chọn tối thiểu để bật nút OK / tối đa được đánh dấu
  min?: number;
  max?: number;
  okText?: string;
  cancelText?: string;
  onConfirm: (values: SelectValue[]) => void;
  onCancel?: () => void;
};

export type CustomModalOptions = {
  type: "custom";
};

export type BasicModalOptions = {
  title?: string;
  message?: string;
  subMessage?: string;
  modalTitle?: string;
  render?: React.ReactNode;
  onDismiss?: () => void; // lúc đóng modal
  /** false: backdrop / nút back không đóng được (phải bấm nút trong modal). */
  closable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  middle?: React.ReactNode;
  inAnimation?:
    | "fadeIn"
    | "slideInDown"
    | "slideInUp"
    | "slideInUp"
    | "zoomIn"
    | "zoomInDown";
  outAnimation?:
    | "fadeOut"
    | "slideOutDown"
    | "slideOutUp"
    | "zoomOut"
    | "zoomOutDown";
};
export type GlobalModalOptions = BasicModalOptions &
  (
    | AlertModalOptions
    | ConfirmModalOptions
    | InputModalOptions
    | PromptModalOptions
    | MenuModalOptions
    | CustomModalOptions
    | TabsModalOptions
    | RadioModalOptions
    | CheckboxModalOptions
  );

const GlobalModalComponent = () => {
  const { currentModal, closeCurrentModal } = useModalStore(
    useShallow((state) => ({
      currentModal: state.currentModal,
      closeCurrentModal: state.closeCurrentModal,
    })),
  );

  // Khi đóng, currentModal thành null ngay nên nội dung biến mất trước khi animation out chạy xong:
  // giữ bản trước đó để vẽ nốt animation.
  const [placeholder, setPlaceholder] = useState<GlobalModalOptions | null>(currentModal);
  useEffect(() => {
    if (currentModal) setPlaceholder(currentModal);
  }, [currentModal]);

  const showValue = currentModal ?? placeholder;

  const closeModal = () => {
    if (!currentModal) return;
    if (currentModal.closable === false) {
      return toast.warning("Hãy chọn một nút trong hộp thoại để tiếp tục.");
    }
    currentModal.onDismiss?.();
    closeCurrentModal();
  };

  return (
    <ModalWrapper
      title={showValue?.modalTitle}
      show={!!currentModal}
      onCancel={closeModal}
      inAnimation={showValue?.inAnimation}
      outAnimation={showValue?.outAnimation}
      type={showValue?.type}
    >
      <View className="px-3 rounded-lg">
        {showValue?.header}
        {showValue && <RenderContent modal={showValue} />}
        {showValue?.footer}
      </View>
    </ModalWrapper>
  );
};

const RenderContent = ({ modal }: { modal: GlobalModalOptions }) => {
  switch (modal.type) {
    case "alert":
      return <AlertModal {...modal} />;
    case "confirm":
      return <ConfirmModal {...modal} />;
    case "menu":
      return <MenuModal {...modal} />;
    case "input":
      return <InputModal {...modal} />;
    case "prompt":
      return <PromptModal {...modal} />;
    case "tabs":
      return <TabsModal {...modal} />;
    case "custom":
      return <CustomModal {...modal} />;
    case "radio":
      return <RadioModal {...modal} />;
    case "checkbox":
      return <CheckboxModal {...modal} />;
    default:
      return null;
  }
};

export const GlobalModal = memo(GlobalModalComponent);

export default GlobalModal;
