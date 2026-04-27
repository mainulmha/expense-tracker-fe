import axios from "axios";

const authAPI = axios.create({
  baseURL: "http://192.168.0.159:5000/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ এটা যোগ করুন - token automatically attach হবে
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("📤 Request:", config.method.toUpperCase(), config.url);
    console.log("📤 Token:", token ? "Yes" : "No");
    return config;
  },
  (error) => Promise.reject(error),
);

export default authAPI;
