const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
    table {
      border-collapse: collapse;
      width: 40%;
      margin: 20px;
      top: 650px;
      right: 50px;
      position: absolute;
    }

    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }

    th {
      background-color: #333;
      color: #fff;
    }
  </style>

  <table>
    <thead>
      <tr>
        <th>Meeting</th>
        <th>BPM Waarde</th>
      </tr>
    </thead>
    <tbody id="tableBody"></tbody>
  </table>
`;

class BPMTable extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM aanmaken
    this.attachShadow({ mode: "open" });

    // Template klonen naar de shadow DOM
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Interne staat van de component
    this.values = [];
    this.latestTimestamp = 0; // Timestamp van de laatst ontvangen BPM-waarde
  }

  connectedCallback() {
    // WebSocket instellen (vervang 'ws://localhost:3000' door de URL van je backend-server)
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.updateBPMWithDelay(data.bpmValues); // Doorgeven van de array met BPM-waarden en timestamp
    });

    // Start het bijwerken van waarden elke 2 seconden
    this.updateValues();
  }

  // Methode om waarden elke 2 seconden bij te werken
  updateValues() {
    // Plan de volgende update na 2 seconden
    setTimeout(() => {
      // Roep de volgende update aan
      this.updateValues();
    }, 2000);
  }

  // Methode om BPM-waarden met een vertraging te bij te werken
  updateBPMWithDelay(newBPMArray) {
    const currentTime = new Date().getTime();
    if (currentTime - this.latestTimestamp >= 1000) {
      // Verwerk alleen als er één seconde is verstreken sinds de laatste BPM-waarde
      this.latestTimestamp = currentTime;
      this.updateBPM(newBPMArray);
    }
  }

  // Methode om BPM-waarden bij te werken
  updateBPM(newBPM) {
    if (Array.isArray(newBPM) && newBPM.length > 0) {
      // Haal de nieuwste BPM-waarde op uit de array
      const latestBPM = newBPM[newBPM.length - 1];

      if (!isNaN(latestBPM)) {
        this.values.unshift(latestBPM);
      }
    }

    // Houd slechts 10 waarden bij
    if (this.values.length > 10) {
      this.values.pop();
    }

    // Werk de tabel bij
    this.updateTableBody();
  }

 // Methode om de tbody van de tabel bij te werken
updateTableBody() {
  const tableBody = this.shadowRoot.getElementById("tableBody");

  tableBody.innerHTML = "";

  this.values.forEach((value, index) => {
    const row = document.createElement("tr");
    const indexText = this.getIndexText(index);
    const roundedValue = Math.round(value); // Round the BPM value to the nearest integer
    row.innerHTML = `
      <td>${indexText}</td>
      <td>${roundedValue}</td>
    `;
    tableBody.appendChild(row);
  });
}

  // Hulpmethode om tekst te genereren op basis van de index
  getIndexText(index) {
    if (index === 0) {
      return "Meest Recent";
    } else {
      return `${index + 1}de Laatste`;
    }
  }
}

// Definieer de aangepaste HTML-tag 'bpm-table' als een webcomponent
customElements.define("bpm-table", BPMTable);