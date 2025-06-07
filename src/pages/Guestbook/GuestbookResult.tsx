import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGuestbooksPaginated } from "../../api/guestbook";
import { getQRCodeEvent, ServerQrcodeResponse } from "../../api/qrcode";
import "./GuestbookResult.css";

// QR 코드 이벤트 정보 타입 정의 - 제거하고 ServerQrcodeResponse 활용
// interface QrEventInfo {
//   id: string;
//   shortId: string;
//   title: string;
//   description: string;
//   secretCode: string;
//   entryStartAt: string;
//   entryEndAt: string;
// }

interface GuestbookItem {
  id: string;
  name: string;
  createdAt: string;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const GuestbookResult: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eventData 타입을 ServerQrcodeResponse의 qrcodeInfo 부분으로 변경
  const [eventData, setEventData] = useState<
    ServerQrcodeResponse["data"]["qrcodeInfo"] | null
  >(null);
  const [guestbooks, setGuestbooks] = useState<GuestbookItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchGuestbooks = async (page: number) => {
    if (!shortId) return;

    try {
      // setLoading(true); // 호출하는 쪽에서 관리하도록 변경 고려, 일단 유지
      const response = await getGuestbooksPaginated(
        shortId,
        page,
        pagination.pageSize
      );
      setGuestbooks(response.data.guestbooks);
      setPagination(response.data.pagination);
      // setLoading(false); // 호출하는 쪽에서 관리하도록 변경 고려, 일단 유지
    } catch (err) {
      console.error("방명록 데이터 로딩 실패:", err);
      setError("방명록 정보를 불러오는데 실패했습니다.");
      // setLoading(false); // 에러 발생 시에도 로딩 상태 해제
    }
  };

  useEffect(() => {
    // shortId가 없는 경우
    if (!shortId) {
      setError("잘못된 접근입니다. 올바른 QR 코드를 통해 접속해주세요.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true); // 전체 데이터 로딩 시작
      try {
        // 이벤트 정보 가져오기
        const eventResponse = await getQRCodeEvent(shortId);
        setEventData(eventResponse.data.qrcodeInfo); // qrcodeInfo 전체 저장

        // 방명록 목록 가져오기 (첫 페이지)
        await fetchGuestbooks(1);
      } catch (err) {
        // getQRCodeEvent 또는 fetchGuestbooks에서 발생한 에러 처리
        console.error("데이터 로딩 실패:", err);
        // setError 메시지는 fetchGuestbooks 내부 또는 getQRCodeEvent 호출 결과에 따라 이미 설정될 수 있음
        // 여기서는 포괄적인 에러 메시지 또는 특정 에러 상황에 따라 다른 메시지를 설정할 수 있음
        if (!error) {
          // 기존에 setError로 설정된 메시지가 없다면 새로 설정
          setError("페이지 로딩 중 문제가 발생했습니다.");
        }
      } finally {
        setLoading(false); // 모든 API 호출 후 로딩 상태 해제
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortId]); // pagination.pageSize를 의존성 배열에서 제거 (fetchGuestbooks에 직접 전달)

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchGuestbooks(newPage);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    // Intl.DateTimeFormat을 사용하여 "년, 월, 일, 시, 분"까지만 표시
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (loading && guestbooks.length === 0) {
    return (
      <div className="guestbook-result-container loading">
        <div className="loading-spinner" />
        <p>방명록 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && guestbooks.length === 0) {
    return (
      <div className="guestbook-result-container error">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guestbook-result-container">
      <div className="guestbook-result-header">
        <h1>{eventData?.qrcodeEventInfo.title || "방명록 결과"}</h1>
        {eventData?.qrcodeEventInfo.description && (
          <p className="event-description">
            {eventData.qrcodeEventInfo.description}
          </p>
        )}
        {/* 추가 정보 표시 영역 */}
        {eventData && (
          <div className="event-details">
            {" "}
            {/* Guestbook.css의 스타일을 재사용하거나 여기에 맞게 새로 정의 */}
            <div className="detail-item">
              <span className="detail-label">입장 시작 시간:</span>
              <span className="detail-value">
                {formatDate(eventData.qrcodeEventInfo.entryStartAt)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">입장 종료 시간:</span>
              <span className="detail-value">
                {formatDate(eventData.qrcodeEventInfo.entryEndAt)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">최대 입장 가능 인원:</span>
              <span className="detail-value">
                {eventData.qrcodeBenefitInfo.maxAttendeeCount}명
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">현재 등록 인원:</span>
              <span className="detail-value">
                {eventData.qrcodeBenefitInfo.maxAttendeeCount -
                  eventData.qrcodeBenefitInfo.availableAttendeeCount}
                명
              </span>
            </div>
          </div>
        )}
        <div className="result-summary">
          총 <span className="highlight">{pagination.totalItems}</span>개의
          방명록이 등록되었습니다.
        </div>
      </div>

      <div className="guestbook-list-container">
        {guestbooks.length > 0 ? (
          <>
            <div className="guestbook-list">
              {guestbooks.map((item) => (
                <div key={item.id} className="guestbook-card">
                  <div className="guestbook-card-header">
                    <h3 className="guest-name">{item.name}</h3>
                    <span className="guest-date">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 UI */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevious || loading}
                >
                  처음
                </button>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevious || loading}
                >
                  이전
                </button>

                <div className="pagination-info">
                  {pagination.currentPage} / {pagination.totalPages}
                </div>

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  다음
                </button>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNext || loading}
                >
                  마지막
                </button>
              </div>
            )}

            {loading && (
              <div className="loading-more">
                <div className="loading-spinner-small" />
                <p>불러오는 중...</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-result">
            <p>아직 등록된 방명록이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestbookResult;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGuestbooksPaginated } from "../../api/guestbook";
import { getQRCodeEvent, ServerQrcodeResponse } from "../../api/qrcode";
import "./GuestbookResult.css";

// QR 코드 이벤트 정보 타입 정의 - 제거하고 ServerQrcodeResponse 활용
// interface QrEventInfo {
//   id: string;
//   shortId: string;
//   title: string;
//   description: string;
//   secretCode: string;
//   entryStartAt: string;
//   entryEndAt: string;
// }

interface GuestbookItem {
  id: string;
  name: string;
  createdAt: string;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const GuestbookResult: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eventData 타입을 ServerQrcodeResponse의 qrcodeInfo 부분으로 변경
  const [eventData, setEventData] = useState<
    ServerQrcodeResponse["data"]["qrcodeInfo"] | null
  >(null);
  const [guestbooks, setGuestbooks] = useState<GuestbookItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchGuestbooks = async (page: number) => {
    if (!shortId) return;

    try {
      // setLoading(true); // 호출하는 쪽에서 관리하도록 변경 고려, 일단 유지
      const response = await getGuestbooksPaginated(
        shortId,
        page,
        pagination.pageSize
      );
      setGuestbooks(response.data.guestbooks);
      setPagination(response.data.pagination);
      // setLoading(false); // 호출하는 쪽에서 관리하도록 변경 고려, 일단 유지
    } catch (err) {
      console.error("방명록 데이터 로딩 실패:", err);
      setError("방명록 정보를 불러오는데 실패했습니다.");
      // setLoading(false); // 에러 발생 시에도 로딩 상태 해제
    }
  };

  useEffect(() => {
    // shortId가 없는 경우
    if (!shortId) {
      setError("잘못된 접근입니다. 올바른 QR 코드를 통해 접속해주세요.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true); // 전체 데이터 로딩 시작
      try {
        // 이벤트 정보 가져오기
        const eventResponse = await getQRCodeEvent(shortId);
        setEventData(eventResponse.data.qrcodeInfo); // qrcodeInfo 전체 저장

        // 방명록 목록 가져오기 (첫 페이지)
        await fetchGuestbooks(1);
      } catch (err) {
        // getQRCodeEvent 또는 fetchGuestbooks에서 발생한 에러 처리
        console.error("데이터 로딩 실패:", err);
        // setError 메시지는 fetchGuestbooks 내부 또는 getQRCodeEvent 호출 결과에 따라 이미 설정될 수 있음
        // 여기서는 포괄적인 에러 메시지 또는 특정 에러 상황에 따라 다른 메시지를 설정할 수 있음
        if (!error) {
          // 기존에 setError로 설정된 메시지가 없다면 새로 설정
          setError("페이지 로딩 중 문제가 발생했습니다.");
        }
      } finally {
        setLoading(false); // 모든 API 호출 후 로딩 상태 해제
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortId]); // pagination.pageSize를 의존성 배열에서 제거 (fetchGuestbooks에 직접 전달)

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchGuestbooks(newPage);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    // Intl.DateTimeFormat을 사용하여 "년, 월, 일, 시, 분"까지만 표시
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (loading && guestbooks.length === 0) {
    return (
      <div className="guestbook-result-container loading">
        <div className="loading-spinner" />
        <p>방명록 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && guestbooks.length === 0) {
    return (
      <div className="guestbook-result-container error">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guestbook-result-container">
      <div className="guestbook-result-header">
        <h1>{eventData?.qrcodeEventInfo.title || "방명록 결과"}</h1>
        {eventData?.qrcodeEventInfo.description && (
          <p className="event-description">
            {eventData.qrcodeEventInfo.description}
          </p>
        )}
        {/* 추가 정보 표시 영역 */}
        {eventData && (
          <div className="event-details">
            {" "}
            {/* Guestbook.css의 스타일을 재사용하거나 여기에 맞게 새로 정의 */}
            <div className="detail-item">
              <span className="detail-label">입장 시작 시간:</span>
              <span className="detail-value">
                {formatDate(eventData.qrcodeEventInfo.entryStartAt)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">입장 종료 시간:</span>
              <span className="detail-value">
                {formatDate(eventData.qrcodeEventInfo.entryEndAt)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">최대 입장 가능 인원:</span>
              <span className="detail-value">
                {eventData.qrcodeBenefitInfo.maxAttendeeCount}명
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">현재 등록 인원:</span>
              <span className="detail-value">
                {eventData.qrcodeBenefitInfo.maxAttendeeCount -
                  eventData.qrcodeBenefitInfo.availableAttendeeCount}
                명
              </span>
            </div>
          </div>
        )}
        <div className="result-summary">
          총 <span className="highlight">{pagination.totalItems}</span>개의
          방명록이 등록되었습니다.
        </div>
      </div>

      <div className="guestbook-list-container">
        {guestbooks.length > 0 ? (
          <>
            <div className="guestbook-list">
              {guestbooks.map((item) => (
                <div key={item.id} className="guestbook-card">
                  <div className="guestbook-card-header">
                    <h3 className="guest-name">{item.name}</h3>
                    <span className="guest-date">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 UI */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevious || loading}
                >
                  처음
                </button>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevious || loading}
                >
                  이전
                </button>

                <div className="pagination-info">
                  {pagination.currentPage} / {pagination.totalPages}
                </div>

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  다음
                </button>
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNext || loading}
                >
                  마지막
                </button>
              </div>
            )}

            {loading && (
              <div className="loading-more">
                <div className="loading-spinner-small" />
                <p>불러오는 중...</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-result">
            <p>아직 등록된 방명록이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestbookResult;
