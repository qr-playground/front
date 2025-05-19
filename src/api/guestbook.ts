import api from "./axios";
import { GuestbookRequest } from "./types";

/**
 * 방명록 작성 API
 * @param request 방명록 데이터
 * @returns 성공적으로 생성된 방명록 정보
 */
export const createGuestbook = async (request: GuestbookRequest) => {
  try {
    // shortId는 URL에 사용하고, 요청 본문에서는 제외
    const { shortId, ...requestBody } = request;

    // 실제 API 호출
    const response = await api.post(`/qrcode/${shortId}/guestbook/`, requestBody);

    return response.data;
  } catch (error) {
    console.error("방명록 작성 실패:", error);
    throw error;
  }
};

/**
 * 방명록 목록 조회 API (페이지네이션 지원)
 * @param shortId QR 코드 이벤트 ID
 * @param page 페이지 번호 (1부터 시작)
 * @param size 페이지당 항목 수
 * @returns 방명록 목록 및 페이지네이션 정보
 */
export const getGuestbooksPaginated = async (
  shortId: string,
  page: number = 1,
  size: number = 10
) => {
  try {
    // 실제 API 호출
    const response = await api.get(`/qrcode/${shortId}/guestbook/`, {
      params: {
        page: page - 1, // 서버는 0부터 페이지 시작할 수 있음
        size,
      },
    });

    return response.data;
  } catch (error) {
    console.error("방명록 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 방명록 목록 조회 API (레거시 - 구버전 호환용)
 * @param shortId QR 코드 이벤트 ID
 * @returns 방명록 목록
 */
export const getGuestbooks = async (shortId: string) => {
  console.log(`레거시 방명록 조회 API 호출 - shortId: ${shortId}`);
  return getGuestbooksPaginated(shortId, 1, 30);
};
