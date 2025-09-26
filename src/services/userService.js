import { http } from "../api/http.js";

export async function registerUser({ firstName, lastName, age, email, password }) {
  return http.post("/auth/register", { firstName, lastName, age, email, password });
}

export async function loginUser({ email, password }) {
  return http.post("/auth/login", { email, password });
}

export async function recoverUser(payload, mode="request") {
  if (mode === "reset") {
    return http.post("/auth/reset-password", payload);
  }
  return http.post("/auth/forgot-password", payload);
}
/** Get current user profile */
export async function getMe() {
  return http.get("/users/me", { auth: true });
}

/** Update current user profile (password optional) */
export async function updateProfile(data) {
  return http.put("/users/me", data, { auth: true });
}
/** Change password while logged in */
export async function changePassword({ currentPassword, newPassword }) {
  return http.post("/auth/change-password", { currentPassword, newPassword }, { auth: true });
}
