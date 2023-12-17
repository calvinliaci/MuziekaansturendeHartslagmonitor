const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:3000'); // Change the URL to your backend server

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  // Handle the updated data and update the graph
  console.log('Received updated data:', data);
  // Update your graph using the received data
});