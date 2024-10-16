class QrCodeDetails extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const id = window.location.pathname.split("/").at(-1);
    console.log(id);

    const data = await window.fetchData(`/ticket/${id}`);
    this.render(data);
  }

  render(data) {
    this.innerHTML = `
      <div class="container mt-5">
          <h1 class="text-center">Ticket Details</h1>

          <div class="card">
              <div class="card-body">
                  <h5 class="card-title">Ticket Information</h5>
                  <ul class="list-group list-group-flush">
                      <li class="list-group-item"><strong>VATIN:</strong> <span id="vatin">${
                        data.vatin
                      }</span></li>
                      <li class="list-group-item"><strong>First Name:</strong> <span id="firstname">${
                        data.firstname
                      }</span></li>
                      <li class="list-group-item"><strong>Last Name:</strong> <span id="lastname">${
                        data.lastname
                      }</span></li>
                      <li class="list-group-item"><strong>Time of Creation:</strong> <span id="creation-time">${new Date(
                        data.createdat
                      )}</span></li>
                  </ul>
                  <h5 class="mt-4">QR Code</h5>
                  <img id="qr-code" src=${
                    data.qrCode
                  } alt="QR Code" class="img-fluid">
              </div>
          </div>
      </div>
        `;
  }
}

customElements.define("qrcode-details-component", QrCodeDetails);
