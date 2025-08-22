import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>QR World, 환영합니다</h1>
      <p>
        QR World는 QR 코드를 스캔해 방명록 페이지에 접속하고,{" "}
        <b>선착순으로 등록</b>할 수 있는 서비스입니다.<br />
        소규모 이벤트나 동아리·단체 모임에서 빠르고 공정하게 사람을
        모집할 때 활용해 보세요.
      </p>
      <div className="home-buttons">
        <div className="home-buttons-row">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/generator")}
          >
            QR 코드 생성하기
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/search")}
          >
            이벤트 찾아보기
          </button>
        </div>
        <button className="btn btn-accent" onClick={() => navigate("/about")}>
          자세히 알아보기
        </button>
      </div>
      <div className="home-links">
        <a
          href="https://velog.io/@suhwani/posts"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 개발자 블로그 바로가기
        </a>
        <span className="divider">·</span>
        <a
          href="https://github.com/qr-playground/server"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 GitHub 저장소 바로가기
        </a>
      </div>
    </div>
  );
};

export default Home;
