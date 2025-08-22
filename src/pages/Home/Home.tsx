import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStatisticTotal } from "../../api/statistic";
import type { StatisticTotalResponse } from "../../api/types";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatisticTotalResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchStatisticTotal();
        setStats(data);
      } catch {
        setStats(null);
      }
    })();
  }, []);

  return (
    <>
      <div className="announcement" role="region" aria-label="이벤트 안내">
        <span className="announcement-badge">이벤트</span>
        <div className="announcement-text">
          현재 이벤트를 진행 중입니다. 각 QR 코드마다 <b>3명</b>을 선정해 소정의
          상품을 드립니다.
        </div>
      </div>
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
            {stats ? (
              <div className="home-stats-callout">
                지금까지{" "}
                <b>{stats.statisticInfo.totalUserCount.toLocaleString()}</b>
                명의 사용자가{" "}
                <b>
                  {stats.statisticInfo.totalQrcodeEventCount.toLocaleString()}
                </b>
                개의 이벤트를 만들고, 총
                <b>
                  {" "}
                  {stats.statisticInfo.totalGuestbookCount.toLocaleString()}
                </b>
                개의 방명록을 남겼습니다.
                <br />
                사용자 1명당 평균
                <b>
                  {" "}
                  {stats.statisticInfo.avgQrcodeEventsPerUser.toLocaleString()}
                </b>
                개의 이벤트를 만들고, 이벤트 1개당 평균
                <b>
                  {" "}
                  {stats.statisticInfo.avgGuestbooksPerQrcodeEvent.toLocaleString()}
                </b>
                개의 참여가 모이고 있어요.
              </div>
            ) : (
              <div className="home-stats-callout">
                서비스 지표를 집계 중입니다…
              </div>
            )}
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
    </>
  );
};

export default Home;
