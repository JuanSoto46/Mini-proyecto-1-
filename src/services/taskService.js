import { http } from "../api/http.js";

export const tasksApi = {
  list() {
    return http.get("/tasks", { auth: true });
  },
  create(data) {
    return http.post("/tasks", data, { auth: true });
  },
  update(id, data) {
    return http.put(`/tasks/${id}`, data, { auth: true });
  },
  setStatus(id, status) {
    return http.put(`/tasks/${id}/status`, { status }, { auth: true });
  },
  remove(id) {
    return http.del(`/tasks/${id}`, { auth: true });
  },
};