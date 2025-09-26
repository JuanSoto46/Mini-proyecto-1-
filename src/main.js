/**
 * Entry point of the application.
 * 
 * - Imports the global base CSS styles.
 * - Imports and initializes the router to handle hash-based navigation.
 */

import './styles/base.css';
import { initRouter } from './routes/route.js';

/**
 * Initialize the client-side router.
 * This sets up listeners and renders the correct view on app start.
 */
initRouter();
// Año dinámico en el footer
const y = document.getElementById("year-now");
if (y) y.textContent = new Date().getFullYear();

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function renderFooter() {
  const sitemap = document.getElementById("footer-sitemap");
  const account = document.getElementById("footer-account");
  const accountCol = document.getElementById("footer-account-col");
  if (!sitemap) return; // si aún no cargó el footer

  const logged = isLoggedIn();

  if (logged) {
    // Con sesión
    sitemap.innerHTML = `
      <li><a href="#/board">Tareas</a></li>
      <li><a href="#/profile">Perfil</a></li>
      <li><a href="#/recover">Cambiar contraseña</a></li>
      <li><a href="#/about">Sobre nosotros</a></li>
    `;
    if (account) {
      account.innerHTML = `
        <li><a href="#/logout" data-view="logout">Cerrar sesión</a></li>
      `;
    }
    accountCol?.removeAttribute("hidden");
  } else {
    // Sin sesión
    sitemap.innerHTML = `
      <li><a href="#/login">Login</a></li>
      <li><a href="#/home">Registrarse</a></li>
      <li><a href="#/recover">¿Olvidó su contraseña?</a></li>
      <li><a href="#/about">Sobre nosotros</a></li>
    `;
    if (account) account.innerHTML = "";
    accountCol?.setAttribute("hidden", "hidden");
  }
}

// Re-render del footer cuando cambia la ruta o el token
window.addEventListener("hashchange", renderFooter);
renderFooter();

// Delegar logout desde el footer si no existe handler global
document.addEventListener("click", (e) => {
  const a = e.target.closest('[data-view="logout"]');
  if (!a) return;
  e.preventDefault();
  const headerLogout = document.getElementById("menuLogout");
  if (headerLogout) {
    headerLogout.click(); // reutiliza la lógica existente del menú
  } else {
    // fallback por si acaso
    localStorage.removeItem("token");
    location.hash = "#/login";
  }
});