import { http } from "../api/http.js";

export async function registerUser({ firstName, lastName, age, email, password }) {
  return http.post("/auth/register", { firstName, lastName, age, email, password });
}


export async function loginUser({ email, password }) {
  return http.post("/auth/login", { email, password });
}
export async function recoverUser({ email }) {
  return http.post("/auth/forgot-password", { email });
}


