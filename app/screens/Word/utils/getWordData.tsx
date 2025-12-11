import { WordType } from "../data";

export const getList = (tab: string, data: WordType) => {
  switch (tab) {
    case "definations": {
      return data.definations;
    }

    case "translates": {
      return data.translates;
    }

    case "forms": {
      return data.forms;
    }

    case "synonyms": {
      return data.synonyms;
    }

    case "antonyms": {
      return data.antonyms;
    }

    case "relateds": {
      return data.relateds;
    }
    case "images": {
      return data.wordInfo.images;
    }
    case "audios": {
      return data.wordInfo.audios;
    }
    case "ipas": {
      return data.wordInfo.ipas;
    }
    default:
      return [];
  }
};
