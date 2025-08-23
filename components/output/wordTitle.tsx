import AppText from "@/components/AppText";

type Props = { children: React.ReactNode };
const WordTitle = (props: Props) => (
  <AppText color="primary" size={36} font="MulishBold">
    {props.children}
  </AppText>
);

export default WordTitle;
