import ReactGA from "react-ga4";

const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;

// 구글 애널리틱스 초기화
ReactGA.initialize(gaTrackingId);

// 페이지뷰 추적
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "page_view", page: path });
};
