import AppText from "@/components/AppText";
import { useDatabase } from "@/hooks/useDatabase";
import { streamRequest } from "@/utils/apiStreaming";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
// import { database, tableNames } from "@/watermelon/database";
import AppButton from "@/components/AppButton";
import { useTypingText } from "@/hooks/useTypingText";
import { useWebSocket } from "@/hooks/useWebSocket";
import { View } from "react-native";
import { extractObjectByPath } from "../../Word/data";

const backend_url = "tiles-washington-qty-specialized.trycloudflare.com";
const HomeHeader = () => {
  const db = useSQLiteContext();
  const word = "hiiii";
  const socketUrl = `wss://${backend_url}/ws/dict/${word}`;
  const handleMessage = (message: any) => {
    console.log(message);
  };

  const { isReady, lastMessage, connect, close, sendMessage } = useWebSocket(
    socketUrl,
    handleMessage,
  );

  const connectSocket = () => {
    connect();
  };
  const disconnectSocket = () => {
    close();
  };

  const sendMessageSocket = () => {
    sendMessage({ abc: "lon coca", def: "lon pepsi" });
  };

  useEffect(() => {
    // Alert.alert(isReady.toString());
  }, [isReady]);

  const search = "";

  const [result, setResult] = useState("");
  const displayText = useTypingText(result);
  const queueRef = useRef(""); // Chứa dữ liệu đang đợi để "gõ"
  const [firstTimeRender, setFirstTimeRender] = useState<boolean | null>(null);
  const flags = useRef(null);
  const entries = useRef<any[]>([]);

  // Hàm này chạy liên tục để "gõ" chữ ra màn hình

  const [streamingType, setStreamingType] = useState(false);
  const streaming = () => {
    setResult("");
    flags.current = null;
    entries.current = [];
    setFirstTimeRender(null);
    streamRequest({
      url: `https://${backend_url}/test-ai/?value=example&lang=en&user_lang=vi`,
      onChunk: (chunk: string) => {
        setResult((prev) => {
          const newResult = prev + chunk;
          console.log(
            "Lay du lieu sense dau tien",
            entries.current.length,
            flags,
          );
          if (!flags.current) {
            const newFlags = getFlags(newResult);
            flags.current = newFlags;
            // Check choac cac thu, canh bao cac thu
          }

          if (!entries.current.length) {
            const senses = geFirstSense(newResult);
            if (senses)
              entries.current = [
                entries.current,
                { pos: "", ipas: [], senses },
              ];
          }

          return prev + chunk;
        });

        // if (firstTimeRender) {

        // }
      },

      onFinish: (fullResult: string) => {
        console.log("fullResult", fullResult);
        const data = JSON.parse(fullResult);
        // Xong tu day them vao entries, database,...
      },
      setStreamingType: (val) => {
        if (firstTimeRender !== null) return;
        setFirstTimeRender((prev) => val);
      },
    });
  };

  const database = useDatabase();

  const getTodos = async () => {};

  // useEffect(() => {
  //   streaming();
  // }, []);
  return (
    <View className="">
      {/* <AppLabel titles={["Flash", "wise"]} /> */}
      {/* <AppButton
        onPress={() => router.push("/screens/Collection/Discover/List/screen")}
        type="primary"
      >
        <AppIcon name="link" branch="antd" color="white" size={18} />
        <AppText color="white">Discover</AppText>
      </AppButton> */}

      <AppText font="MulishSemiBold" size={32}>
        Hi, JOIN
      </AppText>
      <View className="">
        <AppText size={"sm"} font="MulishLight" color="subText1">
          What would you like to learn today?
        </AppText>
      </View>

      <View className="flex-row items-center justify-end gap-1 p-2">
        <AppButton
          onPress={() => {
            connectSocket();
          }}
          title="Connect"
        />
        <AppButton
          type="success"
          onPress={() => {
            sendMessageSocket();
          }}
          title="Send message"
        />
        <AppButton
          type="error"
          onPress={() => {
            disconnectSocket();
          }}
          title="Disconnect"
        />
      </View>

      <AppText>{firstTimeRender?.toString()}</AppText>
      <AppText>{JSON.stringify(lastMessage) || "Not have any message"}</AppText>
      <AppText>{useTypingText(JSON.stringify(flags.current))}</AppText>
      <AppText>{useTypingText(JSON.stringify(entries.current))}</AppText>
    </View>
  );
};

export default HomeHeader;

const getFlags = (accumulatedText: string) => {
  let flags = null;
  const flagsMatch = extractObjectByPath(accumulatedText, '"flags"');
  console.log("get flags");
  if (flagsMatch) {
    flags = JSON.parse(flagsMatch);
    console.log("flags", flags);

    // Xử lý che chắn ngay lập tức
    if (flags.isOffensive) {
      console.warn("CẢNH BÁO: Từ tục tịu! Kích hoạt chế độ che chắn.");
      // Hiển thị cảnh báo hoặc ẩn nội dung nhạy cảm tại đây
    }
    if (!flags.isValid) {
      console.error("Từ không hợp lệ.");
      // Có thể dừng stream hoặc báo lỗi
    }
  }
  return flags;
};

const geFirstSense = (accumulatedText: string) => {
  let sense = null;
  const senseMatch = extractObjectByPath(accumulatedText, '"senses"');
  if (senseMatch) {
    sense = JSON.parse(senseMatch);

    // Xử lý che chắn ngay lập tức
  }
  return sense;
};
const getFlagsAndSenses = (accumulatedText: string) => {
  // accumulatedText += decoder.decode(value, { stream: true });
  const startTime = performance.now();
  let flagsFound = false;
  let firstSenseFound = false;

  // 1. CHECK FLAGS (Ưu tiên số 1)
  let flags = null,
    sense = null;
  if (!flagsFound) {
    const flagsMatch = extractObjectByPath(accumulatedText, '"flags"');
    if (flagsMatch) {
      flags = JSON.parse(flagsMatch);
      const timeFlags = (performance.now() - startTime).toFixed(2);
      console.log(`🛡️ Flags detected at ${timeFlags}ms:`, flags);

      // Xử lý che chắn ngay lập tức
      if (flags.isOffensive) {
        console.warn("CẢNH BÁO: Từ tục tịu! Kích hoạt chế độ che chắn.");
        // Hiển thị cảnh báo hoặc ẩn nội dung nhạy cảm tại đây
      }
      if (!flags.isValid) {
        console.error("Từ không hợp lệ.");
        // Có thể dừng stream hoặc báo lỗi
      }

      flagsFound = true;

      // return flags;
    }
  }

  // 2. NHẶT SENSE ĐẦU TIÊN (Ưu tiên số 2)
  if (flagsFound && !firstSenseFound) {
    const senseMatch = extractObjectByPath(accumulatedText, '"senses"', true); // true để lấy phần tử đầu tiên trong mảng
    if (senseMatch) {
      sense = JSON.parse(senseMatch);
      const timeSense = (performance.now() - startTime).toFixed(2);
      console.log(`✅ First Sense detected at ${timeSense}ms`);

      firstSenseFound = true;
    }
  }

  return {
    flags,
    sense,
  };
};
