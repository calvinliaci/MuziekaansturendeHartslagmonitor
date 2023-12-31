const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    :host {
      display: block;
      position: absolute;
      top: 920px;
      left: 300px;

      font-family: 'Arial', sans-serif;
      text-align: center;
      padding: 20px;
      border: 4px solid #333; /* Border color */
      border-radius: 20px; /* Increased border-radius for a smoother look */
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Soft box shadow for depth */
      transition: box-shadow 0.3s ease; /* Smooth transition on hover or state changes */
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
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); /* Enhanced shadow on hover */
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

    // Create shadow DOM
    this.attachShadow({ mode: 'open' });

    // Initialize BPM values
    this.bpm = 0;
    this.averageBPM = 0;

    // Render the component
    this.render();

    // WebSocket setup (replace 'ws://localhost:3000' with your backend server URL)
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.updateBPMWithDelay(data.bpmValues); // Pass the array of BPM values
      this.updateAverageBPMWithDelay(data.avgBpm);

      // console.log(data.bpmValues);
      // console.log(data.avgBpm);
    });
  }

  // Method to update BPM value with a 2-second delay
  updateBPMWithDelay(newBPMArray) {
    setTimeout(() => {
      this.updateBPM(newBPMArray);
    }, 1000);
  }

  // Method to update BPM value
  updateBPM(newBPMArray) {
    if (Array.isArray(newBPMArray) && newBPMArray.length > 0) {
      // Get the newest BPM value from the array
      const newBPM = newBPMArray[newBPMArray.length - 1];

      if (!isNaN(newBPM)) {
        this.bpm = parseFloat(newBPM);
        this.render();
      }
    }
  }

  // Method to update average BPM value with a 2-second delay
  updateAverageBPMWithDelay(newAverageBPM) {
    setTimeout(() => {
      this.updateAverageBPM(newAverageBPM);
    }, 1000);
  }

  // Method to update average BPM value
  updateAverageBPM(newAverageBPM) {
    if (!isNaN(newAverageBPM)) {
      this.averageBPM = parseFloat(newAverageBPM);
      this.render();
    }
  }

  // Method to render the component
  render() {
    // Render the template
    const content = document.importNode(template.content, true);

    // Update BPM and average BPM values in the content
    content.querySelector('.bpm-value').textContent = `${this.bpm.toFixed(0)} BPM`;
    content.querySelector('.average-bpm-value').textContent = `Gemiddeld: ${this.averageBPM.toFixed(0)} BPM`;

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(content);
  }
}

// Define the custom element
customElements.define('bpm-display', BPMDisplay);
