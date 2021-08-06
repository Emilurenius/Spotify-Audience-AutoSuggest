function adminLogin() {
    window.onload = () => {
        if (queries.spotifyLogin == "success") {
            alert("Logged in")
        }else if (queries.spotifyLogin == "failed") {
            alert("Login failed")
        }
    }
}adminLogin()