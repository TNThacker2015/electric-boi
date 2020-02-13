"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

var _diagnostic = _interopRequireDefault(require("@parcel/diagnostic"));

var _backend = require("./backend");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let WORKER_ID = 0;

class Worker extends _events.default {
  constructor(options) {
    super();

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "worker", void 0);

    _defineProperty(this, "id", WORKER_ID++);

    _defineProperty(this, "calls", new Map());

    _defineProperty(this, "exitCode", null);

    _defineProperty(this, "callId", 0);

    _defineProperty(this, "ready", false);

    _defineProperty(this, "stopped", false);

    _defineProperty(this, "isStopping", false);

    this.options = options;
  }

  async fork(forkModule) {
    let filteredArgs = process.execArgv.filter(v => !/^--(debug|inspect)/.test(v));

    for (let i = 0; i < filteredArgs.length; i++) {
      let arg = filteredArgs[i];

      if ((arg === '-r' || arg === '--require') && filteredArgs[i + 1] === '@parcel/register') {
        filteredArgs.splice(i, 2);
        i--;
      }
    }

    let WorkerBackend = (0, _backend.getWorkerBackend)(this.options.backend);
    this.worker = new WorkerBackend(filteredArgs, data => this.receive(data), err => {
      this.emit('error', err);
    }, code => {
      this.exitCode = code;
      this.emit('exit', code);
    });
    await this.worker.start();
    await new Promise((resolve, reject) => {
      this.call({
        method: 'childInit',
        args: [forkModule, {
          patchConsole: !!this.options.patchConsole
        }],
        retries: 0,
        resolve,
        reject
      });
    });
    this.ready = true;
    this.emit('ready');
  }

  send(data) {
    this.worker.send(data);
  }

  call(call) {
    if (this.stopped || this.isStopping) {
      return;
    }

    let idx = this.callId++;
    this.calls.set(idx, call);
    this.send({
      type: 'request',
      idx: idx,
      child: this.id,
      handle: call.handle,
      method: call.method,
      args: call.args
    });
  }

  receive(message) {
    if (this.stopped || this.isStopping) {
      return;
    }

    if (message.type === 'request') {
      this.emit('request', message);
    } else if (message.type === 'response') {
      let idx = message.idx;

      if (idx == null) {
        return;
      }

      let call = this.calls.get(idx);

      if (!call) {
        // Return for unknown calls, these might accur if a third party process uses workers
        return;
      }

      if (message.contentType === 'error') {
        call.reject(new _diagnostic.default({
          diagnostic: message.content
        }));
      } else {
        call.resolve(message.content);
      }

      this.calls.delete(idx);
      this.emit('response', message);
    }
  }

  async stop() {
    if (!this.stopped) {
      this.stopped = true;

      if (this.worker) {
        await this.worker.stop();
      }
    }
  }

}

exports.default = Worker;