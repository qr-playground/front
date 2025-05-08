// 공통 응답 인터페이스
export interface ServerResponse<T> {
  success: boolean;
  status: number;
  data: T;
  timestamp: string;
}

// 사용자 정보 인터페이스
export interface UserInfo {
  id: string; // UUID
  phoneNumber: string;
  role: string;
}

// 토큰 정보 인터페이스
export interface TokenInfo {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

// 인증 응답 데이터 인터페이스
export interface AuthResponseData {
  userInfo: UserInfo;
  tokenInfo: TokenInfo;
}

// 사용자 프로필 인터페이스
export interface UserProfile extends UserInfo {
  createdAt: string;
  updatedAt: string;
  qrcodeInfos?: QRCodeResponse[];
}

// QR 코드 데이터 인터페이스
export interface QrcodeEventData {
  title: string;
  description: string;
  secretCode: string;
  entryStartAt: string;
  entryEndAt: string;
  errorCorrectionLevel: string; // "L" | "M" | "Q" | "H"
  includeMargin: boolean;
  backgroundColor: string;
  pointColor: string;
  size: number;
  dotType: string;
  logoVisualSize?: number;
  logoVisualRatio?: number;
  logoImageId?: string;
}

// QR 코드 응답 인터페이스
export interface QRCodeResponse {
  id: number;
  title: string;
  description: string;
  url: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
