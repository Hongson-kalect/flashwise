import {
  backCardInfo,
  backCardStyle,
  backCardTitle,
  CardElement,
  frontCardStyle,
  frontCardTitle,
  qq,
} from "@/configs/cardOptions";

export function makeQuestion(method: string, question: number): CardElement {
  let questionType = qq.hideText;
  switch (method) {
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

      return {
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

      return {
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

      return {
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

      return {
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

      return {
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
