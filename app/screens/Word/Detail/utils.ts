import { WordState } from "../type";

type ActionType =
  | "INITIAL"
  | "FULLDATA"
  | "WORD"
  | "SENSE_PARTIAL"
  | "IMAGE_PARTIAL"
  | "COMPLETED";
export const senseDataReducer = (
  state: WordState,
  action: { type: ActionType; payload?: any },
): WordState => {
  switch (action.type) {
    case "INITIAL":
      const { word, senses, images } = action.payload.data;
      const newData = {
        word: state.word,
        senses: state.senses,
        images: state.images,
      };

      if (!newData.word && word) {
        newData.word = word;
      }

      newData.senses = { ...newData.senses, ...senses };
      newData.images = { ...newData.images, ...images };

      return {
        ...state,
        ...newData,
        isLoading: true,
        status: "INITIAL",
      };

    case "FULLDATA":
      return {
        ...state,
        ...action.payload.data,
        status: "COMPLETED",
        isLoading: false,
      };

    case "WORD": {
      return {
        ...state,
        status: "PARTIAL",
        word: action.payload.data,
      };
    }

    case "SENSE_PARTIAL": {
      const sense = action.payload.data;
      if (state.senses[sense.id]) return state;
      return {
        ...state,
        status: "PARTIAL",
        senses: { ...state.senses, ...sense },
      };
    }

    case "IMAGE_PARTIAL": {
      const image = action.payload.data;
      const senseId = Object.keys(image)[0];

      if (state.images[senseId]) return state;

      return {
        ...state,
        status: "PARTIAL",
        images: {
          ...state.images,
          ...image,
        },
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
  if (!sensesObj.word) return null;

  // 1. Nhóm các sense theo pos bằng một Object tạm (Map)
  const grouped = Object.values(sensesObj.senses).reduce(
    (acc, currentSense) => {
      const pos = currentSense.pos || "unknown";

      if (!acc[pos]) {
        acc[pos] = {
          pos: pos,
          senses: [],
        };
      }

      // 2. Chèn sense kèm ảnh vào mảng tương ứng của pos đó
      acc[pos].senses.push({
        ...currentSense,
        image: sensesObj.images[currentSense.id] || null,
      });

      return acc;
    },
    {} as Record<string, { pos: string; senses: any[] }>,
  );

  // 3. Chuyển Object tạm thành Mảng để mapping (entries)
  return {
    ...sensesObj.word,
    entries: Object.values(grouped),
  };
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
              subId: "s_2",
              languageCode: "en",
              value:
                "To present something formally for discussion in a meeting.",
              translate:
                "Đưa ra một vấn đề gì đó chính thức để thảo luận trong cuộc họp.",
            },
            usage: {
              id: "usg_2",
              subId: "s_2",
              languageCode: "en",
              value: "Used in formal or parliamentary contexts.",
              translate: "Dùng trong bối cảnh trang trọng hoặc nghị trường.",
            },
            translates: ["trình lên", "đưa ra thảo luận"],
            examples: [
              {
                id: "ex_2",
                subId: "s_2",
                languageCode: "en",
                value: "The committee decided to table the report.",
                translate: "Ủy ban đã quyết định đưa bản báo cáo ra thảo luận.",
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
