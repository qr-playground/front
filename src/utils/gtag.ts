import ReactGA from "react-ga4";

// 구글 애널리틱스 초기화
export const initializeGA = () => {
  const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

  if (trackingId) {
    ReactGA.initialize(trackingId, {
      debug: import.meta.env.DEV, // 개발 모드에서만 디버그 활성화
    });
    console.log("구글 애널리틱스 초기화 완료:", trackingId);
  } else {
    console.warn("구글 애널리틱스 추적 ID가 설정되지 않았습니다.");
  }
};

// 페이지뷰 추적
export const trackPageView = (path: string) => {
  const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

  if (trackingId) {
    ReactGA.send({
      hitType: "pageview",
      page: path,
      title: document.title,
    });
    console.log("페이지뷰 추적:", path);
  }
};

// 이벤트 추적 (선택사항)
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

  if (trackingId) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
    console.log("이벤트 추적:", { category, action, label, value });
  }
};

// QR 코드 생성 이벤트 추적
export const trackQRCodeGeneration = (type: string) => {
  trackEvent("QR Code", "Generate", type);
};

// 사용자 행동 추적
export const trackUserAction = (action: string, detail?: string) => {
  trackEvent("User Action", action, detail);
};
