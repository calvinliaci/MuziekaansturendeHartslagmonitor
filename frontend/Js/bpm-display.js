const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      display: block;
      position: absolute;
      top: 930px;
      left: 300px;

      font-family: 'Arial', sans-serif;
      text-align: center;
      padding: 20px;
      border: 4px solid #333; 
      border-radius: 20px; 
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
      transition: box-shadow 0.3s ease; 
      max-width: 300px;
      margin: 0 auto;
    }

    .bpm-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .average-bpm-value {
      font-size: 18px;
      color: #666;
    }

    .heart {
      color: red;
      font-size: 32px;
      margin: 0 5px;
    }

    :host(:hover) {
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); /* Verbeterde schaduw bij hover */
    }
  </style>
  <div>
    <span class="bpm-value"></span>
    <span class="heart">❤️</span>
    <br>
    <span class="average-bpm-value"></span>
    <span class="heart">❤️</span>
  </div>
`;

class BPMDisplay extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM aanmaken
    this.attachShadow({ mode: 'open' });

    // Initialiseren van BPM-waarden
    this.bpm = 0;
    this.averageBPM = 0;

    // Component renderen
    this.render();

    // WebSocket instellen (vervang 'ws://localhost:3000' door de URL van je backend-server)
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.updateBPMWithDelay(data.bpmValues); // Array van BPM-waarden doorgeven
      this.updateAverageBPMWithDelay(data.avgBpm);

      // console.log(data.bpmValues);
      // console.log(data.avgBpm);
    });
  }

  // Methode om BPM-waarde met een vertraging van 2 seconden bij te werken
  updateBPMWithDelay(newBPMArray) {
    setTimeout(() => {
      this.updateBPM(newBPMArray);
    }, 1000);
  }

  // Methode om BPM-waarde bij te werken
  updateBPM(newBPMArray) {
    if (Array.isArray(newBPMArray) && newBPMArray.length > 0) {
      // Haal de nieuwste BPM-waarde op uit de array
      const newBPM = newBPMArray[newBPMArray.length - 1];

      if (!isNaN(newBPM)) {
        this.bpm = parseFloat(newBPM);
        this.render();
      }
    }
  }

  // Methode om gemiddelde BPM-waarde met een vertraging van 2 seconden bij te werken
  updateAverageBPMWithDelay(newAverageBPM) {
    setTimeout(() => {
      this.updateAverageBPM(newAverageBPM);
    }, 1000);
  }

  // Methode om gemiddelde BPM-waarde bij te werken
  updateAverageBPM(newAverageBPM) {
    if (!isNaN(newAverageBPM)) {
      this.averageBPM = parseFloat(newAverageBPM);
      this.render();
    }
  }

  // Methode om de component te renderen
  render() {
    // Het template renderen
    const content = document.importNode(template.content, true);

    // BPM- en gemiddelde BPM-waarden bijwerken in de inhoud
    content.querySelector('.bpm-value').textContent = `${this.bpm.toFixed(0)} BPM`;
    content.querySelector('.average-bpm-value').textContent = `Gemiddeld: ${this.averageBPM.toFixed(0)} BPM`;

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(content);
  }
}

// Definieer component
customElements.define('bpm-display', BPMDisplay);