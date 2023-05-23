const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Trending = require('./src/trending');
const Pc = require('./src/pcgames');
const Mobile = require('./src/mobilegames');
const Apps = require('./src/apps');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET'],
}));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Menangani pesan dari klien
    console.log(`Received message: ${message}`);
    const parsedMessage = JSON.parse(message);

    // Mengirim data yang diminta berdasarkan pesan dari klien
    if (parsedMessage.type === 'getTrending') {
      ws.send(JSON.stringify({ type: 'trending', data: Trending }));
    } else if (parsedMessage.type === 'getPcGames') {
      ws.send(JSON.stringify({ type: 'pcgames', data: Pc }));
    } else if (parsedMessage.type === 'getMobileGames') {
      ws.send(JSON.stringify({ type: 'mobilegames', data: Mobile }));
    } else if (parsedMessage.type === 'getApps') {
      ws.send(JSON.stringify({ type: 'apps', data: Apps }));
    } else if (parsedMessage.type === 'getGame') {
      const { slug, gameType } = parsedMessage;
      let data = null;
      
      if (gameType === 'trending') {
        data = Trending.find((item) => item.slug === slug);
      } else if (gameType === 'pcgames') {
        data = Pc.find((item) => item.slug === slug);
      } else if (gameType === 'mobilegames') {
        data = Mobile.find((item) => item.slug === slug);
      } else if (gameType === 'apps') {
        data = Apps.find((item) => item.slug === slug);
      }
      
      if (data) {
        ws.send(JSON.stringify({ type: 'game', slug, data }));
      } else {
        ws.send(JSON.stringify({ type: 'game', slug, data: null }));
      }
    }
  });
});




// Mengirim data trending ke semua klien yang terhubung saat terjadi perubahan data
const sendTrendingData = () => {
  const trendingData = JSON.stringify(Trending);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'trending', data: Trending }));
    }
  });
};

// Mengirim data PC games ke semua klien yang terhubung saat terjadi perubahan data
const sendPcGamesData = () => {
  const pcGamesData = JSON.stringify(Pc);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'pcgames', data: Pc }));
    }
  });
};

// Mengirim data mobile games ke semua klien yang terhubung saat terjadi perubahan data
const sendMobileGamesData = () => {
  const mobileGamesData = JSON.stringify(Mobile);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'mobilegames', data: Mobile }));
    }
  });
};

// Mengirim data apps ke semua klien yang terhubung saat terjadi perubahan data
const sendAppsData = () => {
  const appsData = JSON.stringify(Apps);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'apps', data: Apps }));
    }
  });
};

app.use(express.static('public'));

app.get('/api/trending', (req, res) => {
  res.json(Trending);
});
app.get('/api/trending/:slug', (req, res) => {
  const slug = req.params.slug;
  const game = Trending.find((item) => item.slug === slug);
  if (game) {
    res.json(game);
  } else {
    res.status(404).json({ error: 'Data tidak ditemukan' });
  }
});

app.get('/api/pcgames', (req, res) => {
  res.json(Pc);
});

app.get('/api/pcgames/:slug', (req, res) => {
  const slug = req.params.slug;
  const item = Pc.find((item) => item.slug === slug);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Data tidak ditemukan' });
  }
});

app.get('/api/mobilegames', (req, res) => {
  res.json(Mobile);
});

app.get('/api/mobilegames/:slug', (req, res) => {
  const slug = req.params.slug;
  const item = Mobile.find((item) => item.slug === slug);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Data tidak ditemukan' });
  }
});

app.get('/api/apps', (req, res) => {
  res.json(Apps);
});

app.get('/api/apps/:slug', (req, res) => {
  const slug = req.params.slug;
  const item = Apps.find((item) => item.slug === slug);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Data tidak ditemukan' });
  }
});

setInterval(() => {
  sendTrendingData();
}, 5000);

setInterval(() => {
  sendPcGamesData();
}, 5000);

setInterval(() => {
  sendMobileGamesData();
}, 5000);

setInterval(() => {
  sendAppsData();
}, 5000);

server.listen(5000, () => {
  console.log('Server berjalan pada port 5000');
});

module.exports = app;
