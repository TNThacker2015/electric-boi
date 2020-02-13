"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patchConsole = patchConsole;
exports.PluginLogger = exports.default = void 0;

var _events = require("@parcel/events");

var _util = require("util");

var _diagnostic = require("@parcel/diagnostic");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

class Logger {
  constructor() {
    _logEmitter.set(this, {
      writable: true,
      value: new _events.ValueEmitter()
    });
  }

  onLog(cb) {
    return _classPrivateFieldGet(this, _logEmitter).addListener(cb);
  }

  verbose(diagnostic) {
    _classPrivateFieldGet(this, _logEmitter).emit({
      type: 'log',
      level: 'verbose',
      diagnostics: Array.isArray(diagnostic) ? diagnostic : [diagnostic]
    });
  }

  info(diagnostic) {
    this.log(diagnostic);
  }

  log(diagnostic) {
    _classPrivateFieldGet(this, _logEmitter).emit({
      type: 'log',
      level: 'info',
      diagnostics: Array.isArray(diagnostic) ? diagnostic : [diagnostic]
    });
  }

  warn(diagnostic) {
    _classPrivateFieldGet(this, _logEmitter).emit({
      type: 'log',
      level: 'warn',
      diagnostics: Array.isArray(diagnostic) ? diagnostic : [diagnostic]
    });
  }

  error(input, realOrigin) {
    // $FlowFixMe origin is undefined on PluginInputDiagnostic
    let diagnostic = (0, _diagnostic.anyToDiagnostic)(input);

    if (typeof realOrigin === 'string') {
      diagnostic = Array.isArray(diagnostic) ? diagnostic.map(d => {
        return _objectSpread({}, d, {
          origin: realOrigin
        });
      }) : _objectSpread({}, diagnostic, {
        origin: realOrigin
      });
    }

    _classPrivateFieldGet(this, _logEmitter).emit({
      type: 'log',
      level: 'error',
      diagnostics: Array.isArray(diagnostic) ? diagnostic : [diagnostic]
    });
  }

  progress(message) {
    _classPrivateFieldGet(this, _logEmitter).emit({
      type: 'log',
      level: 'progress',
      message
    });
  }

}

var _logEmitter = new WeakMap();

const logger = new Logger();
var _default = logger;
exports.default = _default;

class PluginLogger {
  constructor(opts) {
    _defineProperty(this, "origin", void 0);

    this.origin = opts.origin;
  }

  updateOrigin(diagnostic) {
    return Array.isArray(diagnostic) ? diagnostic.map(d => {
      return _objectSpread({}, d, {
        origin: this.origin
      });
    }) : _objectSpread({}, diagnostic, {
      origin: this.origin
    });
  }

  verbose(diagnostic) {
    logger.verbose(this.updateOrigin(diagnostic));
  }

  info(diagnostic) {
    logger.info(this.updateOrigin(diagnostic));
  }

  log(diagnostic) {
    logger.log(this.updateOrigin(diagnostic));
  }

  warn(diagnostic) {
    logger.warn(this.updateOrigin(diagnostic));
  }

  error(input) {
    // $FlowFixMe it should work, don't really wanna mess with the types of logger.error though...
    logger.error(input, this.origin);
  }

  progress(message) {
    logger.progress(message);
  }

}

exports.PluginLogger = PluginLogger;
let consolePatched = false; // Patch `console` APIs within workers to forward their messages to the Logger
// at the appropriate levels.
// TODO: Implement the rest of the console api as needed.
// TODO: Does this need to be disposable/reversible?

function patchConsole() {
  if (consolePatched) {
    return;
  }
  /* eslint-disable no-console */
  // $FlowFixMe


  console.log = console.info = (...messages) => {
    logger.info(messagesToDiagnostic(messages));
  }; // $FlowFixMe


  console.debug = (...messages) => {
    // TODO: dedicated debug level?
    logger.verbose(messagesToDiagnostic(messages));
  }; // $FlowFixMe


  console.warn = (...messages) => {
    logger.warn(messagesToDiagnostic(messages));
  }; // $FlowFixMe


  console.error = (...messages) => {
    logger.error(messagesToDiagnostic(messages));
  };
  /* eslint-enable no-console */


  consolePatched = true;
}

function messagesToDiagnostic(messages) {
  if (messages.length === 1 && messages[0] instanceof Error) {
    let error = messages[0];
    return (0, _diagnostic.errorToDiagnostic)(error);
  } else {
    return {
      message: joinLogMessages(messages),
      origin: 'console'
    };
  }
}

function joinLogMessages(messages) {
  return messages.map(m => typeof m === 'string' ? m : (0, _util.inspect)(m)).join(' ');
}