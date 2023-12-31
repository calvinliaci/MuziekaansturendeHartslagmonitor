// Maak een nieuwe aangepaste HTML-tag voor de footer-component
class FooterComponent extends HTMLElement {
  constructor() {
    super();

    // Creëer een shadow root
    this.attachShadow({ mode: 'open' });

    // Definieer de HTML-content
    this.shadowRoot.innerHTML = /*html*/`
      <style>
        .footer-container {
          display: flex;
          justify-content: space-around;
          top: 1150px;
          left: 0px;
          right: 0px;
          position: absolute;
          background-color: #333;
          color: #fff;
          padding: 20px;
        }

        .footer-section {
          max-width: 250px;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        ul li {
          margin-bottom: 8px;
        }

        a {
          color: #fff;
          text-decoration: none;
        }
      </style>
      <div class="footer-container">
        <div class="footer-section">
          <h3>Concept</h3>
          <p>
            Deze site is gemaakt zodat je makkelijk gegevens over je bpm kan bekijken. <br/>
            <hr/>
            De muziek zal zichzelf automatisch matchen aan je hartritme voor die optimale sportervaring.<br/>
          </p>
        </div>

        <div class="footer-section">
          <h3>Participanten</h3>
          <ul>
            <li><a href="#">Viktor Dries 2-ICT</a></li>
            <li><a href="#">Bram Lemmens 2-ICT</a></li>
            <li><a href="#">Calvin Liaci 3-ICT</a></li>
            <li><a href="#">Preben Steegmans 3-ELO</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>Contact</h3>
          <p><a href="mailto:viktor.dries@student.ucll.be">viktor.dries@student.ucll.be</a></p>
          <p><a href="mailto:bram.lemmens2@student.ucll.be">bram.lemmens2@student.ucll.be</a></p>
          <p><a href="mailto:calvin.liaci@student.ucll.be">calvin.liaci@student.ucll.be</a></p>
          <p><a href="mailto:preben.steegmans@student.ucll.be">preben.steegmans@student.ucll.be</a></p>
        </div>
      </div>
    `;
  }
}

// Definieer component
customElements.define('footer-component', FooterComponent);