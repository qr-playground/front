import QRCodeStyling from "qr-code-styling";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQRCodeEvent, getUserQrCodes } from "../../api/qrcode";
import { useAuth } from "../../context/AuthContext";
import "./MyQrCodes.css";

interface QrCodeItem {
  id: string;
  shortId: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  eventInfo: {
    entryStartAt: string;
    entryEndAt: string;
  };
  design: {
    backgroundColor: string;
    pointColor: string;
    errorCorrectionLevel: string;
  };
  benefitInfo: {
    maxAttendeeCount: number;
    availableAttendeeCount: number;
    isAttendeeCountLimited: boolean;
  };
}

// 서버에서 반환하는 QR 코드 정보 타입
interface QrcodeResponse {
  success: boolean;
  status: number;
  data: {
    qrcodeInfo: {
      qrcodeEventInfo: {
        id: string; // UUID지만 문자열로 처리
        shortId: string;
        title: string;
        description: string;
        secretCode: string;
        entryStartAt: string; // LocalDateTime이지만 문자열로 처리
        entryEndAt: string; // LocalDateTime이지만 문자열로 처리
        isEntryEnded: boolean;
      };
      qrcodeDesignInfo: {
        id: string; // UUID지만 문자열로 처리
        errorCorrectionLevel: string;
        includeMargin: boolean;
        backgroundColor: string;
        pointColor: string;
        size: number;
        dotType: string;
        logoVisualSize: number | null;
        logoVisualRatio: number | null;
        logoImageId: string | null; // UUID지만 문자열로 처리
      };
      qrcodeBenefitInfo: {
        id: string; // UUID지만 문자열로 처리
        maxAttendeeCount: number;
        availableAttendeeCount: number;
        isAttendeeCountLimited: boolean;
      };
    };
  };
  timestamp: string;
}

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type DotType =
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "square"
  | "extra-rounded";

interface QrCodeModalProps {
  shortId: string;
  onClose: () => void;
  formatDate: (dateString: string) => string;
}

// QR 코드 모달 컴포넌트
const QrCodeModal: React.FC<QrCodeModalProps> = ({
  shortId,
  onClose,
  formatDate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QrcodeResponse | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // 두 날짜 사이의 시간 간격 계산 함수
  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 밀리초 단위 차이
    const diff = end.getTime() - start.getTime();

    // 모든 시간을 시간과 분으로 환산
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // 시간이 0이면 분만 표시
    if (totalHours === 0) {
      return `${minutes}분`;
    }

    // 분이 0이면 시간만 표시
    if (minutes === 0) {
      return `${totalHours}시간`;
    }

    // 시간과 분 모두 표시 (앞에 0 붙이지 않음)
    return `${totalHours}시간 ${minutes}분`;
  };

  // QR 코드 데이터 가져오기
  useEffect(() => {
    const fetchQrCodeData = async () => {
      try {
        console.log("QR 코드 데이터 가져오기 시작", shortId);
        setLoading(true);

        // 실제 API 호출로 변경
        const response = await getQRCodeEvent(shortId);
        setQrData(response); // API 응답을 직접 상태에 설정
        console.log("QR 코드 데이터 가져오기 성공", response);

        setLoading(false);
      } catch (err) {
        console.error("QR 코드 데이터 가져오기 실패:", err);
        setError("QR 코드 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchQrCodeData();
  }, [shortId]);

  // DOM이 렌더링된 후 QR 코드 생성을 위한 별도의 useEffect
  useEffect(() => {
    // qrData가 있고 loading이 false이고 previewRef.current가 있을 때만 실행
    if (qrData && !loading && previewRef.current) {
      generateQrCode(qrData);
    }
  }, [qrData, loading, previewRef.current]);

  // QR 코드 생성 함수
  const generateQrCode = (qrData: QrcodeResponse) => {
    try {
      console.log("QR 코드 생성 시도", previewRef.current);

      if (!previewRef.current) {
        console.error("previewRef가 없습니다");
        return;
      }

      // 기존 내용 제거
      previewRef.current.innerHTML = "";

      const { qrcodeEventInfo, qrcodeDesignInfo } = qrData.data.qrcodeInfo;

      // QR 코드에 포함될 URL 생성
      const url = `${window.location.origin}/guestbook/${qrcodeEventInfo.shortId}`;
      console.log("생성할 QR 코드 URL:", url);

      // errorCorrectionLevel 처리
      const errorLevel: ErrorCorrectionLevel = ["L", "M", "Q", "H"].includes(
        qrcodeDesignInfo.errorCorrectionLevel
      )
        ? (qrcodeDesignInfo.errorCorrectionLevel as ErrorCorrectionLevel)
        : "H";

      // dotType 처리
      const dotType: DotType = (
        [
          "rounded",
          "dots",
          "classy",
          "classy-rounded",
          "square",
          "extra-rounded",
        ].includes(qrcodeDesignInfo.dotType)
          ? qrcodeDesignInfo.dotType
          : "square"
      ) as DotType;

      // QR 코드 옵션 설정
      const containerWidth = window.innerWidth < 768 ? 250 : 280; // 모바일에서는 더 작게
      const qr = new QRCodeStyling({
        width: containerWidth,
        height: containerWidth,
        data: url,
        margin: 5, // 여백 설정
        dotsOptions: {
          color: qrcodeDesignInfo.pointColor || "#000000",
          type: dotType,
        },
        backgroundOptions: {
          color: qrcodeDesignInfo.backgroundColor || "#FFFFFF",
        },
        qrOptions: {
          errorCorrectionLevel: errorLevel,
        },
      });

      qrCodeRef.current = qr;

      // QR 코드 추가
      qr.append(previewRef.current);
      console.log("QR 코드 생성 성공");
    } catch (err) {
      console.error("QR 코드 생성 오류:", err);
      setError("QR 코드를 생성하는데 실패했습니다.");
      setLoading(false);
    }
  };

  // QR 코드 다운로드 핸들러
  const handleDownload = () => {
    console.log("QR 코드 다운로드 시도", qrCodeRef.current);
    if (!qrCodeRef.current || !qrData) return;

    try {
      // QR 코드의 Canvas 얻기
      const canvas = previewRef.current?.querySelector("canvas");
      if (!canvas) {
        console.error("Canvas 요소를 찾을 수 없습니다.");
        return;
      }

      // 결합할 새 Canvas 생성
      const resultCanvas = document.createElement("canvas");
      const ctx = resultCanvas.getContext("2d");
      if (!ctx) {
        console.error("Canvas 컨텍스트를 생성할 수 없습니다.");
        return;
      }

      // QR 코드 Canvas 크기 가져오기
      const qrWidth = canvas.width;
      const qrHeight = canvas.height;

      // 여백과 전체 크기 계산
      const padding = 40;
      const borderRadius = 12;
      const topHeaderHeight = 80; // 상단 헤더 영역
      const infoHeight = 180; // 설명 영역 높이 (기존 120에서 증가)
      const dividerHeight = 2; // 구분선 높이
      const dividerMargin = 20; // 구분선 위아래 여백
      const lineSpacing = 22; // 텍스트 줄 간격

      // 결과 Canvas 크기 설정
      resultCanvas.width = qrWidth + padding * 2;
      resultCanvas.height =
        topHeaderHeight + qrHeight + infoHeight + padding * 2;

      // 백그라운드 그라데이션
      const gradient = ctx.createLinearGradient(0, 0, 0, resultCanvas.height);
      gradient.addColorStop(0, "#f8f9fa");
      gradient.addColorStop(1, "#e9ecef");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

      // 테두리가 있는 흰색 카드 배경 그리기
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      roundRect(
        ctx,
        padding / 2,
        padding / 2,
        resultCanvas.width - padding,
        resultCanvas.height - padding,
        borderRadius
      );

      // 그림자 리셋
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 헤더 영역 (상단 색상 영역)
      ctx.fillStyle = "#3b82f6"; // 파란색 통일
      roundRectTop(
        ctx,
        padding / 2,
        padding / 2,
        resultCanvas.width - padding,
        topHeaderHeight,
        borderRadius
      );

      // 헤더 텍스트
      const title = qrData.data.qrcodeInfo.qrcodeEventInfo.title || "QR 코드";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        title,
        resultCanvas.width / 2,
        padding / 2 + topHeaderHeight / 2 + 8
      );

      // QR 코드 이미지 그리기 (중앙에 배치)
      const qrX = (resultCanvas.width - qrWidth) / 2;
      const qrY = padding / 2 + topHeaderHeight + padding / 2;
      ctx.drawImage(canvas, qrX, qrY, qrWidth, qrHeight);

      // 구분선 그리기
      const dividerY = qrY + qrHeight + dividerMargin;
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(
        padding + 20,
        dividerY,
        resultCanvas.width - padding * 2 - 40,
        dividerHeight
      );

      // 정보 텍스트 영역 시작 Y 위치
      let currentTextY = dividerY + dividerMargin + 20;

      // 시작 시간
      const entryStartAt = qrData.data.qrcodeInfo.qrcodeEventInfo.entryStartAt;
      if (entryStartAt) {
        ctx.fillStyle = "#555555";
        ctx.font = "15px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `시작: ${formatDate(entryStartAt)}`,
          resultCanvas.width / 2,
          currentTextY
        );
        currentTextY += lineSpacing;
      }

      // 종료 시간
      const entryEndAt = qrData.data.qrcodeInfo.qrcodeEventInfo.entryEndAt;
      if (entryEndAt) {
        ctx.fillStyle = "#555555";
        ctx.font = "15px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `종료: ${formatDate(entryEndAt)}`,
          resultCanvas.width / 2,
          currentTextY
        );
        currentTextY += lineSpacing;
      }

      // 최대 참여 인원
      const maxAttendeeCount =
        qrData.data.qrcodeInfo.qrcodeBenefitInfo.maxAttendeeCount;
      if (maxAttendeeCount !== null && maxAttendeeCount !== undefined) {
        ctx.fillStyle = "#555555";
        ctx.font = "15px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `최대 인원: ${maxAttendeeCount}명`,
          resultCanvas.width / 2,
          currentTextY
        );
        currentTextY += lineSpacing;
      }

      // 설명 텍스트 (위치를 currentTextY 기준으로 조정)
      const description =
        qrData.data.qrcodeInfo.qrcodeEventInfo.description || "";
      const shortIdText = qrData.data.qrcodeInfo.qrcodeEventInfo.shortId || ""; // shortIdText로 변경

      ctx.fillStyle = "#333333";
      ctx.font = "16px Arial, sans-serif";
      ctx.textAlign = "center";
      const maxWidth = resultCanvas.width - padding * 2 - 40;

      if (description) {
        wrapText(
          ctx,
          description,
          resultCanvas.width / 2,
          currentTextY, // 수정된 Y 위치
          maxWidth,
          24 // wrapText 내의 lineHeight
        );
      }

      // 바닥글 (코드 정보) - Y 위치는 이전과 동일하게 유지 (하단에 고정)
      ctx.fillStyle = "#6c757d";
      ctx.font = "13px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `입장 코드: ${shortIdText}`,
        resultCanvas.width / 2,
        resultCanvas.height - padding / 2 - 15
      );

      // 다운로드 링크 생성
      const dataUrl = resultCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qrcode-${shortIdText}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("QR 코드 다운로드 오류:", err);
      // 대체 다운로드 방법 (실패한 경우를 대비한 기본 방식)
      try {
        // shortIdText를 qrData에서 다시 가져오도록 수정
        const fallbackShortId =
          qrData?.data.qrcodeInfo.qrcodeEventInfo.shortId || "code";
        qrCodeRef.current.download({
          name: `qrcode-${fallbackShortId}`,
          extension: "png",
        });
      } catch (fallbackErr) {
        console.error("기본 다운로드 방식도 실패:", fallbackErr);
      }
    }
  };

  // 둥근 모서리 직사각형 그리기 유틸리티 함수
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  // 상단 부분만 둥근 모서리 처리하는 함수
  const roundRectTop = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  // 텍스트 줄바꿈 함수
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let testLine = "";
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = words[n] + " ";
        lineCount++;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y + lineCount * lineHeight);
  };

  if (error) {
    return (
      <div className="qr-modal-overlay" onClick={onClose}>
        <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="qr-modal-header">
            <h2>오류 발생</h2>
            <button className="qr-modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="qr-modal-body">
            <div className="qr-modal-error">
              <p>{error}</p>
              <button onClick={onClose} className="retry-button">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h2>{qrData?.data.qrcodeInfo.qrcodeEventInfo.title || "QR 코드"}</h2>
          <button className="qr-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="qr-modal-body">
          {loading ? (
            <div className="qr-modal-loading">
              <div className="loading-spinner" />
              <p>QR 코드를 생성 중입니다...</p>
            </div>
          ) : (
            <>
              <div className="qr-code-container" ref={previewRef}></div>
              <div className="qr-code-info">
                <table className="qr-info-table">
                  <tbody>
                    <tr>
                      <td className="info-label">입장 코드:</td>
                      <td className="info-value">
                        {qrData?.data.qrcodeInfo.qrcodeEventInfo.shortId ||
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="info-label">설명:</td>
                      <td className="info-value">
                        {qrData?.data.qrcodeInfo.qrcodeEventInfo.description ||
                          "설명 없음"}
                      </td>
                    </tr>
                    <tr>
                      <td className="info-label">시작 시간:</td>
                      <td className="info-value">
                        {formatDate(
                          qrData?.data.qrcodeInfo.qrcodeEventInfo
                            .entryStartAt || ""
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="info-label">종료 시간:</td>
                      <td className="info-value">
                        {formatDate(
                          qrData?.data.qrcodeInfo.qrcodeEventInfo.entryEndAt ||
                            ""
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="info-label">유지 시간:</td>
                      <td className="info-value">
                        {qrData
                          ? calculateDuration(
                              qrData.data.qrcodeInfo.qrcodeEventInfo
                                .entryStartAt,
                              qrData.data.qrcodeInfo.qrcodeEventInfo.entryEndAt
                            )
                          : ""}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="qr-code-actions">
                <button className="qr-download-button" onClick={handleDownload}>
                  QR 코드 다운로드
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MyQrCodes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState<QrCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQrCodeId, setSelectedQrCodeId] = useState<string | null>(null);

  useEffect(() => {
    // AuthContext가 로딩 중일 때는 리다이렉트하지 않음
    if (isLoading) return;

    // 비로그인 사용자는 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchQrCodes = async () => {
      try {
        setLoading(true);
        const response = await getUserQrCodes();
        setQrCodes(response.data.qrcodes);
        setError(null);
      } catch (err) {
        console.error("QR 코드 목록 조회 오류:", err);
        setError("QR 코드 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQrCodes();
  }, [isAuthenticated, navigate, isLoading]);

  // QR 코드 상세 정보 모달 표시
  const showQrCodeModal = (shortId: string) => {
    setSelectedQrCodeId(shortId);
  };

  // 모달 닫기
  const closeQrCodeModal = () => {
    setSelectedQrCodeId(null);
  };

  // 날짜 포맷 함수 - 시간과 분까지 표시하도록 수정
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // QR 코드 상태 확인 (시작 시간과 종료 시간을 모두 고려)
  const getQrStatus = (
    startDate: string,
    endDate: string
  ): { status: string; className: string } => {
    const now = new Date();
    const startAt = new Date(startDate);
    const endAt = new Date(endDate);

    if (now < startAt) {
      // 시작 시간보다 이전이면 "예정됨"
      return { status: "예정됨", className: "qr-status-pending" };
    } else if (now > endAt) {
      // 종료 시간보다 이후면 "만료됨"
      return { status: "만료됨", className: "qr-status-expired" };
    } else {
      // 시작 시간과 종료 시간 사이면 "활성"
      return { status: "활성", className: "qr-status-active" };
    }
  };

  if (loading) {
    return (
      <div className="my-qrcodes-container">
        <div className="my-qrcodes-header">
          <h1>내 QR 코드 목록</h1>
        </div>
        <div className="loading-message">
          <div className="loading-spinner" />
          <p>QR 코드 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-qrcodes-container">
        <div className="my-qrcodes-header">
          <h1>내 QR 코드 목록</h1>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => navigate(0)} // 페이지 새로고침
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-qrcodes-container">
      <div className="my-qrcodes-header">
        <h1>내 QR 코드 목록</h1>
      </div>

      <div className="qrcode-actions">
        <p className="qrcode-count">
          총 <span className="qrcode-count-highlight">{qrCodes.length}</span>
          개의 QR 코드가 있습니다.
        </p>
        <Link to="/generator" className="create-qrcode-button">
          + 새 QR 코드 만들기
        </Link>
      </div>

      {qrCodes.length > 0 ? (
        <div className="qrcode-list">
          {qrCodes.map((qrCode) => {
            const { status, className } = getQrStatus(
              qrCode.eventInfo.entryStartAt,
              qrCode.eventInfo.entryEndAt
            );

            return (
              <div key={qrCode.id} className="qrcode-card">
                <div className="qrcode-card-header">
                  <h2 className="qrcode-title">{qrCode.title}</h2>
                  <span className={`qrcode-status ${className}`}>{status}</span>
                </div>
                <p className="qrcode-description">{qrCode.description}</p>
                <div className="qrcode-info">
                  <div className="qrcode-info-item">
                    <span className="info-label">생성일:</span>
                    <span className="info-value">
                      {formatDate(qrCode.createdAt)}
                    </span>
                  </div>
                  <div className="qrcode-info-item">
                    <span className="info-label">시작일:</span>
                    <span className="info-value">
                      {formatDate(qrCode.eventInfo.entryStartAt)}
                    </span>
                  </div>
                  <div className="qrcode-info-item">
                    <span className="info-label">종료일:</span>
                    <span className="info-value">
                      {formatDate(qrCode.eventInfo.entryEndAt)}
                    </span>
                  </div>
                  <div className="qrcode-info-item">
                    <span className="info-label">참여자 수:</span>
                    <span className="info-value">
                      {qrCode.benefitInfo.maxAttendeeCount -
                        qrCode.benefitInfo.availableAttendeeCount}
                      명
                    </span>
                  </div>
                  <div className="qrcode-info-item">
                    <span className="info-label">최대 인원:</span>
                    <span className="info-value">
                      {qrCode.benefitInfo.maxAttendeeCount}명
                    </span>
                  </div>
                </div>
                <div className="qrcode-actions">
                  <button
                    onClick={() => showQrCodeModal(qrCode.shortId)}
                    className="qrcode-action-button view-button"
                  >
                    QR 코드 보기
                  </button>
                  <Link
                    to={`/settings/my-qrcodes/${qrCode.shortId}/result`}
                    className="qrcode-action-button results-button"
                  >
                    결과 보기
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>등록된 QR 코드가 없습니다.</p>
          <p>새 QR 코드를 생성해보세요!</p>
        </div>
      )}

      <div className="back-navigation">
        <button onClick={() => navigate("/settings")} className="back-button">
          설정으로 돌아가기
        </button>
      </div>

      {/* QR 코드 모달 */}
      {selectedQrCodeId && (
        <QrCodeModal
          shortId={selectedQrCodeId}
          onClose={closeQrCodeModal}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default MyQrCodes;
