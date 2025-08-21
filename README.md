## QRworld Front

깔끔하고 빠른 QR 서비스의 프런트엔드입니다. React + TypeScript + Vite 기반으로 구축되었습니다. 

### 🔗 서비스 링크

- 서비스: `https://qrworld.shop`
- API: `https://api.qrworld.shop`
- Swagger: `https://api.qrworld.shop/swagger-ui/index.html`
- 개발자 블로그: `https://velog.io/@suhwani/posts`
- 서버 저장소: `https://github.com/qr-playground/server`

### 🛠 기술 스택

- React 18, TypeScript, Vite
- React Router, Axios
- ESLint, Prettier

### ⚙️ 환경변수 (.env.local 예시)

```env
# API 베이스 URL (예: 로컬 백엔드 또는 배포 API)
VITE_API_BASE_URL=http://localhost:8080
# 프로덕션 예시
# VITE_API_BASE_URL=https://api.qrworld.shop
```

### ✨ 주요 기능

- QR 코드 생성/검색/관리 UI
- 로그인/회원가입/설정 페이지
- Primary-Replica 기반 읽기 최적화 백엔드에 맞춘 API 호출 구조
- 반응형 레이아웃, 접근성 고려된 기본 스타일

### 📁 폴더 구조 (요약)

```
front/
├─ src/
│  ├─ api/             # API 클라이언트 (axios)
│  ├─ components/      # 재사용 컴포넌트
│  ├─ pages/           # 페이지 (Home, Login, Search, Settings 등)
│  ├─ context/         # 전역 상태(Context API)
│  ├─ hooks/           # 커스텀 훅
│  ├─ utils/           # 유틸리티
│  ├─ styles/          # 전역 스타일
│  ├─ main.tsx         # 엔트리
│  └─ App.tsx          # 라우팅 엔트리
├─ public/
└─ index.html
```

### 📤 문의 및 연락처

- 개선 요청, 오류 제보 시 소정의 상품을 드립니다.
- 오류 제보 / 문의 / 개선 요청: `suhwani.dev@gmail.com`
