class Router {
  constructor() {
    this._routes = [
      {
        path: "/home",
        name: "Home",
        component: "home-component",
        showAsLink: true,
      },

      {
        path: "/createQR",
        name: "Create QR-CODE",
        component: "qrcode-create-component",
        showAsLink: true,
      },

      {
        path: /\/qrcode\/([a-zA-Z0-9-]+)/, // /qrcode/UUID
        name: "QR-CODE Details",
        component: "qrcode-details-component",
        showAsLink: false,
      },
    ];

    this.addEventListeners();
  }

  get routes() {
    return this._routes
      .filter((route) => route.showAsLink)
      .map((route) => ({
        path: route.path,
        name: route.name,
      }));
  }

  navigate(url) {
    if (url === "/" || url === "/index.html") {
      url = "/home";
    }

    const route = this.findRoute(url);

    const app = document.getElementById("app");
    app.innerHTML = "";

    if (window.location.pathname === route.path) {
      window.history.replaceState({}, "", route.path);
    } else {
      window.history.pushState({}, "", route.path);
    }
    window.dispatchEvent(new Event("urlchange"));

    const componentToInsert = document.createElement(route.component);
    app.appendChild(componentToInsert);
  }

  findRoute(url) {
    for (let route of this._routes) {
      if (typeof route.path === "string" && route.path === url) {
        return route;
      } else if (route.path instanceof RegExp && route.path.test(url)) {
        return {
          ...route,
          path: url,
        };
      }
    }

    return {
      path: "/notFound",
      name: "Not Found",
      component: "page-not-found",
    };
  }

  addEventListeners() {
    // when someone is going back
    window.addEventListener("popstate", (event) => {
      this.navigate(window.location.pathname);
    });

    // when someone is going on another link
    window.addEventListener("click", (event) => {
      event.preventDefault();

      const link = event.target.closest("[data-link]");

      if (link) {
        event.stopPropagation();

        const href = link.getAttribute("href");
        this.navigate(href);

        return;
      }
    });
  }
}

export default Router;
