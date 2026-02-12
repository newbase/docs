/**
 * Course (Class) Service
 * 
 * 백엔드의 /course 엔드포인트와 통신하는 서비스입니다.
 * UI에서는 '클래스(Class)'라는 용어를 사용하지만, 
 * 백엔드 API와의 통신에서는 '코스(Course)' 용어를 사용합니다.
 */

import { apiClient } from './apiClient';
import {
  GetCourseListByOrganizationResponseDto,
  CourseListItemDto,
  GetCourseDetailResponseDto,
  CreateCourseRequestDto,
  CreateCourseResponseDto,
  UpdateCourseRequestDto
} from '../types/api/course';

import { featureFlags } from '../config/featureFlags';
import { mockClassesData } from '../data/mock/classes';

export const courseService = {
  /**
   * 기관별 코스(클래스) 리스트 조회
   */
  getCoursesByOrganization: async (organizationId: number): Promise<GetCourseListByOrganizationResponseDto> => {
    if (featureFlags.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Map mockClassesData to GetCourseListByOrganizationResponseDto
      const courseList = Object.values(mockClassesData).map(c => ({
        courseId: parseInt(c.id) || Math.floor(Math.random() * 1000),
        title: c.title,
        scenarioCount: (c.curriculum || []).length,
        participantCount: c.currentParticipants || 0,
        isActive: c.isActive ?? !c.password,
        startDate: c.participationPeriod?.startDate || '',
        endDate: c.participationPeriod?.endDate || null,
      }));
      return {
        courseList: courseList as CourseListItemDto[],
        totalCount: courseList.length,
        totalParticipantCount: courseList.reduce((sum, c) => sum + c.participantCount, 0)
      };
    }

    return await apiClient.get<GetCourseListByOrganizationResponseDto>(`/course/organization/list`, {
      params: { organizationId }
    });
  },

  /**
   * 코스(클래스) 상세 조회
   */
  getCourseDetail: async (courseId: number): Promise<GetCourseDetailResponseDto> => {
    if (featureFlags.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const course = Object.values(mockClassesData).find(c => c.id === courseId.toString());
      if (!course) throw new Error('클래스를 찾을 수 없습니다.');

      return {
        courseId: parseInt(course.id),
        title: course.title,
        isPrivate: !!course.password,
        minPerfectCount: null,
        minExcellentOrHigherCount: null,
        minGoodOrHigherCount: null,
        minPlayCount: course.completionRequirements?.minScenarios || 0,
        scenarioList: (course.curriculum || []).map((s, index) => ({
          scenarioId: typeof s.id === 'string' ? parseInt(s.id) || index : s.id,
          order: index + 1,
        })),
      };
    }

    return await apiClient.get<GetCourseDetailResponseDto>(`/course/${courseId}`);
  },

  /**
   * 새로운 코스(클래스) 생성
   */
  createCourse: async (data: CreateCourseRequestDto): Promise<CreateCourseResponseDto> => {
    if (featureFlags.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        courseId: Math.floor(Math.random() * 1000)
      };
    }
    return await apiClient.post<CreateCourseResponseDto>('/course', data);
  },

  /**
   * 코스(클래스) 정보 수정
   */
  updateCourse: async (courseId: number, data: UpdateCourseRequestDto): Promise<void> => {
    if (featureFlags.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return;
    }
    return await apiClient.put(`/course/${courseId}`, data);
  },

  /**
   * 코스(클래스) 삭제
   */
  deleteCourse: async (courseId: number): Promise<void> => {
    if (featureFlags.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }
    return await apiClient.delete(`/course/${courseId}`);
  },

  /**
   * 코스(클래스) 수강신청 (참여)
   */
  enrollCourse: async (courseId: number): Promise<void> => {
    if (featureFlags.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    return await apiClient.post(`/course/${courseId}/enroll`);
  }
};

export default courseService;
