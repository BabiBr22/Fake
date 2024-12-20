// Configurações da API do Spotify
const CLIENT_ID = ''; // Substitua pelo seu Client ID
const REDIRECT_URI = 'http://localhost:3000/callback'; // Substitua pelo URL da sua página
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = '';




document.addEventListener('DOMContentLoaded', function() {
 
    const trackListContainer = document.getElementById('trackList');

    // Função para buscar playlists do usuário
    async function fetchPlaylists() {
        const token = checkAuthentication(); // Verifica a autenticação e obtém o token

        if (!token) {
            alert("Você precisa estar autenticado!");
            return;
        }

        try {
            // Requisição para buscar as playlists do usuário
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            const playlists = data.items;

            // Limpar as playlists existentes antes de adicionar novas
            const playlistsContainer = document.getElementById('playlistsContainer');
            playlistsContainer.innerHTML = '';

            // Exibe as playlists na tela
            playlists.forEach(playlist => {
                const div = document.createElement('div');
                div.classList.add('playlist-item');
                div.innerHTML = `
                <a href="#" onclick="fetchPlaylistTracks('${playlist.id}')">
                    <img src="${playlist.images[0]?.url}" alt="${playlist.name}" width="50" />
                    <span>${playlist.name}</span>
                </a>
            `;
                playlistsContainer.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao buscar playlists:', error);
        }
    }

    // Função chamada ao clicar no botão "Ir para minhas playlists"
    document.getElementById('goToPlaylistsBtn').addEventListener('click', function () {
        fetchPlaylists(); // Chama a função que busca as playlists
        document.getElementById('playlistsScreen').style.display = 'block'; // Exibe a tela de playlists
        document.querySelector('.main-content').style.display = 'none'; // Esconde a tela principal
    });


    // Função para buscar músicas de uma playlist
    async function fetchPlaylistTracks(playlistId) {
        const token = checkAuthentication(); // Verifica a autenticação e obtém o token

        if (!token) {
            alert("Você precisa estar autenticado!");
            return;
        }

        try {
            // Requisição para buscar as músicas da playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            const tracks = data.items;

            // Limpa a lista de faixas antes de exibir as novas
            trackListContainer.innerHTML = '';

            // Exibe as músicas da playlist
            tracks.forEach(item => {
                const track = item.track;
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" onclick="playTrack('${track.id}')">
                        <img src="${track.album.images[0]?.url}" alt="${track.name}" width="50" />
                        ${track.name} - ${track.artists.map(artist => artist.name).join(', ')}
                    </a>
                `;
                trackListContainer.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao buscar músicas da playlist:', error);
        }
    }

    // Chama a função para buscar as playlists
    fetchPlaylists();

    // Função para tocar uma música
    function playTrack(trackId) {
        const spotifyPlayer = document.getElementById('spotifyPlayer');
        spotifyPlayer.src = `https://open.spotify.com/embed/track/${trackId}`;
    }
});

// Função para verificar a autenticação e obter o token
function checkAuthentication() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
        localStorage.setItem('spotify_access_token', accessToken);
        window.history.replaceState({}, document.title, REDIRECT_URI);
        return accessToken;
    }

    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
        return storedToken;
    }

    redirectToSpotifyLogin();
    return null;
}

// Função para redirecionar para autenticação do Spotify
function redirectToSpotifyLogin() {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=playlist-read-private%20user-read-private%20user-library-read`;
    window.location.href = authUrl;
}


document.addEventListener('DOMContentLoaded', function () {
    const playlistsContainer = document.getElementById('playlistsContainer');

    // Função para buscar playlists do usuário
    async function fetchPlaylists() {
        const token = checkAuthentication(); // Verifica a autenticação e obtém o token

        if (!token) {
            alert("Você precisa estar autenticado!");
            return;
        }

        try {
            // Requisição para buscar as playlists do usuário
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            const playlists = data.items;

            // Exibe as playlists na tela
            playlists.forEach(playlist => {
                const div = document.createElement('div');
                div.classList.add('playlist-item');
                div.innerHTML = `
                    <a href="playlists.html?playlistId=${playlist.id}">
                        <img src="${playlist.images[0]?.url}" alt="${playlist.name}" width="50" />
                        <span>${playlist.name}</span>
                    </a>
                `;
                playlistsContainer.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao buscar playlists:', error);
        }
    }

    fetchPlaylists(); // Chama a função para buscar as playlists
});

// Função para pegar o token da URL
function getAccessTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('access_token');
}

// Função para buscar playlists do Spotify
function fetchPlaylists(accessToken) {
    const url = 'https://api.spotify.com/v1/me/playlists'; // API para pegar playlists
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const playlists = data.items;

            // Preencher as playlists nos cards
            for (let i = 0; i < playlists.length && i < 3; i++) {
                const playlist = playlists[i];
                const card = document.getElementById(`playlist${i + 1}`);
                card.innerHTML = `<a href="${playlist.external_urls.spotify}" target="_blank">${playlist.name}</a>`;
            }
        })
        .catch(error => console.error('Erro ao carregar playlists:', error));
}

// Inicialização
(function init() {
    const accessToken = getAccessTokenFromURL();
    if (accessToken) {
        // Agora você pode usar o token para fazer requisições ao Spotify
        console.log('Token de acesso:', accessToken);
        fetchPlaylists(accessToken); // Carrega as playlists ao iniciar
    }
})();


// Função para verificar a autenticação e obter o token
function checkAuthentication() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
        // Salva o token no localStorage e limpa a URL
        localStorage.setItem('spotify_access_token', accessToken);
        window.history.replaceState({}, document.title, REDIRECT_URI); // Limpa o token da URL
        return accessToken;
    }

    // Verifica se o token já está salvo no localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
        return storedToken;
    }

    // Se não houver token, redireciona para o login
    redirectToSpotifyLogin();
    return null;
}

// Função para redirecionar para autenticação do Spotify
function redirectToSpotifyLogin() {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=playlist-read-private%20user-read-private%20user-library-read`;
    window.location.href = authUrl;
}


document.addEventListener('DOMContentLoaded', function () {
    const trackListContainer = document.getElementById('trackList');
    const playlistId = new URLSearchParams(window.location.search).get('playlistId');

    // if (!playlistId) {
    //     alert('Playlist não encontrada.');
    //     return;
    // }

    async function fetchPlaylistTracks() {
        const token = checkAuthentication(); // Verifica a autenticação e obtém o token

        if (!token) {
            alert("Você precisa estar autenticado!");
            return;
        }

        try {
            // Requisição para buscar as músicas da playlist
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            const tracks = data.items;

            // Exibe as músicas na tela
            tracks.forEach(item => {
                const track = item.track;
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="reproduzir.html?track_url=${track.id}">
                        <img src="${track.album.images[0]?.url}" alt="${track.name}" width="50" />
                        ${track.name} - ${track.artists.map(artist => artist.name).join(', ')}
                    </a>
                `;
                trackListContainer.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao buscar músicas da playlist:', error);
        }
    }

    fetchPlaylistTracks(); // Chama a função para buscar as músicas da playlist
});

document.addEventListener('DOMContentLoaded', function () {
    const trackId = new URLSearchParams(window.location.search).get('track_url');

    if (trackId) {
        // Inicializa o player com o ID da música
        const token = checkAuthentication(); // Verifica a autenticação e obtém o token

        if (token) {
            const player = new Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            player.connect().then(success => {
                if (success) {
                    console.log('Player conectado com sucesso!');
                } else {
                    console.error('Falha ao conectar o player.');
                }
            });

            // Tocar a música
            player.play({
                uris: [`spotify:track:${trackId}`]
            });

            // Outros controles como volume, etc.
        } else {
            alert('Você precisa estar autenticado!');
        }
    }
});


// Função para redirecionar para autenticação do Spotify
function redirectToSpotifyLogin() {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=playlist-read-private%20user-read-private%20user-library-read`;
    window.location.href = authUrl;
}

// Verifica se já temos um token armazenado ou na URL
function checkAuthentication() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
        // Salva o token no localStorage e limpa a URL
        localStorage.setItem('spotify_access_token', accessToken);
        window.history.replaceState({}, document.title, REDIRECT_URI); // Limpa o token da URL
        return accessToken;
    }

    // Verifica se o token já está salvo no localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
        return storedToken;
    }

    // Se não houver token, redireciona para o login
    redirectToSpotifyLogin();
    return null;
}



// Função para exibir a música na home
function displayTrackPlayer(trackId) {
    const playerContainer = document.getElementById('player-container');

    if (!playerContainer) {
        console.error('Elemento com ID "player-container" não encontrado.');
        return;
    }

    // Cria o iframe do player do Spotify
    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/track/${trackId}`;
    iframe.width = "300";
    iframe.height = "380";
    iframe.frameborder = "0";
    iframe.allow = "encrypted-media"; // Necessário para reprodução do Spotify
    playerContainer.appendChild(iframe);
}

// Função para pegar o ID da música da URL
function getTrackIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('track_url');
}

// Tente pegar o ID da música da URL
const trackId = getTrackIdFromURL();

// Se o trackId existir, exibe o player
if (trackId) {
    displayTrackPlayer(trackId);
} 
// else {
//     alert("Música não encontrada.");
// }

// Função para buscar o artista e suas músicas
document.getElementById('searchButton').addEventListener('click', function () {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        searchArtist(searchQuery);
    }
});




async function searchArtist(artistName) {
    // Pega o token de acesso
    const accessToken = checkAuthentication();

    // if (!accessToken) {
    //     alert("Erro: Token de acesso não encontrado.");
    //     return;
    // }

    try {
        // Requisição para buscar o artista
        const artistResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const artistData = await artistResponse.json();
        const artist = artistData.artists.items[0];

        if (artist) {
            displayArtistInfo(artist);

            // Requisição para buscar as músicas do artista
            const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const tracksData = await tracksResponse.json();
            displayTracks(tracksData.tracks);
        } else {
            alert('Artista não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao buscar o artista:', error);
        alert('Erro ao buscar o artista.');
    }
}

// Exibe as informações do artista (foto, nome)
function displayArtistInfo(artist) {
    document.getElementById('artistName').textContent = artist.name;
    const artistImage = document.getElementById('artistImage');
    artistImage.src = artist.images[0]?.url || '';
    artistImage.style.display = 'block';
}

// Função para exibir as músicas do artista
function displayTracks(tracks) {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = ''; // Limpa a lista antes de adicionar as novas músicas

    tracks.forEach(track => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="reproduzir.html?track_url=${track.id}" target="_self">
                <img src="${track.album.images[0]?.url || ''}" alt="${track.name}" width="50" />
                ${track.name}
            </a>
        `;
        trackList.appendChild(li);
    });
}

// Inicialização
(function init() {
    const accessToken = checkAuthentication();
    if (accessToken) {
        // Aqui pode ser feito qualquer processamento inicial se necessário
    }
})();


// Elementos principais
const homeScreen = document.querySelector(".main-content"); // Tela inicial
const playlistsScreen = document.getElementById("playlistsScreen"); // Tela de playlists
const songsScreen = document.getElementById("songsScreen"); // Tela de músicas
const playlistsList = document.getElementById("playlistsList"); // Lista de playlists
const songsList = document.getElementById("songsList"); // Lista de músicas
const playlistName = document.getElementById("playlistName"); // Nome da playlist na tela de músicas
const goToPlaylistsBtn = document.getElementById("goToPlaylistsBtn"); // Botão na sidebar

// Playlists simuladas (você pode substituir por dados reais da API do Spotify)
const playlists = [
    { id: "1", name: "Liked Songs", songs: ["Song A", "Song B", "Song C"] },
    { id: "2", name: "Daily Mix", songs: ["Song D", "Song E"] },
    { id: "3", name: "Discover Weekly", songs: ["Song F", "Song G", "Song H"] },
];

// Função para exibir a tela de playlists
function showPlaylists() {
    // Esconder a tela inicial (home) e outras telas
    homeScreen.style.display = "none";
    songsScreen.style.display = "none";

    // Mostrar a tela de playlists
    playlistsScreen.style.display = "block";

    // Renderizar a lista de playlists

    // playlistsList.innerHTML = ""; // Limpar conteúdo anterior
    // playlists.forEach((playlist) => {
    //     const li = document.createElement("li");
    //     li.textContent = playlist.name; // Nome da playlist
    //     li.dataset.id = playlist.id; // Atribuir ID como referência
    //     li.addEventListener("click", () => showSongs(playlist)); // Evento ao clicar na playlist
    //     playlistsList.appendChild(li); // Adicionar na lista
    // });
}

// Função para exibir a tela de músicas
function showSongs(playlist) {
    // Esconder a tela de playlists
    playlistsScreen.style.display = "none";

    // Mostrar a tela de músicas
    songsScreen.style.display = "block";

    // Atualizar título e listar músicas
    playlistName.textContent = playlist.name;
    songsList.innerHTML = ""; // Limpar músicas anteriores
    playlist.songs.forEach((song) => {
        const li = document.createElement("li");
        li.textContent = song; // Nome da música
        li.addEventListener("click", () => playSong(song)); // Reproduzir música ao clicar
        songsList.appendChild(li);
    });
}

// Função para simular a reprodução de uma música
function playSong(song) {
    alert(`Reproduzindo: ${song}`);
}

// Adicionar evento ao botão de playlists
goToPlaylistsBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Evitar comportamento padrão
    showPlaylists(); // Chamar função de exibir playlists
});


// Função para exibir músicas de uma playlist
function showSongs(playlist) {
    // Esconder a tela de playlists
    playlistsScreen.style.display = "none";

    // Atualizar o título e listar músicas
    playlistName.textContent = playlist.name;
    songsList.innerHTML = ""; // Limpar músicas anteriores
    playlist.songs.forEach((song) => {
        const li = document.createElement("li");
        li.textContent = song;
        li.addEventListener("click", () => playSong(song)); // Função de reprodução
        songsList.appendChild(li);
    });

    // Mostrar a tela de músicas
    songsScreen.style.display = "block";
}

// Função para carregar as playlists
async function fetchPlaylists() {
    const token = 'seu_token_aqui';  // Substitua com o token do Spotify
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    const playlists = data.items;

    const playlistsList = document.getElementById('playlistsList');
    playlistsList.innerHTML = ''; // Limpa a lista de playlists

    playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.textContent = playlist.name;
        li.addEventListener('click', function () {
            loadPlaylistTracks(playlist.id, playlist.name);  // Carrega as faixas da playlist ao clicar
        });
        playlistsList.appendChild(li);
    });
}

// Função para carregar as músicas de uma playlist
async function loadPlaylistTracks(playlistId, playlistName) {
    // Exibe a tela de músicas
    document.getElementById('songsScreen').style.display = 'block';
    document.getElementById('playlistsScreen').style.display = 'none';

    // Exibe o nome da playlist
    document.getElementById('playlistName').textContent = playlistName;

    const token = 'seu_token_aqui';  // Substitua com o token do Spotify
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    const tracks = data.items;

    const songsList = document.getElementById('songsList');
    songsList.innerHTML = ''; // Limpa a lista de músicas

    tracks.forEach(item => {
        const track = item.track;
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="reproduzir.html?track_url=${track.id}">
                <img src="${track.album.images[0]?.url}" alt="${track.name}" width="50" />
                ${track.name} - ${track.artists.map(artist => artist.name).join(', ')}
            </a>
        `;
        songsList.appendChild(li);
    });
}

// Função para simular a reprodução de uma música
function playSong(song) {
    alert(`Reproduzindo: ${song}`);
}

// Adiciona evento ao botão para ir às playlists
goToPlaylistsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showPlaylists();
});
