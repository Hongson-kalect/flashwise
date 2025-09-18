import * as React from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

const data = [...new Array(6).keys()];
const deviceWidth = Dimensions.get("window").width;

type Props = {
  width?: number;
  height?: number;
  data?: number[];
  loop?: boolean;
  mode?: "horizontal-stack" | "vertical-stack" | "parallax" | undefined;
  dots?: boolean;
  renderItem: ({
    data,
    index,
  }: {
    data: any;
    index: number;
  }) => React.ReactNode;
};

function AppCarousel({
  loop = true,
  mode = "parallax",
  dots = true,
  ...props
}: Props) {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [width] = React.useState(props.width || deviceWidth - 14);
  const [height] = React.useState(props.height || (width / 16) * 9);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={{ flex: 1, paddingVertical: 4 }}>
      <Carousel
        ref={ref}
        width={width}
        height={height}
        data={data}
        onProgressChange={progress}
        loop={loop}
        pagingEnabled={true}
        snapEnabled={true}
        mode={mode}
        renderItem={({ index }) => {
          const value = data[index];
          return (
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              {/* <View
              style={{
                  flex: 1,
                  borderRadius: 10,
                  overflow: "hidden",
                  justifyContent: "center",
                }}
                > */}
              {props.renderItem?.({ data: value, index })}
              {/* <Text style={{ textAlign: "center", fontSize: 30 }}>{index}</Text> */}
              {/* </View> */}
            </View>
          );
        }}
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
          snapDirection: "left",
          stackInterval: 18,
        }}
        // customConfig={() => ({ type: "positive", viewCount: 5 })}
      />

      {dots && (
        <Pagination.Custom
          progress={progress}
          data={data}
          dotStyle={{
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 4,
            height: 2,
            marginTop: -5,
          }}
          containerStyle={{ gap: 5, marginTop: 10 }}
          onPress={onPressPagination}
          renderItem={(_, index) => (
            <View style={{ width: 8, height: 2, borderRadius: 4 }} />
          )}
        />
      )}
    </View>
  );
}

export default AppCarousel;
