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
        "대부분의 스마트폰 기본 카메라 앱으로 QR 코드를 스캔할 수 있습니다. 카메라를 QR 코드에 향하게 하면 자동으로 인식합니다.",
    },
    {
      question: "생성한 QR 코드는 얼마나 오래 사용할 수 있나요?",
      answer:
        "QR World에서 생성한 QR 코드는 계정이 유지되는 한 영구적으로 사용할 수 있습니다.",
    },
    {
      question: "QR 코드를 수정할 수 있나요?",
      answer:
        "예, 생성한 QR 코드의 내용이나 디자인을 언제든지 수정할 수 있습니다. 단, 같은 QR 코드를 유지하려면 기본 URL은 변경하지 마세요.",
    },
    {
      question: "서비스 이용 비용은 얼마인가요?",
      answer:
        "기본 기능은 무료로 제공됩니다. 고급 기능과 대량 생성 시에는 유료 플랜을 이용하실 수 있습니다.",
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
          QR World는 누구나 쉽게 QR 코드를 생성하고 관리할 수 있는 서비스입니다.
          개인 사용자부터 비즈니스 사용자까지, 다양한 목적에 맞는 QR 코드를 몇
          번의 클릭만으로 생성할 수 있습니다.
        </p>
      </div>

      <div className="about-section">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>URL 링크</h3>
            <p>
              웹사이트, 소셜 미디어, 블로그 등 원하는 링크로 연결되는 QR 코드를
              생성하세요.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>연락처 공유</h3>
            <p>
              이름, 전화번호, 이메일 등의 연락처 정보를 담은 QR 코드를 만들어
              명함 대신 사용하세요.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>통계 분석</h3>
            <p>
              QR 코드 스캔 횟수, 위치, 시간 등의 통계 데이터를 확인할 수
              있습니다.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>디자인 커스터마이징</h3>
            <p>
              색상, 로고, 디자인 등을 자유롭게 커스터마이징하여 브랜드에 맞는 QR
              코드를 만들 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>사용 방법</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>회원가입</h3>
              <p>
                간단한 회원가입 과정을 통해 QR World의 모든 기능을 이용할 수
                있습니다.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>QR 코드 생성</h3>
              <p>원하는 정보를 입력하고 QR 코드를 생성합니다.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>다운로드 및 공유</h3>
              <p>
                생성된 QR 코드를 다운로드하거나 소셜 미디어, 이메일 등으로
                공유합니다.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>통계 확인</h3>
              <p>생성한 QR 코드의 사용 현황과 통계를 확인합니다.</p>
            </div>
          </div>
        </div>
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
        <div className="contact-info">
          <p>📧 이메일: support@qrworld.com</p>
          <p>📱 전화: 02-123-4567</p>
        </div>
      </div>
    </div>
  );
};

export default About;
