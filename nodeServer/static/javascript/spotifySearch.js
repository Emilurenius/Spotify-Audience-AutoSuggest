function spotifySearch() {
    const songName = document.getElementById("songName")
    const artist = document.getElementById("artist")
    const search = document.getElementById("search")
    const resultsContainer = document.getElementById("resultsContainer")

    search.addEventListener("click", (event) => {
        results = getJSON(`${url}/spotify/search?songName=${songName.value}&artist=${artist.value}`).body.tracks.items
        console.log(results)

        for (let result in results) {
            console.log(results[result])

            songLink = document.createElement("a")
            songLink.classList.add("centeredText")
            songLink.href = `${url}/spotify/addsong?uri=${results[result].uri}`
            songLink.innerHTML = `${results[result].name} by ${results[result].artists[0].name}`

            songImage = document.createElement("img")
            songImage.src = results[result].album.images[2].url

            linkContainer = document.createElement("div")
            linkContainer.classList.add("maxWidthDiv")
            linkContainer.style = "margin-left: 20%"

            linkContainer.appendChild(songImage)
            linkContainer.appendChild(songLink)

            resultsContainer.appendChild(linkContainer)
        }
    })
}spotifySearch()