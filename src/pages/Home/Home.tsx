import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>QR World에 오신 것을 환영합니다</h1>
      <p>
        QR World는 쉽고 빠르게 QR 코드를 생성하고 관리할 수 있는 서비스입니다.
        개인 맞춤형 QR 코드를 생성하여 비즈니스, 이벤트, 개인적인 용도로
        활용해보세요.
      </p>
      <div className="home-buttons">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/generator")}
        >
          QR 코드 생성하기
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/about")}>
          자세히 알아보기
        </button>
      </div>
    </div>
  );
};

export default Home;
