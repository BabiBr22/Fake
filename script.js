// Simula o retorno da API do Spotify
const playlistsResponse = {
  items: [
      {
          name: "Rock",
          external_urls: { spotify: "https://open.spotify.com/playlist/07cif0YRP9EDU1JpsaMAME" },
          images: [{ url: "https://mosaic.scdn.co/640/ab67616d00001e023783782de74f61e36795bf9c" }],
          owner: { display_name: "Babi" },
          tracks: { total: 95 }
      },
      {
          name: "Artemas",
          external_urls: { spotify: "https://open.spotify.com/playlist/2EDuqKi7BWMyVBEZqSaq6Q" },
          images: [{ url: "https://i.scdn.co/image/ab67616d00001e02e087ae290e42880e5b044dd3" }],
          owner: { display_name: "Babi" },
          tracks: { total: 7 }
      }
      // Adicione mais itens conforme necessário
  ]
};

// Seleciona o contêiner onde as playlists serão exibidas
const container = document.getElementById('playlists-container');

// Função para renderizar playlists
function renderPlaylists(playlists) {
  playlists.forEach(playlist => {
      // Cria elementos HTML para cada playlist
      const playlistDiv = document.createElement('div');
      playlistDiv.style.border = "1px solid #ccc";
      playlistDiv.style.margin = "10px";
      playlistDiv.style.padding = "10px";

      const title = document.createElement('h2');
      title.textContent = playlist.name;

      const image = document.createElement('img');
      image.src = playlist.images[0].url;
      image.alt = playlist.name;
      image.style.width = "200px";

      const link = document.createElement('a');
      link.href = playlist.external_urls.spotify;
      link.textContent = "Abrir no Spotify";
      link.target = "_blank";

      const owner = document.createElement('p');
      owner.textContent = `Criado por: ${playlist.owner.display_name}`;

      const tracks = document.createElement('p');
      tracks.textContent = `Total de músicas: ${playlist.tracks.total}`;

      // Adiciona os elementos ao div
      playlistDiv.appendChild(image);
      playlistDiv.appendChild(title);
      playlistDiv.appendChild(owner);
      playlistDiv.appendChild(tracks);
      playlistDiv.appendChild(link);

      // Adiciona o div ao contêiner
      container.appendChild(playlistDiv);
  });
}

// Renderiza as playlists
renderPlaylists(playlistsResponse.items);
