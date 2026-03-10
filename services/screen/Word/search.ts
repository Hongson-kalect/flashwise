import { getTranslateRoomId } from "@/utils/socket";

export function searchWord(val:string) {
    
}

export function searchWordDetail(val:string) {
    const [userLangCode, targetLangCode] = ["vi", "en"]; // Get from state
    const socketRoom = getTranslateRoomId(val, userLangCode, targetLangCode);

    
}