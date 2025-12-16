import { BasicModalOptions, CustomModalOptions } from "@/providers/Modal";

type Props = CustomModalOptions & BasicModalOptions;

const CustomModal = (modal: Props) => {
  return modal.render;
};

export default CustomModal;
