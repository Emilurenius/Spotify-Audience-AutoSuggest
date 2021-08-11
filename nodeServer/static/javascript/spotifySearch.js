function spotifySearch() {
    const songName = document.getElementById("songName")
    const artist = document.getElementById("artist")
    const search = document.getElementById("search")
    const resultsContainer = document.getElementById("resultsContainer")

    search.addEventListener("click", (event) => {
        resultsContainer.innerHTML = ""
        const response = getJSON(`${url}/spotify/search?songName=${songName.value}&artist=${artist.value}`)
        console.log(response)

        if (response == false) {
            window.location.reload()
        }

        const results = response.body.tracks.items
        console.log(results)

        for (let result in results) {
            console.log(results[result])

            songLink = document.createElement("a")
            songLink.classList.add("centeredText")
            songLink.href = `${url}/spotify/addsong?uri=${results[result].uri}`
            songLink.innerHTML = `${results[result].name}<br>${results[result].artists[0].name}`

            artistNameText = document.createElement("p")
            artistNameText.classList.add("centeredText")
            artistNameText.innerHTML = `${results[result].artists[0].name}`

            songImage = document.createElement("img")
            songImage.src = results[result].album.images[2].url
            songImage.style = "vertical-align: middle; margin: 10px;"

            linkContainer = document.createElement("div")
            linkContainer.classList.add("maxWidthDiv")
            linkContainer.style = "margin-left: 10%"

            linkContainer.appendChild(songImage)
            linkContainer.appendChild(songLink)
            //linkContainer.appendChild(artistNameText)

            resultsContainer.appendChild(linkContainer)
        }
    })
}spotifySearch()