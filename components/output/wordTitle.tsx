import AppText from "@/components/AppText";

type Props = { children: React.ReactNode };
const WordTitle = (props: Props) => (
  <AppText color="primary" size={36} weight="bold">
    {props.children}
  </AppText>
);

export default WordTitle;
