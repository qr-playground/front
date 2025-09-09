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
            개선 사항/오류 제보는 아래 구글폼으로 부탁드립니다. (참여자 중
            소정의 상품 증정)
            <br />
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdgNG61y42xsheoVQgxTRU-PwjvhE_3YTUB-zV-YRW5EWxkdA/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
            >
              📝 구글폼 작성하기
            </a>
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
