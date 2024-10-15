class PageNotFound extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
        <div class="container vh-100 d-flex flex-column justify-content-center align-items-center">
            <h1 class="display-1">404</h1>
            <h2 class="mb-4">Page Not Found</h2>
            <p class="lead text-center">Sorry, the page you are looking for does not exist.<br>It might have been removed, had its name changed, or is temporarily unavailable.</p>
            <a href="/" class="btn btn-primary">Go to Homepage</a>
        </div>
    `;
  }
}

customElements.define("page-not-found", PageNotFound);
