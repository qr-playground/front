import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStatisticTotal } from "../../api/statistic";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mau, setMau] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchStatisticTotal();
        setMau(data.statisticInfo.totalUserCount);
      } catch {
        // 에러 시에도 영역은 노출되도록 0으로 표기
        setMau(0);
      }
    })();
  }, []);

  return (
    <div className="home-scale-wrap">
      <div className="home-scale">
        <div className="home-container">
          <h1>QR World, 환영합니다</h1>
          <p>
            QR World는 QR 코드를 스캔해 방명록 페이지에 접속하고,{" "}
            <b>선착순으로 등록</b>할 수 있는 서비스입니다.
            <br />
            소규모 이벤트나 동아리·단체 모임에서 빠르고 공정하게 사람을 모집할
            때 활용해 보세요.
          </p>
          <div style={{ marginTop: 6, color: "#7a7a7a", fontSize: "0.95rem" }}>
            총 가입 사용자 수:
            <b style={{ marginLeft: 6 }}>
              {mau === null ? "집계 중" : mau.toLocaleString()}
            </b>
          </div>
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
            <button
              className="btn btn-accent"
              onClick={() => navigate("/about")}
            >
              자세히 알아보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
