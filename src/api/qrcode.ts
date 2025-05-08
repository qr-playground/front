import api from "./axios";
import { QrcodeEventData } from "./types";

// 서버에서 반환하는 QR 코드 이벤트 응답 구조
export interface ServerQrcodeResponse {
  success: boolean;
  status: number;
  data: {
    qrcodeInfo: {
      qrcodeEventInfo: {
        id: string;
        shortId: string;
        title: string;
        description: string;
        secretCode: string;
        entryStartAt: string;
        entryEndAt: string;
      };
      qrcodeDesignInfo: {
        id: string;
        errorCorrectionLevel: string;
        includeMargin: boolean;
        backgroundColor: string;
        pointColor: string;
        size: number;
        dotType: string;
        logoVisualSize: number | null;
        logoVisualRatio: number | null;
        logoImageId: string | null;
      };
    };
  };
  timestamp: string;
}

// QR 코드 생성 API 호출
export const createQRCode = async (
  data: QrcodeEventData
): Promise<ServerQrcodeResponse> => {
  const response = await api.post("/qrcode/event", data);
  return response.data;
};

// QR 코드 이벤트 조회 API 호출
export const getQRCodeEvent = async (
  shortId: string
): Promise<ServerQrcodeResponse> => {
  const response = await api.get(`/qrcode/event/${shortId}`);
  return response.data;
};

// 레거시 함수들은 유지 (사용되는 곳이 있을 수 있음)
export const getQRCodes = async () => {
  const response = await api.get("/qrcode/event");
  return response.data;
};

export const getQRCodeById = async (id: number) => {
  const response = await api.get(`/qrcode/event/${id}`);
  return response.data;
};

export const updateQRCode = async (
  id: number,
  data: Partial<QrcodeEventData>
) => {
  const response = await api.put(`/qrcode/event/${id}`, data);
  return response.data;
};

export const deleteQRCode = async (id: number): Promise<void> => {
  await api.delete(`/qrcode/event/${id}`);
};
