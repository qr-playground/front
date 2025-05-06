import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate("/login");
  };

  const handleSettingsClick = () => {
    setShowDropdown(false);
    navigate("/settings");
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 인증 상태에 따라 로그인/유저 아이콘 표시
  const renderAuthSection = () => {
    if (isAuthenticated && user) {
      return (
        <div className="navbar-user-section" ref={dropdownRef}>
          <button
            className="navbar-user-icon-button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="사용자 메뉴"
          >
            <div className="navbar-user-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  fill="#3498db"
                />
                <path
                  d="M12 14C7.03 14 3 18.03 3 23H21C21 18.03 16.97 14 12 14Z"
                  fill="#3498db"
                />
              </svg>
            </div>
          </button>

          {showDropdown && (
            <div className="navbar-dropdown">
              <button
                onClick={handleSettingsClick}
                className="navbar-dropdown-item navbar-dropdown-settings"
              >
                내 설정
              </button>
              <button
                onClick={handleLogout}
                className="navbar-dropdown-item navbar-dropdown-logout"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Link to="/login" className="navbar-item navbar-login">
          로그인
        </Link>
      );
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          QR World
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">
            홈
          </Link>
          <Link to="/generator" className="navbar-item">
            QR 코드 생성
          </Link>

          {isAuthenticated && user?.role === "ADMIN" && (
            <Link to="/admin" className="navbar-item">
              관리자
            </Link>
          )}

          {renderAuthSection()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
