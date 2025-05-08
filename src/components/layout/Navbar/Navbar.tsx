import React, { useEffect, useRef, useState } from "react";
import { MdAccountCircle } from "react-icons/md";
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
              <MdAccountCircle size={32} color="#3b82f6" />
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
