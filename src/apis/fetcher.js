import axios from "axios";

const fetcher = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Sử dụng URL từ .env
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

fetcher.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request details:", {
      url: config.baseURL + config.url, // Log URL đầy đủ
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

fetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response error details:", {
      url: error.config.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default fetcher;