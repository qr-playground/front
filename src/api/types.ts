// 공통 응답 인터페이스
export interface ServerResponse<T> {
  success: boolean;
  status: number;
  data: T;
  timestamp: string;
}

export interface StatisticTotalResponse {
  statisticInfo: {
    totalUserCount: number;
    totalQrcodeEventCount: number;
    totalGuestbookCount: number;
    avgQrcodeEventsPerUser: number;
    avgGuestbooksPerQrcodeEvent: number;
  };
}

// 사용자 정보 인터페이스
export interface UserInfo {
  id: string; // UUID (서버: java.util.UUID)
  phoneNumber: string;
  role: string; // 서버: Role (enum -> string)
}

// 토큰 정보 인터페이스 (서버 AuthDto.Response.TokenInfo와 일치)
export interface TokenInfo {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // 서버: Long
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

// QR 코드 생성 요청 데이터 인터페이스 (클라이언트에서 서버로 전송)
export interface QrcodeEventCreateData {
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
  maxAttendeeCount: number;
}

// QR 코드 데이터 인터페이스 (서버에서 반환되는 완전한 데이터)
export interface QrcodeEventData {
  id: string;
  shortId: string;
  title: string;
  description: string;
  secretCode: string;
  entryStartAt: string;
  entryEndAt: string;
  isEntryEnded: boolean;
  createdAt: string;
  errorCorrectionLevel: string; // "L" | "M" | "Q" | "H"
  includeMargin: boolean;
  backgroundColor: string;
  pointColor: string;
  size: number;
  dotType: string;
  logoVisualSize?: number;
  logoVisualRatio?: number;
  logoImageId?: string;
  maxAttendeeCount: number;
  availableAttendeeCount?: number;
  isAttendeeCountLimited?: boolean;
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

// Guestbook 관련 인터페이스
export interface GuestbookRequest {
  shortId: string;
  deviceId: string;
  name: string;
  phoneNumber?: string; // 선택 사항
  message?: string; // 방명록 메시지 필드 (선택 사항)
}

export interface GuestbookResponse {
  success: boolean;
  status: number;
  data: {
    message: string;
    guestbookId: string;
  };
  timestamp: string;
}

export interface GuestbookListResponse {
  success: boolean;
  status: number;
  data: {
    guestbooks: GuestbookItem[];
  };
  timestamp: string;
}

export interface GuestbookItem {
  id: string;
  name: string;
  phoneNumber?: string;
  message: string;
  createdAt: string;
}
