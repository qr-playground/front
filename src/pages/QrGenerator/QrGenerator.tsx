import { ko } from "date-fns/locale";
import QRCodeStyling from "qr-code-styling";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../../api/image";
import { createQRCode } from "../../api/qrcode";
import { useAuth } from "../../context/AuthContext";
import "./QrGenerator.css";

interface QROptions {
  value: string;
  title: string;
  description: string;
  bgColor: string;
  fgColor: string;
  size: number;
  level: "L" | "M" | "Q" | "H";
  logoImage: string | null;
  logoSize: number;
  logoAspectRatio?: number;
  maxAttendeeCount: number;
}

const DOT_TYPES = [
  { value: "square", label: "사각형" },
  { value: "dots", label: "원형" },
  { value: "rounded", label: "둥근 사각형" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy 둥근" },
  { value: "extra-rounded", label: "더 둥근" },
] as const;

type DotType = (typeof DOT_TYPES)[number]["value"];

const CARD_PADDING = 40;
const TITLE_HEIGHT = 60;
const CARD_WIDTH = 380; // 카드 전체 고정
const CARD_HEIGHT = 520; // 카드 전체 고정

// 디바운스 커스텀 훅
function useDebouncedEffect(
  effect: () => void,
  deps: unknown[],
  delay: number
) {
  const callback = useRef(effect);
  useEffect(() => {
    callback.current = effect;
  }, [effect]);
  useEffect(() => {
    const handler = setTimeout(() => {
      callback.current();
    }, delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

// 5분 단위로 올림하는 함수
function getNextAvailableTime() {
  const now = new Date();
  now.setSeconds(0, 0);
  const next = new Date(now.getTime() + 60 * 60 * 1000); // 1시간 뒤
  const min = next.getMinutes();
  const rounded = Math.ceil(min / 5) * 5;
  if (rounded === 60) {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0);
  } else {
    next.setMinutes(rounded);
  }
  return next;
}

const QrGenerator: React.FC = () => {
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState<QROptions>({
    value: `${window.location.origin}/guestbook/example-shortid`,
    title: "",
    description: "",
    bgColor: "#ffffff",
    fgColor: "#000000",
    size: 250,
    level: "H",
    logoImage: null,
    logoSize: 75,
    logoAspectRatio: 1,
    maxAttendeeCount: 100,
  });
  const [entryStartAt, setEntryStartAt] = useState<Date | null>(
    getNextAvailableTime()
  );
  const [entryDuration, setEntryDuration] = useState(10); // 분 단위, 5~60
  const [useSecret, setUseSecret] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  // const [saved, setSaved] = useState(false); // 미사용 변수 주석 처리
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [dotType, setDotType] = useState<DotType>("square");
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // QR 코드가 카드 중앙에 오도록 위치 계산
  const qrSize = options.size;
  const qrX = (CARD_WIDTH - qrSize) / 2;
  const qrY = CARD_PADDING;

  const getLogoImage = () => options.logoImage || undefined;

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: qrSize,
      height: qrSize,
      data: options.value,
      image: getLogoImage(),
      dotsOptions: {
        color: options.fgColor,
        type: dotType,
      },
      backgroundOptions: {
        color: options.bgColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        imageSize: options.logoImage ? options.logoSize / qrSize : 0,
        margin: 0,
      },
      qrOptions: {
        errorCorrectionLevel: options.level,
      },
    });
    setQrCode(qr);
    qrCodeRef.current = qr;
  }, [
    options.value,
    options.fgColor,
    options.bgColor,
    options.logoImage,
    options.logoSize,
    options.level,
    dotType,
    qrSize,
  ]);

  useDebouncedEffect(
    () => {
      if (!cardCanvasRef.current) return;
      const canvas = cardCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 캔버스 초기화
      ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // 그림자 효과
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.08)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.restore();

      // QR 코드 업데이트 및 그리기
      if (qrCodeRef.current) {
        qrCodeRef.current.update({
          width: qrSize,
          height: qrSize,
        });
        qrCodeRef.current
          .getRawData("png")
          .then((blob: Blob | Buffer | null) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob as Blob);
            const img = new window.Image();
            img.onload = () => {
              ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
              URL.revokeObjectURL(url);

              // 제목
              const titleText = options.title.trim()
                ? options.title
                : "QR 코드";
              ctx.fillStyle = "#333";
              ctx.font = "bold 24px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                titleText,
                CARD_WIDTH / 2,
                qrY + qrSize + TITLE_HEIGHT / 2 + 60
              );

              // 설명
              const descText = options.description.trim()
                ? options.description
                : "QR 코드 설명을 입력하세요.";
              ctx.fillStyle = "#666";
              ctx.font = "16px Arial";
              ctx.textAlign = "center";
              let y = qrY + qrSize + TITLE_HEIGHT + 60;
              const maxWidth = CARD_WIDTH - CARD_PADDING * 2;
              const words = descText.split(" ");
              let line = "";
              for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + " ";
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && i > 0) {
                  ctx.fillText(line, CARD_WIDTH / 2, y);
                  line = words[i] + " ";
                  y += 22;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, CARD_WIDTH / 2, y);
            };
            img.src = url;
          });
      }
    },
    [
      qrCode,
      options.title,
      options.description,
      options.fgColor,
      options.bgColor,
      options.logoImage,
      options.logoSize,
      options.level,
      dotType,
      qrSize,
      CARD_WIDTH,
      CARD_HEIGHT,
      qrX,
      qrY,
    ],
    500
  );

  // const handleCopyUrl = () => { // 미사용 함수 주석 처리
  //   if (options.value) {
  //     navigator.clipboard.writeText(options.value);
  //     alert("QR 코드 URL이 클립보드에 복사되었습니다!");
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
    // setSaved(false);
    setError("");
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);

    setOptions((prev) => {
      const newOptions = {
        ...prev,
        [name]: newValue,
      };

      if (name === "size") {
        const maxLogoSize = Math.floor(newValue * 0.3);
        newOptions.logoSize = Math.min(prev.logoSize, maxLogoSize);
      }

      return newOptions;
    });
    // setSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("이미지 크기는 2MB 이하여야 합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setOptions((prev) => ({
          ...prev,
          logoImage: reader.result as string,
          logoSize: Math.min(prev.logoSize, Math.floor(prev.size * 0.3)),
          logoAspectRatio: aspectRatio,
        }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setOptions((prev) => ({
      ...prev,
      logoImage: null,
    }));
  };

  // step 1에서 완료 버튼 클릭 시 동작
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError("QR 코드를 저장하려면 로그인이 필요합니다.");
      return;
    }
    if (!options.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!entryStartAt) {
      setError("입장 시작 시간을 입력해주세요.");
      return;
    }
    if (useSecret && !secretCode.trim()) {
      setError("비밀코드를 입력해주세요.");
      return;
    }

    // 종료 시간 계산
    const entryEndAt = new Date(entryStartAt.getTime() + entryDuration * 60000);

    // 한국 시간(KST)을 UTC로 변환하여 서버에 전송
    const formatDateToUTC = (date: Date) => {
      // ISO 문자열로 변환하면 자동으로 UTC가 됨
      return date.toISOString();
    };

    try {
      let logoImageId = null;

      // 1. 로고 이미지가 있으면 업로드
      if (options.logoImage) {
        try {
          // base64 -> Blob 변환
          const response = await fetch(options.logoImage);
          if (!response.ok) {
            throw new Error("Failed to fetch logo image");
          }
          const blob = await response.blob();
          const file = new File([blob], "logo.png", { type: blob.type });
          const data = await uploadImage(file);
          logoImageId = data.id;
        } catch (error) {
          console.error("로고 이미지 업로드 실패:", error);
          setError("로고 이미지 업로드에 실패했습니다.");
          return;
        }
      }

      // 2. QR 코드 이벤트 생성
      const response = await createQRCode({
        title: options.title,
        description: options.description,
        secretCode: useSecret ? secretCode : "",
        entryStartAt: formatDateToUTC(entryStartAt),
        entryEndAt: formatDateToUTC(entryEndAt),
        errorCorrectionLevel: options.level,
        includeMargin: false,
        backgroundColor: options.bgColor,
        pointColor: options.fgColor,
        size: options.size,
        dotType: dotType,
        logoVisualSize: options.logoSize,
        logoVisualRatio: options.logoAspectRatio,
        maxAttendeeCount: options.maxAttendeeCount,
        ...(logoImageId && { logoImageId }),
      });

      // response에서 shortId 추출
      const shortId = response.data.qrcodeInfo.qrcodeEventInfo.shortId;

      navigate(`/qr-result/${shortId}`);
    } catch (err) {
      console.error("QR 코드 저장 실패:", err);
      setError("QR 코드 저장에 실패했습니다.");
    }
  };

  // const downloadQRCode = () => { // 미사용 함수 주석 처리
  //   if (cardCanvasRef.current) {
  //     const dataUrl = cardCanvasRef.current.toDataURL("image/png");
  //     const link = document.createElement("a");
  //     link.download = `${options.title || "qrcode"}.png`;
  //     link.href = dataUrl;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  return (
    <div className="qr-generator-container">
      <h2>{step === 0 ? "QR 코드 디자인" : "QR 코드 이벤트 설정"}</h2>
      <div className="step-indicator">
        <span className="current-step"> step {step + 1} </span> / 2
      </div>
      <div className="qr-content">
        <div className="qr-form">
          {step === 0 ? (
            <>
              {/* 기존 디자인 입력 폼 */}
              <div className="form-group">
                <label htmlFor="title">제목</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={options.title}
                  onChange={handleInputChange}
                  placeholder="QR 코드 제목"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">설명</label>
                <textarea
                  id="description"
                  name="description"
                  value={options.description}
                  onChange={handleInputChange}
                  placeholder="QR 코드에 대한 설명"
                  rows={3}
                ></textarea>
              </div>
              <div className="form-group">
                <label>로고 이미지</label>
                <div className="logo-upload-container">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    이미지 선택
                  </button>
                  {options.logoImage && (
                    <button
                      type="button"
                      className="btn-remove-logo"
                      onClick={removeLogo}
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
                {options.logoImage && (
                  <div className="logo-size-controls">
                    <div className="form-group">
                      <label htmlFor="logoSize">
                        로고 크기:{" "}
                        <span className="slider-value">
                          {options.logoSize}px
                        </span>
                      </label>
                      <input
                        type="range"
                        id="logoSize"
                        name="logoSize"
                        min="20"
                        max={Math.floor(options.size * 0.3)}
                        step="1"
                        value={options.logoSize}
                        onChange={handleSliderChange}
                      />
                    </div>
                  </div>
                )}
                {options.logoImage && options.level !== "H" && (
                  <div className="warning-message">
                    로고를 추가할 때는 오류 복원 수준을 '매우 높음'으로 설정하는
                    것이 좋습니다.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label style={{ marginBottom: 8, fontWeight: 600 }}>
                  QR 점 모양 선택
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {DOT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setDotType(type.value)}
                      style={{
                        padding: "0.5rem 1.1rem",
                        borderRadius: "20px",
                        border:
                          dotType === type.value
                            ? "2px solid #4a6cf7"
                            : "1px solid #ccc",
                        background: dotType === type.value ? "#eaf2ff" : "#fff",
                        color: dotType === type.value ? "#2056c7" : "#333",
                        fontWeight: dotType === type.value ? 700 : 400,
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        outline: "none",
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group color-picker">
                  <label htmlFor="fgColor">QR 색상</label>
                  <div className="color-input-container">
                    <input
                      type="color"
                      id="fgColor"
                      name="fgColor"
                      value={options.fgColor}
                      onChange={handleInputChange}
                    />
                    <span>{options.fgColor}</span>
                  </div>
                </div>
                <div className="form-group color-picker">
                  <label htmlFor="bgColor">배경 색상</label>
                  <div className="color-input-container">
                    <input
                      type="color"
                      id="bgColor"
                      name="bgColor"
                      value={options.bgColor}
                      onChange={handleInputChange}
                    />
                    <span>{options.bgColor}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="size">
                  QR 코드 크기:{" "}
                  <span className="slider-value">{options.size}px</span>
                </label>
                <input
                  type="range"
                  id="size"
                  name="size"
                  min="100"
                  max="300"
                  step="10"
                  value={options.size}
                  onChange={handleSliderChange}
                  data-min="100"
                  data-max="300"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="buttons-container">
                <button
                  type="button"
                  className="btn-save"
                  onClick={() => setStep(1)}
                >
                  다음
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label
                  htmlFor="entryStartAt"
                  style={{ fontWeight: 600, marginBottom: 8 }}
                >
                  입장 시작 날짜 및 시간
                </label>
                <DatePicker
                  selected={entryStartAt}
                  onChange={(date) => setEntryStartAt(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={5}
                  dateFormat="yyyy년 MM월 dd일 (eee) HH:mm"
                  placeholderText="날짜와 시간을 선택하세요"
                  className="date-picker-input"
                  required
                  locale={ko}
                  minDate={new Date()}
                  minTime={new Date()}
                  maxTime={new Date(new Date().setHours(23, 55, 0, 0))}
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="entryDuration"
                  style={{
                    fontWeight: 600,
                    marginBottom: 15,
                    display: "block",
                  }}
                >
                  입장 가능 시간:{" "}
                  <span className="slider-value">{entryDuration}분</span>
                </label>
                <input
                  type="range"
                  id="entryDuration"
                  name="entryDuration"
                  min={5}
                  max={60}
                  step={5}
                  value={entryDuration}
                  onChange={(e) => setEntryDuration(Number(e.target.value))}
                  data-min="5"
                  data-max="60"
                  style={{
                    width: "100%",
                    margin: "10px 0",
                    position: "relative",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.95rem",
                    color: "#888",
                  }}
                >
                  <span>최소: 5분</span>
                  <span>최대: 60분</span>
                </div>
              </div>
              <div className="form-group">
                <label
                  htmlFor="maxAttendeeCount"
                  style={{ fontWeight: 600, marginBottom: 8 }}
                >
                  최대 입장 인원 (1~1000명)
                </label>
                <input
                  type="number"
                  id="maxAttendeeCount"
                  name="maxAttendeeCount"
                  value={options.maxAttendeeCount}
                  onChange={(e) => {
                    let count = parseInt(e.target.value);
                    if (isNaN(count) || count < 1) count = 1;
                    if (count > 1000) count = 1000;
                    setOptions((prev) => ({
                      ...prev,
                      maxAttendeeCount: count,
                    }));
                  }}
                  min="1"
                  max="1000"
                  placeholder="예: 100"
                  className="number-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <div
                  style={{ fontSize: "0.85rem", color: "#888", marginTop: 4 }}
                >
                  이 QR코드를 통해 입장할 수 있는 최대 인원 수를 설정합니다.
                </div>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={useSecret}
                    onChange={(e) => setUseSecret(e.target.checked)}
                  />
                  입장 시 암호를 입력해야 등록할 수 있다
                </label>
              </div>
              {useSecret && (
                <div className="form-group">
                  <label htmlFor="secretCode">암호</label>
                  <input
                    type="text"
                    id="secretCode"
                    name="secretCode"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="암호 입력"
                  />
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              <div className="buttons-container">
                <button
                  type="button"
                  className="btn-download"
                  onClick={() => setStep(0)}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSubmit}
                >
                  완료
                </button>
              </div>
            </>
          )}
        </div>
        <div className="qr-preview">
          <canvas
            ref={cardCanvasRef}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              background: "#fff",
            }}
          />
          <div
            style={{
              width: CARD_WIDTH,
              textAlign: "center",
              marginTop: 18,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: "0.95rem", color: "#888", marginTop: 8 }}>
              이 카드가 이미지로 다운로드됩니다.
              <br />
              실제 생성되는 QR코드는 이 미리보기와 다를 수 있습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
