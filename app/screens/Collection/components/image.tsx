import { useState } from "react";
import { Image } from "react-native";

const CollectionImage = ({ source }: { source: string }) => {
  const [height, setHeight] = useState(0);
  const setImageHeight = (height: number) => {
    if (height) {
      setHeight(height);
    }
  };

  return (
    <Image
      style={{ height: height || "auto", width: "100%" }}
      onLayout={(e) => setImageHeight(e.nativeEvent.layout.height)}
      className="w-full"
    ></Image>
  );
};

export default CollectionImage;
