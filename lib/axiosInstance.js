import axios from "axios";
import store from "@/store";
import { clearAuth } from "@/store/auth";

const unauthorizedCode = [401];

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"}/api`,
  timeout: 50000, // Timeout limit (optional)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    let accessToken;

    if (!accessToken) {
      const { auth } = store.getState();
      accessToken = auth.token;
    }

    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    const { response } = error;

    if (response && unauthorizedCode.includes(response.status)) {
      console.error("API Error:", error);
      store.dispatch(clearAuth());
      location.replace("/dashboard/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
