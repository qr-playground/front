import React, { useState } from "react";
import { searchQRCodeEvents } from "../../api/qrcode";
import { QrcodeEventData } from "../../api/types";
import "./Search.css";

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<QrcodeEventData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(20); // 한 페이지당 20개
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  });

  // 검색 함수 (페이지 번호 포함)
  const handleSearch = async (page: number = 0) => {
    if (!searchTerm.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchQRCodeEvents(searchTerm, page, pageSize);
      setSearchResults(response.data.qrcodes);
      setPagination(response.data.pagination);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (err) {
      setError("검색 중 오류가 발생했습니다.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < pagination.totalPages) {
      handleSearch(page);
    }
  };

  // 첫 검색 (엔터키 또는 버튼 클릭)
  const handleInitialSearch = () => {
    setCurrentPage(0);
    handleSearch(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInitialSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>이벤트 검색</h1>
        <p>다양한 QR코드를 검색해보세요!</p>
      </div>

      <div className="search-input-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="이벤트의 제목을 입력해주세요"
            className="search-input"
          />
          <button
            onClick={handleInitialSearch}
            disabled={loading}
            className="search-button"
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>
      </div>

      {error && <div className="search-error">{error}</div>}

      {hasSearched && !loading && (
        <div className="search-results-section">
          <div className="search-results-header">
            <h2>검색 결과</h2>
            <span className="search-results-count">
              총 {pagination.totalItems}개의 결과 (페이지{" "}
              {pagination.currentPage + 1} / {pagination.totalPages || 1})
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="search-no-results">
              <p>검색 결과가 없습니다.</p>
              <p>다른 검색어를 시도해보세요.</p>
            </div>
          ) : (
            <>
              <div className="search-results-grid">
                {searchResults.map((qrcode) => (
                  <div key={qrcode.id} className="qrcode-card">
                    <div className="qrcode-card-header">
                      <h3 className="qrcode-title">{qrcode.title}</h3>
                      <span className="qrcode-short-id">#{qrcode.shortId}</span>
                    </div>
                    <p className="qrcode-description">{qrcode.description}</p>
                    <div className="qrcode-details">
                      <div className="qrcode-date">
                        <strong>참여 기간:</strong>
                        <br />
                        {formatDate(qrcode.entryStartAt)} ~{" "}
                        {formatDate(qrcode.entryEndAt)}
                      </div>
                      <div className="qrcode-status">
                        <span
                          className={`status-badge ${
                            qrcode.isEntryEnded ? "ended" : "active"
                          }`}
                        >
                          {qrcode.isEntryEnded ? "종료됨" : "진행중"}
                        </span>
                      </div>
                    </div>
                    <div className="qrcode-actions">
                      <button
                        onClick={() =>
                          window.open(`/qr-result/${qrcode.shortId}`, "_blank")
                        }
                        className="btn btn-primary"
                      >
                        QR 코드 보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 UI */}
              {pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="pagination-btn"
                    >
                      이전
                    </button>

                    {/* 페이지 번호들 */}
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`pagination-btn ${
                            index === currentPage ? "active" : ""
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages - 1}
                      className="pagination-btn"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
