class HomeComponent extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const data = await window.fetchData("/ticket");
    this.render(data);
  }

  render(data) {
    this.innerHTML = `
     <div class="px-4 py-5 my-5 text-center">
        <i class="bi bi-qr-code-scan" style="font-size: 5rem;"></i>
        <h1 class="display-5 fw-bold text-body-emphasis">${data} Tickets Generated</h1>
        <div class="col-lg-6 mx-auto mt-5">
            <a href="/createQR" data-link type="button" class="btn btn-primary btn-lg px-4 gap-3">Create your QR code.</a>
        </div>
    </div>
    `;
  }
}

customElements.define("home-component", HomeComponent);
