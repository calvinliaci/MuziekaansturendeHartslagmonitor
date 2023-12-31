// Create a WebSocket connection to the specified server
const socket = new WebSocket('ws://localhost:3000');

// Define a custom HTML element named MusicExample
class MusicExample extends HTMLElement {
  constructor() {
    // Call the constructor of the HTMLElement class
    super();

    // Attach a shadow DOM to encapsulate the component's styling and structure
    this.attachShadow({ mode: 'open' });

    // Set the inner HTML of the shadow DOM using a template literal
    this.shadowRoot.innerHTML = /*html*/`
      <style>
        :host {
          display: block;
          position: absolute;
          right: 350px;
          top: 10px;
          width: 400px;
          height: 300px;
          box-sizing: border-box;
          background-color: #fff;
          z-index: 999;
        }

        .music-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0px;
          margin: 0px;
          border: 1px solid black;
        }

        .music-image {
          max-width: 100%;
          margin-bottom: 10px;
        }

        .music-title {
          font-size: 1.5em;
          margin: 0;
        }

        .music-duration {
          margin: 0;
        }

        .bpm {
          margin: 0;
        }
      </style>
      <div class="music-block">
        <img class="music-image" src="" alt="Muziek Afbeelding">
        <h1 class="music-title">Geen nummer geselecteerd</h1>
        <p class="music-duration"></p>
        <p class="bpm"></p>
      </div>
    `;
  }

  connectedCallback() {
    // Listen for messages from the server through the WebSocket connection
    socket.addEventListener('message', (event) => {
      // Parse the JSON data from the server
      const data = JSON.parse(event.data);

      // Update the music information based on the selected song
      this.updateMusicInfo(data.selectedSong);
    });
  }

  // Update the displayed music information based on the provided song data
  updateMusicInfo(song) {
    if (song) {
      // If a song is selected, update the displayed information
      this.shadowRoot.querySelector('.music-image').src = this.getThumbnailUrl(song.filePath);
      this.shadowRoot.querySelector('.music-title').textContent = song.title || 'Onbekend';
      this.shadowRoot.querySelector('.music-duration').textContent = this.formatDuration(song.duration) || '';
      this.shadowRoot.querySelector('.bpm').textContent = "Beats per minuut: " + song.bpm || "Beats per minuut: ?";
    } else {
      // If no song is selected, reset the displayed information
      this.shadowRoot.querySelector('.music-image').src = '';
      this.shadowRoot.querySelector('.music-title').textContent = 'Geen nummer geselecteerd';
      this.shadowRoot.querySelector('.music-duration').textContent = '';
      this.shadowRoot.querySelector('.bpm').textContent = '';
    }
  }

  // Generate the YouTube thumbnail URL based on the YouTube video URL
  getThumbnailUrl(youtubeUrl) {
    const videoId = this.extractVideoId(youtubeUrl);
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Extract the video ID from a YouTube video URL
  extractVideoId(youtubeUrl) {
    const match = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  // Format the duration from seconds into the "minutes:seconds" format
  formatDuration(durationInSeconds) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}

// Define the custom element 'music-example'
customElements.define('music-example', MusicExample);
