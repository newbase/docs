/**
 * Classes Data Hook
 *
 * 백엔드 API 변경: Course → Class (2026-02-02)
 * - 실제 API: GET /class/organization/list (organizationId 필수)
 * - Mock 또는 organizationId 없을 때: mock 데이터
 */
import { useState, useEffect, useCallback } from 'react';
import { ClassItem } from '../classes';
import { mockClassesData } from '../mock/classes';
import { isFeatureEnabled } from '../../config/featureFlags';
import { getClassListByOrganization, getClassDetail } from '../../services/classService';
import { classListItemDtoToClassItem, classDetailDtoToClassItem } from '../../utils/classUtils';

/**
 * Class API로 기관별 클래스 목록 조회 후 ClassItem 형태로 반환
 */
const fetchClassesFromClassAPI = async (
  organizationId: string
): Promise<Record<string, ClassItem>> => {
  const res = await getClassListByOrganization({
    organizationId: Number(organizationId),
    page: 1,
    pageSize: 500,
  });
  const list = (res.classList ?? []).map((dto) =>
    classListItemDtoToClassItem(dto, { organizationId: Number(organizationId) })
  );
  const record: Record<string, ClassItem> = {};
  list.forEach((item) => {
    record[item.id] = item;
  });
  return record;
};

/**
 * 클래스 데이터를 가져오는 훅
 * - organizationId 있고 USE_MOCK_DATA false → GET /class/organization/list 연동
 * - 그 외 → mock 데이터 (기존 /classes 엔드포인트 제거됨, Swagger 기준 Class API 사용)
 */
export const useClasses = (organizationId?: string | null) => {
  const [classes, setClasses] = useState<Record<string, ClassItem>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      setError(null);

      try {
        const useMock = isFeatureEnabled('USE_MOCK_DATA');

        if (useMock || !organizationId) {
          setClasses(mockClassesData);
        } else {
          const data = await fetchClassesFromClassAPI(organizationId);
          // API가 없거나 빈 목록을 반환한 경우 mock 데이터 적용
          const isEmpty = !data || Object.keys(data).length === 0;
          setClasses(isEmpty ? mockClassesData : data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setClasses(mockClassesData);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [organizationId]);

  return { classes, loading, error };
};

/**
 * 특정 클래스 데이터 가져오기
 * - organizationId 있으면 useClasses(organizationId)에서 조회 (목록에 포함된 경우)
 */
export const useClass = (
  classId: string | undefined,
  organizationId?: string | null
) => {
  const { classes, loading, error } = useClasses(organizationId);
  const [classData, setClassData] = useState<ClassItem | null>(null);

  useEffect(() => {
    if (classId && classes[classId]) {
      setClassData(classes[classId]);
    } else {
      setClassData(null);
    }
  }, [classId, classes]);

  return { classData, loading, error };
};

/**
 * 클래스 목록을 배열로 반환
 * - organizationId 있고 USE_MOCK_DATA false → GET /class/organization/list 기반 목록
 */
export const useClassesList = (organizationId?: string | null) => {
  const { classes, loading, error } = useClasses(organizationId);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);

  useEffect(() => {
    setClassesList(Object.values(classes));
  }, [classes]);

  return { classesList, loading, error };
};

/**
 * 클래스 상세 조회 (GET /class/{classId})
 * - USE_MOCK_DATA false이고 classId 유효할 때만 API 호출
 * - refetch: 비밀번호 변경 등 후 상세 재조회 시 사용
 */
export const useClassDetail = (
  classId: string | number | undefined,
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled ?? (!isFeatureEnabled('USE_MOCK_DATA') && classId != null && String(classId).trim() !== '');
  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled || classId == null) return;
    setLoading(true);
    setError(null);
    try {
      const dto = await getClassDetail(Number(classId));
      setClassData(classDetailDtoToClassItem(dto));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setClassData(null);
    } finally {
      setLoading(false);
    }
  }, [classId, enabled]);

  useEffect(() => {
    if (!enabled || classId == null) {
      setClassData(null);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [refetch]);

  return { classData, loading, error, refetch };
};
