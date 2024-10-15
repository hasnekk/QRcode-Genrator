import Router from "./router/router.js";

const router = new Router();
window.router = router;

document.addEventListener("DOMContentLoaded", () => {
  const navigationBar = document.createElement("navigation-bar");
  const app = document.createElement("div");
  app.id = "app";
  const footer = document.createElement("footer-component");

  document.body.appendChild(navigationBar);
  document.body.appendChild(app);
  document.body.appendChild(footer);

  router.navigate(window.location.pathname);
});
