import axios from "axios";

const expenseAPI = axios.create({
  baseURL: "http://192.168.0.159:5000/api/expense",
  headers: {
    "Content-Type": "application/json",
  },
});

// Token যোগ করার জন্য Interceptor
expenseAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 401 Unauthorized হলে লগআউট
expenseAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default expenseAPI;
