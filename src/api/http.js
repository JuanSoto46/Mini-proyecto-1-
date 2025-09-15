// URL base: env o fallback en dev
function pickBaseUrl() {
  const raw = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (raw) {
    const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
    // En desarrollo usa la primera, en producción usa la última
    if (import.meta.env.DEV) return parts[0];
    return parts[parts.length - 1];
  }
  return import.meta.env.DEV ? "http://localhost:3000/api/v1" : "";
}

const BASE_URL = pickBaseUrl();

function norm(url) { return (url || "").replace(/\/+$/, ""); }
const API = norm(BASE_URL);

async function request(path, { method = "GET", headers = {}, body } = {}) {
  if (!API) throw new Error("API base URL is not configured");
  const token = localStorage.getItem("token");
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("No se pudo conectar con el servidor");
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = (isJson ? payload?.message || payload?.error : String(payload)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return isJson ? payload : { ok: true };
}

export const http = {
  get: (p, o) => request(p, { method: "GET", ...o }),
  post: (p, b, o) => request(p, { method: "POST", body: b, ...o }),
  put: (p, b, o) => request(p, { method: "PUT", body: b, ...o }),
  del: (p, o) => request(p, { method: "DELETE", ...o }),
};
