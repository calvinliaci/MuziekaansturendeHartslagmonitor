import "./hartslag.js"
import "./footer.js"
import "./afspeelMuziek.js"
import "./bpmTabel.js"
import "./bpm-display.js"
import "./heartBeatHeader.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
    <heartbeat-header></heartbeat-header>
    <chart-element></chart-element>
    <bpm-display></bpm-display>
    <music-example></music-example>
    <bpm-table></bpm-table>
    <footer-component></footer-component>
`
class app extends HTMLElement {
    constructor() {
        super()
        const shadow = this.attachShadow({ mode: "open" }); // zorgt ervoor dat het component een afgeschermde stijl kan hebben
        shadow.append(template.content.cloneNode(true));
    }
}

customElements.define('app-comp', app)