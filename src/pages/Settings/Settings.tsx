import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, UserProfile } from "../../api/user";
import { useAuth } from "../../context/AuthContext";
import "./Settings.css";

const Settings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await getUserProfile();
        setUserProfile(profileData);
        setError(null);
      } catch (err) {
        console.error("사용자 정보 조회 오류:", err);
        setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-card">
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <div className="settings-card">
          <p className="settings-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">내 설정</h1>

        <div className="settings-section">
          <h2 className="settings-section-title">사용자 정보</h2>
          <div className="settings-info-item">
            <span className="settings-label">핸드폰 번호:</span>
            <span className="settings-value">
              {userProfile?.phoneNumber || "핸드폰 번호 정보 없음"}
            </span>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">계정 설정</h2>
          <button className="settings-button">비밀번호 변경</button>
          <button className="settings-button">개인정보 수정</button>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">QR 코드 관리</h2>
          <button
            className="settings-button"
            onClick={() => navigate("/settings/my-qrcodes")}
          >
            내 QR 코드 목록
          </button>
          <button className="settings-button">QR 코드 생성 내역</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
