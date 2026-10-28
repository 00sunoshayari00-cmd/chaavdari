// lib/adminApi.ts
import axios from "axios";

export const adminApi = axios.create({ baseURL: "/api/admin" });

export function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    return (
      (err.response?.data as { error?: string } | undefined)?.error ??
      err.message
    );
  }
  return "Something went wrong";
}
