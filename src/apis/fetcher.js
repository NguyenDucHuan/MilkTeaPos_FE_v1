import axios from "axios";

const fetcher = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000000,
});

fetcher.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

fetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    };
    console.error("Response error details:", errorDetails);
    return Promise.reject(error);
  }
);

export default fetcher;
