// #region Imports
import express from 'express';
import mqtt from 'mqtt';
import mysql from 'mysql';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';
import WebSocket from 'ws';
// #endregion

let bpmValues = [];
let bpm;
let avgBpm;
let isSongPlaying = false;
let currentSong = null;

// #region Variables
const VERSION = '1.0';
const APP = express();
const PORT = process.env.PORT || 3000;
const DBCON = mysql.createConnection({
  host: 'muziekaansturendehartslagmonitor.mysql.database.azure.com',
  user: 'MuziekaansturendeHartslagmonitor',
  password: 'eloict123!',
  database: 'muziekaansturendehartslagmonitordb',
  timezone: 'utc',
  ssl: {
    ca: fs.readFileSync('DigiCertGlobalRootCA.crt.pem'),
  },
});

const server = http.createServer(APP);
const wss = new WebSocket.Server({ server });

const protocol = 'mqtt';
const host = 'linuxservermh.northeurope.cloudapp.azure.com';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `${protocol}://${host}:${port}`;
const topic = 'ucll/muziekaansturendehartslagmonitor';

const mqttClient = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

DBCON.connect(function (err) {
  if (err) throw err;
  console.log('connected to database!');
});

APP.use("/", express.static("../frontend"));

APP.use(express.json());

mqttClient.on('connect', () => {
  console.log('Connected to MQTT server : ' + host + ':' + port);
  mqttClient.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
  });
});

mqttClient.on('message', (topic, payload) => {
  // Convert the payload to a number (assuming it contains the BPM value)
  const receivedBpm = parseFloat(payload.toString());

  if (!isNaN(receivedBpm) && receivedBpm > 50) {
    // Add the received BPM to the array
    bpmValues.push(receivedBpm);

    // Calculate the average BPM
    avgBpm = calculateAverageBpm();

    // Send data to the frontend when a new message is received
    sendDataToFrontend();

    // Check if a song is currently playing
    if (!isSongPlaying) {
      selectAndPlaySong(avgBpm);
    } else {
      console.log('A song is currently playing. Wait until it finishes.');
    }
  } else {
    console.error('Invalid or low BPM value received:', payload.toString());
  }
});


// Add the following function to calculate the average BPM considering the last 750 values above 50
function calculateAverageBpm() {
  const filteredBpmValues = bpmValues
    .slice(-500); // Select the last 500 BPM values

  if (filteredBpmValues.length === 0) {
    return 0;
  }

  const sum = filteredBpmValues.reduce((acc, bpm) => acc + bpm, 0);
  return sum / filteredBpmValues.length;
}



async function selectAndPlaySong(avgBpm) {
  try {
    const selectedSong = await selectSongByBPM(avgBpm);
    
    if (selectedSong) {
      console.log(`Selected Song: ${selectedSong.title} - BPM: ${selectedSong.bpm}`);
      await playSong(selectedSong);
      currentSong = selectedSong;
    } else {
      console.log('No matching song found for the average BPM.');
    }
  } catch (error) {
    console.error('Error selecting or playing the song:', error);
  }
}


async function playSong(song) {
  try {
    isSongPlaying = true;

    // Get the directory path using import.meta.url
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Assuming your MP3 files are in a 'music' directory relative to your script
    const musicFilePath = path.join(__dirname, 'music', `${song.title}.mp3`);

    // Use double quotes around the file path to handle spaces
    const command = process.platform === 'win32'
      ? `start "" "${musicFilePath}"`
      : `xdg-open "${musicFilePath}"`;

    // Set currentSong before playing the song
    currentSong = song;

    exec(command, (err) => {
      if (err) {
        console.error('Error playing the song:', err);
      } else {
        console.log(`Now playing the song: ${song.title}`);

        setTimeout(() => {
          isSongPlaying = false;
          console.log(`Song duration elapsed. Now ready to select a new song.`);
          // Select and play a new song after the duration
          selectAndPlaySong(avgBpm);
        }, song.duration * 1000);

        // Send the updated currentSong to the frontend
        sendDataToFrontend();
      }
    });
  } catch (error) {
    console.error('Error playing the song:', error);
    isSongPlaying = false;
  }
}

function selectSongByBPM(bpm) {
  return new Promise((resolve, reject) => {
    DBCON.query('SELECT * FROM songs WHERE (bpm >= ? AND bpm <= ?)', [bpm - 5, bpm + 5], (err, result) => {
      if (err) {
        reject(err);
      } else {
        const selectedSong = result[0];
        resolve(selectedSong);
      }
    });
  });
}

function sendDataToFrontend() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          bpmValues: bpmValues,
          avgBpm: avgBpm,
          selectedSong: currentSong,
        })
      );
    }
  });
}

server.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
