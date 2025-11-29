import axios, { AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

export const baseURL = "http://192.168.1.111:8000/api/";
export const dictionaryURL = "https://api.dictionaryapi.dev/api/v2/";
export const datamuseURL = "https://serverInstance.datamuse.com/";

export const serverInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  responseType: "json",
  timeout: 10000,
});

export const dictionaryInstance = axios.create({
  baseURL: dictionaryURL,
  headers: {
    "Content-Type": "application/json",
  },
  responseType: "json",
  timeout: 10000,
});

export const datamuseInstance = axios.create({
  baseURL: datamuseURL,
  headers: {
    "Content-Type": "application/json",
  },
  responseType: "json",
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

serverInstance.interceptors.request.use(async (config) => {
  // const token = process.env.EXPO_PUBLIC_ACCESS_TOKEN; // Hoặc lấy từ AsyncStorage, Redux, etc.
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

serverInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // console.log(
    //   "Response error res data",
    //   JSON.stringify(error.response?.data)
    // );

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      error.response?.data?.messages?.[0]?.message === "Token is expired" &&
      !originalRequest._retry;

    if (!shouldAttemptRefresh) {
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return serverInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      const response = await axios.post(`${baseURL}/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", newRefreshToken);

      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return serverInstance(originalRequest);
    } catch (err) {
      processQueue(err, null);
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      alert("Cook"); // tuỳ chỉnh xử lý logout tại đây
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

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
