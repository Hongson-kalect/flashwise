import { Args } from "./args";

export type KaikkiWord = {
  abbreviations: Abbreviations[]; //meta
  alt_of: RomanWord[]; //remove
  anagrams: { tags: string[]; word: string }[]; //remove
  antonyms: Antonyms[]; //meta
  categories: string[]; // searchable

  //   coordinate_terms: CoordinateTerm[];
  derived: Derived[]; //meta
  descendants: Descendant[]; //meta
  //   etymology_examples: Example[]; //meta -remove
  //   etymology_numbers: number | string; //meta - remove
  //   etymology_templates: HeadTemplate[];
  etymology_text: string; //meta -remove
  form_of: RomanWord[]; //
  forms: Form[]; //Biến thể, cách viết khác
  //   head_templates: HeadTemplate[]; //
  holonyms: Derived[];
  hypernyms: Derived[];
  hyphenation: Derived[];
  hyphenations: Derived[];
  hyponyms: Derived[];
  //   inflection_templates: InflectionTemplates[];
  //   info_templates: {
  //     args: Args;
  //     expasion: string;
  //     extra_data: { tags: string[]; words: string[] };
  //     name: string;
  //   }[];
  instances: {
    //metadata
    source: string;
    tags: string[];
    word: string;
    topics: string[];
  }[];
  lang: string; //FK
  lang_code: string; //FK
  literal_meanings: string;
  meronyms: Derived[]; //Cách gọi khác
  orginal_title: string;
  pos: string; //
  proverbs: {
    alt: string;
    english: string;
    roman: string;
    ruby: string[][];
    sense: string;
    tags: string[];
    translation: string;
    word: string;
  }[];
  redirects: string[];
  ralated: Derived[];
  senses: Senses[]; //
  sounds: Sound[]; //
  source: string; //
  synonyms: Derived[];
  translations: Derived[];
  troponyms: BasicReference[];
  wikidata: string[];
  wikipedia: string[];
  word: string;
};

type Abbreviations = {
  alt: string;
  english: string;
  roman: string;
  sense: string;
  tags: {
    [key: string]: string;
  }[];
  topics: string;
  translations: string[];
  urls: string;
  word: string;
};

type BaseNode = {
  alt: string;
  english: string;
  qualifier: string;
  raw_tags: string[];
  source: string;
  tags: string[];
  topics: string[];
  translations: string[];
  word: string;
};

type Form = {
  form: string;
  heade_nr: number | string;
  ipa: string;
  roman: string;
  raw_tags: string[];
  source: string;
  tags: string[];
  topics: string[];
  ruby: string[][];
};

type RomanWord = {
  roman: string;
  word: string;
};

type Extra = { extra: string; word: string };
type Example = {
  bold_literal_offsets: number[][];
  bold_roman_offsets: number[][];
  bold_text_offsets: number[][];
  bold_translation_offsets: number[][];
  english: string;
  literal_meaning: string;
  note: string;
  raw_tags: string[];
  ref: string;
  roman: string;
  ruby: string[][];
  tags: string[];
  text: string;
  translation: string;
  type: string;
};

type Senses = {
  alt_of: Extra[];
  antonyms: BaseNode[];
  attestations: {
    date: string;
    references: { refn: string; text: string }[];
  }[];
  categories: string[];
  compound_of: Extra[];
  coordinate_terms: BaseNode[];
  examples: Example[];
  form_of: Extra[];
  glosses: string[];
  head_nr: string;
  holonyms: BaseNode[];
  hypernyms: BaseNode[];
  hyponyms: BaseNode[];
  info_templates: {
    args: Args;
    expansion: string;
    extra_data: { tags: string[]; words: string[] };
    name: string;
  }[];
  instances: BaseNode[];
  links: string[][];
  meronyms: BaseNode[];
  qualifier: string;
  raw_glosses: string[];
  related: BaseNode[];
  senseid: string;
  synonyms: BaseNode[];
  tags: string[];
  taxonomy: string;
  topics: string[];
  troponyms: BaseNode[];
  wikidata: string[];
  wikipedia: string[];
};

type HeadTemplate = {
  args: {
    [key: string]: string;
  };
  expansion: string;
  name: string;
};

type InflectionTemplates = {
  args: Args;
  name: string;
};

type BasicReference = {
  alt: string;
  english: string;
  raw_tags: string[];
  roman: string;
  ruby: string[][];
  sense: string;
  tags: string[];
  topics: string[];
  translations: string;
  urls: string[];
  word: string;
};

type Derived = BasicReference & {
  taxonomic: string;
  qualifier: string;
};

type Antonyms = BasicReference & {
  source: string;
};

type Sound = {
  audio: string; // audio seen in alternative fact [English]; reached 960047 times,
  "audio-ipa": string; // audio-ipa seen in baka [Cebuano]; reached 95 times,
  enpr: string; // enpr seen in audacity [English]; reached 22674 times,
  form: string; // form seen in obtruncaverimus [Latin]; reached 7521 times,
  hangeul: string; // hangeul seen in 쏼라쏼라 [Korean]; reached 57413 times,
  homophone: string; // homophone seen in bowed [English]; reached 250107 times,
  ipa: string; // ipa seen in prophesy [English]; reached 6367525 times,
  mp3_url: string; // mp3_url seen in alternative fact [English]; reached 960047 times,
  note: string; // note seen in foster [English]; reached 556973 times,
  oga_url: string; // oga_url seen in 歌 [Chinese]; reached 361 times,
  ogg_url: string; // ogg_url seen in alternative fact [English]; reached 959687 times,
  opus_url: string; // opus_url seen in 詩史試時市事 [Chinese]; reached 233 times,
  other: string; // other seen in realtor [English]; reached 168809 times,
  raw_tags: string[]; //
  // [raw_tags seen in 細舅子 [Chinese]; reached 2104772 times]
  rhymes: string; // rhymes seen in hysteromyomectomy [English]; reached 1076596 times,
  roman: string; // roman seen in 嘀 [Translingual]; reached 273561 times,
  tags: string[]; //
  // [tags]
  text: string; // text seen in sit-up-and-beg [English]; reached 1442 times,
  topics: string[]; //
  // [topics seen in Melbourne [English]; reached 10906 times]
  wav_url: string; // wav_url seen in 中旬 [Chinese]; reached 3694 times,
  yue_url: string; // yue_url seen in 㯞 [Chinese]; reached 2 times,
  zh_pron: string; // zh_pron seen in 嘀 [Translingual]; reached 3427734 times
};

type CoordinateTerm = BasicReference & {
  qualifier: string;
  taxonomic: string;
  source: string;
};

type Descendant = {
  descendants: string[];
  lang: string; //lang seen in know-how [English]; reached 622699 times,
  lang_code: string; //lang_code seen in know-how [English]; reached 622699 times,
  raw_tags: string[];
  roman: string; //roman seen in know-how [English]; reached 137109 times,
  ruby: string[][];
  sense: string; //sense seen in canteen [English]; reached 9170 times,
  tags: string[];
  word: string; //word seen in know-how [English]; reached 581943 times
};
