// Về mặt sau: Có thể cân nhắc hiển thị định nghĩa hoặc không. Vì cơ bản thì ai người học biết ngôn ngữ gốc rồi. thì nó chỉ có tác dụng liên kết từ nước ngoài thay vì cần dữ liệu để học

export const cardCase = {
  targetTarget: {
    show: {
      mode: "target-native",
      cardType: "show",
      front: {
        text: "apple",
        definition: "A round fruit with red or green skin.",
        example: "I ate an apple.",
        image: "",
      },
      back: {
        translation: "quả táo",
        //"Từ đồng nghĩa" trong tiếng anh là gì
        otherTranslations: "A round fruit with red or green skin.",
        synonyms: "A round fruit with red or green skin.",
        antonyms: "A round fruit with red or green skin.",
        collocations: "I ate an apple.",
        relatedWords: "I ate an apple.",
        otherForms:
      },
      question: {
        type: "choose_image",
      },
      backsideType: "translation",
      flipMode: "manual",
    },
    word: {
      mode: "target-native",
      cardType: "word",
      front: {
        text: "apple",
      },
      back: {
        translation: "quả táo",
        definition: "A round fruit with red or green skin.",
        example: "I ate an apple.",
      },
      question: {
        type: "choose_image",
      },
      backsideType: "translation",
      flipMode: "manual",
    },

    sound: {
      mode: "target-native",
      cardType: "sound",
      front: {
        sound: "apple.mp3",
      },
      back: {
        translation: "quả táo",
        definition: "A fruit with red or green skin.",
        example: "I ate an apple.",
      },
      question: {
        type: "write",
      },
      backsideType: "translation",
      flipMode: "auto",
    },

    cloze: {
      mode: "target-native",
      cardType: "cloze",
      front: {
        example: "I ate an ____ for breakfast.",
        image: "breakfast.jpg",
      },
      back: {
        word: "apple",
        translation: "quả táo",
        definition: "A fruit with red/green skin.",
        example: "I ate an apple for breakfast.",
      },
      question: {
        type: "cloze_fill",
      },
      backsideType: "answer",
      flipMode: "auto",
    },

    "full-info": {
      mode: "target-native",
      cardType: "full-info",
      front: {
        text: "apple",
        sound: "apple.mp3",
        image: "apple.jpg",
        definition: "A round fruit...",
        example: "He ate an apple.",
      },
      back: {
        translation: "quả táo",
        tips: "Commonly used in idioms like 'apple of my eye'",
      },
      question: {
        type: "speak",
      },
      backsideType: "translation",
      flipMode: "manual",
    },

    "meaning-first": {
      mode: "target-native",
      cardType: "meaning-first",
      front: {
        translation: "quả táo",
        definition: "A fruit eaten daily.",
        example: "He picked an apple.",
      },
      back: {
        word: "apple",
        sound: "apple.mp3",
      },
      question: {
        type: "speak",
      },
      backsideType: "answer",
      flipMode: "manual",
    },

    "sentence-audio": {
      mode: "target-native",
      cardType: "sentence-audio",
      front: {
        sound: "sentence_audio.mp3",
        cloze: "He ate an ____ after school.",
      },
      back: {
        word: "apple",
        translation: "quả táo",
        definition: "A fruit with red/green skin.",
      },
      question: {
        type: "cloze_fill",
      },
      backsideType: "answer",
      flipMode: "auto",
    },
    "tip-card": {
      mode: "target-native",
      cardType: "tip-card",
      front: {
        text: "apple",
      },
      back: {
        tips: "Used in idioms like 'apple of my eye'",
        example: "You're the apple of my eye.",
      },
      question: {
        type: "none",
      },
      backsideType: "tip",
      flipMode: "manual",
    },
  },
  targetNative: {
    definition: {
      mode: "target-target",
      cardType: "definition",
      front: {
        definition: "A round fruit with red or green skin.",
        example: "She ate an apple after lunch.",
      },
      back: {
        word: "apple",
        sound: "apple.mp3",
      },
      question: {
        type: "write",
      },
      backsideType: "answer",
      flipMode: "manual",
    },

    reverse: {
      mode: "target-target",
      cardType: "reverse",
      front: {
        word: "apple",
      },
      back: {
        definition: "A round fruit with red or green skin.",
        example: "She picked an apple.",
      },
      question: {
        type: "choose_meaning",
      },
      backsideType: "hint",
      flipMode: "manual",
    },

    image: {
      mode: "target-target",
      cardType: "image",
      front: {
        image: "apple.jpg",
      },
      back: {
        word: "apple",
        definition: "A fruit with red or green skin.",
        example: "He picked an apple from the tree.",
      },
      question: {
        type: "write",
      },
      backsideType: "answer",
      flipMode: "manual",
    },
  },
};
