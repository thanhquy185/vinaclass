import axios, { type InternalAxiosRequestConfig } from "axios";
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

const refreshClient = axios.create({
  baseURL: environment.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let refreshInFlight: Promise<string> | null = null;

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const requestRefreshToken = async (retry = 0): Promise<string> => {
  try {
    const response = await refreshClient.post("/auth/refresh");
    // ConvertCaseMiddleware camel-cases API responses; keep a snake_case
    // fallback for deployments that do not apply that middleware.
    const token =
      response.data?.data?.accessToken ?? response.data?.data?.access_token;
    if (typeof token !== "string" || token.length === 0) {
      throw new Error("Refresh response did not include an access token.");
    }
    return token;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 409 && retry < 3) {
      await wait(150 * (retry + 1));
      return requestRefreshToken(retry + 1);
    }
    throw error;
  }
};

const refreshAccessToken = (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = requestRefreshToken()
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

const isPublicAuthRequest = (url: string | undefined): boolean =>
  Boolean(
    url &&
      (/\/login$/.test(url) ||
        /\/register$/.test(url) ||
        /\/auth\/refresh$/.test(url) ||
        /\/auth\/otp\//.test(url))
  );

// Handle expired authentication centrally.
axiosClient.interceptors.response.use(
  (response) => normalizeApiKeys(response.data),
  async (error) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const hasBearerToken = Boolean(config?.headers?.Authorization);
    const canRefresh =
      error.response?.status === 401 &&
      config &&
      hasBearerToken &&
      !config._authRetry &&
      !isPublicAuthRequest(config.url) &&
      Boolean(useAuthStore.getState().token);

    if (canRefresh && config) {
      config._authRetry = true;
      try {
        const accessToken = await refreshAccessToken();
        useAuthStore.getState().setToken(accessToken);
        config.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient.request(config);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      hasBearerToken &&
      !isPublicAuthRequest(config?.url)
    ) {
      useAuthStore.getState().logout();
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
