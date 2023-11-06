class createBBDD extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'open' })
    }
    
    async connectedCallback() {
        // Carrega els estils CSS
        const style = document.createElement('style')
        style.textContent = await fetch('/shadows/userLogin.css').then(r => r.text())
        this.shadow.appendChild(style)
    
        // Carrega els elements HTML
        const htmlContent = await fetch('/shadows/editBBDD.html').then(r => r.text())

        // Converteix la cadena HTML en nodes utilitzant un DocumentFragment
        const template = document.createElement('template');
        template.innerHTML = htmlContent;
        
        // Clona i afegeix el contingut del template al shadow
        this.shadow.appendChild(template.content.cloneNode(true));

        this.shadow.querySelector('#deleteInputText').addEventListener('click',this.actionDeleteRow.bind(this))
        this.shadow.querySelector('#deleteShowForm').addEventListener('click', this.showView.bind(this, 'viewSignUpForm', 'initial'))
    }

    async actionDeleteRow() {
        let refDeleteEntry = this.shadow.querySelector('#signUpUserName')
    }

}

customElements.define('edit-bbdd', createBBDD)