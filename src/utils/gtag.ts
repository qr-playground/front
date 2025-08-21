// 네이티브 gtag 타입 선언
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
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

  // gtag 초기화
  window.gtag =
    window.gtag ||
    function () {
      (window.gtag as any).q = (window.gtag as any).q || [];
      (window.gtag as any).q.push(arguments);
    };
  window.gtag("js", new Date());
  window.gtag("config", gaTrackingId);

  console.log("✅ 네이티브 GA 초기화 완료:", gaTrackingId);
};

// 초기화 실행
initGA();

// 페이지뷰 추적 - 네이티브 gtag 사용
export const trackPageView = (path: string) => {
  if (!gaTrackingId) {
    console.warn("❌ GA 추적 ID가 없습니다");
    return;
  }

  if (window.gtag) {
    window.gtag("config", gaTrackingId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log("✅ GA 페이지 추적:", {
      path,
      url: window.location.href,
      title: document.title,
    });
  } else {
    console.warn("❌ gtag이 아직 로드되지 않았습니다");
  }
};
