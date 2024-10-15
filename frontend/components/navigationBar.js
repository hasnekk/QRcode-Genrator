class NavigationBar extends HTMLElement {
  constructor() {
    super();
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  connectedCallback() {
    this.render();
    window.addEventListener("urlchange", () => {
      console.log("hej");
      this.handleLocationChange();
    });
  }

  disconnectedCallback() {
    window.removeEventListener("urlchange", this.handleLocationChange);
  }

  handleLocationChange() {
    this.render(); // Re-render the navigation bar when the location changes
  }

  render() {
    const routes = window.router.routes;
    const currentPathname = window.location.pathname;

    this.innerHTML = `
      <div class="container">
        <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
          <div class="col-md-3 mb-2 mb-md-0">
            <a data-link href="/" class="d-inline-flex link-body-emphasis text-decoration-none">
              <i class="bi bi-qr-code-scan fs-1"></i>
            </a>
          </div>

          <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
            ${routes
              .map(
                (route) => `
                <li>
                  <a
                    data-link
                    href="${route.path}"
                    class="nav-link px-2 ${
                      currentPathname === route.path ? "link-secondary" : null
                    }"
                  >
                    ${route.name}
                  </a>
                </li>`
              )
              .join("")}
              
              <li>
                <a
                  data-link
                  href="/qrcode/932837323"
                  class="nav-link px-2"
                >
                  nesto
                </a>
              </li>
          </ul>

          <div class="col-md-3 text-end">
            <button type="button" class="btn btn-outline-primary me-2">
              Login
            </button>
            <button type="button" class="btn btn-primary">Sign-up</button>
          </div>
        </header>
      </div>`;
  }
}

customElements.define("navigation-bar", NavigationBar);
