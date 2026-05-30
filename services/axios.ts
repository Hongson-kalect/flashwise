import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { useAuthStore } from "../stores/useAuthStore"; // <--- Import Store ở đây

export const baseURL = "http://192.168.1.111:8000/api/";
// ... (giữ nguyên dictionaryURL và datamuseURL của bạn)

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

export const serverInstance = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  responseType: "json",
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

// 1. Request Interceptor
serverInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ƯU TIÊN 1: Lấy từ Zustand trên RAM (Siêu nhanh)
    let token = useAuthStore.getState().accessToken;
    
    // ƯU TIÊN 2: Dự phòng nếu Zustand chưa kịp init thì đọc đồng bộ từ SecureStore
    if (!token) {
      token = SecureStore.getItem("accessToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor
serverInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // NẾU LÀ GUEST HOẶC API CÔNG KHAI: Bỏ qua hoàn toàn logic Refresh Token
    if (originalRequest.headers?.["x-no-auth"] === "true" || useAuthStore.getState().isGuest) {
      return Promise.reject(error); // Trả lỗi về thẳng component xử lý UI, không tự động logout
    }

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      error.response?.data?.messages?.[0]?.message === "Token is expired" &&
      !originalRequest._retry;

    if (!shouldAttemptRefresh) {
      if (error.response?.status === 401) {
        // Token bẩn, sai chữ ký -> Gọi store logout để đá user ra ngoài
        await useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return serverInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const response = await axios.post(`${baseURL}/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Cập nhật cả Zustand lẫn SecureStore thông qua hàm login của Store
      await useAuthStore.getState().login(accessToken, newRefreshToken);

      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return serverInstance(originalRequest);
    } catch (err) {
      processQueue(err, null);
      
      // REFRESH TOKEN HẾT HẠN -> Gọi store logout
      await useAuthStore.getState().logout();
      
      Alert.alert("Phiên làm việc hết hạn", "Vui lòng đăng nhập lại.");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// Khi Guest gọi API, ta truyền thêm config { headers: { 'x-no-auth': 'true' } }
export const GetPublicAPI = (url:string, params:object) => {
  return GetAPI(url, { ...params, headers: { "x-no-auth": "true" } });
};

export const GetAPI = async (url: string, params?: any) => {
  return await serverInstance.get(url, { params });
};

export const PostAPI = async (
  url: string,
  data: any,
  customConfig: AxiosRequestConfig = {}
) => {
  return await serverInstance.post(url, data, customConfig);
};

export const PutAPI = async (url: string, data: any) => {
  return await serverInstance.put(url, data);
};

export const PatchAPI = async (
  url: string,
  data: any,
  customConfig: AxiosRequestConfig = {}
) => {
  return await serverInstance.patch(url, data, customConfig);
};

export const DeleteAPI = async (url: string) => {
  return await serverInstance.delete(url);
};

// Tạo intercepter thêm token vào header
