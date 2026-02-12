/**
 * Feature Flags Configuration
 * 
 * 운영 환경에서 기능을 단계적으로 노출하기 위한 Feature Flag 시스템
 * 환경 변수 또는 설정 파일을 통해 제어 가능
 */
import React from 'react';

export interface FeatureFlags {
  // UI Features
  FEATURE_COURSE_PLAYER_UI: boolean;
  FEATURE_STUDIO_EDITOR: boolean;
  FEATURE_DASHBOARD_ANALYTICS: boolean;
  FEATURE_ADVANCED_FILTERS: boolean;
  
  // API Features
  USE_MOCK_DATA: boolean; // true: mock 데이터 사용, false: 실제 API 사용
  
  // Role-based Features
  FEATURE_PREMIUM_FEATURES: boolean;
  FEATURE_ADMIN_PANEL: boolean;
  
  // Environment-specific
  ENABLE_DEV_TOOLS: boolean;
  ENABLE_EMAIL_PREVIEW: boolean;
}

/**
 * 환경 변수에서 Feature Flag 읽기
 * 기본값은 개발 환경에서는 true, 프로덕션에서는 false
 */
const getEnvFlag = (key: string, defaultValue: boolean = false): boolean => {
  const envValue = process.env[`REACT_APP_${key}`];
  if (envValue === undefined) return defaultValue;
  return envValue === 'true' || envValue === '1';
};

/**
 * 현재 환경 감지
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Feature Flags 설정
 * 환경 변수로 오버라이드 가능
 */
export const featureFlags: FeatureFlags = {
  // UI Features
  FEATURE_COURSE_PLAYER_UI: getEnvFlag('FEATURE_COURSE_PLAYER_UI', !isProduction),
  FEATURE_STUDIO_EDITOR: getEnvFlag('FEATURE_STUDIO_EDITOR', true),
  FEATURE_DASHBOARD_ANALYTICS: getEnvFlag('FEATURE_DASHBOARD_ANALYTICS', true),
  FEATURE_ADVANCED_FILTERS: getEnvFlag('FEATURE_ADVANCED_FILTERS', !isProduction),
  
  // API Features
  USE_MOCK_DATA: getEnvFlag('USE_MOCK_DATA', isDevelopment),
  
  // Role-based Features
  FEATURE_PREMIUM_FEATURES: getEnvFlag('FEATURE_PREMIUM_FEATURES', true),
  FEATURE_ADMIN_PANEL: getEnvFlag('FEATURE_ADMIN_PANEL', true),
  
  // Environment-specific
  ENABLE_DEV_TOOLS: getEnvFlag('ENABLE_DEV_TOOLS', isDevelopment),
  ENABLE_EMAIL_PREVIEW: getEnvFlag('ENABLE_EMAIL_PREVIEW', isDevelopment),
};

/**
 * Feature Flag 체크 헬퍼 함수
 */
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

/**
 * 여러 Feature Flag를 동시에 체크
 */
export const areFeaturesEnabled = (...flags: Array<keyof FeatureFlags>): boolean => {
  return flags.every(flag => featureFlags[flag]);
};

/**
 * Feature Flag를 조건부로 사용하는 HOC
 */
export const withFeatureFlag = <P extends object>(
  Component: React.ComponentType<P>,
  flag: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    if (!isFeatureEnabled(flag)) {
      if (FallbackComponent) {
        return React.createElement(FallbackComponent, props);
      }
      return null;
    }
    return React.createElement(Component, props);
  };
  return WrappedComponent;
};
