"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OverlayFS = void 0;

var _utils = require("@parcel/utils");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function read(method) {
  return async function (...args) {
    try {
      return await this.writable[method](...args);
    } catch (err) {
      return this.readable[method](...args);
    }
  };
}

function readSync(method) {
  return function (...args) {
    try {
      return this.writable[method](...args);
    } catch (err) {
      return this.readable[method](...args);
    }
  };
}

function write(method) {
  return function (...args) {
    return this.writable[method](...args);
  };
}

function checkExists(method) {
  return function (filePath, ...args) {
    if (this.writable.existsSync(filePath)) {
      return this.writable[method](filePath, ...args);
    }

    return this.readable[method](filePath, ...args);
  };
}

class OverlayFS {
  constructor(writable, readable) {
    _defineProperty(this, "writable", void 0);

    _defineProperty(this, "readable", void 0);

    _defineProperty(this, "readFile", read('readFile'));

    _defineProperty(this, "writeFile", write('writeFile'));

    _defineProperty(this, "stat", read('stat'));

    _defineProperty(this, "unlink", write('unlink'));

    _defineProperty(this, "mkdirp", write('mkdirp'));

    _defineProperty(this, "rimraf", write('rimraf'));

    _defineProperty(this, "ncp", write('ncp'));

    _defineProperty(this, "createReadStream", checkExists('createReadStream'));

    _defineProperty(this, "createWriteStream", write('createWriteStream'));

    _defineProperty(this, "cwd", readSync('cwd'));

    _defineProperty(this, "chdir", readSync('chdir'));

    _defineProperty(this, "realpath", checkExists('realpath'));

    _defineProperty(this, "readFileSync", readSync('readFileSync'));

    _defineProperty(this, "statSync", readSync('statSync'));

    _defineProperty(this, "existsSync", readSync('existsSync'));

    _defineProperty(this, "realpathSync", checkExists('realpathSync'));

    this.writable = writable;
    this.readable = readable;
  }

  static deserialize(opts) {
    return new OverlayFS(opts.writable, opts.readable);
  }

  serialize() {
    return {
      $$raw: false,
      writable: this.writable,
      readable: this.readable
    };
  }

  async copyFile(source, destination) {
    if (await this.writable.exists(source)) {
      await this.writable.writeFile(destination, (await this.writable.readFile(source)));
    } else {
      await this.writable.writeFile(destination, (await this.readable.readFile(source)));
    }
  }

  async exists(filePath) {
    return (await this.writable.exists(filePath)) || this.readable.exists(filePath);
  }

  async readdir(path, opts) {
    // Read from both filesystems and merge the results
    let writable = [];
    let readable = [];

    try {
      writable = await this.writable.readdir(path, opts);
    } catch (err) {// do nothing
    }

    try {
      readable = await this.readable.readdir(path, opts);
    } catch (err) {// do nothing
    }

    return Array.from(new Set([...writable, ...readable]));
  }

  readdirSync(path, opts) {
    // Read from both filesystems and merge the results
    let writable = [];
    let readable = [];

    try {
      writable = this.writable.readdirSync(path, opts);
    } catch (err) {// do nothing
    }

    try {
      readable = this.readable.readdirSync(path, opts);
    } catch (err) {// do nothing
    }

    return Array.from(new Set([...writable, ...readable]));
  }

  async watch(dir, fn, opts) {
    let writableSubscription = await this.writable.watch(dir, fn, opts);
    let readableSubscription = await this.readable.watch(dir, fn, opts);
    return {
      unsubscribe: async () => {
        await writableSubscription.unsubscribe();
        await readableSubscription.unsubscribe();
      }
    };
  }

  async getEventsSince(dir, snapshot, opts) {
    let writableEvents = await this.writable.getEventsSince(dir, snapshot, opts);
    let readableEvents = await this.readable.getEventsSince(dir, snapshot, opts);
    return [...writableEvents, ...readableEvents];
  }

  async writeSnapshot(dir, snapshot, opts) {
    await this.writable.writeSnapshot(dir, snapshot, opts);
  }

}

exports.OverlayFS = OverlayFS;
(0, _utils.registerSerializableClass)(`${_package.default.version}:OverlayFS`, OverlayFS);