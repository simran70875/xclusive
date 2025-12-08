// api/axios.ts
import axios from "axios";
import { BASE_URL } from "../utils/config";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // ✅ safely access here
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
