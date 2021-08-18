// All external modules are loaded in:
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const path = require("path")
const fs = require("fs")
const cors = require("cors")
const bcrypt = require("bcrypt")

const SpotifyWebAPI = require('spotify-web-api-node');
scopes = ["user-read-playback-state", "user-modify-playback-state"]

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

function refreshAccessToken() {
    spotifyAPI.refreshAccessToken().then(
        (data) => { 
            console.log("Access token refreshed")

            spotifyAPI.setAccessToken(data.body["access_token"])
        },
        (err) => {
            console.log("Could not refresh access token", err)
        }
    )
}

function randInt(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
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
app.use(cookieParser()) // Middleware for handling cookies
app.use(cors()) // Making sure the browser can request more data after it is loaded on the client computer.


app.use("/static", express.static("static"))

app.get("/", (req, res) => { // This address handles connecting clients to the server, and gives a visual interface
    const connectCode = req.cookies.connectCode
    console.log(connectCode)

    if (connectCode) {
        codeData = loadJSON("/json/connectCode.json")
        console.log(connectCode == codeData.code)
        if (connectCode == codeData.code && codeData.expires < Date.now()+ 24 * 60 * 60 * 1000) {
            res.sendFile(path.join(__dirname, "/html/index.html"))
        }
        else {
            res.sendFile(path.join(__dirname, "/html/clientConnect.html"))
        }
    }
    else {
        console.log("No code data")
        res.sendFile(path.join(__dirname, "/html/clientConnect.html"))
    }
})

app.get("/admin", (req, res) => { // Admin control panel

    const pass = req.cookies.adminPass
    let passCorrect = false
    console.log(pass)
    const hashedPass = loadJSON("/adminPass/pass.json").pass

    if (pass) {
        bcrypt.compare(pass, hashedPass, (err, result) => {
            if (err) {
                res.send("Oops! Something went wrong!<br>Please contact system administrator!")
                throw new Error(err)
            }else {
                passCorrect = result
            }
            if (passCorrect) {
                res.sendFile(path.join(__dirname, "/html/admin.html"))
                console.log("admin logged in successfully")
            } else {
                res.sendFile(path.join(__dirname, "/html/adminLogin.html"))
                console.log("Login initiated")
            }
        })
    }
    else {
        res.sendFile(path.join(__dirname, "/html/adminLogin.html"))
        console.log("Login initiated")
    }
})

app.get("/admin/generateCode", (req, res) => { // Generate new code for clients to connect with

    const pass = req.cookies.adminPass
    let passCorrect = false
    console.log(pass)
    const hashedPass = loadJSON("/adminPass/pass.json").pass

    if (pass) {
        bcrypt.compare(pass, hashedPass, (err, result) => {
            if (err) {
                res.send("Oops! Something went wrong!<br>Please contact system administrator!")
                throw new Error(err)
            }else {
                passCorrect = result
            }
            if (passCorrect) {
                const codeData = loadJSON("/json/connectCode.json")
                timeNow = Date.now()

                const newCode = randInt(1111, 9999)
                console.log(`Connect code generated: ${newCode}`)

                codeData.code = newCode
                codeData.expires = timeNow + 24 * 60 * 60 * 1000
                console.log(`Current time: ${timeNow} __ Expires: ${codeData.expires}`)

                res.send(codeData)
                saveJSON(codeData, "/json/connectCode.json")
            } else {
                console.log("Unauthorized admin activity detected! Redirecting to login")
                res.send({"unauthorized": true})
            }
        })
    }
})

app.get('/spotify/login', (req, res) => { // Communicates with spotify to log in the server
    const pass = req.cookies.adminPass
    let passCorrect = false
    console.log(pass)
    const hashedPass = loadJSON("/adminPass/pass.json").pass

    if (pass) {
        bcrypt.compare(pass, hashedPass, (err, result) => {
            if (err) {
                res.send("Oops! Something went wrong!<br>Please contact system administrator!")
                throw new Error(err)
            }else {
                passCorrect = result
            }

            if (passCorrect) {
                const loginPage = spotifyAPI.createAuthorizeURL(scopes)
                res.redirect(`${loginPage}`)
                console.log("Login initiated")
            }
            else {
                console.log("Unauthorized admin activity detected! Redirecting to login")
                res.redirect("/admin")
            }
        })
    }
})

app.get("/spotify/login/success", async (req, res) => { // Spotify redirects here after a login, and the server recieves a token
    const { code } = req.query

    try {
        const data = await spotifyAPI.authorizationCodeGrant(code)
        const { access_token, refresh_token } = data.body
        spotifyAPI.setAccessToken(access_token)
        spotifyAPI.setRefreshToken(refresh_token)

        // res.send(`Logged in! ${access_token} ${refresh_token}`)
        res.redirect("/admin?spotifyLogin=success")
        console.log(`Logged in!\n${access_token}\n${refresh_token}`)
    } catch (err) {
        res.redirect("/admin?spotifyLogin=failed")
        console.log("Login failed")
    }
})

app.get("/spotify/search", async (req, res) => { // Searches after a song on spotify based on client input
    const connectCode = req.cookies.connectCode

    if (connectCode) {
        codeData = loadJSON("/json/connectCode.json")
        if (connectCode == codeData.code && codeData.expires < Date.now()+ 24 * 60 * 60 * 1000) {
            try {
                const results = await spotifyAPI.search(`${req.query.songName} ${req.query.artist}`, ["track"], { limit:5, offset:0})
                res.send(results)
                console.log(req.query.songName, req.query.artist)
            } catch {
                refreshAccessToken()
                res.redirect(`/spotify/search?songName=${req.query.songName}&artist=${req.query.artist}`)
            }
        }
        else{
            console.log("Not logged in 1")
            res.send(false)
        }
    }
    else{
        console.log("Not logged in 2")
        res.send("Not logged in")
    }
})

app.get("/spotify/addsong", async (req, res) => { // Adds song to the end of the currently active playback based on client input
    const connectCode = req.cookies.connectCode
    console.log(connectCode)

    if (connectCode) {
        codeData = loadJSON("/json/connectCode.json")
        console.log(connectCode == codeData.code)
        if (connectCode == codeData.code && codeData.expires < Date.now()+ 24 * 60 * 60 * 1000) {
            try {
                const playbackData = await spotifyAPI.getMyCurrentPlaybackState()
                deviceID = playbackData.body.device.id
        
                const response = await spotifyAPI.addToQueue(req.query.uri)
        
                res.send("Song added successfully")
            } catch (err) {
                refreshAccessToken()
                res.redirect(`/spotify/addsong?uri=${req.query.uri}`)
            }
        }
        else{
            res.redirect("/")
        }
    }
    else{
        res.redirect("/")
    }
})


app.listen(port, () => console.log(`Listening on ${port}`))