class QrCodeDetails extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
        HELLO WORLD!
        `;
  }
}

customElements.define("qrcode-details-component", QrCodeDetails);
