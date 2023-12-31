    const socket = new WebSocket('ws://localhost:3000');

    class MusicExample extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                position: absolute;
                top: 520px;
                left: 10px;
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
            padding: 10px;
            margin: 10px;
            border: 1px solid #ddd;
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
        // Luister naar berichten van de server
        socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        this.updateMusicInfo(data.selectedSong);
        });
    }

    updateMusicInfo(song) {
        if (song) {
        this.shadowRoot.querySelector('.music-image').src = this.getThumbnailUrl(song.filePath);
        this.shadowRoot.querySelector('.music-title').textContent = song.title || 'Onbekend';
        this.shadowRoot.querySelector('.music-duration').textContent = this.formatDuration(song.duration) || '';;
        this.shadowRoot.querySelector('.bpm').textContent = "Beats per minuut: " + song.bpm || "Beats per minuut: ?"; 
        } else {
        // Reset de informatie als er geen nummer is geselecteerd
        this.shadowRoot.querySelector('.music-image').src = '';
        this.shadowRoot.querySelector('.music-title').textContent = 'Geen nummer geselecteerd';
        this.shadowRoot.querySelector('.music-duration').textContent = '';
        this.shadowRoot.querySelector('.bpm').textContent = ''; 

        }
    }

    getThumbnailUrl(youtubeUrl) {
        const videoId = this.extractVideoId(youtubeUrl);
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    extractVideoId(youtubeUrl) {
        const match = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    }

    formatDuration(durationInSeconds) {
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    }

    customElements.define('music-example', MusicExample);