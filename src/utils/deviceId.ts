const DEVICE_ID_KEY = 'deviceId';

/**
 * 로컬 스토리지에서 Device ID를 가져옵니다.
 */
export const getStoredDeviceId = (): string | null => {
  try {
    return localStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Device ID 조회 실패:', error);
    return null;
  }
};

/**
 * Device ID를 로컬 스토리지에 저장합니다.
 */
export const storeDeviceId = (deviceId: string): void => {
  try {
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch (error) {
    console.error('Device ID 저장 실패:', error);
  }
};

/**
 * 서버에서 새로운 Device ID를 발급받습니다.
 */
export const fetchDeviceIdFromServer = async (): Promise<string | null> => {
  try {
    // 환경 변수에서 API 기본 URL 가져오기
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    
    const response = await fetch(`${API_BASE_URL}/auth/device-id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Device ID 발급 실패: ${response.status}`);
    }

    const data = await response.json();

    // 서버 응답에서 토큰 추출 (AuthDto.Response 구조에 맞춰)
    const deviceId = data.data.deviceId;

    console.log("deviceId: ", deviceId);
    
    if (!deviceId) {
      throw new Error('서버 응답에 Device ID가 없습니다.');
    }

    return deviceId;
  } catch (error) {
    console.error('Device ID 발급 요청 실패:', error);
    return null;
  }
};

/**
 * Device ID를 초기화합니다.
 * 캐시에 있으면 사용하고, 없으면 서버에서 발급받아 저장합니다.
 */
export const initializeDeviceId = async (): Promise<string | null> => {
  // 1. 캐시에서 기존 Device ID 확인
  let deviceId = getStoredDeviceId();
  
  if (deviceId) {
    console.log('캐시된 Device ID 사용:', deviceId.substring(0, 20) + '...');
    return deviceId;
  }

  // 2. 캐시에 없으면 서버에서 새로 발급
  console.log('Device ID가 없습니다. 서버에서 발급받는 중...');
  deviceId = await fetchDeviceIdFromServer();
  
  if (deviceId) {
    // 3. 발급받은 Device ID를 캐시에 저장
    storeDeviceId(deviceId);
    console.log('새 Device ID 발급 및 저장 완료:', deviceId.substring(0, 20) + '...');
    return deviceId;
  }

  console.error('Device ID 초기화 실패');
  return null;
};

/**
 * Device ID를 강제로 재발급받습니다.
 */
export const refreshDeviceId = async (): Promise<string | null> => {
  console.log('Device ID 강제 재발급 중...');
  
  const newDeviceId = await fetchDeviceIdFromServer();
  
  if (newDeviceId) {
    storeDeviceId(newDeviceId);
    console.log('Device ID 재발급 완료:', newDeviceId.substring(0, 20) + '...');
    return newDeviceId;
  }

  console.error('Device ID 재발급 실패');
  return null;
};

/**
 * 현재 Device ID를 반환합니다. (동기 함수)
 */
export const getCurrentDeviceId = (): string | null => {
  return getStoredDeviceId();
}; 