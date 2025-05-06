import { QRCodeSVG } from "qrcode.react";
import React, { useRef, useState } from "react";
import { createQRCode, QRCodeData } from "../../api/qrcode";
import { useAuth } from "../../context/AuthContext";
import "./QrGenerator.css";

interface QROptions extends QRCodeData {
  value: string;
  title: string;
  description: string;
  bgColor: string;
  fgColor: string;
  size: number;
  includeMargin: boolean;
  level: "L" | "M" | "Q" | "H";
  logoImage: string | null;
  logoWidth: number;
  logoHeight: number;
}

const QrGenerator: React.FC = () => {
  const [options, setOptions] = useState<QROptions>({
    value: "https://qrworld.com",
    title: "",
    description: "",
    bgColor: "#ffffff",
    fgColor: "#000000",
    size: 200,
    includeMargin: true,
    level: "M",
    logoImage: null,
    logoWidth: 50,
    logoHeight: 50,
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

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
    setSaved(false);
    setError("");
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
    setSaved(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
    setSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("이미지 크기는 2MB 이하여야 합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setOptions((prev) => ({
        ...prev,
        logoImage: reader.result as string,
      }));

      // 높은 오류 복원 수준 권장
      if (options.level !== "H" && options.level !== "Q") {
        setOptions((prev) => ({
          ...prev,
          level: "H",
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setOptions((prev) => ({
      ...prev,
      logoImage: null,
    }));
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setError("QR 코드를 저장하려면 로그인이 필요합니다.");
      return;
    }

    if (!options.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    try {
      // API 호출
      await createQRCode({
        value: options.value,
        title: options.title,
        description: options.description,
        bgColor: options.bgColor,
        fgColor: options.fgColor,
        size: options.size,
        includeMargin: options.includeMargin,
        level: options.level,
      });

      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("QR 코드 저장 실패:", err);
      setError("QR 코드 저장에 실패했습니다.");
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    // QR 코드 영역 전체를 캡처하기 위해 qr-code-wrapper 요소를 사용
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = options.size;
    canvas.height = options.size;

    // 배경색 설정
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // QR 코드 SVG 가져오기
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      // QR 코드 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 로고 이미지가 있다면 중앙에 그리기
      if (options.logoImage) {
        const logoImg = new Image();
        logoImg.onload = () => {
          // 로고 이미지를 중앙에 배치
          const x = (canvas.width - options.logoWidth) / 2;
          const y = (canvas.height - options.logoHeight) / 2;

          // 로고 배경을 흰색으로 (선택 사항)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, options.logoWidth, options.logoHeight);

          // 로고 이미지 그리기
          ctx.drawImage(logoImg, x, y, options.logoWidth, options.logoHeight);

          // 이미지 다운로드
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");

          const fileName = options.title.trim()
            ? `${options.title.replace(/\s+/g, "_")}_qrcode.png`
            : "qrcode.png";

          downloadLink.download = fileName;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        logoImg.src = options.logoImage;
      } else {
        // 로고 없이 바로 다운로드
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");

        const fileName = options.title.trim()
          ? `${options.title.replace(/\s+/g, "_")}_qrcode.png`
          : "qrcode.png";

        downloadLink.download = fileName;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const optionsList = [
    { value: "L", label: "낮음 (7%)" },
    { value: "M", label: "중간 (15%)" },
    { value: "Q", label: "높음 (25%)" },
    { value: "H", label: "매우 높음 (30%)" },
  ];

  return (
    <div className="qr-generator-container">
      <h1>QR 코드 생성기</h1>

      <div className="qr-content">
        <div className="qr-form">
          <div className="form-group">
            <label htmlFor="value">URL 또는 텍스트</label>
            <input
              type="text"
              id="value"
              name="value"
              value={options.value}
              onChange={handleInputChange}
              placeholder="https://example.com"
              required
            />
          </div>

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
                  <label htmlFor="logoWidth">
                    로고 너비: {options.logoWidth}px
                  </label>
                  <input
                    type="range"
                    id="logoWidth"
                    name="logoWidth"
                    min="20"
                    max={options.size / 2}
                    step="5"
                    value={options.logoWidth}
                    onChange={handleSliderChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="logoHeight">
                    로고 높이: {options.logoHeight}px
                  </label>
                  <input
                    type="range"
                    id="logoHeight"
                    name="logoHeight"
                    min="20"
                    max={options.size / 2}
                    step="5"
                    value={options.logoHeight}
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
            <label htmlFor="size">크기: {options.size}px</label>
            <input
              type="range"
              id="size"
              name="size"
              min="100"
              max="400"
              step="10"
              value={options.size}
              onChange={handleSliderChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">오류 복원 수준</label>
            <select
              id="level"
              name="level"
              value={options.level}
              onChange={handleInputChange}
            >
              {optionsList.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="includeMargin"
                checked={options.includeMargin}
                onChange={handleCheckboxChange}
              />
              여백 포함
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="buttons-container">
            <button
              type="button"
              className="btn-download"
              onClick={downloadQRCode}
            >
              PNG 다운로드
            </button>
            <button type="button" className="btn-save" onClick={handleSave}>
              {saved ? "저장됨!" : "저장하기"}
            </button>
          </div>
        </div>

        <div className="qr-preview">
          <div className="qr-code-wrapper" ref={qrRef}>
            <QRCodeSVG
              value={options.value}
              size={options.size}
              bgColor={options.bgColor}
              fgColor={options.fgColor}
              level={options.level as "L" | "M" | "Q" | "H"}
              includeMargin={options.includeMargin}
            />
            {options.logoImage && (
              <div
                className="qr-logo-overlay"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: `${options.logoWidth}px`,
                  height: `${options.logoHeight}px`,
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                  borderRadius: "4px",
                  padding: "2px",
                }}
              >
                <img
                  src={options.logoImage}
                  alt="Logo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>

          <div className="qr-info">
            <h3>{options.title || "QR 코드"}</h3>
            <p>{options.description || "QR 코드 설명을 입력하세요."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
