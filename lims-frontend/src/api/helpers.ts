import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com', // Ubah sesuai API Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type for API response
interface ApiResponse<T = any> {
  data: T;
}

// Helper for GET request
export const axiosGet = async <T>(
  url: string,
  params: Record<string, any> = {},
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.get(url, {
      ...config,
      params,
    });
    return { data: response.data };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Helper for POST request
export const axiosPost = async <T>(
  url: string,
  data: Record<string, any> = {},
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return { data: response.data };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Helper for PUT request
export const axiosPut = async <T>(
  url: string,
  data: Record<string, any> = {},
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return { data: response.data };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Helper for PATCH request
export const axiosPatch = async <T>(
  url: string,
  data: Record<string, any> = {},
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return { data: response.data };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Helper for DELETE request
export const axiosDelete = async <T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return { data: response.data };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Centralized error handling function
const handleError = (error: any): void => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error Request:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }
  } else {
    console.error('Unexpected Error:', error);
  }
};
