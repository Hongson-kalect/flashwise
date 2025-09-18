import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import CardDefination from "@/components/card/Defination";
import CardExample from "@/components/card/Example";
import CardImage from "@/components/card/Image";
import CardWord from "@/components/card/Word";
import { TextStyle, View, ViewStyle } from "react-native";

// Về mặt sau: Có thể cân nhắc hiển thị định nghĩa hoặc không. Vì cơ bản thì ai người học biết ngôn ngữ gốc rồi. thì nó chỉ có tác dụng liên kết từ nước ngoài thay vì cần dữ liệu để học
const learningDirection = {
  enVi: "English to Vietnamese",
  viEn: "Vietnamese to English",
  enEn: "English to English",
};

const answerMethod = {
  //Nếu có hình đủ hình ảnh thì 50% tỉ lệ là chooseImage thay vì chooseWord
  //condition.speak? answerMethod.speak:answerMethod.write?answerMethod.write:answerMethod.chooseWord
  //condition.write? answerMethod.write?answerMethod.write:answerMethod.chooseWord
  all: "all types",
  write: "type the answer",
  speak: "speak the answer",
  chooseImage: "choose correct image",
  chooseWord: "choose correct word",
  connectWord: "connect word pairs",
  writeOrSpeak: "write or speak",
  writeOrChooseWord: "write or choose word",
  writeOrChooseImage: "write or choose image",
  none: "no answer required",
  multipleChoice: "multiple choice answer", // ✅ thêm
  reorder: "reorder words to form sentence", // ✅ thêm
};

type FRONT_CARD_ELEMENT =
  | "keyword"
  | "question"
  | "text"
  | "option_sound" // Options luôn hiển thị nhưng mà không có âm thanh. Nếu có options này thì sẽ phát âm thanh
  | "voice"
  | "image"
  | "definition"
  | "example"
  | "translate";

export type FRONT_CARD_OPTIONS =
  | "full"
  | "minimal"
  | "text"
  | "voiceOnly"
  | "imageOnly"
  | "defineOnly"
  | "translation"
  | "hideText"
  | "textAndImage"
  | "textAndVoice"
  | "textAndTranslation"
  | "question"
  | "completeSentences";

export const frontCardInfo: {
  [key in FRONT_CARD_OPTIONS]: FRONT_CARD_ELEMENT[];
} = {
  // * Only Tổ hợp đầy đủ, dùng cho lần đầu (level 0)
  full: ["option_sound", "text", "image", "definition", "example"],

  // level 1
  hideText: ["image", "definition", "example"], // Ẩn từ gốc, chỉ để đoán
  voiceOnly: ["voice"],

  // level 2
  textAndImage: ["text", "image"],
  defineOnly: ["definition", "example"],

  // level 3
  question: ["question"], //easy
  // level 4
  textAndVoice: ["text", "voice"],
  translation: ["translate"], // Dịch ngược
  // level 5
  // question: ["question"], //medium
  imageOnly: ["image"], // Luyện phản xạ. Mặt sau phải có định nghĩa
  minimal: ["keyword"], // Luyện phản xạ. Mặt sau phải có định nghĩa
  // level 6
  // level 7
  //Câu hỏi khó, mở rộng, nâng cao

  // Dạng đơn giản nhất (chỉ từ khoá)

  // Các dạng 1 nội dung duy nhất

  // Mấy cái này không biết hiển thị như thế nào
  text: ["question"],
  textAndTranslation: ["text", "translate"],
  completeSentences: ["voice"], // Cái này 1 sound, 2 là bản dịch, 3 là câu gốc

  // Dạng câu hỏi
};

// số bằng level cho phép xuất hiện và là tỉ lệ xuất hiện
export const qq: {
  [key in FRONT_CARD_OPTIONS]?: {
    elements: FRONT_CARD_ELEMENT[];
    backside: { [key: number]: keyof typeof backCardInfo };
    anserMethod: { [key: number]: keyof typeof answerMethod };
  };
} = {
  // * Only Tổ hợp đầy đủ, dùng cho lần đầu (level 0)
  full: {
    elements: ["option_sound", "text", "image", "definition", "example"],
    anserMethod: {
      0: "write",
    },
    backside: {
      0: "translation",
    },
  },

  // level 1
  hideText: {
    elements: ["image", "definition", "example"], // Ẩn từ gốc, chỉ để đoán
    anserMethod: {
      1: "write",
      2: "speak",
      3: "chooseWord",
      4: "chooseImage",
    },
    backside: {
      0: "translation",
      1: "translation",
      2: "moreInfo", //hint
      3: "usage", //culturalNote, GrammarNote
      4: "proTip", //etymology
      5: "collocations",
    },
  },
  voiceOnly: {
    elements: ["voice"],
    anserMethod: {
      1: "write",
      2: "speak",
    },
    backside: {
      1: "translation",
      2: "translation",
      3: "fullReveal",
      4: "hint", // speak hint,
    },
  },

  // level 2
  textAndImage: {
    elements: ["text", "image"],
    anserMethod: {
      // 1:'write',
      2: "speak",
      3: "chooseWord", // chọn bản dịch
    },
    backside: {
      2: "translation",
      3: "moreInfo", //hint
      4: "usage", //culturalNote, GrammarNote
      5: "proTip", //etymology
      6: "collocations",
    },
  },
  defineOnly: {
    elements: ["definition", "example"],
    anserMethod: {
      2: "chooseWord", // chọn từ | bản dịch
      3: "speak",
    },
    backside: {
      2: "moreInfo", //hint
      3: "translation",
      4: "proTip", //etymology
      5: "usage", //culturalNote, GrammarNote
      6: "collocations",
    },
  },

  // level 3
  question: {
    elements: ["question"], //easy, m ,h -> 3,5,6
    anserMethod: {
      3: "all", // Tùy câu hỏi. write / choose
    },
    backside: {
      3: "explanation",
    },
  },
  // level 4
  textAndVoice: {
    elements: ["text", "voice"],
    anserMethod: {
      4: "chooseWord", // Chọn bản dịch
    },
    backside: {
      1: "translation",
      2: "moreInfo",
      3: "usage",
      4: "collocations",
    },
  },
  translation: {
    elements: ["translate"], // Dịch ngược
    anserMethod: {
      4: "chooseWord", // Chọn bản dịch
      5: "write",
      6: "speak",
    },

    backside: {
      1: "fullReveal", // original word
    },
  },
  // level 5
  // question: ["question"], //medium
  imageOnly: {
    elements: ["image"], // Luyện phản xạ. Mặt sau phải có định nghĩa
    anserMethod: {
      1: "chooseWord", // Chọn từ
      2: "write",
      3: "chooseWord", // Chọn bản nghe
      4: "speak",
    },
    backside: {
      1: "translation",
      2: "fullReveal",
      // 3:'collocations',
    },
  },
  minimal: {
    elements: ["keyword"],
    anserMethod: {
      1: "write",
      2: "speak",
      3: "chooseWord",
      4: "chooseWord", // Chọn bản nghe
    },
    backside: {
      4: "hint",
      5: "combine",
    },
  },
  text: {
    elements: ["text"],
    anserMethod: { 1: "speak", 2: "chooseWord" },
    backside: {
      1: "translation",
      2: "fullReveal",
    },
  },
};

export const frontCardElementMapping: {
  [key in FRONT_CARD_ELEMENT]: (props: any) => React.ReactNode;
} = {
  image: (props) => <CardImage {...props} />,
  definition: (props) => <CardDefination {...props} />,
  example: (props) => <CardExample {...props} />,
  // keyword:(props) => <CardKeyword {...props}/>,
  question: (props) => (
    <View>
      <AppText>{JSON.stringify(props.question)}</AppText>
    </View>
  ),
  text: (props) => <CardWord {...props} />,
  voice: (props) => (
    <View style={{ alignItems: "center", flex: 1 }}>
      <AppButton onPress={() => {}} style={{ borderRadius: 24 }}>
        <View
          // activeOpacity={0.8}
          style={{
            height: 200,
            alignItems: "center",
            justifyContent: "center",
            width: 200,
            borderRadius: 24,
            padding: 8,
          }}
        >
          <AppIcon branch="feather" name="volume-2" color="white" size={100} />
        </View>
      </AppButton>
    </View>
  ),
  translate: (props) => (
    <View>
      <AppText>{JSON.stringify(props.translate)}</AppText>
    </View>
  ),
  keyword: (props) => (
    <View>
      <AppText>{JSON.stringify(props.keyword)}</AppText>
    </View>
  ),
  option_sound: (props) => (
    <View>
      <AppText>{JSON.stringify(props.option_sound)}</AppText>
    </View>
  ),
};

export const frontCardTitle: {
  [key in FRONT_CARD_OPTIONS]?: string;
} = {
  defineOnly: "Định Nghĩa",
  question: "Câu hỏi",
  imageOnly: "Hình ảnh",
  minimal: "Keywords",
  completeSentences: "Hoàn thành câu",
};

export const frontCardStyle: {
  [key in FRONT_CARD_OPTIONS]?: {
    [key in FRONT_CARD_ELEMENT]?: {
      wrapper?: ViewStyle;
      text?: TextStyle;
      subText?: TextStyle;
    };
  };
} = {
  defineOnly: {
    definition: {
      wrapper: {},
      text: {
        fontSize: 18,
      },
    },
  },
};

export const frontContentCardStyle: {
  [key in FRONT_CARD_OPTIONS]?: {
    [key in FRONT_CARD_ELEMENT]?: ViewStyle | TextStyle;
  };
} = {
  defineOnly: {
    definition: {
      fontSize: 24,
    },
  },
};

const textAndTranslation = false; // Hiển thị nghĩa ngay bên dưới từ gốc

const backCardInfo = {
  // --- Nghĩa cơ bản ---
  translation: "translation, other translations (target → native)",
  combine: "Cả từ gốc lẫn bản dịch", // Dùng cho bài nghe, đọc

  // --- Hỗ trợ trả lời ---
  hint: "definition, example with hidden word (hint before answer)",
  fullReveal:
    "reveal full front card info (used after answer if front is limited)",

  // --- Giải thích chi tiết ---
  explanation: "detailed explanation (why correct or incorrect)",
  usage: "usage in sentence",
  grammarNote: "grammar note",

  // --- Nâng cao (từ → từ) ---
  moreInfo: "synonyms, antonyms, collocations, variations (target → target)",
  proTip: "advanced usage tips or uncommon insights",

  // --- Khác ---
  none: "no back side (one-sided card)",
  collocations: "common phrases with this word", // dùng cho trình độ cao
  culturalNote: "cultural context or usage caveats", // khi học từ theo ngữ cảnh văn hóa
  etymology: "word origin", // useful cho từ khó nhớ // Cách từ được tạo ra hay gì?
  defination: "defination và example", // useful cho từ khó nhớ // Cách từ được tạo ra hay gì?
};

const flipCondition = {
  free: "can flip anytime",
  locked: "cannot flip",
  lockedUntilCorrect: "cannot flip until correct",

  //Tự động lật và có thể lật lại
  afterAnswer: "can flip after answering",
  afterCorrect: "can flip only if answer is correct",
  afterTimer: "can flip after countdown",
};

const condition = {
  listen: true,
  read: true,
  write: true,
  speak: true,
  see: true, //Hiện tại nếu false thì cút, còn sau chơi full voice thì hên xui
  none: "none",
};

// speak => write => chooseWord | chooseImage
const memoryLevelCardCases = {
  target_native: {
    0: [
      {
        id: "lv0-intro",
        front: frontCardInfo.full,
        back: backCardInfo.translation,
        flip: flipCondition.free,
        answer: answerMethod.write,
      },
    ],

    1: [
      {
        id: "lv1-basic-text",
        front: frontCardInfo.hideText,
        back: backCardInfo.translation,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.write,
      },
      {
        id: "lv1-voice",
        front: frontCardInfo.voiceOnly,
        back: backCardInfo.combine,
        flip: flipCondition.afterCorrect,
        answer: condition.speak,
        condition: condition.listen,
      },
    ],

    2: [
      {
        id: "lv2-text-image",
        front: frontCardInfo.textAndImage,
        back: backCardInfo.translation,
        flip: flipCondition.afterTimer,
        answer: answerMethod.speak, // Chọn bản dịch
        condition: condition.speak,
      },

      {
        id: "lv2-define-only",
        front: frontCardInfo.defineOnly,
        back: backCardInfo.translation,
        flip: flipCondition.lockedUntilCorrect,
        answer: answerMethod.write,
      },
    ],

    3: [
      {
        id: "lv3-mcq-easy",
        front: frontCardInfo.question,
        back: backCardInfo.explanation,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.multipleChoice,
      },
      {
        id: "lv2-text-voice",
        front: frontCardInfo.voiceOnly,
        back: backCardInfo.usage,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.speak,
      },
      {
        id: "lv3-define-usage",
        front: frontCardInfo.defineOnly,
        back: backCardInfo.usage,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.write,
      },
      {
        id: "lv3-translation-hint",
        front: frontCardInfo.translation,
        back: backCardInfo.hint, // define, example
        flip: flipCondition.lockedUntilCorrect,
        answer: answerMethod.write,
      },
    ],

    4: [
      {
        id: "lv4-advanced-usage",
        front: frontCardInfo.hideText,
        back: backCardInfo.usage,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.writeOrSpeak,
      },
      {
        id: "lv4-define-explanation",
        front: frontCardInfo.text,
        back: backCardInfo.explanation,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.writeOrChooseWord,
      },
      {
        id: "lv4-speak-or-write",
        front: frontCardInfo.voiceOnly,
        back: backCardInfo.fullReveal,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.writeOrSpeak,
      },
    ],

    5: [
      {
        id: "lv5-pro-tip",
        front: frontCardInfo.text,
        back: backCardInfo.proTip,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.write,
      },
      {
        id: "lv3-mcq-medium", // Câu hỏi khó hơn 1 tý
        front: frontCardInfo.question,
        back: backCardInfo.explanation,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.multipleChoice,
      },
    ],

    6: [
      {
        id: "lv6-reorder-sentence",
        front: frontCardInfo.completeSentences,
        back: backCardInfo.grammarNote,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.reorder,
      },
      {
        id: "lv6-advanced-culture",
        front: frontCardInfo.text,
        back: backCardInfo.culturalNote, //Special usecase
        flip: flipCondition.afterAnswer,
        answer: answerMethod.multipleChoice,
      },
    ],

    7: [
      {
        id: "lv7-etymology",
        front: frontCardInfo.text,
        back: backCardInfo.etymology, // Nếu có
        flip: flipCondition.afterAnswer,
        answer: answerMethod.write,
      },
      {
        id: "lv7-advanced-connect",
        front: frontCardInfo.text,
        back: backCardInfo.moreInfo,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.connectWord,
      },
      {
        id: "lv7-hard-quiz",
        front: frontCardInfo.question,
        back: backCardInfo.explanation,
        flip: flipCondition.afterAnswer,
        answer: answerMethod.multipleChoice,
      },
    ],
  },
};
