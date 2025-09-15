import { http } from "../api/http.js";

export const tasksApi = {
  list: () => http.get("/tasks"),
  create: ({ title, detail, date, time, status = "todo" }) =>
    http.post("/tasks", { title, detail, date, time, status }),
  setStatus: (id, status) => http.post(`/tasks/${id}/status`, { status }),
  remove: (id) => http.post(`/tasks/${id}/delete`),
};
