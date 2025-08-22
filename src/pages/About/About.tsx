import React, { useState } from "react";
import "./About.css";

// FAQ 아이템 타입 정의
interface FaqItem {
  question: string;
  answer: string;
}

const About: React.FC = () => {
  // 활성화된 FAQ 인덱스들을 Set으로 관리
  const [activeFaqs, setActiveFaqs] = useState<Set<number>>(new Set());

  // FAQ 아이템 데이터
  const faqItems: FaqItem[] = [
    {
      question: "QR 코드는 어떻게 스캔하나요?",
      answer:
        "대부분의 스마트폰 기본 카메라 앱으로 QR 코드를 스캔할 수 있습니다.\n또한 링크로 접근하실 수 있습니다.",
    },
    {
      question: "생성한 QR 코드는 얼마나 오래 사용할 수 있나요?",
      answer:
        "QR코드는 생성 시 설정한 기간동안 사용할 수 있습니다. \n단, 오랜 시간 유지하고 싶다면 이메일 문의 부탁드립니다.",
    },
    {
      question: "QR 코드를 수정할 수 있나요?",
      answer: "아쉽지만 수정은 불가합니다. 새로 생성해야 합니다.",
    },
    {
      question: "서비스 이용 비용은 얼마인가요?",
      answer:
        "무료로 제공하는 베타 버전입니다. \n단, 100명이 넘는 대규모 인원은 이메일 문의 부탁드립니다.",
    },
  ];

  // FAQ 아이템 클릭 핸들러 - 여러 FAQ 동시 오픈 지원
  const toggleFaq = (index: number) => {
    const newActiveFaqs = new Set(activeFaqs);
    if (newActiveFaqs.has(index)) {
      newActiveFaqs.delete(index);
    } else {
      newActiveFaqs.add(index);
    }
    setActiveFaqs(newActiveFaqs);
  };

  // FAQ가 활성화되었는지 확인하는 함수
  const isFaqActive = (index: number): boolean => {
    return activeFaqs.has(index);
  };

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>QR World에 대해 알아보세요</h1>
        <p className="about-subtitle">
          더 많은 정보와 연결을 위한 QR 코드 솔루션
        </p>
      </div>

      <div className="about-section">
        <h2>서비스 소개</h2>
        <p>
          QR World는 QR 코드를 스캔해 방명록 페이지에 접속하고,{" "}
          <b>선착순으로 등록</b>할 수 있는 서비스입니다.
          <br />
          소규모 이벤트나 동아리·단체 모임에서 빠르고 공정하게 사람을 모집할 때
          활용해 보세요.
        </p>
      </div>

      <div className="about-section">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>방명록 QR 생성</h3>
            <p>
              이벤트·모임 정보를 입력하면 전용 방명록 페이지 QR이 즉시
              생성됩니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>선착순 자동 기록</h3>
            <p>
              QR을 스캔한 순서대로 실시간 등수와 남은&nbsp;좌석 수를 표시합니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>진행 현황 대시보드</h3>
            <p>
              등록 인원, 선착순 마감 여부 등을 대시보드로 한눈에 확인합니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>커스터마이징 QR</h3>
            <p>행사 로고·색상을 적용해 브랜드 맞춤형 QR을 만들 수 있습니다.</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>사용 방법</h2>
        <ul className="steps-list">
          <li>
            <span className="step-badge">1</span>
            <p>
              <b>QR 스캔</b> – 참여자는 현장 또는 온라인에 제공된 QR 코드를
              스캔합니다.
            </p>
          </li>
          <li>
            <span className="step-badge">2</span>
            <p>
              <b>정보 입력</b> – 이름·연락처를 입력하고 등록 버튼을 누릅니다.
            </p>
          </li>
          <li>
            <span className="step-badge">3</span>
            <p>
              <b>선착순 결과 확인</b> – 즉시 본인의 등수를 확인하고, 주최자는
              대시보드로 전체 현황을 모니터링합니다.
            </p>
          </li>
        </ul>
      </div>

      <div className="about-section">
        <h2>자주 묻는 질문</h2>
        <div className="faq-container">
          {faqItems.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${isFaqActive(index) ? "active" : ""}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-toggle-icon">
                  {isFaqActive(index) ? "−" : "+"}
                </span>
              </div>
              <div className={`faq-answer ${isFaqActive(index) ? "show" : ""}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section contact-section">
        <h2>문의하기</h2>
        <p>더 궁금한 점이 있으시면 언제든지 문의해 주세요.</p>
        <p>개선 요청, 오류 제보 시 소정의 상품을 드립니다.</p>
        <div className="contact-info">
          <p>📧 이메일: suhwani.dev@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default About;
