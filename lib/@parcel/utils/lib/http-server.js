"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHTTPServer = createHTTPServer;

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _ = require("../");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creates either an http or https server with an awaitable dispose
// that closes any connections
async function createHTTPServer(options) {
  let server;

  if (!options.https) {
    server = _http.default.createServer(options.listener);
  } else if (options.https === true) {
    server = _https.default.createServer((await (0, _.generateCertificate)(options.outputFS, options.cacheDir)), options.listener);
  } else {
    server = _https.default.createServer((await (0, _.getCertificate)(options.inputFS, options.https)), options.listener);
  } // HTTPServer#close only stops accepting new connections, and does not close existing ones.
  // Before closing, destroy any active connections through their sockets. Additionally, remove sockets when they close:
  // https://stackoverflow.com/questions/18874689/force-close-all-connections-in-a-node-js-http-server
  // https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately/14636625#14636625


  let sockets = new Set();
  server.on('connection', socket => {
    (0, _nullthrows.default)(sockets).add(socket);
    socket.on('close', () => {
      (0, _nullthrows.default)(sockets).delete(socket);
    });
  });
  return {
    server,

    stop() {
      return new Promise((resolve, reject) => {
        for (let socket of (0, _nullthrows.default)(sockets)) {
          socket.destroy();
        }

        sockets = new Set();
        server.close(err => {
          if (err != null) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    }

  };
}