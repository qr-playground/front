import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteQrCodeByShortId,
  getQrCodeResultData,
  terminateQrCode,
  updateQrCodeMeta,
} from "../../api/qrcodeResult";
import { formatToKoreanDateTime } from "../../utils/dateUtils";
import "./MyQrcodeResult.css";

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

const MyQrcodeResult: React.FC = () => {
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<
    "terminate" | "delete" | null
  >(null);

  // 인라인 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);

  const fetchGuestbooks = async (page: number) => {
    if (!shortId) return;

    try {
      setLoading(true);
      const response = await getQrCodeResultData(
        shortId,
        page,
        pagination.pageSize
      );
      setEventData(response.data.qrCodeInfo.qrcodeEventInfo);
      setGuestbooks(response.data.guestbooks);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error("QR 코드 결과 데이터 로딩 실패:", err);
      setError("QR 코드 정보를 불러오는데 실패했습니다.");
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

    // 첫 페이지 데이터 로드
    fetchGuestbooks(1);
  }, [shortId]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchGuestbooks(newPage);
  };

  // 날짜 포맷 함수 - 한국 시간으로 변환
  const formatDate = (dateString: string): string => {
    return formatToKoreanDateTime(dateString);
  };

  // 타임존 미표기(예: YYYY-MM-DDTHH:mm:ss)면 UTC로 간주해 파싱
  const parseApiDate = (s: string | null | undefined): Date | null => {
    if (!s) return null;
    const hasZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(s);
    return hasZone ? new Date(s) : new Date(`${s}Z`);
  };

  // QR 코드 인라인 수정 시작
  const handleEditQrCode = () => {
    if (!eventData) return;
    setIsEditing(true);
    setEditTitle(eventData.title);
    setEditDescription(eventData.description || "");
    setTitleTouched(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditDescription("");
    setError(null);
    setTitleTouched(false);
  };

  const handleSaveEdit = async () => {
    if (!shortId) return;
    if (!editTitle.trim()) {
      setError("제목을 입력해주세요.");
      setTitleTouched(true);
      return;
    }
    try {
      setSaving(true);
      await updateQrCodeMeta(shortId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      // 로컬 상태 반영 및 재조회
      setEventData((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle.trim(),
              description: editDescription.trim(),
            }
          : prev
      );
      await fetchGuestbooks(pagination.currentPage);
      setIsEditing(false);
    } catch (err) {
      console.error("QR 코드 메타 저장 실패:", err);
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  // QR 코드 종료 확인 모달 표시
  const showTerminateConfirmation = () => {
    setConfirmationType("terminate");
    setShowConfirmation(true);
  };

  // QR 코드 삭제 확인 모달 표시
  const showDeleteConfirmation = () => {
    setConfirmationType("delete");
    setShowConfirmation(true);
  };

  // 확인 모달 닫기
  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationType(null);
  };

  // QR 코드 종료 처리
  const handleTerminateQrCode = async () => {
    if (!shortId) return;

    try {
      setLoading(true);
      const response = await terminateQrCode(shortId);
      console.log("QR 코드 종료 결과:", response);
      alert("QR 코드 접근이 종료되었습니다.");

      // 데이터 다시 로드
      fetchGuestbooks(pagination.currentPage);
      closeConfirmation();
    } catch (err) {
      console.error("QR 코드 종료 실패:", err);
      alert("QR 코드 접근 종료 중 오류가 발생했습니다.");
      setLoading(false);
      closeConfirmation();
    }
  };

  // QR 코드 삭제 처리
  const handleDeleteQrCode = async () => {
    if (!shortId) return;

    try {
      setLoading(true);
      const response = await deleteQrCodeByShortId(shortId);
      console.log("QR 코드 삭제 결과:", response);
      alert("QR 코드가 삭제되었습니다.");
      closeConfirmation();
      navigate("/settings/my-qrcodes");
    } catch (err) {
      console.error("QR 코드 삭제 실패:", err);
      alert("QR 코드 삭제 중 오류가 발생했습니다.");
      setLoading(false);
      closeConfirmation();
    }
  };

  // QR 코드 상태 확인
  const getQrStatus = (): { status: string; className: string } => {
    if (!eventData)
      return { status: "알 수 없음", className: "status-unknown" };

    const now = new Date();
    const startAt = parseApiDate(eventData.entryStartAt);
    const endAt = parseApiDate(eventData.entryEndAt);

    if (startAt && now < startAt) {
      return { status: "예정됨", className: "status-pending" };
    } else if (endAt && now > endAt) {
      return { status: "만료됨", className: "status-expired" };
    } else {
      return { status: "활성", className: "status-active" };
    }
  };

  const { status, className } = getQrStatus();

  if (loading && guestbooks.length === 0) {
    return (
      <div className="qrcode-result-container loading">
        <div className="loading-spinner" />
        <p>QR 코드 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error && guestbooks.length === 0) {
    return (
      <div className="qrcode-result-container error">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/settings/my-qrcodes")}>
            QR 코드 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qrcode-result-container">
      {/* QR 코드 정보 헤더 */}
      <div className="qrcode-result-header">
        <div className="header-title-section">
          {isEditing ? (
            <div style={{ width: "100%" }}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (!titleTouched) setTitleTouched(true);
                }}
                onBlur={() => setTitleTouched(true)}
                placeholder="제목을 입력하세요"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  border:
                    !editTitle.trim() && titleTouched
                      ? "1px solid #ef4444"
                      : "1px solid #ddd",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                disabled={saving}
              />
              {!editTitle.trim() && titleTouched && (
                <div style={{ marginTop: 4 }}>
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "0.95rem",
                      lineHeight: 1.3,
                      fontWeight: 500,
                    }}
                  >
                    제목은 비워둘 수 없습니다.
                  </span>
                </div>
              )}
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="설명을 입력하세요"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
                disabled={saving}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  className="action-button edit-button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  className="action-button delete-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  취소
                </button>
                <span
                  className={`qrcode-status ${className}`}
                  style={{ marginLeft: "auto" }}
                >
                  {status}
                </span>
              </div>
              {error && (
                <div className="error-message" style={{ marginTop: 10 }}>
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <h1>{eventData?.title || "QR 코드 관리"}</h1>
              <span className={`qrcode-status ${className}`}>{status}</span>
            </>
          )}
        </div>

        {!isEditing && eventData?.description && (
          <p className="qrcode-description">{eventData.description}</p>
        )}

        <div className="qrcode-meta">
          <div className="qrcode-meta-item">
            <span className="meta-label">입장 코드:</span>
            <span className="meta-value">{eventData?.shortId}</span>
          </div>
          <div className="qrcode-meta-item">
            <span className="meta-label">시작 시간:</span>
            <span className="meta-value">
              {eventData && formatDate(eventData.entryStartAt)}
            </span>
          </div>
          <div className="qrcode-meta-item">
            <span className="meta-label">종료 시간:</span>
            <span className="meta-value">
              {eventData && formatDate(eventData.entryEndAt)}
            </span>
          </div>
          {eventData?.secretCode && (
            <div className="qrcode-meta-item">
              <span className="meta-label">비밀 코드:</span>
              <span className="meta-value">{eventData.secretCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR 코드 관리 액션 버튼 */}
      <div className="qrcode-result-actions">
        {!isEditing ? (
          <button
            className="action-button edit-button"
            onClick={handleEditQrCode}
          >
            QR 코드 수정
          </button>
        ) : null}
        <button
          className="action-button terminate-button"
          onClick={showTerminateConfirmation}
          disabled={status === "만료됨"}
        >
          즉시 종료시키기
        </button>
        <button
          className="action-button delete-button"
          onClick={showDeleteConfirmation}
        >
          QR 코드 삭제
        </button>
      </div>

      {/* 방명록 결과 섹션 */}
      <div className="guestbook-result-section">
        <div className="section-header">
          <h2>방명록 결과</h2>
          <div className="result-summary">
            총 <span className="highlight">{pagination.totalItems}</span>명이
            참여했습니다.
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

      {/* 하단 내비게이션 */}
      <div className="bottom-navigation">
        <button
          className="back-button"
          onClick={() => navigate("/settings/my-qrcodes")}
        >
          QR 코드 목록으로 돌아가기
        </button>
      </div>

      {/* 확인 모달 */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>
                {confirmationType === "terminate"
                  ? "QR 코드 접근 종료"
                  : "QR 코드 삭제"}
              </h3>
            </div>
            <div className="modal-body">
              {confirmationType === "terminate" ? (
                <p className="modal-message">
                  이 QR 코드에 대한 접근을 종료하시겠습니까?
                  <br />
                  종료 후에는 새로운 방명록이 등록되지 않습니다.
                </p>
              ) : (
                <p className="modal-message">
                  이 QR 코드를 삭제하시겠습니까?
                  <br />
                  삭제한 QR 코드는 복구할 수 없습니다.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={closeConfirmation}>
                취소
              </button>
              <button
                className={
                  confirmationType === "terminate"
                    ? "terminate-confirm"
                    : "delete-confirm"
                }
                onClick={
                  confirmationType === "terminate"
                    ? handleTerminateQrCode
                    : handleDeleteQrCode
                }
              >
                {confirmationType === "terminate" ? "종료하기" : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQrcodeResult;
