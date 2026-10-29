// lib/api.ts  (public API client; the admin one stays in lib/adminApi.ts)
import axios from "axios";

export const api = axios.create({ baseURL: "/api" });
