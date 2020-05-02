const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const log4js = require('log4js');


const logger = log4js.getLogger();
logger.level = process.env.loglevel || 'debug';

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

const app = express();
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.get('/', (_req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (socket) => {
  logger.debug(`${socket.id} connected`);
  socket.on('disconnect', () => {
    logger.debug(`${socket.id} disconnected`);
  });
});


server.listen(port);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  logger.debug(`Listening on ${bind}`);
}

server.on('error', onError);
server.on('listening', onListening);
