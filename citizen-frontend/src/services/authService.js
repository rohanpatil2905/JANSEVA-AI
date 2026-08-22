import { request } from "./api";

export const authService = {
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: (token) => request("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
};
