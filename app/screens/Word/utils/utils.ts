import { WordType } from "../data";

export const basicWordMapping = (sense: WordType[]) => {
  const sortedSenses = sense.sort((a, b) => {
    const aIsUser = a.isUser ? 1 : 0;
    const bIsUser = b.isUser ? 1 : 0;
    if (b.isUser !== a.isUser) return bIsUser - aIsUser;

    //Tạm tính score = số từ, số definition, số example, số translate nó có
    const aScore = basicScoreAccount(a);
    const bScore = basicScoreAccount(b);
    return aScore - bScore;
  });

  const result: WordType[] = [];
  sortedSenses.map((sortedSense: WordType) => {
    const pos = sortedSense.wordInfo.pos;
    const defiantions = sortedSense.definations;
    const translates = sortedSense.translates;
    const forms = sortedSense.forms;

    const currentPos = result.find(
      (item: WordType) => item.wordInfo.pos === pos
    );

    if (currentPos) {
      forms.forEach((form) => {
        addIfValueNotExist(currentPos.forms, form);
      });

      defiantions.forEach((defiantion) => {
        addIfValueNotExist(currentPos.definations, defiantion);
      });
      translates.forEach((translate) => {
        addIfValueNotExist(currentPos.translates, translate);
      });
    } else {
      result.push({
        ...sortedSense,
        definations: [...defiantions],
        translates: [...translates],
        forms: [...forms],
      });
    }
  });

  return result;
};

const addIfValueNotExist = (
  array: { value: any; [key: string]: any }[],
  value: { value: any; [key: string]: any }
) => {
  const exist = array.find(
    (item: { value: string; [key: string]: any }) =>
      JSON.stringify(item.value) === JSON.stringify(value.value)
  );
  if (!exist) {
    array.push(value);
  }
};

const basicScoreAccount = (word: WordType) => {
  let score = 0;
  word.definations.forEach((defination) => {
    defination.value.map((item) => (score += item.length));
    const examples = defination.examples;
    examples.forEach((example) => {
      score += example.value.length;
      const trans = example.exampleTranslate;
      trans.forEach((tran) => {
        score += tran?.value?.length || 0;
      });
    });
  });
  return score;
};
