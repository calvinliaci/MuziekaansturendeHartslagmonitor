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

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.values = [];
    this.latestTimestamp = 0; // Timestamp of the latest BPM value received
  }

  connectedCallback() {
    // WebSocket setup (replace 'ws://localhost:3000' with your backend server URL)
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.updateBPMWithDelay(data.bpmValues, data.timestamp); // Pass the array of BPM values and timestamp
    });

    // Start updating values every 2 seconds
    this.updateValues();
  }

  updateValues() {
    // Schedule the next update after 2 seconds
    setTimeout(() => {
      // Call the next update
      this.updateValues();
    }, 2000);
  }

  updateBPMWithDelay(newBPMArray, timestamp) {
    const currentTime = new Date().getTime();
    if (currentTime - this.latestTimestamp >= 1000) {
      // Process only if one second has passed since the last BPM value
      this.latestTimestamp = currentTime;
      this.updateBPM(newBPMArray);
    }
  }

  updateBPM(newBPM) {
    if (Array.isArray(newBPM) && newBPM.length > 0) {
      // Get the newest BPM value from the array
      const latestBPM = newBPM[newBPM.length - 1];

      if (!isNaN(latestBPM)) {
        this.values.unshift(latestBPM);
      }
    }

    // Keep only 10 values
    if (this.values.length > 10) {
      this.values.pop();
    }

    // Update the table
    this.updateTableBody();
  }

  updateTableBody() {
    const tableBody = this.shadowRoot.getElementById("tableBody");

    tableBody.innerHTML = "";

    this.values.forEach((value, index) => {
      const row = document.createElement("tr");
      const indexText = this.getIndexText(index);
      row.innerHTML = `
        <td>${indexText}</td>
        <td>${value}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  getIndexText(index) {
    if (index === 0) {
      return "Meest Recent";
    } else {
      return `${index + 1}de Laatste`;
    }
  }
}

customElements.define("bpm-table", BPMTable);
