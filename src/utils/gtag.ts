import ReactGA from "react-ga4";

const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;

// 구글 애널리틱스 초기화
ReactGA.initialize(gaTrackingId);

// 페이지뷰 추적
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "page_view", page: path });
  
  // 개발 환경에서 추적 확인을 위한 로깅
  if (import.meta.env.DEV) {
    console.log("📊 GA 페이지 추적:", path, {
      full_url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      tracking_id: import.meta.env.VITE_GA_TRACKING_ID
    });
  }
};
