import AppText from "@/components/AppText";
import AlertModal from "@/components/modals/components/AlertModal";
import ConfirmModal from "@/components/modals/components/ConfirmModal";
import InputModal from "@/components/modals/components/InputModal";
import MenuModal from "@/components/modals/components/MenuModal";
import PromptModal from "@/components/modals/components/PromptModal";
import TabsModal from "@/components/modals/components/TabModal";
import ModalWrapper from "@/components/modals/ModalWrapper";
import { useDebounce } from "@/hooks/useDebouce";
import useModalStore from "@/stores/modalStore";
import React, { memo, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

export type AlertModalOptions = {
  type: "alert";
  title?: string;
  message?: string;
  subMessage?: string;
  okText?: string;
  onOk?: () => void;
  onClose?: () => void;
};
export type ConfirmModalOptions = {
  type: "confirm";
  title?: string;
  message?: string;
  subMessage?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
};
export type InputModalOptions = {
  type: "input";
  title?: string;

  defaultValue?: string;
  placeholder?: string;
  isShowCancelButton?: boolean;
  textInnerHeader?: React.ReactNode;
  textOuterHeader?: React.ReactNode;
  textInnerFooter?: React.ReactNode;
  textOuterFooter?: React.ReactNode;
  message?: string;
  subMessage?: string;
  okText?: string;
  cancelText?: string;
  onOk?: (value: string) => void;
  onCancel?: () => void;
};

export type PromptModalOptions = {
  type: "prompt";
  title?: string;

  defaultValue?: string;
  placeholder?: string;
  isShowCancelButton?: boolean;
  textInnerHeader?: React.ReactNode;
  textOuterHeader?: React.ReactNode;
  textInnerFooter?: React.ReactNode;
  textOuterFooter?: React.ReactNode;
  message?: string;
  subMessage?: string;
  okText?: string;
  cancelText?: string;
  onOk?: (value: string) => void;
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
  color?: string;
  backgroundColor?: string;
};

export type MenuModalOptions = {
  type: "menu";
  title?: string;
  message?: string;
  subMessage?: string;
  menuOptions: MenuOption[];
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
};

export type TabsModalOptions = {
  type: "tabs";
  title?: string;
  message?: string;
  subMessage?: string;
  tabs: React.ReactNode[];
  okText?: string;
  cancelText?: string;
  isShowCancelButton?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
};

export type CustomModalOptions = {
  type: "custom";
};

export type BasicModalOptions = {
  modalTitle?: string;
  render?: React.ReactNode;
  onDismiss?: () => void; // lúc đóng modal
  header?: React.ReactNode;
  footer?: React.ReactNode;
  middle?: React.ReactNode;
  inAnimation?: "fadeIn" | "slideInDown" | "zoomIn" | "zoomInDown";
  outAnimation?: "fadeOut" | "slideOutDown" | "zoomOut" | "zoomOutDown";
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
  );

export type ListModalOptions = {
  title: string;
  value: number | string;
  type?: "checkbox" | "radio";
  options: { label: string; value: number | string }[];
  onDismiss?: () => void;
  onSubmit: (val: number | string) => void;
};

const GlobalModalComponent = () => {
  const { globalModal, setGlobalModal } = useModalStore();

  // Modal sẽ ẩn khi props = null => Dữ liệu bị mất ngay lập tức
  // Animation out sẽ thực hiện với màn trắng => dùng cái này để cache dữ liệu trước đó
  const [placeholder, setPlaceholder] = useState(globalModal);
  useEffect(() => {
    globalModal && setPlaceholder(globalModal);
  }, [globalModal]);

  const showValue = useMemo(
    () => (globalModal ? globalModal : placeholder),
    [placeholder, globalModal]
  );

  const outAnimation = useDebounce(globalModal?.outAnimation, 200); // when close all modal will be null, include outAnimation, so keep this to close it correctly

  const closeModal = () => {
    globalModal?.onDismiss?.();
    setGlobalModal(null);
  };

  const RenderContent = ({ modal }: { modal: typeof globalModal }) => {
    if (!modal) return null;

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
        return (
          modal.render || (
            <View>
              <AppText>{'Add "render" props to custom your modal'}</AppText>
            </View>
          )
        );
    }
  };

  return (
    <ModalWrapper
      title={globalModal?.modalTitle}
      show={!!globalModal}
      onCancel={closeModal}
      inAnimation={globalModal?.inAnimation}
      outAnimation={outAnimation}
      type={globalModal?.type}
    >
      <View className="px-3 rounded-lg">
        {globalModal?.header}
        <RenderContent modal={showValue} />
        {globalModal?.footer}
      </View>
    </ModalWrapper>
  );
};

export const GlobalModal = memo(GlobalModalComponent);
