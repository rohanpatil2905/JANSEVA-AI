// ============================================================================
// JanSeva AI — Centralized API Client & HTTP Transport Layer
// ============================================================================
// Provides a unified request abstraction for all JanSeva services.
// Supports base URL resolution from VITE_API_BASE_URL, bearer token injection,
// standard error normalization, and seamless fallback between API and mock modes.

import axios from 'axios';

// Storage keys
const SESSION_KEY = 'janseva_officer_session';

/**
 * Resolve the API base URL from environment or default to local API endpoint
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api');

/**
 * Check if the application is configured to run against the real backend API
 */
export const isApiMode = () => {
  const dataSource = import.meta.env.VITE_DATA_SOURCE;
  const hasBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL);
  return dataSource === 'api' || hasBaseUrl;
};

/**
 * Standardized Municipal API Error structure
 */
export class MunicipalApiError extends Error {
  constructor({ message, status, code, details, isNetworkError = false }) {
    super(message);
    this.name = 'MunicipalApiError';
    this.status = status;
    this.code = code || 'MUNICIPAL_ERROR';
    this.details = details || null;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Central Axios Instance configured for JanSeva AI
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout for municipal network operations
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor: Attach Bearer Authorization token if officer session exists
 */
axiosInstance.interceptors.request.use(
  config => {
    try {
      if (typeof window !== 'undefined') {
        const rawSession = sessionStorage.getItem(SESSION_KEY);
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        }
      }
    } catch (e) {
      // Ignore session read errors during interceptor
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Response Interceptor: Standardize municipal error codes and messages
 */
axiosInstance.interceptors.response.use(
  response => response.data,
  error => {
    // Network or Server Unreachable
    if (!error.response) {
      const isAbort = error.code === 'ECONNABORTED';
      const municipalError = new MunicipalApiError({
        message: isAbort
          ? 'Municipal server request timed out. Please retry.'
          : 'Unable to connect to municipal backend service. Network offline or server unavailable.',
        status: 0,
        code: isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
        isNetworkError: true,
      });
      return Promise.reject(municipalError);
    }

    const { status, data } = error.response;
    let message = data?.message || data?.error || 'An unexpected municipal service error occurred.';
    let code = data?.code || `HTTP_${status}`;

    switch (status) {
      case 400:
        message = data?.error || data?.message || 'Invalid grievance request parameters.';
        code = code || 'BAD_REQUEST';
        break;
      case 401:
        message = 'Municipal officer session expired or unauthorized. Please re-authenticate.';
        code = 'UNAUTHORIZED';
        // Proactively clear invalid session
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_KEY);
          }
        } catch (e) {}
        break;
      case 403:
        message = 'Insufficient statutory municipal authority for this operational action.';
        code = 'FORBIDDEN_AUTHORITY';
        break;
      case 404:
        message = data?.message || 'Requested municipal grievance record or resource not found.';
        code = 'RESOURCE_NOT_FOUND';
        break;
      case 409:
        message = data?.message || 'Conflict detected. Grievance status or assignment has been modified concurrently.';
        code = 'RESOURCE_CONFLICT';
        break;
      case 422:
        message = data?.message || 'Validation failed. Please verify required statutory fields.';
        code = 'VALIDATION_FAILED';
        break;
      case 429:
        message = 'Municipal API rate limit exceeded. Please throttle requests.';
        code = 'RATE_LIMITED';
        break;
      case 500:
      default:
        message = data?.message || 'Municipal backend service unavailable. Please retry shortly.';
        code = 'INTERNAL_SERVER_ERROR';
        break;
    }

    const municipalError = new MunicipalApiError({
      message,
      status,
      code,
      details: data?.details || data?.errors || null,
      isNetworkError: false,
    });

    return Promise.reject(municipalError);
  }
);

/**
 * Standard Unified API Client Abstraction
 */
export const apiClient = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),

  /**
   * Dedicated Multipart/Form-Data file upload helper for Evidence attachments
   */
  upload: (url, formData, config = {}) =>
    axiosInstance.post(url, formData, {
      ...config,
      headers: {
        ...(config.headers || {}),
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default apiClient;
