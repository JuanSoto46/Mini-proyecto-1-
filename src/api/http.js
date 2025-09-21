// src/api/http.js
const BASES = (import.meta.env.VITE_API_BASE_URL || "")
  .split(",").map(s => s.trim()).filter(Boolean);

if (BASES.length === 0) BASES.push("http://localhost:3000/api/v1");
const ORDERED_BASES = [...BASES];

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: "Bearer " + t } : {};
}
function goLogin() { try { location.hash = "#/login"; } catch {} }
function getStickyIndex() {
  const i = Number(localStorage.getItem("api_base_idx") || 0);
  return Number.isFinite(i) && i >= 0 && i < ORDERED_BASES.length ? i : 0;
}
function setStickyIndex(i){ try{ localStorage.setItem("api_base_idx", String(i)); }catch{} }

async function request(method, path, body, { auth = false } = {}) {
  if (auth && !localStorage.getItem("token")) {
    goLogin(); const e = new Error("No has iniciado sesión"); e.status = 401; throw e;
  }
  let lastErr;
  const start = getStickyIndex();
  for (let step = 0; step < ORDERED_BASES.length; step++) {
    const i = (start + step) % ORDERED_BASES.length;
    const base = ORDERED_BASES[i].replace(/\/+$/, "");
    const url = base + path;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...(auth ? authHeader() : {}) },
        body: body != null ? JSON.stringify(body) : undefined,
      });
      if (res.ok) setStickyIndex(i);
      if (res.status === 401 && auth) { localStorage.removeItem("token"); goLogin(); }
      const txt = await res.text(); let data = null; try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
      if (!res.ok) { const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`; const err = new Error(msg); err.status = res.status; err.data = data; throw err; }
      return data;
    } catch (err) { lastErr = err; }
  }
  throw lastErr || new Error("No se pudo conectar al servidor");
}

export const http = {
  get:  (p, o)    => request("GET",    p, null, o),
  post: (p, b, o) => request("POST",   p, b, o),
  put:  (p, b, o) => request("PUT",    p, b, o),
  patch:(p, b, o) => request("PATCH",  p, b, o),
  del:  (p, o)    => request("DELETE", p, null, o),
};
