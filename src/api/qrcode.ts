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
        isEntryEnded: boolean;
        createdAt: string;
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
      qrcodeBenefitInfo: {
        id: string;
        maxAttendeeCount: number;
        availableAttendeeCount: number;
        isAttendeeCountLimited: boolean;
      };
    };
  };
  timestamp: string;
}

/**
 * QR 코드 생성 API
 * @param data QR 코드 생성에 필요한 데이터
 * @returns 생성된 QR 코드 정보
 */
export const createQRCode = async (
  data: QrcodeEventData
): Promise<ServerQrcodeResponse> => {
  const response = await api.post("/qrcode/event", data);

  // 서버에서 shortId만 반환하는 경우를 처리
  if (response.data.data && typeof response.data.data.shortId === "string") {
    // 서버 응답이 shortId만 포함하는 경우, 필요한 구조로 변환
    const shortId = response.data.data.shortId;

    // UTC 시간으로 변환
    const formatDateToUTC = (date: Date) => {
      return date.toISOString();
    };

    // ServerQrcodeResponse 형식으로 변환하여 반환
    return {
      success: true,
      status: 200,
      data: {
        qrcodeInfo: {
          qrcodeEventInfo: {
            id: "", // 서버에서 받지 못한 정보
            shortId: shortId,
            title: data.title,
            description: data.description,
            secretCode: data.secretCode || "",
            entryStartAt: data.entryStartAt,
            entryEndAt: data.entryEndAt,
            isEntryEnded: false,
            createdAt: formatDateToUTC(new Date()),
          },
          qrcodeDesignInfo: {
            id: "", // 서버에서 받지 못한 정보
            errorCorrectionLevel: data.errorCorrectionLevel,
            includeMargin: data.includeMargin,
            backgroundColor: data.backgroundColor,
            pointColor: data.pointColor,
            size: data.size,
            dotType: data.dotType,
            logoVisualSize: data.logoVisualSize || null,
            logoVisualRatio: data.logoVisualRatio || null,
            logoImageId: data.logoImageId || null,
          },
          qrcodeBenefitInfo: {
            id: "",
            maxAttendeeCount: 0,
            availableAttendeeCount: 0,
            isAttendeeCountLimited: false,
          },
        },
      },
      timestamp: formatDateToUTC(new Date()),
    };
  }

  // 이미 적절한 형식으로 응답이 왔다면 그대로 반환
  return response.data;
};

/**
 * QR 코드 이벤트 조회 API
 * @param shortId QR 코드 단축 ID
 * @returns QR 코드 이벤트 정보
 */
export const getQRCodeEvent = async (
  shortId: string
): Promise<ServerQrcodeResponse> => {
  const response = await api.get(`/qrcode/event/${shortId}`);
  return response.data;
};

/**
 * 사용자의 QR 코드 목록 조회 API
 * @returns 사용자가 생성한 QR 코드 목록
 */
export const getUserQrCodes = async () => {
  try {
    const response = await api.get("/qrcode/event/user");
    console.log("서버 응답 원본:", response.data);

    // 서버 응답이 없는 경우 기본값 반환
    if (!response.data || !response.data.data) {
      console.error("서버 응답 데이터가 없음");
      return {
        success: true,
        status: 200,
        data: {
          qrcodes: [],
          totalCount: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 서버 응답 형식을 클라이언트가 기대하는 형식으로 변환
    const qrcodeInfos = response.data.data.qrcodeInfos || [];
    console.log("QR 코드 정보 배열:", qrcodeInfos);

    // QR 코드 목록을 클라이언트가 기대하는 형식으로 변환
    const qrcodes = qrcodeInfos.map(
      (info: ServerQrcodeResponse["data"]["qrcodeInfo"]) => {
        const { qrcodeEventInfo, qrcodeDesignInfo, qrcodeBenefitInfo } = info;

        // UTC 시간으로 변환 (서버에서 받은 데이터 처리용)
        const formatDateToUTC = (dateString: string) => {
          if (!dateString) return new Date().toISOString();
          const date = new Date(dateString);
          return date.toISOString();
        };

        return {
          id: qrcodeEventInfo.id,
          shortId: qrcodeEventInfo.shortId,
          title: qrcodeEventInfo.title,
          description: qrcodeEventInfo.description,
          url: `${window.location.origin}/qr/${qrcodeEventInfo.shortId}`, // 클라이언트에서 생성
          createdAt: qrcodeEventInfo.createdAt || qrcodeEventInfo.entryStartAt, // 서버 DTO에 createdAt이 있으면 사용, 없으면 entryStartAt (fallback)
          updatedAt: formatDateToUTC(new Date().toISOString()), // 현재 API 응답에 없음, 임시로 현재 시간
          eventInfo: {
            entryStartAt: qrcodeEventInfo.entryStartAt,
            entryEndAt: qrcodeEventInfo.entryEndAt,
            // participantsCount는 benefitInfo에서 계산하므로 제거
          },
          design: {
            backgroundColor: qrcodeDesignInfo.backgroundColor,
            pointColor: qrcodeDesignInfo.pointColor,
            errorCorrectionLevel: qrcodeDesignInfo.errorCorrectionLevel,
          },
          benefitInfo: {
            // 추가된 정보
            maxAttendeeCount: qrcodeBenefitInfo.maxAttendeeCount,
            availableAttendeeCount: qrcodeBenefitInfo.availableAttendeeCount,
            isAttendeeCountLimited: qrcodeBenefitInfo.isAttendeeCountLimited,
          },
        };
      }
    );

    console.log("변환된 QR 코드 목록:", qrcodes);

    // 시간대 정보를 유지하는 ISO 문자열 형식 생성 (Z 제거) - 이 함수는 위에서 이미 정의됨. 중복 제거.
    // const formatDateToLocalISOString = (date: Date) => {
    //   const pad = (num: number) => String(num).padStart(2, "0");
    //   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    //     date.getDate()
    //   )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    //     date.getSeconds()
    //   )}`;
    // };

    // 클라이언트가 기대하는 응답 형식으로 반환
    return {
      success: true,
      status: 200,
      data: {
        qrcodes: qrcodes,
        totalCount: response.data.data.totalCount || qrcodes.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("QR 코드 목록 조회 오류:", error);
    throw error;
  }
};

/**
 * QR 코드 이벤트 검색 API (PGroonga Fuzzy 검색 + 페이지네이션)
 * @param keyword 검색 키워드
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @returns 검색된 QR 코드 이벤트 목록 + 페이지네이션 정보
 */
export const searchQRCodeEvents = async (
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<{
  success: boolean;
  status: number;
  data: {
    qrcodes: QrcodeEventData[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  };
  timestamp: string;
}> => {
  try {
    const response = await api.get("/qrcode/event/search", {
      params: {
        keyword,
        page,
        size,
      },
    });

    console.log("서버 검색 응답:", response.data);

    // 서버 응답: QrcodeEventDto.ListResponse
    const serverData = response.data.data || response.data;
    const qrcodeInfos = serverData.qrcodeInfos || [];
    const pagination = serverData.pagination || {};

    // 서버 응답을 클라이언트가 기대하는 형식으로 변환
    const qrcodes: QrcodeEventData[] = qrcodeInfos.map((info: any) => {
      const { qrcodeEventInfo, qrcodeDesignInfo, qrcodeBenefitInfo } = info;

      return {
        id: qrcodeEventInfo.id,
        shortId: qrcodeEventInfo.shortId,
        title: qrcodeEventInfo.title,
        description: qrcodeEventInfo.description,
        secretCode: qrcodeEventInfo.secretCode,
        entryStartAt: qrcodeEventInfo.entryStartAt,
        entryEndAt: qrcodeEventInfo.entryEndAt,
        isEntryEnded: qrcodeEventInfo.isEntryEnded,
        createdAt: qrcodeEventInfo.createdAt,

        // Design 정보
        errorCorrectionLevel: qrcodeDesignInfo.errorCorrectionLevel,
        includeMargin: qrcodeDesignInfo.includeMargin,
        backgroundColor: qrcodeDesignInfo.backgroundColor,
        pointColor: qrcodeDesignInfo.pointColor,
        size: qrcodeDesignInfo.size,
        dotType: qrcodeDesignInfo.dotType,
        logoVisualSize: qrcodeDesignInfo.logoVisualSize,
        logoVisualRatio: qrcodeDesignInfo.logoVisualRatio,
        logoImageId: qrcodeDesignInfo.logoImageId,

        // Benefit 정보
        maxAttendeeCount: qrcodeBenefitInfo.maxAttendeeCount,
        availableAttendeeCount: qrcodeBenefitInfo.availableAttendeeCount,
        isAttendeeCountLimited: qrcodeBenefitInfo.isAttendeeCountLimited,
      };
    });

    return {
      success: true,
      status: 200,
      data: {
        qrcodes,
        pagination: {
          totalItems: pagination.totalItems || 0,
          totalPages: pagination.totalPages || 0,
          currentPage: pagination.currentPage || 0,
          pageSize: pagination.pageSize || size,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("QR 코드 이벤트 검색 오류:", error);
    throw error;
  }
};
