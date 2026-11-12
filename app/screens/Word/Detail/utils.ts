import * as Speech from "expo-speech";
import { SenseContentType, SenseType } from "../data";
import { initialState, WordState } from "../type";

type ActionType =
  | "RESET"
  | "INITIAL"
  | "FULLDATA"
  | "WORD"
  | "PARTIAL_SENSE"
  | "PARTIAL_METADATA"
  | "PARTIAL_IMAGE"
  | "PARTIAL_LINKS"
  | "PARTIAL_TRANSLATE"
  | "SENSE_REMOVED"
  | "FULL_SENSE"
  | "REJECTED"
  | "ERROR"
  | "FAILED"
  | "COMPLETED";
const errText = (p: any) =>
  typeof p === "string" ? p : p?.message || p?.detail || undefined;

export const senseDataReducer = (
  state: WordState,
  action: { type: ActionType; payload: any },
): WordState => {
  switch (action.type) {
    case "RESET":
      return {
        ...initialState,
      };
    case "INITIAL": {
      // payload = data của get-word. complete=true (HTTP 200): đã đủ, không chờ socket. formOf: gợi ý "là dạng của …" khi nghĩa này là của từ gốc
      // mà người dùng tra bằng dạng biến cách chưa có mục riêng (get-word trả redirect, hook tra tiếp từ gốc rồi truyền formOf vào đây).
      const { id, value, language_code, senses } = action.payload.data ?? {};
      const complete = !!action.payload.complete;
      // complete (bản đủ từ server): thay hẳn nghĩa, bỏ nghĩa cũ đã bị server loại
      const merged = complete ? {} : { ...state.senses };
      Object.values<SenseType>(senses || {}).forEach((sense) => {
        merged[sense.id] = merged[sense.id]
          ? { ...merged[sense.id], ...sense }
          : sense;
      });

      return {
        ...state,
        id: state.id ?? id,
        value: state.value ?? value,
        languageCode: state.languageCode ?? language_code,
        senses: merged,
        formOf: action.payload.formOf ?? action.payload.data?.form_of ?? null,
        isLoading: !complete,
        status: complete ? "COMPLETED" : "INITIAL",
        error: null,
      };
    }

    // Bản cuối từ socket (như get-word 200): thay toàn bộ, lưu được
    case "FULL_SENSE": {
      const data = action.payload ?? {};
      // Socket gửi `senses` là MẢNG (get-word và local là object theo id): luôn đưa về object khoá theo sense.id, nếu không
      // khoá thành 0, 1, 2... và PARTIAL_IMAGE / PARTIAL_TRANSLATE tới sau (khoá theo id) tạo mục thứ hai cùng id -> trùng tên tab
      const bySenseId: Record<string, SenseType> = {};
      Object.values<SenseType>(data.senses ?? {}).forEach((sense) => {
        if (sense?.id) bySenseId[sense.id] = sense;
      });
      return {
        ...state,
        id: data.id ?? state.id,
        value: data.value ?? state.value,
        languageCode: data.language_code ?? state.languageCode,
        senses: bySenseId,
        isLoading: false,
        status: "COMPLETED",
        error: null,
      };
    }

    case "SENSE_REMOVED": {
      const senses = { ...state.senses };
      (Array.isArray(action.payload) ? action.payload : []).forEach(
        (id: string) => delete senses[id],
      );
      return { ...state, senses };
    }

    case "REJECTED":
      return {
        ...state,
        isLoading: false,
        status: "ERROR",
        // Không dùng chuỗi của server ("Word rejected"): WordStatus có lời giải thích tiếng Việt cho mã rejected
        error: { code: "rejected" },
      };

    case "ERROR":
      return {
        ...state,
        isLoading: false,
        status: "ERROR",
        error: { code: "failed", message: errText(action.payload) },
      };

    // Lỗi HTTP của get-word (payload = WordError)
    case "FAILED":
      return {
        ...state,
        isLoading: false,
        status: "ERROR",
        error: action.payload,
      };

    case "FULLDATA":
      return {
        ...state,
        ...action.payload,
        status: "COMPLETED",
        isLoading: false,
      };

    case "WORD": {
      const { id, value, language_code } = action.payload ?? {};
      return {
        ...state,
        id: id ?? state.id,
        value: value ?? state.value,
        languageCode: language_code ?? state.languageCode,
        status: state.status === "COMPLETED" ? state.status : "PARTIAL",
      };
    }

    case "PARTIAL_SENSE": {
      const senseObj = action.payload;
      const updatedSenses = { ...state.senses };

      // Vòng lặp O(k) với k là số lượng sense được gom trong lượt socket này (thường k = 1 hoặc vài sense)
      Object.keys(senseObj).forEach((senseId) => {
        const currentSense = updatedSenses[senseId];
        const newSenseData = senseObj[senseId];

        updatedSenses[senseId] = currentSense
          ? { ...currentSense, ...newSenseData } // Giữ data cũ, đè imageUrl (hoặc các prop ảnh khác) lên
          : { id: senseId, ...newSenseData }; // Phòng thủ nếu sense chưa khởi tạo
      });

      return {
        ...state,
        senses: updatedSenses,
      };
    }
    case "PARTIAL_IMAGE": {
      const imageObj = action.payload;
      const updatedSenses = { ...state.senses };

      // Vòng lặp O(k) với k là số lượng sense được gom trong lượt socket này (thường k = 1 hoặc vài sense)
      Object.keys(imageObj).forEach((senseId) => {
        const currentSense = updatedSenses[senseId];
        const newSenseData = imageObj[senseId];

        updatedSenses[senseId] = currentSense
          ? { ...currentSense, image_preview: newSenseData } // Giữ data cũ, đè imageUrl (hoặc các prop ảnh khác) lên
          : { id: senseId, image_preview: newSenseData }; // Phòng thủ nếu sense chưa khởi tạo
      });

      return {
        ...state,
        senses: updatedSenses,
      };
    }
    // Server nối nghĩa vào concept sau khi từ đã lưu: payload {senseId: {id, label, status, equivalents}}
    case "PARTIAL_LINKS": {
      const linksObj = action.payload ?? {};
      const updatedSenses = { ...state.senses };
      Object.keys(linksObj).forEach((senseId) => {
        const currentSense = updatedSenses[senseId];
        if (currentSense) updatedSenses[senseId] = { ...currentSense, concept: linksObj[senseId] };
      });
      return { ...state, senses: updatedSenses };
    }
    case "PARTIAL_METADATA": {
      const metadataObj = action.payload;
      const updatedSenses = { ...state.senses };

      // Vòng lặp O(k) với k là số lượng sense được gom trong lượt socket này (thường k = 1 hoặc vài sense)
      Object.keys(metadataObj).forEach((senseId) => {
        const currentSense = updatedSenses[senseId];
        const newSenseData = metadataObj[senseId];

        updatedSenses[senseId] = currentSense
          ? { ...currentSense, metadata: newSenseData } // Giữ data cũ, đè imageUrl (hoặc các prop ảnh khác) lên
          : { id: senseId, metadata: newSenseData }; // Phòng thủ nếu sense chưa khởi tạo
      });

      return {
        ...state,
        senses: updatedSenses,
      };
    }
    case "PARTIAL_TRANSLATE": {
      const translateObj = action.payload;
      const updatedSenses = { ...state.senses };

      // Vòng lặp O(k) với k là số lượng sense được gom trong lượt socket này (thường k = 1 hoặc vài sense)
      Object.keys(translateObj).forEach((senseId) => {
        const currentSense = updatedSenses[senseId];
        const newSenseData = translateObj[senseId];

        updatedSenses[senseId] = currentSense
          ? {
              ...currentSense,
              contents: { ...currentSense.contents, ...newSenseData },
            }
          : { id: senseId, contents: newSenseData }; // Phòng thủ nếu sense chưa khởi tạo
      });

      return {
        ...state,
        senses: updatedSenses,
      };
    }

    case "COMPLETED":
      return {
        ...state,
        isLoading: false,
        status: "COMPLETED",
      };
    // save kiểm tra lại toàn bộ dữ liệu (hoặc ko) => save all data to local

    default:
      return state;
  }
};

export const mapSenses = (sensesObj: WordState) => {
  if (!sensesObj.id) return null;

  // 1. Nhóm các sense theo pos bằng một Object tạm (Map)
  const grouped = Object.values(sensesObj.senses).reduce(
    (acc, currentSense) => {
      const pos = (currentSense.pos || "unknown").toLowerCase();

      if (!acc[pos]) {
        acc[pos] = {
          pos: pos,
          senses: [],
        };
      }

      // 2. Chèn sense kèm ảnh vào mảng tương ứng của pos đó
      acc[pos].senses.push({
        ...currentSense,
      });

      return acc;
    },
    {} as Record<string, { pos: string; senses: any[] }>,
  );

  // 3. Chuyển Object tạm thành Mảng để mapping (entries)
  return {
    id: sensesObj.id,
    value: sensesObj.value,
    languageCode: sensesObj.languageCode,
    entries: Object.values(grouped),
  };
};

export const getLangContent = (content?: SenseContentType, lang?: string) => {
  if (!lang || !content) return null;

  if (content && !!content?.[lang]) {
    return content[lang];
  }
};

export const getLangTranslate = (
  content?: { [lang: string]: string[] },
  lang?: string,
) => {
  if (!lang || !content) return null;

  return content[lang] || [];
};

export const getSenseData = (dispatch: any) => {
  // 1. INITIAL: Trả về thông tin Word và nghĩa Danh từ (Noun)
  // setTimeout(() => {
  //   dispatch({
  //     type: "INITIAL",
  //     payload: {
  //       data: {
  //         word: { id: "w_table", value: "table" },
  //         senses: {
  //           s_1: {
  //             id: "s_1",
  //             pos: "noun",
  //             metadata: { ipa: "/ˈteɪbl/" },
  //             definition: {
  //               id: "def_1",
  //               subId: "s_1",
  //               languageCode: "en",
  //               value:
  //                 "A piece of furniture with a flat top and one or more legs.",
  //               translate:
  //                 "Một món đồ nội thất có mặt phẳng và một hoặc nhiều chân.",
  //             },
  //             usage: {
  //               id: "usg_1",
  //               subId: "s_1",
  //               languageCode: "en",
  //               value: "Commonly used in dining rooms and offices.",
  //               translate: "Thường dùng trong phòng ăn và văn phòng.",
  //             },
  //             translates: ["cái bàn", "mặt bàn"],
  //             examples: [
  //               {
  //                 id: "ex_1",
  //                 subId: "s_1",
  //                 languageCode: "en",
  //                 value: "The books are on the table.",
  //                 translate: "Những cuốn sách đang ở trên bàn.",
  //               },
  //             ],
  //           },
  //         },
  //         images: {
  //           s_1: "https://assets.pbimgs.com/pbimgs/rk/images/dp/wcm/202252/0235/modern-farmhouse-round-pedestal-extending-dining-table-l.jpg",
  //         },
  //       },
  //     },
  //   });
  // }, 3000);

  // 2. SENSE_PARTIAL: Đẩy thêm nghĩa Động từ (Verb) sau 3s
  setTimeout(() => {
    dispatch({
      type: "SENSE_PARTIAL",
      payload: {
        data: {
          s_2: {
            id: "s_2",
            pos: "verb",
            metadata: { ipa: "/ˈteɪbl/" },
            definition: {
              id: "def_2",
              value:
                "To present something formally for discussion in a meeting.",
            },
            usage: {
              id: "usg_2",
              value: "Used in formal or parliamentary contexts.",
            },
            examples: [
              {
                id: "ex_2",
                value: "The committee decided to table the report.",
              },
            ],
          },
        },
      },
    });
  }, 1000);

  // 3. IMAGE_PARTIAL: Sau 5s, ảnh cho nghĩa Verb mới về
  setTimeout(() => {
    dispatch({
      type: "IMAGE_PARTIAL",
      payload: {
        data: {
          s_2: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=500",
        },
      },
    });
  }, 3000);

  // 4. COMPLETED
  setTimeout(() => {
    dispatch({ type: "COMPLETED" });
  }, 4000);
};

export const getTranslate = (dispatch: any) => {
  setTimeout(() => {
    dispatch({
      type: "SENSE_TRANSLATE",
      payload: {
        data: {
          s_2: {
            language_code: "vi",
            definition: {
              id: "def_t_2",
              originId: "def_2",
              value:
                "Đưa ra một vấn đề gì đó chính thức để thảo luận trong cuộc họp.",
            },
            usage: {
              id: "usg_t_2",
              oiriginId: "usg_2",
              value: "Dùng trong bối cảnh trang trọng hoặc nghị trường.",
            },
            translates: ["trình lên", "đưa ra thảo luận"],
            examples: [
              {
                id: "ex_t_2",
                originId: "ex_2",
                value: "Ủy ban đã quyết định đưa bản báo cáo ra thảo luận.",
              },
            ],
          },
          s_1: {
            language_code: "vi",
            definition: {
              id: "def_t_1",
              originId: "def_1",
              value:
                "Đưa ra một vấn đề gì đó chính thức để thảo luận trong cuộc họp.",
            },
            usage: {
              id: "usg_t_1",
              oiriginId: "usg_1",
              value: "Dùng trong bối cảnh trang trọng hoặc nghị trường.",
            },
            translates: ["trình lên", "đưa ra thảo luận"],
            examples: [
              {
                id: "ex_t_1",
                originId: "ex_1",
                value: "Ủy ban đã quyết định đưa bản báo cáo ra thảo luận.",
              },
            ],
          },
        },
      },
    });
  }, 1000);
};

/**
 * Kiểm tra xem dữ liệu WordState đã được dịch đầy đủ sang ngôn ngữ mục tiêu chưa.
 * @param state - Trạng thái của từ hiện tại
 */
export const isTranslationCompleted = (state: WordState): boolean => {
  const { senses } = state;
  const senseIds = Object.keys(senses);

  // Nếu không có sense nào, coi như chưa hoàn thành (hoặc tùy logic của bạn)
  if (senseIds.length === 0) return false;

  return senseIds.every((id) => {
    const sense = senses[id];

    // 1. Kiểm tra translates (mảng string) - Giả định mảng này chứa các từ tương đương đã dịch
    // Nếu bạn yêu cầu phải có ít nhất 1 từ dịch
    const hasTranslates = sense.translates && sense.translates.length > 0;
    if (!hasTranslates) return false;

    // 2. Kiểm tra Definition
    const def = sense.definition;
    const isDefTranslated = def && def.translate?.trim().length > 0;
    if (!isDefTranslated) return false;

    // 3. Kiểm tra Usage
    const usage = sense.usage;
    const isUsageTranslated = usage && usage.translate?.trim().length > 0;
    if (!isUsageTranslated) return false;

    // 4. Kiểm tra Examples (phải dịch toàn bộ các ví dụ trong mảng)
    const hasExamples = sense.examples && sense.examples.length > 0;
    if (!hasExamples) return false;

    const areAllExamplesTranslated = sense.examples.every(
      (ex) => ex.translate?.trim().length > 0,
    );

    return areAllExamplesTranslated;
  });
};

export const textToSpeech = (text: string, language: string = "en") => {
  Speech.speak(text, { language });
};
