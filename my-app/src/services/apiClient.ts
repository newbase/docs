/**
 * API Client
 * 
 * 통합 API 클라이언트 - 모든 API 요청을 중앙에서 관리
 * - 인증 토큰 자동 주입
 * - 요청/응답 인터셉터
 * - 에러 처리
 * - 타입 안전한 API 호출
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

/**
 * API 에러 타입 정의
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * 요청 옵션 타입
 */
export interface RequestOptions extends RequestInit {
  skipAuth?: boolean; // 인증 토큰을 건너뛸지 여부
  timeout?: number; // 타임아웃 (ms)
  params?: Record<string, any>; // Query parameters
}

/**
 * 토큰 저장소 관리
 */
class TokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'medicrew_access_token';
  private readonly REFRESH_TOKEN_KEY = 'medicrew_refresh_token';

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken();
  }
}

const tokenStorage = new TokenStorage();

/**
 * 토큰 갱신 함수 타입
 */
type TokenRefreshFn = () => Promise<{ accessToken: string; refreshToken?: string } | null>;

let tokenRefreshFn: TokenRefreshFn | null = null;

/**
 * 토큰 갱신 함수 설정
 */
export const setTokenRefreshFn = (fn: TokenRefreshFn) => {
  tokenRefreshFn = fn;
};

/**
 * 토큰 갱신 함수 초기화
 * 
 * ⚠️ TEMPORARY FIX: 토큰 갱신 로직 임시 복구
 * TODO: useUser 훅에서 토큰 갱신 처리하도록 리팩토링 필요
 */
export const initializeTokenRefresh = () => {
  // 임시: 토큰 갱신 함수 설정 (무한 리다이렉트 방지)
  setTokenRefreshFn(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      // TODO: 실제 토큰 갱신 API 엔드포인트로 교체 필요
      const response = await fetch(`${API_BASE_URL}/user/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  });
};

/**
 * 기본 fetch 래퍼 (타임아웃 지원)
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout', undefined, '요청 시간이 초과되었습니다.');
    }
    throw error;
  }
};

/**
 * 에러 응답 파싱
 */
const parseErrorResponse = async (response: Response): Promise<any> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { message: response.statusText };
  } catch {
    return { message: response.statusText };
  }
};

/**
 * 에러 메시지 변환 (사용자 친화적)
 */
const getErrorMessage = (error: ApiError): string => {
  // 백엔드에서 제공한 에러 메시지가 있으면 사용
  if (error.data?.message) {
    return error.data.message;
  }

  // 상태 코드별 기본 메시지
  switch (error.status) {
    case 400:
      return '잘못된 요청입니다.';
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 502:
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.';
  }
};

/**
 * 토큰 갱신 시도
 */
const refreshAccessToken = async (): Promise<boolean> => {
  if (!tokenRefreshFn) {
    return false;
  }

  try {
    const tokens = await tokenRefreshFn();
    if (tokens) {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return false;
};

/**
 * API 요청 실행 (재시도 로직 포함)
 */
const executeRequest = async <T = any>(
  url: string,
  options: RequestOptions,
  retryOn401: boolean = true
): Promise<ApiResponse<T>> => {
  const timeout = options.timeout || 30000;
  delete options.timeout;

  try {
    const response = await fetchWithTimeout(url, options, timeout);

    // 401 에러 처리 (토큰 만료 또는 세션 없음)
    if (response.status === 401) {
      // 토큰이 있고 갱신 함수가 있으면 갱신 시도
      if (retryOn401 && tokenStorage.hasTokens() && tokenRefreshFn) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // 토큰 갱신 후 요청 재시도
          const newHeaders = new Headers(options.headers);
          const newToken = tokenStorage.getAccessToken();
          if (newToken) {
            newHeaders.set('Authorization', `Bearer ${newToken}`);
          }
          return executeRequest<T>(url, { ...options, headers: newHeaders }, false);
        }
      }
      
      // 토큰 갱신 실패 또는 토큰이 없음 - 로그인 페이지로 리다이렉트
      tokenStorage.clearTokens();
      // localStorage에서 유저 정보도 제거
      localStorage.removeItem('medicrew_user');
      
      if (typeof window !== 'undefined') {
        // 현재 경로를 저장하여 로그인 후 복귀할 수 있도록 함
        const currentPath = window.location.pathname + window.location.search;
        
        // 이미 로그인 페이지에 있으면 리다이렉트하지 않음 (무한 루프 방지)
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=token_expired`;
        }
      }
      // 리다이렉트 후 실행을 중단하기 위해 에러 throw
      throw new ApiError(401, 'Unauthorized', undefined, '토큰이 만료되었거나 세션이 없습니다.');
    }

    // 응답 파싱
    const contentType = response.headers.get('content-type');
    let data: T;
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      data = text ? JSON.parse(text) : ({} as T);
    } else {
      data = (await response.text()) as unknown as T;
    }

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = typeof data === 'object' && data !== null ? data : {};
      const error = new ApiError(
        response.status,
        response.statusText,
        errorData,
        getErrorMessage(new ApiError(response.status, response.statusText, errorData))
      );
      
      // 개발 환경에서 로깅
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
      }
      
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        0,
        'Network Error',
        undefined,
        '네트워크 연결을 확인해주세요.'
      );
    }

    // 이미 ApiError인 경우 그대로 throw
    if (error instanceof ApiError) {
      throw error;
    }

    // 기타 에러
    throw new ApiError(
      0,
      'Unknown Error',
      undefined,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    );
  }
};

/**
 * API 클라이언트 클래스
 */
class ApiClient {
  /**
   * 요청 헤더 생성
   */
  private getHeaders(options: RequestOptions = {}, body?: any): HeadersInit {
    const headers: Record<string, string> = {};
    
    // 엄격하게: FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 포함하여 설정)
    // FormData가 아닌 경우에만 Content-Type 설정
    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    // options.headers에 명시적으로 설정된 헤더 병합 (FormData인 경우 Content-Type 제외)
    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.entries(customHeaders).forEach(([key, value]) => {
        // FormData인 경우 Content-Type 헤더는 무시 (브라우저가 자동 설정)
        if (!(isFormData && key.toLowerCase() === 'content-type')) {
          headers[key] = value;
        }
      });
    }

    // 인증 토큰 추가 (skipAuth가 false이고 토큰이 있는 경우)
    if (!options.skipAuth && tokenStorage.hasTokens()) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * GET 요청
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Query params를 URL에 추가
    let url = `${API_BASE_URL}${endpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // boolean 값은 문자열로 변환 (true → "true", false → "false")
          // 백엔드 API가 boolean을 기대하는 경우 문자열로 전달
          const paramValue = typeof value === 'boolean' ? String(value) : String(value);
          searchParams.append(key, paramValue);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      // 개발 환경에서 API 호출 URL 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] GET ${url}`, options.params);
      }
    }

    const response = await executeRequest<T>(url, {
      ...options,
      method: 'GET',
      headers: this.getHeaders(options),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] GET ${endpoint}`, response.data);
    }

    return response.data;
  }

  /**
   * POST 요청
   */
  async post<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 엄격하게: FormData인 경우 JSON.stringify 하지 않음
    const isFormData = data instanceof FormData;
    const body = data ? (isFormData ? data : JSON.stringify(data)) : undefined;
    
    const response = await executeRequest<T>(url, {
      ...options,
      method: 'POST',
      headers: this.getHeaders(options, data),
      body,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] POST ${endpoint}`, { request: data, response: response.data, isFormData });
    }

    return response.data;
  }

  /**
   * PUT 요청
   */
  async put<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await executeRequest<T>(url, {
      ...options,
      method: 'PUT',
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] PUT ${endpoint}`, { request: data, response: response.data });
    }

    return response.data;
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await executeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] PATCH ${endpoint}`, { request: data, response: response.data });
    }

    return response.data;
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await executeRequest<T>(url, {
      ...options,
      method: 'DELETE',
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] DELETE ${endpoint}`, response.data);
    }

    return response.data;
  }

  /**
   * 토큰 설정
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    tokenStorage.setTokens(accessToken, refreshToken);
  }

  /**
   * 토큰 제거
   */
  clearTokens(): void {
    tokenStorage.clearTokens();
  }

  /**
   * 토큰 확인
   */
  hasTokens(): boolean {
    return tokenStorage.hasTokens();
  }
}

// 싱글톤 인스턴스 export
export const apiClient = new ApiClient();

// 기본 export
export default apiClient;
