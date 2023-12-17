// #region Imports
import express from 'express';
import mqtt from 'mqtt';
import mysql from 'mysql';
import fs from 'fs';
import open from 'open';
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
const host = 'localhost';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `${protocol}://${host}:${port}`;
const topic = 'ucll/test';

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

APP.use("/data", express.static("../frontend"));

APP.use(express.json());

APP.get('/', (req, res) => {
  res.send('Backend Muziekaansturende Hartslagmonitor - VERSIE : ' + VERSION);
});

// Endpoint to serve data to the frontend
APP.get('/getData', (req, res) => {
  res.json({
    bpmValues: bpmValues,
    avgBpm: avgBpm,
    selectedSong: currentSong,
  });
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT server : ' + host + ':' + port);
  mqttClient.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
  });
});

mqttClient.on('message', (topic, payload) => {
  const receivedData = payload.toString().split(', ');
  bpm = parseFloat(receivedData[0].split('=')[1]);
  avgBpm = parseFloat(receivedData[1].split('=')[1]);

  bpmValues.push(bpm);

  // Send data to the frontend when a new message is received
  sendDataToFrontend();

  // Check if a song is currently playing
  if (!isSongPlaying) {
    selectAndPlaySong(avgBpm);
  } else {
    console.log('A song is currently playing. Wait until it finishes.');
  }
});

function selectAndPlaySong(avgBpm) {
  selectSongByBPM(avgBpm)
    .then((selectedSong) => {
      if (selectedSong) {
        console.log(`Selected Song: ${selectedSong.title} - BPM: ${selectedSong.bpm}`);
        playSong(selectedSong);
        currentSong = selectedSong;
      } else {
        console.log('No matching song found for the average BPM.');
      }
    })
    .catch((error) => {
      console.error('Error selecting the song:', error);
    });
}

function playSong(song) {
  try {
    isSongPlaying = true;
    open(song.filePath);
    console.log(`Now playing the song: ${song.title}`);

    setTimeout(() => {
      isSongPlaying = false;
      console.log(`Song duration elapsed. Now ready to select a new song.`);
      // Select and play a new song after the duration
      selectAndPlaySong(avgBpm);
    }, song.duration * 1000);
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
