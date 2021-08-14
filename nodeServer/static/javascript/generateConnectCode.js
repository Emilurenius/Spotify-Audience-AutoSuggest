function generateConnectCode() {
    const generateButton = document.getElementById("generateCode")
    const codeContainer = document.getElementById("connectionCode")

    generateButton.addEventListener("click", (event) => {
        codeContainer.innerHTML = ""

        const codeData = getJSON(`${url}/admin/generateCode`)

        if (codeData.unauthorized) {
            window.location.replace(`${url}/admin`)
        }

        const codeText = document.createElement("p")
        codeText.classList.add("centeredText")
        codeText.innerHTML = `Activation code:<br>${codeData.code}<br>Expires at:<br>${timeStampToDate(new Date(codeData.expires))}`

        codeContainer.appendChild(codeText)
    })
}
generateConnectCode()