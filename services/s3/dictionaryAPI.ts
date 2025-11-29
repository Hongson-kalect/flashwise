import { dictionaryInstance } from "../axios";

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

export const dicSearchWord = async (word: string, lang: supportLang = "en") => {
  console.log("s");
  const response = await dictionaryInstance.get(
    `entries/${lang}/${word.toLocaleLowerCase()}`
  );
  // const response = await fetch(
  //   `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word}`
  // );

  console.log("searchWord", response.data);
  return response.data;
};
