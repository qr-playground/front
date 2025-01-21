import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import QRBorderPlugin from "qr-border-plugin";
import textToImage from "./textToImage";
import Select from 'react-select';
import { createData } from '../../api/api';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const QRCode = ({ topText, bottomText, centerText, fontSize, borderThickness }) => {
  const qrCodeRef = useRef(null);
  const qrCodeInstance = useRef(null); // QR 코드 인스턴스 저장
  const navigate = useNavigate();

  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [uuid, setUUID] = useState(uuidv4());
  const [data, setData] = useState(`http://localhost:5173/register/${uuid}`);

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = String(Math.floor(i / 2)).padStart(2, '0');
    const minutes = i % 2 === 0 ? '00' : '30';
    return { value: `${hours}:${minutes}`, label: `${hours}:${minutes}` };
  });

  useEffect(() => {
    // 기본 QR 코드 옵션
    const options = {
      shape: "circle",
      type: "svg",
      width: 300,
      height: 300,
      margin: 0,
      data: data,
      image: textToImage(centerText, fontSize),
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

    // QR 코드 인스턴스 초기화
    qrCodeInstance.current = new QRCodeStyling(options);

    // 테두리 스타일링 옵션
    const extensionOptions = {
      round: 1,
      thickness: borderThickness,
      color: "#000000",
      decorations: {
        top: {
          type: "text",
          value: topText,
          style: "font: bold 20px sans-serif; fill: #D5B882;",
        },
        bottom: {
          type: "text",
          value: bottomText,
          style: "font: bold 20px sans-serif; fill: #D5B882;",
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

    // 라이센스 키 설정 (라이센스 키를 실제 값으로 교체)
    QRBorderPlugin.setKey("your-license-key");

    // 테두리 확장 적용
    qrCodeInstance.current.applyExtension(QRBorderPlugin(extensionOptions));

    // QR 코드 렌더링
    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = ""; // 기존 QR 코드 초기화
      qrCodeInstance.current.append(qrCodeRef.current);
    }
  }, [topText, bottomText, centerText, fontSize, borderThickness, data]);

  const handleCreate = async () => {
    const result = await createData({ startDateTime, endDateTime, id: uuid });
    console.log(result);
  };

  const handleView = () => {
    navigate(`/result/${uuid}`);
  };

  const handleEndDateTimeChange = (selectedOption) => {
    const newEndDateTime = selectedOption.value;
    if (new Date(`1970-01-01T${newEndDateTime}:00`) < new Date(`1970-01-01T${startDateTime}:00`)) {
      alert("종료 시간은 시작 시간보다 빠를 수 없습니다.");
      return;
    }
    setEndDateTime(newEndDateTime);
  };

  return (
    <div>
      <div>
        <label>
          시작 시간:
          <Select
            options={timeOptions}
            value={timeOptions.find(option => option.value === startDateTime)}
            onChange={(selectedOption) => setStartDateTime(selectedOption.value)}
          />
        </label>
      </div>
      <div>
        <label>
          종료 시간:
          <Select
            options={timeOptions}
            value={timeOptions.find(option => option.value === endDateTime)}
            onChange={handleEndDateTimeChange}
          />
        </label>
      </div>
      <div>
        <label>
          UUID:
          <input
            type="text"
            value={uuid}
            readOnly
          />
        </label>
      </div>
      <button onClick={handleCreate}>생성하기</button>
      <button onClick={handleView}>결과보기</button>
      <div ref={qrCodeRef}></div>
    </div>
  );
};

export default QRCode;