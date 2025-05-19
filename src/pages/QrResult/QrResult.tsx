import QRCodeStyling from "qr-code-styling";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getImage } from "../../api/image";
import { getQRCodeEvent } from "../../api/qrcode";
import "./QrResult.css";

/* ---------- 타입 선언 ---------- */
interface QrcodeResponse {
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

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
type DotType =
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "square"
  | "extra-rounded";

/* ---------- 컴포넌트 ---------- */
const QrResult: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  /* 상태 */
  const [qrData, setQrData] = useState<QrcodeResponse | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ref */
  const qrRef = useRef<HTMLDivElement>(null);

  /* -----------------------------------
     1) QR-이벤트 & 로고 로드
  ----------------------------------- */
  useEffect(() => {
    if (!shortId) {
      navigate("/generator");
      return;
    }

    let cancelled = false;

    const completeLoading = (url: string | null) => {
      if (cancelled) return;
      setLogoUrl(url);
      setIsReady(true);
      setIsLoading(false);
    };

    const fetchQrCodeData = async () => {
      try {
        setIsLoading(true);
        setIsReady(false);

        const response = await getQRCodeEvent(shortId);
        if (cancelled) return;
        setQrData(response as QrcodeResponse);

        /* 로고 처리 */
        const logoImageId =
          response.data.qrcodeInfo.qrcodeDesignInfo.logoImageId;

        if (!logoImageId) {
          completeLoading(null);
          return;
        }

        const { url } = await getImage(logoImageId);
        if (!url) {
          completeLoading(null);
          return;
        }

        /* preload */
        const preload = new Image();
        preload.crossOrigin = "anonymous";

        let done = false;
        const finish = (u: string | null) => {
          if (done) return;
          done = true;
          clearTimeout(tid);
          completeLoading(u);
        };

        preload.onload = () => finish(url);
        preload.onerror = () => finish(null);

        const tid = setTimeout(() => finish(null), 3000);
        preload.src = url;
      } catch {
        setError("QR 코드 정보를 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };

    fetchQrCodeData();
    return () => {
      cancelled = true;
    };
  }, [shortId, navigate]);

  /* -----------------------------------
     2) QR 코드 생성
  ----------------------------------- */
  useEffect(() => {
    if (!qrData || !isReady || !qrRef.current) return;

    qrRef.current.innerHTML = "";

    try {
      const { qrcodeEventInfo, qrcodeDesignInfo: design } =
        qrData.data.qrcodeInfo;

      const qrSize = design.size || 256;
      const qrValue = `${window.location.origin}/guestbook/${qrcodeEventInfo.shortId}`;

      const errorLevel: ErrorCorrectionLevel = ["L", "M", "Q", "H"].includes(
        design.errorCorrectionLevel
      )
        ? (design.errorCorrectionLevel as ErrorCorrectionLevel)
        : "H";

      const dotType: DotType = (
        [
          "rounded",
          "dots",
          "classy",
          "classy-rounded",
          "square",
          "extra-rounded",
        ].includes(design.dotType)
          ? design.dotType
          : "square"
      ) as DotType;

      const baseOptions = {
        width: qrSize,
        height: qrSize,
        type: "canvas" as const,
        data: qrValue,
        dotsOptions: {
          color: design.pointColor || "#000000",
          type: dotType,
        },
        backgroundOptions: {
          color: design.backgroundColor || "#FFFFFF",
        },
        qrOptions: {
          errorCorrectionLevel: errorLevel,
        },
      };

      const instance =
        logoUrl != null
          ? new QRCodeStyling({
              ...baseOptions,
              image: logoUrl,
              imageOptions: {
                crossOrigin: "anonymous",
                margin: 5,
                hideBackgroundDots: true,
                imageSize:
                  design.logoVisualSize != null
                    ? design.logoVisualSize / qrSize
                    : 0.3,
              },
            })
          : new QRCodeStyling(baseOptions);

      instance.append(qrRef.current);
      setQrCode(instance);
    } catch {
      setError("QR 코드를 생성하는데 문제가 발생했습니다.");
    }
  }, [qrData, logoUrl, isReady]);

  /* -----------------------------------
     3) PNG 다운로드 (Canvas 사용)
  ----------------------------------- */
  const handleDownload = useCallback(async () => {
    if (!qrCode) return;

    try {
      // QR 코드 컨테이너 요소
      const qrContainer = document.querySelector(
        ".qr-code-container"
      ) as HTMLElement;
      if (!qrContainer) return;

      // 타이틀과 설명 요소
      const qrInfo = qrContainer.querySelector(".qr-code-info") as HTMLElement;
      if (!qrInfo) return;

      // QR 코드의 Canvas 얻기
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) {
        setError("Canvas 요소를 찾을 수 없습니다.");
        return;
      }

      // 결합할 새 Canvas 생성
      const resultCanvas = document.createElement("canvas");
      const ctx = resultCanvas.getContext("2d");
      if (!ctx) {
        setError("Canvas 컨텍스트를 생성할 수 없습니다.");
        return;
      }

      // QR 코드 Canvas 크기 가져오기
      const qrWidth = canvas.width;
      const qrHeight = canvas.height;

      // 여백과 전체 크기 계산
      const padding = 40;
      const borderRadius = 12;
      const topHeaderHeight = 80; // 상단 헤더 영역
      const infoHeight = 120; // 설명 영역 높이
      const dividerHeight = 2; // 구분선 높이
      const dividerMargin = 20; // 구분선 위아래 여백

      // 결과 Canvas 크기 설정 (더 크게 설정)
      resultCanvas.width = qrWidth + padding * 2;
      resultCanvas.height =
        topHeaderHeight + qrHeight + infoHeight + padding * 2;

      // 백그라운드 그라데이션 (밝은 색상으로)
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
      const { title } = qrData?.data.qrcodeInfo.qrcodeEventInfo || {
        title: "QR 코드",
      };
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

      // 설명 텍스트
      const description = qrInfo.querySelector("p")?.textContent || "";
      const shortId = qrData?.data.qrcodeInfo.qrcodeEventInfo.shortId || "";

      // 설명 텍스트 (더 멋진 스타일로)
      ctx.fillStyle = "#333333";
      ctx.font = "16px Arial, sans-serif";
      ctx.textAlign = "center";

      // 줄바꿈 처리를 위한 최대 너비 설정
      const maxWidth = resultCanvas.width - padding * 2 - 40;

      if (description) {
        wrapText(
          ctx,
          description,
          resultCanvas.width / 2,
          dividerY + dividerMargin + 20,
          maxWidth,
          24
        );
      }

      // 바닥글 (코드 정보)
      ctx.fillStyle = "#6c757d";
      ctx.font = "13px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `입장 코드: ${shortId}`,
        resultCanvas.width / 2,
        resultCanvas.height - padding / 2 - 15
      );

      // 다운로드 링크 생성
      const dataUrl = resultCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      const { shortId: fileId } = qrData?.data.qrcodeInfo.qrcodeEventInfo || {};
      link.download = `qr-${fileId || "code"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      setError("PNG로 내보내기에 실패했습니다.");
    }
  }, [qrCode, qrData]);

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

  /* -----------------------------------
     4) 렌더링
  ----------------------------------- */
  if (isLoading)
    return (
      <div className="qr-result-container loading">
        <div className="loading-spinner" />
        <p>QR 코드를 준비하고 있습니다...</p>
      </div>
    );

  if (error)
    return (
      <div className="qr-result-container error">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/generator")}>
            QR 생성 페이지로 돌아가기
          </button>
        </div>
      </div>
    );

  if (!qrData) return null;

  const { qrcodeEventInfo } = qrData.data.qrcodeInfo;

  return (
    <div className="qr-result-container">
      <div className="qr-result-card">
        <div className="qr-result-header">
          <h2>QR 코드 생성 완료!</h2>
        </div>

        <div className="qr-result-content">
          <div className="qr-info">
            <div className="qr-detail">
              <p>
                <span className="label">입장 코드:</span>
                <span className="value">{qrcodeEventInfo.shortId}</span>
              </p>
              <p>
                <span className="label">시작 시간:</span>
                <span className="value">
                  {new Date(qrcodeEventInfo.entryStartAt).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="label">종료 시간:</span>
                <span className="value">
                  {new Date(qrcodeEventInfo.entryEndAt).toLocaleString()}
                </span>
              </p>
              {qrcodeEventInfo.secretCode && (
                <p>
                  <span className="label">비밀 코드:</span>
                  <span className="value">{qrcodeEventInfo.secretCode}</span>
                </p>
              )}
            </div>
          </div>

          {/* ---- QR 코드 & 설명 ---- */}
          <div className="qr-code-container">
            <div ref={qrRef} className="qr-code" />
            <div className="qr-code-info" style={{ textAlign: "center" }}>
              <h2>{qrcodeEventInfo.title}</h2>
              {qrcodeEventInfo.description && (
                <p className="description">{qrcodeEventInfo.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="qr-result-actions">
          <button className="btn-download" onClick={handleDownload}>
            PNG 다운로드
          </button>
          <button className="btn-back" onClick={() => navigate("/generator")}>
            새 QR 코드 만들기
          </button>
          <button className="btn-home" onClick={() => navigate("/")}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrResult;
