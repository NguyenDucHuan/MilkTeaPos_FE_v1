import axios from "axios";

export const fetcher = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request
fetcher.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) return config;

    try {
      const currentUser = JSON.parse(userJson);

      if (currentUser?.accessToken) {
        config.headers.Authorization = `Bearer ${currentUser.accessToken}`;
      }
    } catch (error) {
      console.error("Error parsing currentUser from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
fetcher.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu từ response
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized, logging out...");

      localStorage.removeItem("currentUser");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default fetcher;