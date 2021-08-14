function spotifyLogin() {
    window.onload = () => {
        if (queries.spotifyLogin == "success") {
            alert("Logged in")
            window.location.replace(`${url}/admin`)
        }else if (queries.spotifyLogin == "failed") {
            alert("Login failed")
            window.location.replace(`${url}/admin`)
        }
    }
}spotifyLogin()