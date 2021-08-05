// All external modules are loaded in:
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const path = require("path")
const fs = require("fs")
const cors = require("cors")

const SpotifyWebAPI = require('spotify-web-api-node');
scopes = ["user-read-playback-state"]

function loadJSON(filename) {
    const rawdata = fs.readFileSync(path.join(__dirname, filename))
    const data = JSON.parse(rawdata)
    return data
}

function saveJSON(json, filename) {
    const stringified = JSON.stringify(json, null, 4)
    fs.writeFile(path.join(__dirname, filename), stringified, (err) => {
        if (err) throw err
        console.log("Data written to file")
    })
}

const clientData = loadJSON("/spotifyClientData.json")
const spotifyAPI = new SpotifyWebAPI({
    clientId: clientData.clientID,
    clientSecret: clientData.clientSecret,
    redirectUri: clientData.loginRedirect
})
console.log(clientData)

// Reading input from terminal start
const port = parseInt(process.argv[2])
console.log(`${port} registered as server port`)
// Reading input from terminal end

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors()) // Making sure the browser can request more data after it is loaded on the client computer.


app.use("/static", express.static("static"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/html/index.html"))
})

app.get("/admin", (req, res) => {
    res.send("Admin page")
})


app.listen(port, () => console.log(`Listening on ${port}`))