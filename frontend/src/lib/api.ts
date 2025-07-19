import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';
import { ENV, API_ENDPOINTS, DEFAULTS } from './constants';

// Types for better API handling
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retries?: number;
  retryDelay?: number;
}

// Enhanced error class for better error handling
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: any;

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Retry configuration
const retryConfig = {
  retries: DEFAULTS.RETRY_ATTEMPTS,
  retryDelay: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000),
  retryCondition: (error: AxiosError) => {
    return !error.response || error.response.status >= 500;
  },
};

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: ENV.API_URL,
    timeout: DEFAULTS.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for auth token and request logging
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available and not skipped
      if (!config.skipAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add request timestamp for performance monitoring
      config.metadata = { startTime: new Date().getTime() };

      // Log request in development
      if (ENV.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and logging
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      const duration = new Date().getTime() - response.config.metadata?.startTime;

      // Log response in development
      if (ENV.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
          status: response.status,
          data: response.data,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as ApiRequestConfig;

      // Log error in development
      if (ENV.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }

      // Handle token expiration
      if (error.response?.status === 401 && !originalRequest?.skipAuth) {
        localStorage.removeItem('token');
        delete client.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(new ApiError('Authentication required', 401, 'UNAUTHORIZED'));
      }

      // Retry logic for failed requests
      if (
        originalRequest &&
        retryConfig.retryCondition(error) &&
        (!originalRequest.retries || originalRequest.retries < retryConfig.retries)
      ) {
        originalRequest.retries = (originalRequest.retries || 0) + 1;
        const delay = originalRequest.retryDelay || retryConfig.retryDelay(originalRequest.retries);

        await new Promise(resolve => setTimeout(resolve, delay));
        return client(originalRequest);
      }

      // Transform error to ApiError
      const apiError = transformError(error);
      return Promise.reject(apiError);
    }
  );

  return client;
};

// Transform axios error to ApiError
const transformError = (error: AxiosError): ApiError => {
  if (error.response) {
    const { status, data } = error.response;
    const errorData = data as any;
    
    return new ApiError(
      errorData?.error || errorData?.message || 'Request failed',
      status,
      errorData?.code || `HTTP_${status}`,
      errorData?.details
    );
  }

  if (error.request) {
    return new ApiError(
      'Network error - please check your connection',
      0,
      'NETWORK_ERROR'
    );
  }

  return new ApiError(
    error.message || 'Unknown error occurred',
    500,
    'UNKNOWN_ERROR'
  );
};

// Create the main API client
export const api = createApiClient();

// Generic API methods with better typing
export class ApiClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // Generic GET request
  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Generic POST request
  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  async patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Paginated GET request
  async getPaginated<T = any>(
    url: string, 
    params?: { page?: number; limit?: number; [key: string]: any },
    config?: ApiRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(url, {
      ...config,
      params: {
        page: DEFAULTS.PAGINATION.PAGE,
        limit: DEFAULTS.PAGINATION.LIMIT,
        ...params,
      },
    });
    return response.data;
  }

  // File upload with progress
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Batch requests
  async batch<T = any>(requests: Array<() => Promise<any>>): Promise<T[]> {
    const results = await Promise.allSettled(requests.map(req => req()));
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Batch request ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
  }
}

// Create typed API client instance
export const apiClient = new ApiClient(api);

// Specific API service classes for better organization
export class AuthService {
  static async login(credentials: { email: string; password: string; mfaToken?: string }) {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  static async register(userData: any) {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async getCurrentUser() {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  static async forgotPassword(email: string) {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  static async resetPassword(token: string, password: string) {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  }

  static async setupMFA() {
    return apiClient.post(API_ENDPOINTS.AUTH.MFA.SETUP);
  }

  static async verifyMFA(token: string) {
    return apiClient.post(API_ENDPOINTS.AUTH.MFA.VERIFY, { token });
  }

  static async disableMFA(password: string) {
    return apiClient.post(API_ENDPOINTS.AUTH.MFA.DISABLE, { password });
  }
}

export class UserService {
  static async getUsers(params?: any) {
    return apiClient.getPaginated(API_ENDPOINTS.USERS, params);
  }

  static async getUser(id: string) {
    return apiClient.get(`${API_ENDPOINTS.USERS}/${id}`);
  }

  static async updateProfile(data: any) {
    return apiClient.put(`${API_ENDPOINTS.USERS}/profile`, data);
  }

  static async createUser(data: any) {
    return apiClient.post(API_ENDPOINTS.USERS, data);
  }

  static async updateUser(id: string, data: any) {
    return apiClient.put(`${API_ENDPOINTS.USERS}/${id}`, data);
  }

  static async deleteUser(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
  }
}

export class PolicyService {
  static async getPolicies(params?: any) {
    return apiClient.getPaginated(API_ENDPOINTS.POLICIES, params);
  }

  static async getPolicy(id: string) {
    return apiClient.get(`${API_ENDPOINTS.POLICIES}/${id}`);
  }

  static async createPolicy(data: any) {
    return apiClient.post(API_ENDPOINTS.POLICIES, data);
  }

  static async updatePolicy(id: string, data: any) {
    return apiClient.put(`${API_ENDPOINTS.POLICIES}/${id}`, data);
  }

  static async deletePolicy(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.POLICIES}/${id}`);
  }
}

export class ClaimService {
  static async getClaims(params?: any) {
    return apiClient.getPaginated(API_ENDPOINTS.CLAIMS, params);
  }

  static async getClaim(id: string) {
    return apiClient.get(`${API_ENDPOINTS.CLAIMS}/${id}`);
  }

  static async createClaim(data: any) {
    return apiClient.post(API_ENDPOINTS.CLAIMS, data);
  }

  static async updateClaim(id: string, data: any) {
    return apiClient.put(`${API_ENDPOINTS.CLAIMS}/${id}`, data);
  }

  static async deleteClaim(id: string) {
    return apiClient.delete(`${API_ENDPOINTS.CLAIMS}/${id}`);
  }

  static async uploadClaimDocument(claimId: string, file: File, onProgress?: (progress: number) => void) {
    return apiClient.uploadFile(`${API_ENDPOINTS.CLAIMS}/${claimId}/documents`, file, onProgress);
  }
}

// Export default api instance for backward compatibility
export default api;