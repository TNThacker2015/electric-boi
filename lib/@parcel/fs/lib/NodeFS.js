"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeFS = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _ncp = _interopRequireDefault(require("ncp"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _utils = require("@parcel/utils");

var _watcher = _interopRequireDefault(require("@parcel/watcher"));

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Most of this can go away once we only support Node 10+, which includes
// require('fs').promises
const realpath = (0, _utils.promisify)(_fs.default.realpath);

class NodeFS {
  constructor() {
    _defineProperty(this, "readFile", (0, _utils.promisify)(_fs.default.readFile));

    _defineProperty(this, "writeFile", (0, _utils.promisify)(_fs.default.writeFile));

    _defineProperty(this, "copyFile", (0, _utils.promisify)(_fs.default.copyFile));

    _defineProperty(this, "stat", (0, _utils.promisify)(_fs.default.stat));

    _defineProperty(this, "readdir", (0, _utils.promisify)(_fs.default.readdir));

    _defineProperty(this, "unlink", (0, _utils.promisify)(_fs.default.unlink));

    _defineProperty(this, "utimes", (0, _utils.promisify)(_fs.default.utimes));

    _defineProperty(this, "mkdirp", (0, _utils.promisify)(_mkdirp.default));

    _defineProperty(this, "rimraf", (0, _utils.promisify)(_rimraf.default));

    _defineProperty(this, "ncp", (0, _utils.promisify)(_ncp.default));

    _defineProperty(this, "createReadStream", _fs.default.createReadStream);

    _defineProperty(this, "createWriteStream", _fs.default.createWriteStream);

    _defineProperty(this, "cwd", process.cwd);

    _defineProperty(this, "chdir", process.chdir);

    _defineProperty(this, "readFileSync", _fs.default.readFileSync);

    _defineProperty(this, "statSync", _fs.default.statSync);

    _defineProperty(this, "realpathSync", _fs.default.realpathSync);

    _defineProperty(this, "existsSync", _fs.default.existsSync);

    _defineProperty(this, "readdirSync", _fs.default.readdirSync);
  }

  async realpath(originalPath) {
    try {
      return await realpath(originalPath, 'utf8');
    } catch (e) {// do nothing
    }

    return originalPath;
  }

  exists(filePath) {
    return new Promise(resolve => {
      _fs.default.exists(filePath, resolve);
    });
  }

  watch(dir, fn, opts) {
    return _watcher.default.subscribe(dir, fn, opts);
  }

  getEventsSince(dir, snapshot, opts) {
    return _watcher.default.getEventsSince(dir, snapshot, opts);
  }

  async writeSnapshot(dir, snapshot, opts) {
    await _watcher.default.writeSnapshot(dir, snapshot, opts);
  }

  static deserialize() {
    return new NodeFS();
  }

  serialize() {
    return null;
  }

}

exports.NodeFS = NodeFS;
(0, _utils.registerSerializableClass)(`${_package.default.version}:NodeFS`, NodeFS);