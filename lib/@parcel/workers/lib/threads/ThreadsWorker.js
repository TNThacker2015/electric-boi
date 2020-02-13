"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _worker_threads = require("worker_threads");

var _path = _interopRequireDefault(require("path"));

var _utils = require("@parcel/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const WORKER_PATH = _path.default.join(__dirname, 'ThreadsChild.js');

class ThreadsWorker {
  constructor(execArgv, onMessage, onError, onExit) {
    _defineProperty(this, "execArgv", void 0);

    _defineProperty(this, "onMessage", void 0);

    _defineProperty(this, "onError", void 0);

    _defineProperty(this, "onExit", void 0);

    _defineProperty(this, "worker", void 0);

    this.execArgv = execArgv;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onExit = onExit;
  }

  start() {
    this.worker = new _worker_threads.Worker(WORKER_PATH, {
      execArgv: this.execArgv,
      env: process.env
    });
    this.worker.on('message', data => this.handleMessage(data));
    this.worker.on('error', this.onError);
    this.worker.on('exit', this.onExit);
    return new Promise(resolve => {
      this.worker.on('online', resolve);
    });
  }

  stop() {
    // In node 12, this returns a promise, but previously it accepted a callback
    // TODO: Pass a callback in earlier versions of Node
    return Promise.resolve(this.worker.terminate());
  }

  handleMessage(data) {
    this.onMessage((0, _utils.restoreDeserializedObject)(data));
  }

  send(data) {
    this.worker.postMessage((0, _utils.prepareForSerialization)(data));
  }

}

exports.default = ThreadsWorker;