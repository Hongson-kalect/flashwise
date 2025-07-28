import React, { memo } from "react";
import useModalStore from "@/stores/modalStore";
import { OptionsModal } from "./components/OptionModal";

export type ListModalOptions = {
  title: string;
  value: number | string;
  options: { label: string; value: number | string }[];
  onDismiss?: () => void;
  onSubmit: (val: number | string) => void;
};

const OptionsModalComponent = () => {
  const { listModal, setListModal } = useModalStore();

  const closeModal = () => {
    listModal?.onDismiss?.();
    setListModal(null);
  };

  return (
    <OptionsModal
      show={!!listModal}
      title={listModal?.title}
      value={listModal?.value?.toString() ?? ""}
      options={listModal?.options ?? []}
      onCancel={closeModal}
      onSubmit={(val) => {
        listModal?.onSubmit(val);
        setListModal(null);
      }}
    />
  );
};

export const ListModal = memo(OptionsModalComponent);
