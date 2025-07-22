import { useCallback, useEffect, useState } from 'react';
import { getCurrentDeviceId, initializeDeviceId, refreshDeviceId } from '../utils/deviceId';

interface UseDeviceIdReturn {
  deviceId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Device ID를 관리하는 React Hook
 */
export const useDeviceId = (): UseDeviceIdReturn => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Device ID 초기화
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const id = await initializeDeviceId();
      setDeviceId(id);
      
      if (!id) {
        setError('Device ID를 가져올 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Device ID 초기화 실패';
      setError(errorMessage);
      console.error('Device ID 초기화 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Device ID 재발급
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newId = await refreshDeviceId();
      setDeviceId(newId);
      
      if (!newId) {
        setError('Device ID를 재발급할 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Device ID 재발급 실패';
      setError(errorMessage);
      console.error('Device ID 재발급 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 이미 캐시된 Device ID가 있는지 먼저 확인
    const cachedId = getCurrentDeviceId();
    if (cachedId) {
      setDeviceId(cachedId);
      setIsLoading(false);
    } else {
      // 캐시된 ID가 없으면 서버에서 발급
      initialize();
    }
  }, [initialize]);

  return {
    deviceId,
    isLoading,
    error,
    refresh,
  };
}; 