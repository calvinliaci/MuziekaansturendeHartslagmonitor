class HeartbeatHeader extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    background-color: #333;
                    color: #fff;
                    padding: 20px;
                    z-index: 1000; /* Ensure it's above other elements */
                    text-align: center;
                }

                h1 {
                    font-size: 2.5em;
                    margin: 0;
                }

                h2 {
                    font-size: 1.5em;
                    margin-top: 10px;
                    color: #ecf0f1;
                }

                p {
                    font-size: 1.2em;
                    color: #ecf0f1;
                }
            </style>
            <div>
                <h1>Heartbeat Tracker</h1>
                <h2>Hou je hartslag in check.</h2>
                <p>Hou je hartslag snel en makkelijk bij. Uw gezondheid, onze prioriteit!</p>
            </div>
        `;
    }
}

customElements.define('heartbeat-header', HeartbeatHeader);