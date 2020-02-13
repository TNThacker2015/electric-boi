"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _child_process = _interopRequireDefault(require("child_process"));

var _path = _interopRequireDefault(require("path"));

var _utils = require("@parcel/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const WORKER_PATH = _path.default.join(__dirname, 'ProcessChild.js');

class ProcessWorker {
  constructor(execArgv, onMessage, onError, onExit) {
    _defineProperty(this, "execArgv", void 0);

    _defineProperty(this, "onMessage", void 0);

    _defineProperty(this, "onError", void 0);

    _defineProperty(this, "onExit", void 0);

    _defineProperty(this, "child", void 0);

    _defineProperty(this, "processQueue", true);

    _defineProperty(this, "sendQueue", []);

    this.execArgv = execArgv;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onExit = onExit;
  }

  start() {
    this.child = _child_process.default.fork(WORKER_PATH, process.argv, {
      execArgv: this.execArgv,
      env: process.env,
      cwd: process.cwd()
    });
    this.child.on('message', data => {
      this.onMessage((0, _utils.deserialize)(Buffer.from(data, 'base64')));
    });
    this.child.once('exit', this.onExit);
    this.child.on('error', this.onError);
    return Promise.resolve();
  }

  async stop() {
    this.child.send('die');
    let forceKill = setTimeout(() => this.child.kill('SIGINT'), 500);
    await new Promise(resolve => {
      this.child.once('exit', resolve);
    });
    clearTimeout(forceKill);
  }

  send(data) {
    if (!this.processQueue) {
      this.sendQueue.push(data);
      return;
    }

    let result = this.child.send((0, _utils.serialize)(data).toString('base64'), error => {
      if (error && error instanceof Error) {
        // Ignore this, the workerfarm handles child errors
        return;
      }

      this.processQueue = true;

      if (this.sendQueue.length > 0) {
        let queueCopy = this.sendQueue.slice(0);
        this.sendQueue = [];
        queueCopy.forEach(entry => this.send(entry));
      }
    });

    if (!result || /^win/.test(process.platform)) {
      // Queue is handling too much messages throttle it
      this.processQueue = false;
    }
  }

}

exports.default = ProcessWorker;