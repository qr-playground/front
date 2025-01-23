import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import QRCodeStyling from "qr-code-styling";
import QRBorderPlugin from "qr-border-plugin";
import textToImage from "./textToImage";
import './QRCode.css'; // 스타일 파일 추가
import exampleQRCode from './example-qr.png'; // 예시 QR 코드 이미지 추가
import { v4 as uuidv4 } from 'uuid'; // UUID 생성기 추가

const QRCode = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [uuid, setUuid] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("00");
  const [endMinute, setEndMinute] = useState("00");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [centerText, setCenterText] = useState("");

  const centerFontSize = 20; // 중앙 문구 폰트 크기
  const topBottomFontSize = 15; // 상단/하단 문구 폰트 크기
  const borderThickness = 20;
  useEffect(() => {
    setUuid(uuidv4()); // 페이지가 처음 렌더링될 때 UUID 생성
  }, []);

  const handleCreate = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    alert("QR 코드가 생성되었습니다.");
  };

  const handlePreview = () => {
    const previewWindow = window.open("", "QR Code Preview", "width=400,height=400");
    if (previewWindow) {
      previewWindow.document.write("<html><head><title>QR Code Preview</title></head><body>");
      previewWindow.document.write("<h1>QR Code Preview</h1>");
      previewWindow.document.write("<div id='qrcode'></div>");
      previewWindow.document.write("</body></html>");
      previewWindow.document.close();

      const options = {
        shape: "circle",
        type: "svg",
        width: 300,
        height: 300,
        margin: 0,
        data: `http://localhost:5173/register/${uuid}`,
        image: textToImage(centerText, centerFontSize),
        dotsOptions: {
          type: "dots",
          color: "#000000",
        },
        backgroundOptions: {
          round: 1,
          color: "#ffffff",
        },
        cornersSquareOptions: {
          type: "rounded",
        },
        cornersDotOptions: {
          type: "rounded",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 2,
        },
      };

      const qrCodePreview = new QRCodeStyling(options);

      const extensionOptions = {
        round: 1,
        thickness: borderThickness,
        color: "#000000",
        decorations: {
          top: {
            type: "text",
            value: topText,
            style: `font: bold ${topBottomFontSize}px sans-serif; fill: #FFFFFF;`, // 상단 문구 글씨 크기와 색상 수정
          },
          bottom: {
            type: "text",
            value: bottomText,
            style: `font: bold ${topBottomFontSize}px sans-serif; fill: #FFFFFF;`, // 하단 문구 글씨 크기와 색상 수정
          },
        },
        borderInner: {
          color: "#000000",
          thickness: 5,
        },
        borderOuter: {
          color: "#000000",
          thickness: 5,
        },
      };

      qrCodePreview.applyExtension(QRBorderPlugin(extensionOptions));

      const qrCodeContainer = previewWindow.document.getElementById("qrcode");
      if (qrCodeContainer) {
        qrCodePreview.append(qrCodeContainer);
      }
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (new Date(newStartDate) > new Date(endDate)) {
      alert("시작 날짜는 종료 날짜보다 늦을 수 없습니다.");
      return;
    }
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (new Date(newEndDate) < new Date(startDate)) {
      alert("종료 날짜는 시작 날짜보다 빠를 수 없습니다.");
      return;
    }
    setEndDate(newEndDate);
  };

  return (
    <div className="qrcode-container">
      <h1>QRCode 생성하기</h1>
      <div className="qrcode-content">
        <div className="input-section">
          <div className="input-group">
            <label className="input-label">제목:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">설명:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">시작 날짜:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="input-group">
            <label className="input-label">시작 시간:</label>
            <div className="time-select">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              :
              <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">종료 날짜:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>
          <div className="input-group">
            <label className="input-label">종료 시간:</label>
            <div className="time-select">
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              :
              <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">상단 문구:</label>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">가운데 문구:</label>
            <div className="center-text-input">
              <input
                type="text"
                value={centerText}
                onChange={(e) => setCenterText(e.target.value)}
              />
              <span className="input-description">10글자 이내로 작성해주세요</span>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">하단 문구:</label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
            />
          </div>
        </div>
        <div className="button-section">
          <div className="qrcode-display">
            <img src={exampleQRCode} alt="Example QR Code" className="example-qrcode" />
          </div>
          <div className="button-group">
            <button className="create-button" onClick={handleCreate}>생성하기</button>
            <button className="view-button" onClick={handlePreview}>미리보기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCode;