require("v8-compile-cache");
const path = require('node:path');
const fs = require('node:fs');
const Fastify = require('fastify');
const redis = require('redis');
const { WebSocketServer } = require('ws');
const compress = require('@fastify/compress');
const logger = require('./logger');

const app = Fastify({ logger: logger.level === 'silent' ? false : { level: logger.level } });
const root = __dirname;

// try to connect to redis for caching
let cache;
let totalPoints = 0;
// store per-client minigame progress when redis is available
(async () => {
  try {
    cache = redis.createClient();
    await cache.connect();
    app.log.info('Connected to Redis');
  } catch (err) {
    cache = null;
    app.log.warn('Redis disabled: ' + err.message);
  }
})();

// for realtime game updates
let wss;

function getType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
  }[ext] || 'application/octet-stream';
}

app.addHook('onRequest', (req, reply, done) => {
  req.start = process.hrtime.bigint();
  done();
});

app.addHook('onResponse', (req, reply, done) => {
  const diff = Number(process.hrtime.bigint() - req.start) / 1e6;
  app.log.info({ url: req.url, ms: diff.toFixed(2) }, 'latency');
  done();
});


const port = process.env.PORT || 8080;
async function start() {
  try {
    await app.register(compress);
    app.get('/*', async (req, reply) => {
      const urlPath = req.params['*'] || 'index.html';
      const file = path.join(root, urlPath);
      try {
        let data;
        if (cache) {
          const cached = await cache.get(file);
          if (cached) {
            reply.type(getType(file));
            return reply.send(Buffer.from(cached, 'base64'));
          }
        }
        data = await fs.promises.readFile(file);
        reply.type(getType(file));
        reply.send(data);
        cache && cache
          .set(file, data.toString('base64'), { EX: 60 })
          .catch(err => app.log.warn('Redis set failed: ' + err.message));
      } catch {
        reply.code(404).send('Not found');
      }
    });
    await app.listen({ port, host: '0.0.0.0' });
    wss = new WebSocketServer({ server: app.server });

    wss.on('connection', ws => {
      ws.on('message', async data => {
        try {
          const msg = JSON.parse(data);
          if (msg.type === 'hello') {
            let total = totalPoints;
            if (cache) total = parseInt(await cache.get('globalPoints') || '0', 10);
            ws.send(JSON.stringify({ type: 'total', total }));
            if (msg.id && cache) {
              const saved = await cache.get(`progress:${msg.id}`);
              if (saved) ws.send(JSON.stringify({ type: 'progress', progress: JSON.parse(saved) }));
            }
          }
          if (msg.type === 'points' && typeof msg.points === 'number') {
            if (cache) {
              totalPoints = await cache.incrBy('globalPoints', msg.points);
            } else {
              totalPoints += msg.points;
            }
            ws.send(JSON.stringify({ type: 'total', total: totalPoints }));
          }
          if (msg.type === 'progress' && msg.id && msg.progress) {
            if (cache) {
              await cache.set(`progress:${msg.id}`, JSON.stringify(msg.progress));
            }
          }
        } catch (err) {
          app.log.warn('bad ws msg: ' + err.message);
        }
      });
    });

    app.log.info(`Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
