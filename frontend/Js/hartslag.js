// Create a custom HTML element named ChartElement
class ChartElement extends HTMLElement {
  // Constructor to initialize the element's state
  constructor() {
    super(); // Invoke the constructor of the parent class (HTMLElement)
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM for encapsulation
    this.chartData = Array.from({ length: 50 }, () => 0); // Initialize chart data with 50 zeroes
  }

  // ConnectedCallback is called when the element is added to the DOM
  connectedCallback() {
    this.render(); // Initiate the rendering process
    this.chartCanvas = this.shadowRoot.getElementById('chartCanvas'); // Get the canvas element
    this.chartCanvas.width = this.clientWidth; // Set canvas width
    this.chartCanvas.height = this.clientHeight; // Set canvas height
    this.ctx = this.chartCanvas.getContext('2d'); // Get 2D rendering context
    this.initializeChart(); // Initialize the Chart.js chart
  }

  // Render method sets the inner HTML of the shadow DOM
  render() {
    this.shadowRoot.innerHTML = this.getTemplate();
  }

  // GetTemplate method returns an HTML template as a string
  getTemplate() {
    return /*html*/`
    <style>
      :host {
        display: block;
        position: absolute;
        top: 250px;
        left: 40px;
        width: 800px;
        height: 600px;
        border: 1px solid black;
        box-sizing: border-box;
        background-color: #fff;
      }

        canvas {
          width: 100%;
          height: 100%;
          background-color: lightgray;
        }
      </style>
      <canvas id="chartCanvas"></canvas>
    `;
  }

  // InitializeChart method creates a Chart.js line chart
  initializeChart() {
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 50 }, (_, i) => i + 1),
        datasets: [{
          label: 'Laatste 50 waarden',
          data: this.chartData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 10,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
          pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        }]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
          },
          y: {
            type: 'linear',
            position: 'left',
            min: 50,
            max: 220,
          }
        }
      }
    });
  }

  // SetChartData method updates the chart data with new values
  setChartData(newData) {
    this.chartData = newData;
    this.chart.data.datasets[0].data = this.chartData;
    this.chart.update();
  }
}

// Define the custom element 'chart-element'
customElements.define('chart-element', ChartElement);

// Event listener for the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket('ws://localhost:3000'); // Create a WebSocket connection

  //const chartElement = document.createElement('chart-element'); // Create an instance of ChartElement
  //document.body.appendChild(chartElement); // Append the custom element to the body

  // WebSocket message event listener
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data); // Parse incoming JSON data
    console.log(data);

    // Delay the chart update by 1 second
    setTimeout(() => {
      const last20Values = data.bpmValues.slice(-50); // Get the last 50 values
      chartElement.setChartData(last20Values); // Update the chart data
    }, 1000);
  });
});
