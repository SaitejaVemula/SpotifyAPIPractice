const clientIDAndKey = 
    "OGUwMzE3YjFhZmYzNGFmYzk0NjBlMDFjN2JkOGRmODY6OTA2MmVlZGJlYjVkNDg5NmFkZDllYmY0NzM2ZTYzYTQ=";
let token = ``;
let isTokenGenerated = false;

// DOM ELEMENTS
const form = document.querySelector('form');
const artistImg = document.querySelector('#artist-img img');
const artistName = document.querySelector('#artistName');
const artistSearch = document.querySelector('#artistSearch');
const artistID = document.querySelector('#artistID');
const artistGenres = document.querySelector('#artist-genres');
const artistFollowers = document.querySelector('#followers');
const artistTracks = document.querySelector('#artist-tracks ul');
const artistTracksContainer = document.querySelector('#artist-tracks');
const audio = document.querySelector('audio');

const popup = document.querySelector('.popup');
const popupClose = document.querySelector('.close');

let currentSongs = [];

// FETCH CALLS
async function getToken() {
    let result = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': `Basic ${clientIDAndKey}`
        },
        body: "grant_type=client_credentials"
    });

    if(result.status === 200) {
        result = await result.json();
        token = result.access_token;

        return true;
    } else {
        console.log("Cannot generate a token. Error Code : " + result.status);
    }

    return false;
}

async function searchForArtist(name) {
    name = name.trim().replaceAll(" ", "%20").toLowerCase();
    let result = await fetch(`https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1&market=IN`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if(result.status === 200) {

        result = await result.json();
        if((result.artists.items.length)) {
            result = result.artists.items[0];
            artistTracksContainer.classList.remove('hide');
            updateInfo(
                    result.name,
                    result.external_urls.spotify,
                    result.images[0].url,
                    result.id,
                    result.genres,
                    result.followers.total
                ) ;

            getTopTracks(result.id);
        } else {
            console.log("Cannot find the artist");
            updateInfo(
                "Cannot find the aritst",
                "#",
                "../img/404.jpg",
                '123456789',
                ['NOT FOUND'],
                0
            ) ;
            artistTracksContainer.classList.add('hide');
        }

    } else {
        console.log('Cannot search for the artist. Error Code : ' + result.status);
    }
}

async function getTopTracks(id) {
    let result = await fetch(
        `https://api.spotify.com/v1/artists/${id}/top-tracks?market=IN`,
        {
            method: "GET",
            headers: {
                Authorization:
                    "Bearer " + token,
            },
        }
    );

    if(result.status === 200) {
        result = await result.json();
        result = result.tracks.filter((d,i) => i<5);
        // console.log("Before filter : \n",result);
        updateTracks(result);
    } else {
        console.log("Cannot search for top tracks. Error code : " + result.status);
    }
}

// NORMAL FUNCITONS
function calcTime(ms) {
    let totalSecs = Math.round(ms / 1000);
    let mins = Math.floor(totalSecs / 60);
    let secs = totalSecs - mins*60;

    return `${mins}:${secs > 9 ? secs : '0'+secs}`;
}

function updateInfo(name, link, img, id, genres, followers) {
    if(link === '#') {
        artistName.innerHTML = `${name}`;
    } else {
        artistName.innerHTML = `<a href="${link}" target="_blank">${name}</a>`;
    }
    artistID.textContent = `ID : ${id}`;
    artistImg.src = img;
    artistGenres.innerHTML = '';
    genres.forEach( genre => {
        artistGenres.innerHTML += `<li>${genre}</li>`;
    })
    artistFollowers.innerHTML = `Followers : <strong>${followers}</strong>`
}

function updateTracks(tracks) {
    artistTracks.innerHTML = '';
    currentSongs = [];
    tracks.forEach((track, i) => {
        currentSongs.push(track);
        artistTracks.innerHTML += `<li class="fadeFromLeft">
        <span class="sNo">${i+1}</span>
        <span class="trackName">${track.name}</span>
        ${track.explicit ? '<span class="exp">E</span>' : '<span class="exp hide">E</span>'}
        ${track.preview_url !== null ? 
            `<span class="songURL" onclick="play(this, '${track.preview_url}')"><img src="./img/play.svg"></span>` :
            '' 
        }
        <span class="duration">${calcTime(track.duration_ms)}</span>
        <span class="hide id">${track.id}</span>
    </li>`;
    });
}

function play(e, link) {
    // console.log(e, e.children[0].src, link);
    if( e.children[0].src.includes('play') ) {
        audio.pause();
        audio.src = link;
        audio.play();
        e.children[0].src = './img/pause.svg';
    } else if( e.children[0].src.includes('pause') ) {
        e.children[0].src = './img/play.svg';
        audio.pause();
    }
}

// Code starts here
getToken().then(data => {
    searchForArtist('The Weeknd');
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    searchForArtist(artistSearch.value);
    form.reset();
});

artistTracks.addEventListener('click', (e) => {
    
    if(e.target.classList[0] === 'trackName') {
        let title = popup.querySelector('h1');
        title.textContent = e.target.innerText;
        console.log(e.target.innerText);
        popup.classList.remove('hide');
    }

});

popup.addEventListener('click', e => {
    if(e.target.className === 'close' || e.target.className === 'popup') {
        popup.classList.add('hide');
    }
});