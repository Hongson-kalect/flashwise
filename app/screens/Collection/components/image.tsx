import { useState } from "react";
import { Image } from "react-native";

const CollectionImage = ({ source }: { source: string }) => {
  const [height, setHeight] = useState(0);

  const setImageHeight = (width: number) => {
    const height = (width / 6) * 4;
    if (height) {
      setHeight(height);
    }
  };

  return (
    <Image
      style={{
        height: height || "auto",
        width: "100%",
        resizeMode: "cover",
        borderRadius: 8,
      }}
      onLayout={(e) => setImageHeight(e.nativeEvent.layout.width)}
      source={{ uri: source }}
      className="w-full"
    />
  );
};

export default CollectionImage;
