"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _inspector = require("inspector");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Profiler {
  constructor() {
    _defineProperty(this, "session", void 0);
  }

  startProfiling() {
    this.session = new _inspector.Session();
    this.session.connect();
    return Promise.all([this.sendCommand('Profiler.setSamplingInterval', {
      interval: 100
    }), this.sendCommand('Profiler.enable'), this.sendCommand('Profiler.start')]);
  }

  sendCommand(method, params) {
    (0, _assert.default)(this.session != null);
    return new Promise((resolve, reject) => {
      this.session.post(method, params, (err, params) => {
        if (err == null) {
          resolve(params);
        } else {
          reject(err);
        }
      });
    });
  }

  destroy() {
    if (this.session != null) {
      this.session.disconnect();
    }
  }

  async stopProfiling() {
    let res = await this.sendCommand('Profiler.stop');
    this.destroy();
    return res.profile;
  }

}

exports.default = Profiler;