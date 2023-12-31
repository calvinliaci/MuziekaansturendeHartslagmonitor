class ChartElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.chartData = Array.from({ length: 50 }, () => 0); // Initialiseer met nullen
  }

  connectedCallback() {
    this.render();
    this.chartCanvas = this.shadowRoot.getElementById('chartCanvas');
    this.chartCanvas.width = this.clientWidth;
    this.chartCanvas.height = this.clientHeight;
    this.ctx = this.chartCanvas.getContext('2d');
    this.initializeChart();
  }

  render() {
    this.shadowRoot.innerHTML = this.getTemplate();
  }

  getTemplate() {
    return /*html*/`
    <style>
      :host {
        display: block;
        position: absolute;
        top: 200px;
        left: 40px;
        width: 800px;
        height: 600px;
        border: 1px solid #ddd;
        box-sizing: border-box;
        background-color: #fff;
      }

      canvas {
        width: 100%;
        height: 100%;
      }
    </style>
    <canvas id="chartCanvas"></canvas>
      `;
  }

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

  setChartData(newData) {
    this.chartData = newData;
    this.chart.data.datasets[0].data = this.chartData;
    this.chart.update();
  }
}

customElements.define('chart-element', ChartElement);

document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket('ws://localhost:3000');

  const chartElement = document.createElement('chart-element');
  document.body.appendChild(chartElement);

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log(data)
    const last20Values = data.bpmValues.slice(-50);
    chartElement.setChartData(last20Values);
  });
});