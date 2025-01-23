import React from 'react';
import NavBar from './NavBar/NavBar';
import { Link, Outlet } from 'react-router-dom';
import './Home/Home.css'; // 사이드바 스타일 재사용

const Layout = () => {
  return (
    <div className="home-container">
      <NavBar />
      <div style={{ display: 'flex', flex: 1 }}>
        <aside className="home-sidebar">
          <nav>
            <ul>
              <li><Link to="/">홈</Link></li>
              <li><Link to="/register">등록하기</Link></li>
              <li><Link to="/result">결과보기</Link></li>
              <li><Link to="/qrcode">QRCode 생성하기</Link></li> {/* QRCode 생성하기 링크 추가 */}
            </ul>
          </nav>
        </aside>
        <main className="home-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;