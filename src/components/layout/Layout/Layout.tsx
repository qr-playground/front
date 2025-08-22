import React from "react";
import Navbar from "../Navbar";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>
            개선 요청, 오류 제보 시 소정의 상품을 드립니다.
            <br />
            📧 이메일: suhwani.dev@gmail.com
          </p>
          <p style={{ marginTop: 8 }}>
            <a
              href="https://velog.io/@suhwani/posts"
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 개발자 블로그
            </a>
            <span style={{ margin: "0 8px", color: "#bbb" }}>·</span>
            <a
              href="https://github.com/qr-playground/server"
              target="_blank"
              rel="noopener noreferrer"
            >
             🔗 GitHub 저장소
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
