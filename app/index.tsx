import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

/** Route gốc "/": chưa xem màn giới thiệu thì vào Start, ngược lại vào tabs. */
export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("hasSeenStartPage")
      .then((v) => setTarget(v === "true" ? "/tabs" : "/screens/Start/screen"))
      .catch(() => setTarget("/screens/Start/screen"));
  }, []);

  if (!target) return null;
  return <Redirect href={target as any} />;
}
