import { useLocalSearchParams } from "expo-router/build/hooks";

const Card = () => {
  const { id } = useLocalSearchParams();
  return <div>Card id: {id}</div>;
};

export default Card;
