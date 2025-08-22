// 네이티브 gtag 타입 선언 (any 지양)
type GtagFunction = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
  interface Window {
    gtag: GtagFunction;
  }
}

const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;

// GA 스크립트 로드 및 초기화
const initGA = () => {
  if (!gaTrackingId) return;

  // GA 스크립트 로드
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
  document.head.appendChild(script);

  // gtag 초기화 (rest parameter 사용, arguments 미사용)
  if (!window.gtag) {
    const gtagShim: GtagFunction = (...args: unknown[]) => {
      gtagShim.q = gtagShim.q || [];
      gtagShim.q.push(args);
    };
    window.gtag = gtagShim;
  }
  window.gtag("js", new Date());
  window.gtag("config", gaTrackingId);
};

// 초기화 실행
initGA();

// 페이지뷰 추적 - 네이티브 gtag 사용
export const trackPageView = () => {
  if (!gaTrackingId) {
    return;
  }

  if (window.gtag) {
    window.gtag("config", gaTrackingId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  } else {
    // gtag not loaded yet; skip silently
  }
};
