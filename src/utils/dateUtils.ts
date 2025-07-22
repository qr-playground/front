/**
 * UTC 시간을 한국 시간으로 변환하여 포맷팅하는 유틸리티 함수들
 */

/**
 * UTC 시간 문자열을 한국 시간으로 변환하여 포맷팅
 * @param utcDateString UTC 시간 문자열 (ISO 형식)
 * @param options Intl.DateTimeFormat 옵션
 * @returns 한국 시간으로 포맷팅된 문자열
 */
export const formatToKoreanTime = (
  utcDateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!utcDateString) return "";

  // UTC 시간을 Date 객체로 변환
  const utcDate = new Date(utcDateString);

  // 한국 시간대 오프셋 적용 (UTC+9)
  const koreanDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul", // 한국 시간대 명시
  };

  const formatOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat("ko-KR", formatOptions).format(koreanDate);
};

/**
 * UTC 시간 문자열을 한국 시간으로 변환하여 간단한 형태로 포맷팅
 * @param utcDateString UTC 시간 문자열 (ISO 형식)
 * @returns 한국 시간으로 포맷팅된 문자열 (예: "2024년 1월 15일 14:30")
 */
export const formatToKoreanDateTime = (utcDateString: string): string => {
  if (!utcDateString) return "";

  // UTC 시간을 Date 객체로 변환
  const utcDate = new Date(utcDateString);

  // 한국 시간대 오프셋 적용 (UTC+9)
  const koreanDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(koreanDate);
};

/**
 * UTC 시간 문자열을 한국 시간으로 변환하여 날짜만 포맷팅
 * @param utcDateString UTC 시간 문자열 (ISO 형식)
 * @returns 한국 시간으로 포맷팅된 날짜 문자열 (예: "2024년 1월 15일")
 */
export const formatToKoreanDate = (utcDateString: string): string => {
  if (!utcDateString) return "";

  // UTC 시간을 Date 객체로 변환
  const utcDate = new Date(utcDateString);

  // 한국 시간대 오프셋 적용 (UTC+9)
  const koreanDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(koreanDate);
};

/**
 * UTC 시간 문자열을 한국 시간으로 변환하여 시간만 포맷팅
 * @param utcDateString UTC 시간 문자열 (ISO 형식)
 * @returns 한국 시간으로 포맷팅된 시간 문자열 (예: "14:30")
 */
export const formatToKoreanTimeOnly = (utcDateString: string): string => {
  if (!utcDateString) return "";

  // UTC 시간을 Date 객체로 변환
  const utcDate = new Date(utcDateString);

  // 한국 시간대 오프셋 적용 (UTC+9)
  const koreanDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(koreanDate);
};
