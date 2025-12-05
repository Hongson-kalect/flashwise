import AppText from "@/components/AppText";

type Props = {
  children: React.ReactNode;
};
const PhienAm = (props: Props) => {
  return <AppText color={"subText2"}>{props.children}</AppText>;
};

export default PhienAm;
