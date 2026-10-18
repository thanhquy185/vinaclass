import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Bỏ qua trang cảnh báo của ngrok
  },
  validateStatus: (status) => status >= 200 && status < 300,
  withCredentials: true, //dùng cho cookie
});

// Log để debug xem đang gọi vào đâu
console.log("Current API Base URL:", axiosClient.defaults.baseURL);

// Xử lý lỗi tập trung (Ví dụ: Token hết hạn -> Logout)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout(); // Tự động đá user ra ngoài nếu token lỏ
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

// Tự động đính kèm Token vào Header của mọi request
// axiosClient.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token; // Lấy token trực tiếp từ store
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
