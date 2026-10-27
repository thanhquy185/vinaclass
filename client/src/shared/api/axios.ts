import axios from "axios";
import { environment } from "@/shared/config/environment";
import { useAuthStore } from "@/shared/stores/useAuthStore";

const toCamelCase = (key: string) =>
  key.replace(/_([a-z0-9])/g, (_match, character: string) =>
    character.toUpperCase(),
  );

const normalizeApiKeys = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiKeys(item)) as T;
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (value instanceof Blob || value instanceof Date) {
    return value;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      toCamelCase(key),
      normalizeApiKeys(item),
    ]),
  ) as T;
};

const axiosClient = axios.create({
  baseURL: environment.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Skip the ngrok browser warning page.
  },
  validateStatus: (status) => status >= 200 && status < 300,
  withCredentials: true, // Include cookies in requests.
});

// Handle expired authentication centrally.
axiosClient.interceptors.response.use(
  (response) => normalizeApiKeys(response.data),
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout(); // Clear the session when the token expires.
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
