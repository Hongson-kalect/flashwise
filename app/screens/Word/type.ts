import { WordType } from "./data";

export type SenseType ={
  id:string,
  pos:string,
  metadata: any,
  definition: WordType["definition"],
  translates: WordType["translates"],
  examples: WordType["examples"],
  usage: WordType["usage"],
  note:string
}

export type WordState = {
  word?: {
    id: string,
    value:string
  },
  senses: {[sense_id:string]:SenseType},
  images: {[sense_id:string]:string} // sense_id: url
  isLoading: boolean;
  status: "INITIAL" | "PARTIAL" | "COMPLETED" | null;
};

export const initialState: WordState = {
  word:undefined,
  senses:{},
  images:{},
  isLoading: true,
  status: null,
};

