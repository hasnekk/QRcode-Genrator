class ErrorPage extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const state = history.state;
    const msg = state?.msg ?? "Error occuared.";

    this.render(msg);
  }

  render(data) {
    this.innerHTML = `
       <div class="px-4 py-5 my-5 text-center">
          <i class="bi bi-emoji-frown-fill" style="font-size: 5rem;"></i>
          <h1 class="display-5 fw-bold text-body-emphasis">${data}</h1>
          <div class="col-lg-6 mx-auto mt-5">
              <a href="/home" data-link type="button" class="btn btn-primary btn-lg px-4 gap-3">Back Home</a>
          </div>
      </div>
      `;
  }
}

customElements.define("error-page", ErrorPage);
