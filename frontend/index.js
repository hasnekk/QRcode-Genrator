import Router from "./router/router.js";

const router = new Router();
window.router = router;

window.fetchData = async function fetchData(path, httpMethod, body) {
  const backendURL = "http://127.0.0.1:3000";
  const loadingScreen = document.getElementById("loadingScreen");

  // start loading
  loadingScreen.classList.add("active");

  const method = httpMethod ?? "GET";
  const response = await fetch(`${backendURL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json", // Set the content type to JSON
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.error === true) {
    router.navigate("/errorPage", data.msg);
    loadingScreen.classList.remove("active");
    return;
  }

  // stop loading
  loadingScreen.classList.remove("active");

  return data.data;
};

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
