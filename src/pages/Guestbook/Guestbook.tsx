import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createGuestbook } from "../../api/guestbook";
import { getQRCodeEvent } from "../../api/qrcode";
import "./Guestbook.css";

// QR 코드 이벤트 정보 타입 정의
interface QrEventInfo {
  id: string;
  shortId: string;
  title: string;
  description: string;
  secretCode: string;
  entryStartAt: string;
  entryEndAt: string;
}

// deviceId 관리 함수들
const DEVICE_ID_KEY = "qr_world_device_id";

/**
 * 랜덤한 고유 ID를 생성합니다.
 * 웹에서는 기기의 실제 하드웨어 ID에 접근이 불가능하므로
 * 브라우저 내에서 임의의 고유 문자열을 생성하여 사용합니다.
 */
const generateDeviceId = (): string => {
  // UUID v4 형식의 랜덤 ID 생성 (간소화된 버전)
  return (
    "device-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const Guestbook: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [eventData, setEventData] = useState<QrEventInfo | null>(null);
  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [invalidAccess, setInvalidAccess] = useState(false);

  // deviceId 초기화 (컴포넌트 마운트 시 한 번만 실행)
  const [deviceId] = useState(() => {
    // 기존에 저장된 deviceId가 있는지 확인
    const existingDeviceId = localStorage.getItem(DEVICE_ID_KEY);

    // 있으면 그대로 사용, 없으면 새로 생성
    if (existingDeviceId) {
      return existingDeviceId;
    } else {
      const newId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, newId);
      return newId;
    }
  });

  useEffect(() => {
    // shortId가 없는 경우
    if (!shortId) {
      setInvalidAccess(true);
      setStatusMessage({
        type: "error",
        message: "잘못된 접근입니다. 올바른 QR 코드를 통해 접속해주세요.",
      });
      setLoading(false);

      // 3초 후 홈으로 리다이렉트
      const redirectTimer = setTimeout(() => {
        navigate("/");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }

    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await getQRCodeEvent(shortId);
        setEventData(response.data.qrcodeInfo.qrcodeEventInfo);

        // 비밀 코드가 필요한지 확인
        setNeedsCode(!!response.data.qrcodeInfo.qrcodeEventInfo.secretCode);

        setLoading(false);
      } catch (err: unknown) {
        console.error("이벤트 데이터 로딩 실패:", err);
        setStatusMessage({
          type: "error",
          message: "QR 코드 이벤트 정보를 불러오는데 실패했습니다.",
        });
        setLoading(false);
      }
    };

    fetchEventData();
  }, [shortId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shortId) {
      setStatusMessage({
        type: "error",
        message: "올바른 QR 코드가 필요합니다.",
      });
      return;
    }

    // 이름 필드 유효성 검사
    if (!guestName.trim()) {
      setStatusMessage({
        type: "error",
        message: "이름 또는 닉네임을 입력해주세요.",
      });
      return;
    }

    // 비밀 코드 확인 (실제로는 서버 API에서 검증해야 함)
    if (needsCode && eventData) {
      if (!secretCode.trim()) {
        setStatusMessage({
          type: "error",
          message: "비밀 코드를 입력해주세요.",
        });
        return;
      }

      if (secretCode !== eventData.secretCode) {
        setStatusMessage({
          type: "error",
          message: "비밀 코드가 올바르지 않습니다.",
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      setStatusMessage(null);

      // 방명록 API 호출
      const response = await createGuestbook({
        shortId,
        deviceId,
        name: guestName,
        phoneNumber: phoneNumber || undefined, // 입력하지 않았으면 undefined로 설정
      });

      // 성공 처리
      setStatusMessage({
        type: "success",
        message: response.data.message || "방명록이 성공적으로 등록되었습니다.",
      });

      // 폼 초기화
      setGuestName("");
      setPhoneNumber("");
      setSecretCode("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "방명록 등록에 실패했습니다.";
      setStatusMessage({ type: "error", message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="guestbook-container loading">
        <div className="loading-spinner" />
        <p>이벤트 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (invalidAccess) {
    return (
      <div className="guestbook-container error">
        <div className="error-message">
          <h2>잘못된 접근입니다</h2>
          <p>{statusMessage?.message || "잘못된 접근입니다."}</p>
          <p className="redirect-message">
            잠시 후 메인 페이지로 이동합니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="guestbook-container">
      <div className="guestbook-header">
        <h1>{eventData?.title || "방명록"}</h1>
        {eventData?.description && (
          <p className="event-description">{eventData.description}</p>
        )}
      </div>

      {statusMessage && (
        <div
          className={
            statusMessage.type === "success" ? "success-message" : "form-error"
          }
        >
          <p>{statusMessage.message}</p>
        </div>
      )}

      <div className="guestbook-form-container">
        <h2>방명록 작성하기</h2>
        <form onSubmit={handleSubmit} className="guestbook-form">
          <div className="form-group">
            <label htmlFor="guestName">이름</label>
            <div className="description-text">
              실명 또는 고유한 닉네임을 입력해주세요.
            </div>
            <input
              type="text"
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="(필수) 실명 또는 고유한 닉네임을 입력해주세요"
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호</label>
            <div className="description-text">
              이벤트 상품 전달을 위해서만 사용됩니다. ex.01012345678
            </div>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(선택) 01012345678 형식으로 입력해주세요"
              disabled={submitting}
            />
          </div>

          {needsCode && (
            <div className="form-group">
              <label htmlFor="secretCode">비밀 코드</label>
              <input
                type="text"
                id="secretCode"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="주최자가 제공한 비밀 코드를 입력하세요"
                disabled={submitting}
              />
            </div>
          )}

          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? "등록 중..." : "방명록 남기기"}
          </button>
        </form>

        {statusMessage?.type === "success" && (
          <div className="success-actions">
            <button
              type="button"
              className="view-results-button"
              onClick={() => navigate(`/guestbook/${shortId}/result`)}
            >
              방명록 결과 보러가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guestbook;
