// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://ems-portal-production.up.railway.app", // Railway backend URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
