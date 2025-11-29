import { datamuseInstance, dictionaryInstance } from "../axios";

type supportLang =
  | "en"
  | "hi"
  | "es"
  | "fr"
  | "ja"
  | "ru"
  | "de"
  | "it"
  | "ko"
  | "pt"
  | "ar"
  | "tr";

export const autocompleteWord = async (
  word: string,
  lang: supportLang = "en"
) => {
  const response = await datamuseInstance.get(`sug/`, {
    params: {
      s: word,
    },
  });
  console.log("autocompleteWord", response.data);
  return response.data;
};
