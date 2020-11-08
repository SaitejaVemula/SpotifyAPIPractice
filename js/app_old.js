// Key for the Basic Authorization in the form of btoa(clientID:clientSecret)
let clientIDAndKey =
    "OGUwMzE3YjFhZmYzNGFmYzk0NjBlMDFjN2JkOGRmODY6OTA2MmVlZGJlYjVkNDg5NmFkZDllYmY0NzM2ZTYzYTQ=";
let token = ``;

// DOM ELEMENTS
const form = document.querySelector("form");
const content = document.querySelector(".content");
const artistSearch = document.querySelector("#artistSearch");
const artistImg = document.querySelector("#artist-img img");
const artistName = document.querySelector("#artistName");
const artistID = document.querySelector("#artistID");
const artistGenres = document.querySelector("#artist-genres");
const artistFollowers = document.querySelector("#followers");
const artistTracks = document.querySelector('#artist-tracks ul');


artistSearch.focus();

// Event Listeners
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let artistName = artistSearch.value.trim().replaceAll(" ", "%20").toLowerCase();
    if (artistName) {

        // Fetch the Artist
        fetch(
            `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1&market=IN`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        "Bearer " + token,
                },
            }
        )
            .then((r) => r.json())
            .then((data) => {
                // Got the Artist's data
                console.log(data.artists);
                let d = data.artists.items[0];
                // Updating the UI
                updateInfo( d.name, 
                            d.external_urls.spotify, 
                            d.images[0].url, 
                            d.id, 
                            d.genres,
                            d.followers.total
                );


                // Fetching the artist's top tracks
                fetch(
                    `https://api.spotify.com/v1/artists/${d.id}/top-tracks?market=IN`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                "Bearer " + token,
                        },
                    }
                )
                    .then((r) => r.json())
                    .then((data) => {
                        updateTracks(data.tracks.filter((t, i) => i < 5 ))
                    }).catch(e => {
                        console.log("Cannot Find the tracks : " + e.message);
                    });
            })
            .catch((err) => {

                updateInfo( 'Cannot find an artist', 
                            '#artist-img', 
                            '../img/404.jpg', 
                            '-----',
                            [],
                            '');
                updateTracks([])
            });
    }

    form.reset();
    artistSearch.focus();
});

// fetch() Functions
async function getBearerToken() {
    let result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${clientIDAndKey}`,
        },
        body: "grant_type=client_credentials",
    });

    // console.log(result);
    if (result.status == 200) {
        result = await result.json();
        token = result.access_token;
    } else {
        console.log("Cannot Genereate the token");
    }
}


getBearerToken().then(() => {
    // console.log('Token = ' + token);
    // searchAnArtist('The+Weeknd');
});

async function searchAnArtist(name) {
    let result = await fetch(
        `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1&market=IN`,
        {
            method: "GET",
            headers: {
                Authorization:
                    "Bearer " + token,
            },
        }
    );

    result = await result.json();

    return result.artists;
}


function calcTime(ms) {
    let totalSecs = Math.round(ms / 1000);
    let mins = Math.floor(totalSecs / 60);
    let secs = totalSecs - mins*60;

    return `${mins}:${secs > 9 ? secs : '0'+secs}`;
}

function updateInfo(name, link, img, id, genres, followers) {
    artistName.innerHTML = `<a href="${link}" target="_blank">${name}</a>`;
    artistID.textContent = `ID : ${id}`;
    artistImg.src = img;
    artistGenres.innerHTML = '';
    genres.forEach( genre => {
        artistGenres.innerHTML += `<li>${genre}</li>`;
    })
    artistFollowers.innerHTML = `Followers : <strong>${followers}</strong>`
}

function updateTracks(tracks) {
    console.log();
    artistTracks.innerHTML = '';
    tracks.forEach((track, i) => {
        artistTracks.innerHTML += `<li class="fadeFromLeft">
        <span class="sNo">${i+1}</span>
        <span class="trackName">
        <a href="${track.external_urls.spotify}" target="_blank">
        ${track.name}
        </a>
        </span>
        ${track.explicit ? '<span class="exp">E</span>' : '<span class="exp hide">E</span>'}
        <span class="duration">${calcTime(track.duration_ms)}</span>
    </li>`;
    });
}