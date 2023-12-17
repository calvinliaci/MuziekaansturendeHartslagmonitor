// #region Imports
import express from 'express';
import mqtt from 'mqtt';
import mysql from 'mysql';
import fs from 'fs';
import open from 'open';
// #endregion

let bpmValues = []; // Array to store BPM values
let bpm;
let avgBpm;
let isSongPlaying = false;

// #region Variables
const VERSION = '1.0';
const APP = express();
const PORT = process.env.PORT || 3000;
const DBCON = mysql.createConnection( {
  host: "muziekaansturendehartslagmonitor.mysql.database.azure.com",
  user: "MuziekaansturendeHartslagmonitor",
  password: "eloict123!",
  database: "muziekaansturendehartslagmonitordb",
  timezone: "utc",
  ssl: {
    ca: fs.readFileSync('DigiCertGlobalRootCA.crt.pem')
  }
})


const protocol = 'mqtt';
//const host = '212.204.228.104';
const host = 'localhost';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `${protocol}://${host}:${port}`;
//const username = 'ucll';
//const password = 'demo';
const topic = 'ucll/test';

// connect to mqtt broker
const mqttClient = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    //username: username,
    //password: password,
    reconnectPeriod: 1000,
})


DBCON.connect(function (err) {
  if (err) throw err;
  console.log("connected to database!");
})

/* ---ACTIVATE MIDDLEWARE--- */
APP.use(express.json());

/* ---ENDPOINTS--- */

APP.get('/' , (req , res) => {
    res.send('Backend Muziekaansturende Hartslagmonitor - VERSIE : '+VERSION);

})

mqttClient.on('connect', () => {

  console.log('Connected to MQTT server : '+host+':'+port);
  mqttClient.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})

mqttClient.on('message', (topic, payload) => {
  console.log('Received Message:');
  console.log('- Topic :', topic);
  console.log('- Message :', payload.toString());

  const receivedData = payload.toString().split(', ');
  bpm = parseFloat(receivedData[0].split('=')[1]);
  avgBpm = parseFloat(receivedData[1].split('=')[1]);

  bpmValues.push(bpm);

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
    isSongPlaying = true; // Set the flag to indicate a song is playing
    open(song.filePath);
    console.log(`Now playing the song: ${song.title}`);

    // Set a timeout to reset the flag after the song duration
    setTimeout(() => {
      isSongPlaying = false;
      console.log(`Song duration elapsed. Now ready to select a new song.`);
      // Select and play a new song after the duration
      selectAndPlaySong(avgBpm); // Select using the latest BPM
    }, song.duration * 1000); // Assuming the duration is in seconds, convert it to milliseconds
  } catch (error) {
    console.error('Error playing the song:', error);
    isSongPlaying = false; // Reset the flag in case of an error
  }
}


// Functie om het nummer te selecteren op basis van BPM
function selectSongByBPM(bpm) {
  return new Promise((resolve, reject) => {
    // Voer hier je SQL-query uit om het juiste nummer te selecteren op basis van de gemeten BPM
    DBCON.query('SELECT * FROM songs WHERE (bpm >= ? AND bpm <= ?)', [bpm - 5, bpm + 5], (err, result) => {
      if (err) {
        reject(err);
      } else {
        // Neem aan dat je slechts één nummer wilt teruggeven (de eerste die overeenkomt)
        const selectedSong = result[0];
        resolve(selectedSong);
      }
    });
  });
}


/* ---START SERVER--- */
APP.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});

// ---------------------------------------
// #endregion