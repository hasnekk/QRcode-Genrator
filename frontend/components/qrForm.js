class CreateQRComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click", this.onSubmit.bind(this));
  }

  disconnectedCallback() {
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.removeEventListener("click", this.onSubmit.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();

    const vatin = document.getElementById("vatin");
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");

    if (vatin?.value.length !== 11) {
      alert("Vatin must have 11 characters.");
      return;
    }

    if (!firstName.value) {
      alert("First name is required.");
      return;
    }

    if (!lastName.value) {
      alert("Last name is required.");
      return;
    }

    const data = await window.fetchData("/ticket", "POST", {
      vatin: vatin.value,
      firstName: firstName.value,
      lastName: lastName.value,
    });

    const qrCodeDiv = document.getElementById("qr-code");

    const qrCodeImg = document.createElement("img");
    qrCodeImg.src = data;
    qrCodeImg.alt = "QR code";
    qrCodeImg.style.width = "200px";
    qrCodeImg.style.height = "200px";

    qrCodeDiv.appendChild(qrCodeImg);
  }

  render() {
    this.innerHTML = `
        <div class="container mt-5">
            <h2 class="text-center">Ticket Generation Form</h2>
            <form id="userForm">
                <div class="mb-3">
                    <label for="vatin" class="form-label">VATIN</label>
                    <input type="text" class="form-control" id="vatin" name="vatin" required>
                </div>
                <div class="mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input type="text" class="form-control" id="firstName" name="firstName" required>
                </div>
                <div class="mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input type="text" class="form-control" id="lastName" name="lastName" required>
                </div>
                <button type="submit" id="submitBtn" class="btn btn-primary">Submit</button>
            </form>
        </div>

        <div id="qr-code" class="my-5 container centered-flex d-flex justify-content-center align-items-center">
        </div>
      `;
  }
}

customElements.define("qrcode-create-component", CreateQRComponent);
