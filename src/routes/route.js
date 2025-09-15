import { registerUser, loginUser, recoverUser } from "../services/userService.js";

// Vite 5/7: usar query '?raw' con import: 'default' (as: 'raw' está deprecado)
const VIEWS = import.meta.glob("../views/*.html", { eager: true, query: "?raw", import: "default" });

const app = document.getElementById("app");
const statusEl = document.getElementById("systemStatus");
const titleEl = document.getElementById("app-title");

function setStatus(s = "") { if (statusEl) statusEl.textContent = s; }
function setTitle(t = "Taskly") { if (titleEl) titleEl.textContent = t; }

function getView(name) {
  const key = `../views/${name}.html`;
  const html = VIEWS[key];
  if (!html) throw new Error(`View not found: ${key}`);
  return html;
}

function render(name) {
  try {
    app.innerHTML = getView(name);
    switch (name) {
      case "home": initRegister(); setTitle("Sign up"); break;
      case "login": initLogin(); setTitle("Login"); break;
      case "recover": initRecover(); setTitle("Recover"); break;
      case "board": initBoard(); setTitle("Tasks"); break;
      default: setTitle("Taskly");
    }
    highlightMenu(name);
  } catch (err) {
    app.innerHTML = `<p class="error">No se pudo cargar la vista: ${name}</p>`;
  }
}

function highlightMenu(name) {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === name);
  });
}

function getHashView() {
  const h = location.hash.replace(/^#\/?/, "");
  const [view] = h.split("/");
  return view || "home";
}

export function initRouter() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    const view = btn.getAttribute("data-view");
    if (view === "logout") {
      localStorage.removeItem("token");
      location.hash = "#/login";
      return;
    }
    location.hash = `#/${view}`;
  });

  window.addEventListener("hashchange", () => render(getHashView()));
  render(getHashView());
}

/* ====== Vistas ====== */

function initRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const age = Number(document.getElementById("age").value);
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!firstName || !lastName || !age || !email || !password) {
      msg.textContent = "All fields are required."; return;
    }
    try {
      setStatus("Creando usuario...");
      await registerUser({ firstName, lastName, age, email, password });
      msg.textContent = "Cuenta creada. Ahora puedes iniciar sesión.";
      setStatus("Listo.");
      setTimeout(() => location.hash = "#/login", 800);
    } catch (err) {
      msg.textContent = err.message; setStatus("");
    }
  });
}

function initLogin() {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) { msg.textContent = "Email y contraseña son obligatorios."; return; }
    try {
      setStatus("Ingresando...");
      const r = await loginUser({ email, password });
      if (r?.token) localStorage.setItem("token", r.token);
      msg.textContent = "Sesión iniciada.";
      setStatus("Listo.");
      setTimeout(() => location.hash = "#/board", 600);
    } catch (err) {
      msg.textContent = err.message; setStatus("");
    }
  });
}

function initRecover() {
  const form = document.getElementById("recoverForm");
  const msg = document.getElementById("recoverMsg");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) { msg.textContent = "Escribe tu correo."; return; }
    try {
      setStatus("Enviando correo de recuperación...");
      await recoverUser({ email });
      msg.textContent = "Si el correo existe, recibirás instrucciones.";
      setStatus("Listo.");
    } catch (err) {
      msg.textContent = err.message; setStatus("");
    }
  });
}

function initBoard() {
  const list = document.getElementById("todoList");
  const form = document.getElementById("taskForm");
  const msg = document.getElementById("taskMsg");
  if (!list) return;

  const token = localStorage.getItem("token");
  if (!token) {
    list.innerHTML = "<li>Inicia sesión para ver y crear tus tareas.</li>";
    if (form) form.style.display = "none";
    return;
  }
  if (form) form.style.display = "";

  async function renderList() {
    list.innerHTML = "<li class='small'>Cargando...</li>";
    try {
      const items = await tasksApi.list();
      if (!items.length) {
        list.innerHTML = "<li class='small'>Sin tareas aún.</li>";
        return;
      }
      list.innerHTML = "";
      for (const t of items) {
        const li = document.createElement("li");
        li.className = "task";
        li.innerHTML = `
          <div class="task__main">
            <strong>${t.title}</strong>
            <div class="small">${t.detail || ""}</div>
            <div class="small">${t.date} ${t.time}</div>
          </div>
          <div class="task__actions">
            <select data-act="status" data-id="${t._id}">
              <option value="todo" ${t.status==="todo"?"selected":""}>Por hacer</option>
              <option value="doing" ${t.status==="doing"?"selected":""}>Haciendo</option>
              <option value="done" ${t.status==="done"?"selected":""}>Hecho</option>
            </select>
            <button class="btn btn--danger" data-act="del" data-id="${t._id}">Eliminar</button>
          </div>
        `;
        list.appendChild(li);
      }
    } catch (e) {
      list.innerHTML = `<li class='error'>${e.message}</li>`;
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      const title = document.getElementById("t_title").value.trim();
      const detail = document.getElementById("t_detail").value.trim();
      const date = document.getElementById("t_date").value;
      const time = document.getElementById("t_time").value;
      const status = document.getElementById("t_status").value;
      if (!title || !date || !time) { msg.textContent = "Campos obligatorios faltantes."; return; }
      try {
        await tasksApi.create({ title, detail, date, time, status });
        document.getElementById("t_title").value = "";
        document.getElementById("t_detail").value = "";
        msg.textContent = "Tarea creada.";
        renderList();
      } catch (err) {
        msg.textContent = err.message;
      }
    });
  }

  list.addEventListener("change", async (e) => {
    const sel = e.target.closest("select[data-act='status']");
    if (!sel) return;
    const id = sel.getAttribute("data-id");
    try {
      await tasksApi.setStatus(id, sel.value);
    } catch (err) {
      alert(err.message);
    }
  });

  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act='del']");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!confirm("¿Eliminar tarea?")) return;
    try {
      await tasksApi.remove(id);
      renderList();
    } catch (err) {
      alert(err.message);
    }
  });

  renderList();
}


import { tasksApi } from "../services/taskService.js";
