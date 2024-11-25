const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const fetch = require('node-fetch');
require('dotenv').config();
const path = require('path');


const app = express();

// Função para renovar o token de acesso
async function refreshAccessToken(refreshToken) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`
            ).toString('base64')}`,
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('Erro ao renovar token de acesso');
    }

    return await response.json();
}

// Configuração do Passport para autenticação com Spotify
passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.SPOTIFY_ID,
            clientSecret: process.env.SPOTIFY_SECRET,
            callbackURL: process.env.REDIRECT_URL || 'http://localhost:3000/callback',
            scope: [
                'user-read-private',
                'user-read-email',
                'playlist-modify-private',
                'playlist-modify-public',
                'user-library-read',
                'user-library-modify',
                'user-read-playback-state',
                'user-modify-playback-state',
                'user-read-currently-playing',
                'streaming',
            ],
            showDialog: true,
        },
        (accessToken, refreshToken, expires_in, profile, done) => {
            const user = {
                profile,
                accessToken,
                refreshToken,
                expires_in: Date.now() + expires_in * 1000, // Expiração em milissegundos
            };
            return done(null, user);
        }
    )
);

// Serializar/deserializar usuário no Passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Configuração da sessão
app.use(
    session({
        secret: 'spotify-auth-example',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Middleware para verificar autenticação e renovar token, se necessário
app.use(async (req, res, next) => {
    if (req.isAuthenticated() && Date.now() > req.user.expires_in) {
        try {
            const refreshed = await refreshAccessToken(req.user.refreshToken);
            req.user.accessToken = refreshed.access_token;
            req.user.expires_in = Date.now() + refreshed.expires_in * 1000;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            return res.redirect('/login');
        }
    }
    next();
});

// Middleware de proteção de rotas
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Rotas
app.get('/login', passport.authenticate('spotify'));

// Após autenticação bem-sucedida, redirecionar para o front-end (home)
app.get(
    '/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    (req, res) => {
        if (req.isAuthenticated()) {
            // Redireciona para a página front-end, passando o access_token na query string
            res.redirect(`/home?access_token=${req.user.accessToken}`);
        } else {
            res.redirect('/login');
        }
    }
);

app.use(express.static(path.join(__dirname, 'front', 'public')));

// Rota para o front-end (home), já com o token de acesso
app.get('/home', ensureAuthenticated, (req, res) => {
    // Aqui, ao invés de retornar HTML com o perfil, você pode servir a sua página home do front-end.
    res.sendFile(path.join(__dirname, 'front', 'public', 'home.html'));  // Ou o caminho para o seu front-end
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Erro ao deslogar:', err);
            return res.status(500).send('Erro ao deslogar.');
        }
        res.redirect('/login');
    });
});

app.get('/profile', ensureAuthenticated, (req, res) => {
    const user = req.user;
    res.send(`
        <h1>Bem-vindo, ${user.profile.displayName}</h1>
        <p>ID do Spotify: ${user.profile.id}</p>
        <p>Email: ${user.profile.emails[0]?.value || 'Não disponível'}</p>
        <p>País: ${user.profile.country}</p>
        <p>Plano: ${user.profile.product}</p>
        <img src="${user.profile.photos[0]?.value || ''}" alt="Foto do perfil" width="150">
        <a href="${user.profile.profileUrl}" target="_blank">Perfil no Spotify</a>
        <br>
        <a href="/playlists">Ver Minhas Playlists</a>
    `);
});

app.get('/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), (req, res) => {
    // Aqui, você passa o token de acesso e outras informações para o front-end
    res.redirect(`/dashboard?access_token=${req.user.accessToken}`);
});


// Exibição detalhada das playlists
app.get('/playlists', ensureAuthenticated, async (req, res) => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${req.user.accessToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Erro ao buscar playlists: ${response.statusText}`);
            return res.status(response.status).send('Erro ao buscar playlists.');
        }

        const playlists = await response.json();

        const html = playlists.items
            .map(
                (playlist) => `
                <div>
                    <h2>${playlist.name}</h2>
                    <img src="${playlist.images[0]?.url || ''}" alt="Capa da Playlist" width="150">
                    <p><a href="${playlist.external_urls.spotify}" target="_blank">Abrir no Spotify</a></p>
                </div>
            `
            )
            .join('');

        res.send(`<h1>Suas Playlists</h1>${html}`);
    } catch (error) {
        console.error('Erro ao buscar playlists:', error.message);
        res.status(500).send('Erro ao buscar playlists.');
    }
});

// Rota para criar playlist
app.post('/create-playlist', ensureAuthenticated, express.json(), async (req, res) => {
    const { name, description } = req.body;

    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.user.accessToken}`,
            },
            body: JSON.stringify({
                name,
                description,
                public: false,
            }),
        });

        if (!response.ok) {
            console.error(`Erro ao criar playlist: ${response.statusText}`);
            return res.status(response.status).send('Erro ao criar playlist.');
        }

        const playlist = await response.json();
        res.json(playlist);
    } catch (error) {
        console.error('Erro ao criar playlist:', error.message);
        res.status(500).send('Erro ao criar playlist.');
    }
});



// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
