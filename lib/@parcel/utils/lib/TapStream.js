"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stream = require("stream");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * "Taps" into the contents of a flowing stream, yielding chunks to the passed
 * callback. Continues to pass data chunks down the stream.
 */
class TapStream extends _stream.Transform {
  constructor(tap, options) {
    super(_objectSpread({}, options));

    _defineProperty(this, "_tap", void 0);

    this._tap = tap;
  }

  _transform(chunk, encoding, callback) {
    try {
      this._tap(Buffer.from(chunk));

      callback(null, chunk);
    } catch (err) {
      callback(err);
    }
  }

}

exports.default = TapStream;