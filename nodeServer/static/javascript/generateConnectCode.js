function generateConnectCode() {
    const generateButton = document.getElementById("generateCode")
    const codeContainer = document.getElementById("connectionCode")

    function populateCode(codeData) {
        codeContainer.innerHTML = ""
        const codeText = document.createElement("p")
        codeText.classList.add("centeredText")

        if (parseInt(codeData.expires) < Date.now()) {
            codeText.innerHTML = "Connection code expired!"
        }else {
            codeText.innerHTML = `Connection code:<br>${codeData.code}<br>Expires at:<br>${timeStampToDate(new Date(codeData.expires))}`
        }
        codeContainer.appendChild(codeText)
    }

    const codeData = getJSON(`${url}/admin/getCode`)
    populateCode(codeData)

    generateButton.addEventListener("click", (event) => {

        const codeData = getJSON(`${url}/admin/generateCode`)

        if (codeData.unauthorized) {
            window.location.replace(`${url}/admin`)
        }
        populateCode(codeData)
    })
}
generateConnectCode()