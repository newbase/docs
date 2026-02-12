/**
 * Dashboard Data Hook
 * 
 * 목업 데이터와 실제 API를 전환할 수 있는 훅
 * Feature Flag를 통해 mock ↔ real 스위칭
 */
import { useState, useEffect } from 'react';
import { DashboardActivity, Patient } from '../../types/dashboard';
import { studentMockData, masterMockData } from '../mock/dashboard';
import { isFeatureEnabled } from '../../config/featureFlags';
import apiClient from '../../services/apiClient';

/**
 * 실제 API에서 학생 대시보드 데이터 가져오기
 */
const fetchStudentDashboardFromAPI = async (userId: string) => {
  try {
    const data = await apiClient.get(`/dashboard/student/${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    throw error;
  }
};

/**
 * 실제 API에서 마스터 대시보드 데이터 가져오기
 */
const fetchMasterDashboardFromAPI = async (userId: string) => {
  try {
    const data = await apiClient.get(`/dashboard/master/${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching master dashboard:', error);
    throw error;
  }
};

/**
 * 학생 대시보드 데이터 훅
 */
export const useStudentDashboard = (userId?: string) => {
  const [data, setData] = useState<typeof studentMockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const useMock = isFeatureEnabled('USE_MOCK_DATA');
        
        if (useMock || !userId) {
          // 목업 데이터 사용
          setData(studentMockData);
        } else {
          // 실제 API 사용
          const apiData = await fetchStudentDashboardFromAPI(userId);
          setData(apiData);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // 에러 발생 시 목업 데이터로 폴백
        setData(studentMockData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  return { data, loading, error };
};

/**
 * 마스터 대시보드 데이터 훅
 */
export const useMasterDashboard = (userId?: string, scenarioDetails?: any) => {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const useMock = isFeatureEnabled('USE_MOCK_DATA');
        
        if (useMock || !userId) {
          // 목업 데이터 사용
          const mockActivities = scenarioDetails 
            ? masterMockData.generateMockActivities(scenarioDetails)
            : [];
          setActivities(mockActivities);
        } else {
          // 실제 API 사용
          const apiData = await fetchMasterDashboardFromAPI(userId);
          setActivities(apiData.activities || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // 에러 발생 시 빈 배열로 폴백
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId, scenarioDetails]);

  return { activities, loading, error };
};
