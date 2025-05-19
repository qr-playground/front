import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGuestbooksPaginated } from "../../api/guestbook";
import { getQRCodeEvent } from "../../api/qrcode";
import "./GuestbookResult.css";

// QR 코드 이벤트 정보 타입 정의
interface QrEventInfo {
  id: string;
  shortId: string;
  title: string;
  description: string;
  secretCode: string;
  entryStartAt: string;
  entryEndAt: string;
}

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
  const [eventData, setEventData] = useState<QrEventInfo | null>(null);
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
      setLoading(true);
      const response = await getGuestbooksPaginated(
        shortId,
        page,
        pagination.pageSize
      );
      setGuestbooks(response.data.guestbooks);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error("방명록 데이터 로딩 실패:", err);
      setError("방명록 정보를 불러오는데 실패했습니다.");
      setLoading(false);
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
      try {
        setLoading(true);
        // 이벤트 정보 가져오기
        const eventResponse = await getQRCodeEvent(shortId);
        setEventData(eventResponse.data.qrcodeInfo.qrcodeEventInfo);

        // 방명록 목록 가져오기 (첫 페이지)
        await fetchGuestbooks(1);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setError("방명록 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, [shortId]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchGuestbooks(newPage);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
        <h1>{eventData?.title || "방명록 결과"}</h1>
        {eventData?.description && (
          <p className="event-description">{eventData.description}</p>
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
