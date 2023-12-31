import "./hartslag.js"
import "./footer.js"
import "./afspeelMuziek.js"


const template = document.createElement("template")
template.innerHTML = /*html*/`
    <music-example></music-example>
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