class FooterComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
        <div class="container">
            <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
              <p class="col-md-4 mb-0 text-body-secondary">© ${new Date().getFullYear()}</p>

              <a href="/" data-link class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                <i class="bi bi-qr-code-scan fs-1"></i>
              </a>
        </div>
    `;
  }
}

customElements.define("footer-component", FooterComponent);
