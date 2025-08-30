import api from "./axios";
import { getGuestbooksPaginated } from "./guestbook";
import { getQRCodeEvent } from "./qrcode";

/**
 * QR 코드 제목/설명 수정 API
 * @param shortId QR 코드 단축 ID
 * @param payload { title, description }
 */
export const updateQrCodeMeta = async (
  shortId: string,
  payload: { title: string; description: string }
) => {
  try {
    const response = await api.post(`/qrcode/event/${shortId}/update`, payload);
    return response.data;
  } catch (error) {
    console.error("QR 코드 메타 정보 수정 실패:", error);
    throw error;
  }
};

/**
 * QR 코드 접근 종료 API
 * QR 코드의 entryEndAt을 현재 시간으로 변경하여 더 이상 접근할 수 없게 함
 * @param shortId QR 코드 단축 ID
 * @returns 성공 여부와 메시지
 */
export const terminateQrCode = async (shortId: string) => {
  try {
    // 실제 API 호출
    const response = await api.post(`/qrcode/event/${shortId}/terminate`);
    return response.data;
  } catch (error) {
    console.error("QR 코드 접근 종료 실패:", error);
    throw error;
  }
};

/**
 * QR 코드 삭제 API
 * @param shortId QR 코드 단축 ID
 * @returns 성공 여부와 메시지
 */
export const deleteQrCodeByShortId = async (shortId: string) => {
  try {
    // 실제 API 호출
    const response = await api.post(`/qrcode/event/${shortId}/delete`);
    return response.data;
  } catch (error) {
    console.error("QR 코드 삭제 실패:", error);
    throw error;
  }
};

/**
 * QR 코드 상세 정보와 방명록 데이터를 한 번에 가져오는 API
 * @param shortId QR 코드 단축 ID
 * @param page 방명록 페이지 번호
 * @param size 페이지당 항목 수
 * @returns QR 코드 정보와 방명록 데이터
 */
export const getQrCodeResultData = async (
  shortId: string,
  page: number = 1,
  size: number = 10
) => {
  try {
    // Promise.all을 사용하여 병렬로 두 API 요청 실행
    const [qrCodeData, guestbookData] = await Promise.all([
      getQRCodeEvent(shortId),
      getGuestbooksPaginated(shortId, page, size),
    ]);

    // 통합 데이터 반환
    return {
      success: true,
      status: 200,
      data: {
        qrCodeInfo: qrCodeData.data.qrcodeInfo,
        guestbooks: guestbookData.data.guestbooks,
        pagination: guestbookData.data.pagination,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("QR 코드 결과 데이터 조회 실패:", error);
    throw error;
  }
};
