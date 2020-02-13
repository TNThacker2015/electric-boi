"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _worker_threads = require("worker_threads");

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _childState = require("../childState");

var _child = require("../child");

var _utils = require("@parcel/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ThreadsChild {
  constructor(onMessage, onExit) {
    _defineProperty(this, "onMessage", void 0);

    _defineProperty(this, "onExit", void 0);

    if (_worker_threads.isMainThread || !_worker_threads.parentPort) {
      throw new Error('Only create ThreadsChild instances in a worker!');
    }

    this.onMessage = onMessage;
    this.onExit = onExit;

    _worker_threads.parentPort.on('message', data => this.handleMessage(data));

    _worker_threads.parentPort.on('close', this.onExit);
  }

  handleMessage(data) {
    this.onMessage((0, _utils.restoreDeserializedObject)(data));
  }

  send(data) {
    (0, _nullthrows.default)(_worker_threads.parentPort).postMessage((0, _utils.prepareForSerialization)(data));
  }

}

exports.default = ThreadsChild;
(0, _childState.setChild)(new _child.Child(ThreadsChild));