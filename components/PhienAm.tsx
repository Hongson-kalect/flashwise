import AppText from "@/components/AppText";

type Props = {
  children: React.ReactNode;
};
const PhienAm = (props: Props) => {
  return (
    <AppText size={"sm"} color={"subText3"}>
      {props.children}
    </AppText>
  );
};

export default PhienAm;
