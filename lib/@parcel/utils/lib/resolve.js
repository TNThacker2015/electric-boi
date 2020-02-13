"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolve = resolve;
exports.resolveSync = resolveSync;

var _promisify = _interopRequireDefault(require("./promisify"));

var _resolve2 = _interopRequireDefault(require("resolve"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const resolveAsync = (0, _promisify.default)(_resolve2.default);

async function resolve(fs, id, opts) {
  let res = await resolveAsync(id, _objectSpread({}, opts, {
    async readFile(filename, callback) {
      try {
        let res = await fs.readFile(filename);
        callback(null, res);
      } catch (err) {
        callback(err);
      }
    },

    async isFile(file, callback) {
      try {
        let stat = await fs.stat(file);
        callback(null, stat.isFile());
      } catch (err) {
        callback(null, false);
      }
    },

    async isDirectory(file, callback) {
      try {
        let stat = await fs.stat(file);
        callback(null, stat.isDirectory());
      } catch (err) {
        callback(null, false);
      }
    }

  }));

  if (typeof res === 'string') {
    return {
      resolved: res
    };
  }

  return {
    resolved: res[0],
    pkg: res[1]
  };
}

function resolveSync(fs, id, opts) {
  // $FlowFixMe
  let res = _resolve2.default.sync(id, _objectSpread({}, opts, {
    readFileSync: (...args) => {
      return fs.readFileSync(...args);
    },
    isFile: file => {
      try {
        let stat = fs.statSync(file);
        return stat.isFile();
      } catch (err) {
        return false;
      }
    },
    isDirectory: file => {
      try {
        let stat = fs.statSync(file);
        return stat.isDirectory();
      } catch (err) {
        return false;
      }
    }
  }));

  return {
    resolved: res
  };
}