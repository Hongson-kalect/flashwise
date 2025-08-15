export type CreateWordInputModalProps = {
  title: string;
  field: string;
  type?: "prompt" | "input";
};

export type CreateWordRadioModalProps = {
  title: string;
  field: string;
  type?: "checkbox" | "radio";
  options: { label: string; value: string | number }[];
};

export const bottomSheetTitle = {
  related: "Từ liên quan",
  synonym: "Từ đồng nghĩa",
  antonym: "Từ trái nghĩa",
};
