"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isGlob = isGlob;
exports.isGlobMatch = isGlobMatch;
exports.globSync = globSync;
exports.glob = glob;

var _isGlob2 = _interopRequireDefault(require("is-glob"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _micromatch = require("micromatch");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function isGlob(p) {
  return (0, _isGlob2.default)(normalizePath(p));
}

function isGlobMatch(filePath, glob) {
  return (0, _micromatch.isMatch)(filePath, normalizePath(glob));
}

function globSync(p, options) {
  return _fastGlob.default.sync(normalizePath(p), options);
}

function glob(p, fs, options) {
  // $FlowFixMe
  options = _objectSpread({}, options, {
    fs: {
      stat: async (p, cb) => {
        try {
          cb(null, (await fs.stat(p)));
        } catch (err) {
          cb(err);
        }
      },
      lstat: async (p, cb) => {
        // Our FileSystem interface doesn't have lstat support at the moment,
        // but this is fine for our purposes since we follow symlinks by default.
        try {
          cb(null, (await fs.stat(p)));
        } catch (err) {
          cb(err);
        }
      },
      readdir: async (p, opts, cb) => {
        if (typeof opts === 'function') {
          cb = opts;
          opts = null;
        }

        try {
          cb(null, (await fs.readdir(p, opts)));
        } catch (err) {
          cb(err);
        }
      }
    }
  });
  return (0, _fastGlob.default)(normalizePath(p), options);
}