"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _childState = require("../childState");

var _child = require("../child");

var _utils = require("@parcel/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ProcessChild {
  constructor(onMessage, onExit) {
    _defineProperty(this, "onMessage", void 0);

    _defineProperty(this, "onExit", void 0);

    if (!process.send) {
      throw new Error('Only create ProcessChild instances in a worker!');
    }

    this.onMessage = onMessage;
    this.onExit = onExit;
    process.on('message', data => this.handleMessage(data));
  }

  handleMessage(data) {
    if (data === 'die') {
      return this.stop();
    }

    this.onMessage((0, _utils.deserialize)(Buffer.from(data, 'base64')));
  }

  send(data) {
    let processSend = (0, _nullthrows.default)(process.send).bind(process);
    processSend((0, _utils.serialize)(data).toString('base64'), err => {
      if (err && err instanceof Error) {
        if (err.code === 'ERR_IPC_CHANNEL_CLOSED') {
          // IPC connection closed
          // no need to keep the worker running if it can't send or receive data
          return this.stop();
        }
      }
    });
  }

  stop() {
    this.onExit(0);
    process.exit();
  }

}

exports.default = ProcessChild;
(0, _childState.setChild)(new _child.Child(ProcessChild));