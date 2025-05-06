import api from "./axios";

export interface QRCodeData {
  value: string;
  title: string;
  description: string;
  bgColor: string;
  fgColor: string;
  size: number;
  includeMargin: boolean;
  level: "L" | "M" | "Q" | "H";
}

export interface QRCodeResponse {
  id: number;
  title: string;
  description: string;
  url: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const createQRCode = async (
  data: QRCodeData
): Promise<QRCodeResponse> => {
  const response = await api.post<QRCodeResponse>("/api/qrcode", data);
  return response.data;
};

export const getQRCodes = async (): Promise<QRCodeResponse[]> => {
  const response = await api.get<QRCodeResponse[]>("/api/qrcode");
  return response.data;
};

export const getQRCodeById = async (id: number): Promise<QRCodeResponse> => {
  const response = await api.get<QRCodeResponse>(`/api/qrcode/${id}`);
  return response.data;
};

export const updateQRCode = async (
  id: number,
  data: Partial<QRCodeData>
): Promise<QRCodeResponse> => {
  const response = await api.put<QRCodeResponse>(`/api/qrcode/${id}`, data);
  return response.data;
};

export const deleteQRCode = async (id: number): Promise<void> => {
  await api.delete(`/api/qrcode/${id}`);
};
