import { registerUser, loginUser, recoverUser, changePassword, getMe, updateProfile } from "../services/userService.js";
import { tasksApi } from "../services/taskService.js";

// Import raw HTML views (Vite)
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
      case "home":
        initRegister();
        setTitle("Registrarse");
        break;

      case "login":
        initLogin();
        setTitle("Ingresar");
        break;

      case "profile":
        initProfile();
        setTitle("Perfil");               // sin título en Perfil (requisito del profe)
        break;

      case "recover":
        initRecover();              
        break;


      case "about":
  setTitle("Sobre nosotros");
  const backBtn = document.getElementById("btnBackBoard");
  backBtn?.addEventListener("click", () => {
    location.hash = "#/board";
  });
  break;

      case "board":
        initBoard();
        setTitle("Tareas");
        break;

      default:
        setTitle("Taskly");
    }

    highlightMenu(name);
    updateHeader();
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
  const [viewWithParams] = h.split("/");
  const view = viewWithParams.split("?")[0]; // ✅ limpia los parámetros
  return view || "home";
}


export function initRouter() {
  // Navegación
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    const view = btn.getAttribute("data-view");
    if (view === "logout") {
      localStorage.removeItem("token");
      updateHeader();
      location.hash = "#/login";
      return;
    }
    location.hash = `#/${view}`;
  });

  // Hamburguesa (se configura una sola vez)
  setupHamburger();

  window.addEventListener("hashchange", () => render(getHashView()));
  render(getHashView());
}

/* ====== Vistas ====== */

function initRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");
  if (!form) return;

  // Toggle mostrar contraseña
  const toggle = document.getElementById("togglePwd");
  const pwd = document.getElementById("password");
  toggle?.addEventListener("click", () => {
    const isText = pwd.type === "text";
    pwd.type = isText ? "password" : "text";
    toggle.textContent = isText ? "Mostrar" : "Ocultar";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const firstName = document.getElementById("firstName").value.trim();
    const lastName  = document.getElementById("lastName").value.trim();
    const age       = Number(document.getElementById("age").value);
    const email     = document.getElementById("email").value.trim();
    const password  = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (!firstName || !lastName || !age || !email || !password || !password2) {
      msg.textContent = "Todos los campos son obligatorios."; return;
    }
    if (password !== password2) {
      msg.textContent = "Las contraseñas no coinciden."; return;
    }
    if (password.length < 6) {
      msg.textContent = "La contraseña debe tener al menos 6 caracteres."; return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn?.setAttribute("disabled","disabled");
    try {
      setStatus("Creando usuario...");
      await registerUser({ firstName, lastName, age, email, password });
      msg.textContent = "Cuenta creada. Ahora puedes iniciar sesión.";
      setStatus("");
      setTimeout(() => location.hash = "#/login", 700);
    } catch (err) {
      msg.textContent = err.message || "Error al registrar."; setStatus("");
    } finally {
      btn?.removeAttribute("disabled");
    }
  });
}

function initLogin() {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  if (!form) return;

  const toggle = document.getElementById("togglePwdLogin");
  const pwd = document.getElementById("password");
  toggle?.addEventListener("click", () => {
    const isText = pwd.type === "text";
    pwd.type = isText ? "password" : "text";
    toggle.textContent = isText ? "Mostrar" : "Ocultar";
  });

  form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    msg.textContent = "Email y contraseña son obligatorios.";
    return;
  }

  try {
    setStatus("Ingresando...");
    const r = await loginUser({ email, password });
    if (r?.token) {
      localStorage.setItem("token", r.token);
      updateHeader();
    }
    msg.textContent = "Sesión iniciada.";
    setStatus("");
    setTimeout(() => (location.hash = "#/board"), 600);
  } catch (err) {
    const raw = (err?.message || "").toLowerCase();
    if (err?.status === 401 || /unauthorized|invalid credentials|credenciales|incorrectos/.test(raw)) {
      msg.textContent = "Usuario o contraseña incorrectos";
    } else {
      msg.textContent = err.message || "No se pudo iniciar sesión";
    }
    setStatus("");
  }
});

}

function byId(id){ return document.getElementById(id); }
function show(el){
  if (!el) return;
  el.hidden = false;
  el.classList.remove("hidden");
  el.style.removeProperty("display"); // limpia restos inline
}
function hide(el){
  if (!el) return;
  el.hidden = true;
  el.classList.add("hidden");
  el.style.setProperty("display","none"); // mata lo que haya
}


function initRecover() {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");
  const emailParam = (params.get("email") || "").trim();
  const hasSession = !!localStorage.getItem("token");

  const formRequest = byId("recoverRequest"); // correo
  const formReset   = byId("recoverReset");   // con token
  const formChange  = byId("recoverChange");  // logueado

  const msgReq    = byId("recoverMsg");
  const msgReset  = byId("recoverMsgReset");
  const msgChange = byId("recoverMsgChange");

  // 1) Oculta todo de entrada (corta-fuegos)
  [formRequest, formReset, formChange].forEach(hide);

  // 2) Título + decidir modo
  const mode = token ? "reset" : (hasSession ? "change" : "request");
  setTitle(mode === "request" ? "Recuperar contraseña" : "Cambiar contraseña");

  // 3) Mostrar solo el que toca
  if (mode === "reset") {
    show(formReset);
    // token/email
    const recToken = byId("recToken");
    const recEmail2 = byId("recEmail2");
    const wrap = byId("recEmail2Wrap");
    if (recToken) recToken.value = token || "";
    if (emailParam) { if (recEmail2) recEmail2.value = emailParam; wrap?.setAttribute("hidden","hidden"); }
    else wrap?.removeAttribute("hidden");
  } else if (mode === "change") {
    show(formChange);
  } else {
    show(formRequest);
  }

  // 4) Handlers sin duplicarse
  if (formRequest) formRequest.onsubmit = async (e) => {
    e.preventDefault();
    const email = byId("recEmail")?.value.trim();
    if (!email) { msgReq.textContent = "Ingresa tu correo"; return; }
    const btn = e.submitter; btn?.setAttribute("disabled","disabled");
    try {
      setStatus("Enviando correo...");
      await recoverUser({ email }, "request"); // POST /auth/forgot-password
      msgReq.textContent = "Si el correo existe, se enviaron instrucciones.";
    } catch (err) {
      msgReq.textContent = err?.message || "No se pudo enviar";
    } finally {
      btn?.removeAttribute("disabled");
      setStatus("");
    }
  };

  if (formReset) formReset.onsubmit = async (e) => {
    e.preventDefault();
    const email = (byId("recEmail2")?.value || "").trim();
    const tokenValue = byId("recToken")?.value || token || "";
    const password = byId("recPwd")?.value;
    const password2 = byId("recPwd2")?.value;
    if (!email || !tokenValue || !password || !password2) { msgReset.textContent = "Completa todos los campos"; return; }
    if (password !== password2) { msgReset.textContent = "Las contraseñas no coinciden"; return; }
    const btn = e.submitter; btn?.setAttribute("disabled","disabled");
    try {
      setStatus("Actualizando...");
      await recoverUser({ email, token: tokenValue, password }, "reset"); // POST /auth/reset-password
      msgReset.textContent = "Contraseña actualizada. Puedes iniciar sesión.";
      // location.hash = "#/login";
    } catch (err) {
      msgReset.textContent = err?.message || "No se pudo actualizar";
    } finally {
      btn?.removeAttribute("disabled");
      setStatus("");
    }
  };

  if (formChange) formChange.onsubmit = async (e) => {
    e.preventDefault();
    const currentPassword = byId("curPwd")?.value;
    const newPassword = byId("newPwd")?.value;
    const newPassword2 = byId("newPwd2")?.value;
    if (!currentPassword || !newPassword || !newPassword2) { msgChange.textContent = "Completa todos los campos"; return; }
    if (newPassword.length < 6) { msgChange.textContent = "La nueva contraseña debe tener al menos 6 caracteres"; return; }
    if (newPassword !== newPassword2) { msgChange.textContent = "Las contraseñas no coinciden"; return; }
    const btn = e.submitter; btn?.setAttribute("disabled","disabled");
    try {
      setStatus("Cambiando contraseña...");
      await changePassword({ currentPassword, newPassword }); // POST /auth/change-password
      msgChange.textContent = "Contraseña cambiada correctamente.";
      byId("curPwd").value = "";
      byId("newPwd").value = "";
      byId("newPwd2").value = "";
    } catch (err) {
      msgChange.textContent = err?.message || "No se pudo cambiar la contraseña";
    } finally {
      btn?.removeAttribute("disabled");
      setStatus("");
    }
  };

  // 5) Toggle mostrar/ocultar
  const toggle = byId("togglePwdRec");
  if (toggle) {
    toggle.onclick = () => {
      const i = byId("recPwd");
      if (!i) return;
      i.type = i.type === "password" ? "text" : "password";
      toggle.textContent = i.type === "password" ? "Mostrar" : "Ocultar";
    };
  }
}



function initBoard() {
  if (!localStorage.getItem("token")) {
    // Mensaje para no logueados
    ["col_todo","col_doing","col_done"].forEach(id => {
      const ul = document.getElementById(id); if (ul) ul.innerHTML = "<li class='small'>Inicia sesión para ver tus tareas.</li>";
    });
    document.getElementById("fabNewTask")?.classList.add("hidden");
    return;
  }

  const panel      = document.getElementById("taskPanel");
  const dialog     = document.getElementById("deleteDialog");
  const form       = document.getElementById("taskForm");
  const msg        = document.getElementById("taskMsg");
  const titleH2    = document.getElementById("taskFormTitle");
  const btnSave    = document.getElementById("btnSaveTask");
  const btnCancel  = document.getElementById("btnCancelTask");
  const fab        = document.getElementById("fabNewTask");
  const btnDelOk   = document.getElementById("btnConfirmDelete");
  const btnDelNo   = document.getElementById("btnCancelDelete");
  const taskPanel   = document.getElementById("taskPanel");
const deleteDlg   = document.getElementById("deleteDialog");

  let deleteId = null;

  async function renderKanban() {
    const buckets = { todo: [], doing: [], done: [] };
    const items = await tasksApi.list();
    items.forEach(t => buckets[(t.status || "todo")]?.push(t));

    const paint = (id, arr) => {
      const ul = document.getElementById(id); if (!ul) return;
      ul.innerHTML = "";
      if (!arr.length) { ul.innerHTML = "<li class='small'>Vacío</li>"; return; }
      for (const t of arr) {
        const li = document.createElement("li");
        li.className = "task";
        li.innerHTML = `
          <strong>${t.title}</strong>
          <div class="small">${t.detail || ""}</div>
          <div class="small">${t.date} ${t.time}</div>
          <div class="task__actions">
            <select data-act="status" data-id="${t._id}">
              <option value="todo"  ${t.status==="todo" ? "selected":""}>Por hacer</option>
              <option value="doing" ${t.status==="doing" ? "selected":""}>Haciendo</option>
              <option value="done"  ${t.status==="done" ? "selected":""}>Hecho</option>
            </select>
            <button class="task__btn task__btn--icon" title="Editar" data-act="edit" data-id="${t._id}">✎</button>
            <button class="task__btn task__btn--icon" title="Eliminar" data-act="del" data-id="${t._id}">🗑</button>
          </div>`;
        ul.appendChild(li);
      }
    };
    paint("col_todo",  buckets.todo);
    paint("col_doing", buckets.doing);
    paint("col_done",  buckets.done);
  }


  function openTaskPanel() {
  taskPanel?.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // bloquea scroll del fondo
}
function closeTaskPanel() {
  taskPanel?.classList.add("hidden");
  document.body.style.overflow = "";       // devuelve scroll
}

function openDeleteDialog() {
  deleteDlg?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeDeleteDialog() {
  deleteDlg?.classList.add("hidden");
  document.body.style.overflow = "";
}

// Enlaza tus botones:
document.getElementById("fabNewTask")?.addEventListener("click", openTaskPanel);
document.getElementById("btnCancelTask")?.addEventListener("click", closeTaskPanel);

// Si al editar abres el panel:
document.querySelectorAll("[data-edit]").forEach(btn => {
  btn.addEventListener("click", () => {
    // ...cargar datos en el form...
    openTaskPanel();
  });
});

// Para borrar (abrir confirmación)
document.querySelectorAll("[data-delete]").forEach(btn => {
  btn.addEventListener("click", () => {
    // guarda el id a eliminar en algún sitio si hace falta
    openDeleteDialog();
  });
});
document.getElementById("btnCancelDelete")?.addEventListener("click", closeDeleteDialog);

// Al confirmar borrado, cierras el diálogo también
document.getElementById("btnConfirmDelete")?.addEventListener("click", async () => {
  try {
    // ...llamada DELETE a tu API...
  } finally {
    closeDeleteDialog();
  }
});



  function openPanel(mode, task = null) {
    form.reset(); msg.textContent = "";
    document.getElementById("t_id").value     = task?._id || "";
    document.getElementById("t_title").value  = task?.title || "";
    document.getElementById("t_detail").value = task?.detail || "";
    document.getElementById("t_date").value   = task?.date || "";
    document.getElementById("t_time").value   = task?.time || "";
    document.getElementById("t_status").value = task?.status || "todo";
    titleH2.textContent = mode === "edit" ? "Editar tarea" : "Crear tarea";
    btnSave.textContent = mode === "edit" ? "Guardar cambios" : "Guardar tarea";
    panel.classList.remove("hidden");
  }
  const closePanel = () => panel.classList.add("hidden");

  function openDelete(id) { deleteId = id; dialog.classList.remove("hidden"); }
  const closeDelete = () => { deleteId = null; dialog.classList.add("hidden"); };

  // FAB -> crear
  fab?.addEventListener("click", () => openPanel("create"));

  // Cancelar panel
  btnCancel?.addEventListener("click", closePanel);

  // Confirmar/Cancelar eliminar
  btnDelOk?.addEventListener("click", async () => {
    if (!deleteId) return;
    try { await tasksApi.remove(deleteId); } catch(e){ alert(e.message); }
    closeDelete(); renderKanban();
  });
  btnDelNo?.addEventListener("click", closeDelete);

  // Submit crear/editar
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id    = document.getElementById("t_id").value.trim();
    const title = document.getElementById("t_title").value.trim();
    const detail= document.getElementById("t_detail").value.trim();
    const date  = document.getElementById("t_date").value;
    const time  = document.getElementById("t_time").value;
    const status= document.getElementById("t_status").value;

    if (!title || !date || !time) { msg.textContent = "Completa título, fecha y hora."; return; }

    try {
      if (id) await tasksApi.update(id, { title, detail, date, time, status });
      else    await tasksApi.create({ title, detail, date, time, status });
      closePanel();
      renderKanban();
    } catch (err) {
      msg.textContent = err.message || "No se pudo guardar";
    }
  });

  // Delegación: cambiar estado, editar, eliminar
  if (!window.__kanbanHandlersBound) {
    window.__kanbanHandlersBound = true;

    document.addEventListener("change", async (e) => {
      const sel = e.target.closest("select[data-act='status']");
      if (!sel) return;
      try {
        await tasksApi.setStatus(sel.getAttribute("data-id"), sel.value);
        renderKanban();
      } catch (err) { alert(err.message); }
    });

    document.addEventListener("click", async (e) => {
      const edit = e.target.closest("button[data-act='edit']");
      const del  = e.target.closest("button[data-act='del']");
      if (edit) {
        const id = edit.getAttribute("data-id");
        const all = await tasksApi.list();
        const t = all.find(x => x._id === id);
        if (t) openPanel("edit", t);
      } else if (del) {
        openDelete(del.getAttribute("data-id"));
      }
    });
  }

  // Render inicial
  renderKanban();
}

function updateHeader() {
  const logged = !!localStorage.getItem("token");
  const nav = document.querySelector("nav.menu");
  if (!nav) return;

  const $ = (id) => nav.querySelector("#" + id);
  const show = (el) => el && (el.style.display = "");
  const hide = (el) => el && (el.style.display = "none");

  // Siempre visible
  show($("menuAbout"));

  if (!logged) {
    show($("menuLogin"));
    hide($("menuBoard"));
    hide($("menuProfile"));
    hide($("menuRecover"));
    hide($("menuLogout"));
    // si tienes un botón de "Registrarse" en el menú, escóndelo aquí;
    // el registro va como link dentro del login
    const menuRegister = $("menuRegister");
    if (menuRegister) hide(menuRegister);
  } else {
    hide($("menuLogin"));
    show($("menuBoard"));
    show($("menuProfile"));
    show($("menuRecover"));
    show($("menuLogout"));
  }
}

window.addEventListener("hashchange", updateHeader);
document.addEventListener("DOMContentLoaded", updateHeader);

/* ====== Menú hamburguesa ====== */
function setupHamburger() {
  if (window.__hamburgerBound) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHamburger, { once: true });
    return;
  }

  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("mainMenu") || document.querySelector("nav.menu");
  if (!toggle || !menu) {
    console.warn("[hamburger] faltan #menuToggle o nav.menu/#mainMenu");
    return;
  }
  if (!menu.id) menu.id = "mainMenu";

  const open = () => {
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  // Abrir/cerrar con el botón (evita que el click global cierre al instante)
  toggle.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.contains("open") ? close() : open();
    },
    { passive: false }
  );

  // Cerrar al hacer clic en cualquier parte FUERA del menú o del botón
  document.addEventListener(
    "click",
    (e) => {
      if (!menu.classList.contains("open")) return;
      const insideMenu = e.target.closest("#" + menu.id);
      const onToggle = e.target.closest("#menuToggle");
      if (insideMenu || onToggle) return;
      close();
    },
    { capture: true, passive: true } // captura para llegar antes que otros listeners
  );

  // Cerrar después de navegar con cualquier [data-view]
  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-view]");
    if (!navBtn) return;
    // deja que el router cambie el hash y luego cierra
    setTimeout(close, 0);
  });

  // Cerrar en hashchange y con Escape
  window.addEventListener("hashchange", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  window.__hamburgerBound = true;
}

function initProfile() {
  if (!localStorage.getItem("token")) { 
    location.hash = "#/login"; 
    return; 
  }

  const form = document.getElementById("profileForm");
  const msg  = document.getElementById("profileMsg");
  const btnCancel = document.getElementById("btnCancel");
  if (!form) { setStatus("Profile view not found"); return; }

  // Cargar datos actuales
  setStatus("Loading profile...");
  getMe()
    .then(u => {
      form.firstName.value = u.firstName || "";
      form.lastName.value  = u.lastName  || "";
      form.age.value       = u.age ?? "";
      form.email.value     = u.email || "";
      setStatus("");
    })
    .catch(err => { 
      console.error(err); 
      setStatus("Could not load profile"); 
    });

  // Guardar cambios (sin password)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const firstName = form.firstName.value.trim();
    const lastName  = form.lastName.value.trim();
    const age       = Number(form.age.value);
    const email     = form.email.value.trim();

    if (!firstName || !lastName || !age || !email) {
      msg.textContent = "Completa todos los campos"; 
      return;
    }
    if (age < 10 || age > 120) {
      msg.textContent = "Edad inválida"; 
      return;
    }

    const payload = { firstName, lastName, age, email };

    setStatus("Saving...");
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn?.setAttribute("disabled","disabled");
    try {
      await updateProfile(payload);
      msg.textContent = "Perfil actualizado";
      updateHeader();
    } catch (err) {
      console.error(err);
      msg.textContent = err?.message || "No se pudo actualizar";
    } finally {
      setStatus("");
      submitBtn?.removeAttribute("disabled");
    }
  });
  
  // Zona peligrosa: eliminar cuenta
(function initProfileDangerZone(){
  const btnDelete = document.getElementById("btnDeleteAccount");
  const modal = document.getElementById("deleteModal");
  const btnCancelDelete = document.getElementById("btnCancelDelete");
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");
  const input = document.getElementById("deleteConfirmInput");
  if (!btnDelete || !modal) return;

  btnDelete.addEventListener("click", () => {
    input && (input.value = "");
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(()=>input?.focus(), 0);
  });

  btnCancelDelete?.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  });

  btnConfirmDelete?.addEventListener("click", async () => {
    if (!input || input.value.trim().toUpperCase() !== "ELIMINAR") {
      alert("Debes escribir ELIMINAR exactamente.");
      return;
    }
    try {
      setStatus("Eliminando cuenta...");
      const { deleteMe } = await import("../services/userService.js");
      await deleteMe();
      localStorage.clear();
      alert("Tu cuenta fue eliminada.");
      location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err?.message || "No se pudo eliminar la cuenta");
    } finally {
      setStatus("");
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  });
})();

  // Cancelar
  btnCancel?.addEventListener("click", () => {
  location.hash = "#/board";
});
}
