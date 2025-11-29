import AppSearch from "@/components/input/AppSearch";
import { useDebounce } from "@/hooks/useDebouce";
import { dicSearchWord } from "@/services/s3/dictionaryAPI";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";

const HomeSearch = () => {
  const [searchVal, setSearchVal] = useState("");
  const searchDebounced = useDebounce(searchVal);

  const { data } = useQuery({
    queryFn: () => dicSearchWord(searchDebounced),
    queryKey: ["searchWord", searchDebounced],
    enabled: !!(searchVal && searchDebounced),
  });

  return (
    <View>
      <AppSearch
        value={searchVal}
        onChangeText={setSearchVal}
        placeholder="Enter text to search..."
      />
    </View>
  );
};

export default HomeSearch;
