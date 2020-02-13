"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Handle", {
  enumerable: true,
  get: function () {
    return _WorkerFarm.Handle;
  }
});
Object.defineProperty(exports, "bus", {
  enumerable: true,
  get: function () {
    return _bus.default;
  }
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _WorkerFarm = _interopRequireWildcard(require("./WorkerFarm"));

var _logger = _interopRequireDefault(require("@parcel/logger"));

var _bus = _interopRequireDefault(require("./bus"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!_WorkerFarm.default.isWorker()) {
  // Forward all logger events originating from workers into the main process
  _bus.default.on('logEvent', e => {
    switch (e.level) {
      case 'info':
        _logger.default.info(e.diagnostics);

        break;

      case 'progress':
        (0, _assert.default)(typeof e.message === 'string');

        _logger.default.progress(e.message);

        break;

      case 'verbose':
        _logger.default.verbose(e.diagnostics);

        break;

      case 'warn':
        _logger.default.warn(e.diagnostics);

        break;

      case 'error':
        _logger.default.error(e.diagnostics);

        break;

      default:
        throw new Error('Unknown log level');
    }
  });
}

var _default = _WorkerFarm.default;
exports.default = _default;