import { QuestionType } from "@/app/screens/Practice/example";
import {
  answerMethod,
  backCardInfo,
  backCardStyle,
  backCardTitle,
  CardElement,
  frontCardStyle,
  frontCardTitle,
  qq,
} from "@/configs/cardOptions";
import userState from "@/stores/userStateStore";

export function makeQuestion(
  method: string,
  question: QuestionType
): CardElement {
  let questionType = qq.hideText;
  const { hearable, talkable } = userState.getState();
  let appliedMethod = method;
  if (!talkable && appliedMethod === "speak") appliedMethod = "write";
  if (!hearable && appliedMethod === "listen") appliedMethod = "write";

  switch (appliedMethod) {
    case "write": {
      const type = "hideText"; // Có list 1 loạt, ramdom hoặc dựa vào gì đó
      questionType = qq[type]; // Có list 1 loạt, ramdom hoặc dựa vào gì đó

      const frontTitle = frontCardTitle[type];
      const backTitle = backCardTitle[type];

      const frontStyle = frontCardStyle[type];
      const backStyle = backCardStyle[type];
      const frontElements = questionType.elements;
      const backElements =
        backCardInfo[Object.entries(questionType.backside)[0][1]];
      const answerMethod = Object.entries(questionType.answerMethod)[0][1];
      const frontOptionSound = frontElements.includes("option_sound");
      const backOptionSound = backElements.includes("option_sound");
      const flipType = "manual";
      const answer = getAnser(answerMethod, question);

      return {
        flipType,
        answer,
        frontElements: frontElements,
        backElements: backElements, // Dựa vào level để random xem ra cái nào
        answerMethod: answerMethod, // Dựa vào level để random xem ra cái nào
        frontTitle,
        backTitle,
        frontOptionSound,
        backOptionSound,
        frontStyle,
        backStyle,
      };
    }

    case "listen": {
      const type = "voiceOnly";
      questionType = qq[type]; // Có list 1 loạt, ramdom hoặc dựa vào gì đó

      const frontTitle = frontCardTitle[type];
      const backTitle = backCardTitle[type];

      const frontStyle = frontCardStyle[type];
      const backStyle = backCardStyle[type];
      const frontElements = questionType.elements;
      const backElements =
        backCardInfo[Object.entries(questionType.backside)[0][1]];
      const answerMethod = Object.entries(questionType.answerMethod)[0][1];
      const frontOptionSound = frontElements.includes("option_sound");
      const backOptionSound = backElements.includes("option_sound");

      const flipType = "manual";
      const answer = getAnser(answerMethod, question);

      return {
        flipType,
        answer,
        frontElements: frontElements,
        backElements: backElements, // Dựa vào level để random xem ra cái nào
        answerMethod: answerMethod, // Dựa vào level để random xem ra cái nào
        frontTitle,
        backTitle,
        frontOptionSound,
        backOptionSound,
        frontStyle,
        backStyle,
      };
    }

    case "speak": {
      const type = "textAndImage";
      questionType = qq[type]; // Có list 1 loạt, ramdom hoặc dựa vào gì đó

      const frontTitle = frontCardTitle[type];
      const backTitle = backCardTitle[type];

      const frontStyle = frontCardStyle[type];
      const backStyle = backCardStyle[type];
      const frontElements = questionType.elements;
      const backElements =
        backCardInfo[Object.entries(questionType.backside)[0][1]];
      const answerMethod = "speak"; //Object.entries(questionType.answerMethod)[0][1]
      const frontOptionSound = frontElements.includes("option_sound");
      const backOptionSound = backElements.includes("option_sound");

      const flipType = "answerAuto";
      const answer = getAnser(answerMethod, question);

      return {
        flipType,
        answer,
        frontElements: frontElements,
        backElements: backElements, // Dựa vào level để random xem ra cái nào
        answerMethod: answerMethod, // Dựa vào level để random xem ra cái nào
        frontTitle,
        backTitle,
        frontOptionSound,
        backOptionSound,
        frontStyle,
        backStyle,
      };
    }

    case "chooseWord": {
      const type = "hideText";
      questionType = qq[type]; // Có list 1 loạt, ramdom hoặc dựa vào gì đó

      const frontTitle = frontCardTitle[type];
      const backTitle = backCardTitle[type];

      const frontStyle = frontCardStyle[type];
      const backStyle = backCardStyle[type];
      const frontElements = questionType.elements;
      const backElements =
        backCardInfo[Object.entries(questionType.backside)[0][1]];
      const answerMethod = "chooseWord"; //Object.entries(questionType.answerMethod)[0][1]
      const frontOptionSound = frontElements.includes("option_sound");
      const backOptionSound = backElements.includes("option_sound");

      const flipType = "answerAuto";
      const answer = getAnser(answerMethod, question);

      return {
        flipType,
        answer,
        frontElements: frontElements,
        backElements: backElements, // Dựa vào level để random xem ra cái nào
        answerMethod: answerMethod, // Dựa vào level để random xem ra cái nào
        frontTitle,
        backTitle,
        frontOptionSound,
        backOptionSound,
        frontStyle,
        backStyle,
      };
    }

    default: {
      const type = "hideText"; // Có list 1 loạt, ramdom hoặc dựa vào gì đó
      questionType = qq[type]; // Có list 1 loạt, ramdom hoặc dựa vào gì đó

      const frontTitle = frontCardTitle[type];
      const backTitle = backCardTitle[type];

      const frontStyle = frontCardStyle[type];
      const backStyle = backCardStyle[type];
      const frontElements = questionType.elements;
      const backElements =
        backCardInfo[Object.entries(questionType.backside)[0][1]];
      const answerMethod = Object.entries(questionType.answerMethod)[0][1];
      const frontOptionSound = frontElements.includes("option_sound");
      const backOptionSound = backElements.includes("option_sound");

      const flipType = "answerAuto";
      const answer = getAnser(answerMethod, question);

      return {
        flipType,
        answer,
        frontElements: frontElements,
        backElements: backElements, // Dựa vào level để random xem ra cái nào
        answerMethod: answerMethod, // Dựa vào level để random xem ra cái nào
        frontTitle,
        backTitle,
        frontOptionSound,
        backOptionSound,
        frontStyle,
        backStyle,
      };
    }
  }
}

const getAnser = (
  method: keyof typeof answerMethod,
  question: QuestionType
) => {
  switch (method) {
    case "write":
      return question.word;
    case "speak":
      return question.word;
    case "chooseWord":
      return question.word;
    case "chooseImage":
      return question.word;
    default:
      return question.word;
  }
};
