"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Handle", {
  enumerable: true,
  get: function () {
    return _Handle.default;
  }
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _events = _interopRequireDefault(require("events"));

var _utils = require("@parcel/utils");

var _diagnostic = _interopRequireWildcard(require("@parcel/diagnostic"));

var _Worker = _interopRequireDefault(require("./Worker"));

var _cpuCount = _interopRequireDefault(require("./cpuCount"));

var _Handle = _interopRequireDefault(require("./Handle"));

var _childState = require("./childState");

var _backend = require("./backend");

var _Profiler = _interopRequireDefault(require("./Profiler"));

var _Trace = _interopRequireDefault(require("./Trace"));

var _fs = _interopRequireDefault(require("fs"));

var _logger = _interopRequireDefault(require("@parcel/logger"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let profileId = 1;
let referenceId = 1;

/**
 * workerPath should always be defined inside farmOptions
 */
class WorkerFarm extends _events.default {
  constructor(farmOptions = {}) {
    super();

    _defineProperty(this, "callQueue", []);

    _defineProperty(this, "ending", false);

    _defineProperty(this, "localWorker", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "run", void 0);

    _defineProperty(this, "warmWorkers", 0);

    _defineProperty(this, "workers", new Map());

    _defineProperty(this, "handles", new Map());

    _defineProperty(this, "sharedReferences", new Map());

    _defineProperty(this, "profiler", void 0);

    _defineProperty(this, "workerApi", {
      callMaster: async (request, awaitResponse = true) => {
        // $FlowFixMe
        let result = await this.processRequest(_objectSpread({}, request, {
          awaitResponse
        }));
        return (0, _utils.deserialize)((0, _utils.serialize)(result));
      },
      createReverseHandle: fn => this.createReverseHandle(fn),
      callChild: (childId, request) => new Promise((resolve, reject) => {
        (0, _nullthrows.default)(this.workers.get(childId)).call(_objectSpread({}, request, {
          resolve,
          reject,
          retries: 0
        }));
      }),
      getSharedReference: ref => this.sharedReferences.get(ref)
    });

    this.options = _objectSpread({
      maxConcurrentWorkers: WorkerFarm.getNumWorkers(),
      maxConcurrentCallsPerWorker: WorkerFarm.getConcurrentCallsPerWorker(),
      forcedKillTime: 500,
      warmWorkers: false,
      useLocalWorker: true,
      // TODO: setting this to false makes some tests fail, figure out why
      backend: (0, _backend.detectBackend)()
    }, farmOptions);

    if (!this.options.workerPath) {
      throw new Error('Please provide a worker path!');
    } // $FlowFixMe this must be dynamic


    this.localWorker = require(this.options.workerPath);
    this.run = this.createHandle('run');
    this.startMaxWorkers();
  }

  warmupWorker(method, args) {
    // Workers are already stopping
    if (this.ending) {
      return;
    } // Workers are not warmed up yet.
    // Send the job to a remote worker in the background,
    // but use the result from the local worker - it will be faster.


    let promise = this.addCall(method, [...args, true]);

    if (promise) {
      promise.then(() => {
        this.warmWorkers++;

        if (this.warmWorkers >= this.workers.size) {
          this.emit('warmedup');
        }
      }).catch(() => {});
    }
  }

  shouldStartRemoteWorkers() {
    return this.options.maxConcurrentWorkers > 0 || !this.options.useLocalWorker;
  }

  createHandle(method) {
    return (...args) => {
      // Child process workers are slow to start (~600ms).
      // While we're waiting, just run on the main thread.
      // This significantly speeds up startup time.
      if (this.shouldUseRemoteWorkers()) {
        return this.addCall(method, [...args, false]);
      } else {
        if (this.options.warmWorkers && this.shouldStartRemoteWorkers()) {
          this.warmupWorker(method, args);
        }

        let processedArgs = (0, _utils.restoreDeserializedObject)((0, _utils.prepareForSerialization)([...args, false]));
        return this.localWorker[method](this.workerApi, ...processedArgs);
      }
    };
  }

  onError(error, worker) {
    // Handle ipc errors
    if (error.code === 'ERR_IPC_CHANNEL_CLOSED') {
      return this.stopWorker(worker);
    }
  }

  startChild() {
    let worker = new _Worker.default({
      forcedKillTime: this.options.forcedKillTime,
      backend: this.options.backend,
      patchConsole: this.options.patchConsole
    });
    worker.fork((0, _nullthrows.default)(this.options.workerPath));
    worker.on('request', data => this.processRequest(data, worker));
    worker.on('ready', () => this.processQueue());
    worker.on('response', () => this.processQueue());
    worker.on('error', err => this.onError(err, worker));
    worker.once('exit', () => this.stopWorker(worker));
    this.workers.set(worker.id, worker);
  }

  async stopWorker(worker) {
    if (!worker.stopped) {
      this.workers.delete(worker.id);
      worker.isStopping = true;

      if (worker.calls.size) {
        for (let call of worker.calls.values()) {
          call.retries++;
          this.callQueue.unshift(call);
        }
      }

      worker.calls.clear();
      await worker.stop(); // Process any requests that failed and start a new worker

      this.processQueue();
    }
  }

  processQueue() {
    if (this.ending || !this.callQueue.length) return;

    if (this.workers.size < this.options.maxConcurrentWorkers) {
      this.startChild();
    }

    for (let worker of this.workers.values()) {
      if (!this.callQueue.length) {
        break;
      }

      if (!worker.ready || worker.stopped || worker.isStopping) {
        continue;
      }

      if (worker.calls.size < this.options.maxConcurrentCallsPerWorker) {
        worker.call(this.callQueue.shift());
      }
    }
  }

  async processRequest(data, worker) {
    let {
      method,
      args,
      location,
      awaitResponse,
      idx,
      handle: handleId
    } = data;
    let mod;

    if (handleId != null) {
      mod = (0, _nullthrows.default)(this.handles.get(handleId)).fn;
    } else if (location) {
      // $FlowFixMe this must be dynamic
      mod = require(location);
    } else {
      throw new Error('Unknown request');
    }

    const responseFromContent = content => ({
      idx,
      type: 'response',
      contentType: 'data',
      content
    });

    const errorResponseFromError = e => ({
      idx,
      type: 'response',
      contentType: 'error',
      content: (0, _diagnostic.anyToDiagnostic)(e)
    });

    let result;

    if (method == null) {
      try {
        result = responseFromContent((await mod(...args)));
      } catch (e) {
        result = errorResponseFromError(e);
      }
    } else {
      // ESModule default interop
      // $FlowFixMe
      if (mod.__esModule && !mod[method] && mod.default) {
        mod = mod.default;
      }

      try {
        // $FlowFixMe
        result = responseFromContent((await mod[method](...args)));
      } catch (e) {
        result = errorResponseFromError(e);
      }
    }

    if (awaitResponse) {
      if (worker) {
        worker.send(result);
      } else {
        if (result.contentType === 'error') {
          throw new _diagnostic.default({
            diagnostic: result.content
          });
        }

        return result.content;
      }
    }
  }

  addCall(method, args) {
    if (this.ending) {
      throw new Error('Cannot add a worker call if workerfarm is ending.');
    }

    return new Promise((resolve, reject) => {
      this.callQueue.push({
        method,
        args: args,
        retries: 0,
        resolve,
        reject
      });
      this.processQueue();
    });
  }

  async end() {
    this.ending = true;

    for (let handle of this.handles.values()) {
      handle.dispose();
    }

    this.handles = new Map();
    this.sharedReferences = new Map();
    await Promise.all(Array.from(this.workers.values()).map(worker => this.stopWorker(worker)));
    this.ending = false;
  }

  startMaxWorkers() {
    // Starts workers until the maximum is reached
    if (this.workers.size < this.options.maxConcurrentWorkers) {
      let toStart = this.options.maxConcurrentWorkers - this.workers.size;

      while (toStart--) {
        this.startChild();
      }
    }
  }

  shouldUseRemoteWorkers() {
    return !this.options.useLocalWorker || (this.warmWorkers >= this.workers.size || !this.options.warmWorkers) && this.options.maxConcurrentWorkers > 0;
  }

  createReverseHandle(fn) {
    let handle = new _Handle.default({
      fn,
      workerApi: this.workerApi
    });
    this.handles.set(handle.id, handle);
    return handle;
  }

  async createSharedReference(value) {
    let ref = referenceId++;
    this.sharedReferences.set(ref, value);
    let promises = [];

    for (let worker of this.workers.values()) {
      promises.push(new Promise((resolve, reject) => {
        worker.call({
          method: 'createSharedReference',
          args: [ref, value],
          resolve,
          reject,
          retries: 0
        });
      }));
    }

    await Promise.all(promises);
    return {
      ref,
      dispose: () => {
        this.sharedReferences.delete(ref);
        let promises = [];

        for (let worker of this.workers.values()) {
          promises.push(new Promise((resolve, reject) => {
            worker.call({
              method: 'deleteSharedReference',
              args: [ref],
              resolve,
              reject,
              retries: 0
            });
          }));
        }

        return Promise.all(promises);
      }
    };
  }

  async startProfile() {
    let promises = [];

    for (let worker of this.workers.values()) {
      promises.push(new Promise((resolve, reject) => {
        worker.call({
          method: 'startProfile',
          args: [],
          resolve,
          reject,
          retries: 0
        });
      }));
    }

    this.profiler = new _Profiler.default();
    promises.push(this.profiler.startProfiling());
    await Promise.all(promises);
  }

  async endProfile() {
    if (!this.profiler) {
      return;
    }

    let promises = [this.profiler.stopProfiling()];
    let names = ['Master'];

    for (let worker of this.workers.values()) {
      names.push('Worker ' + worker.id);
      promises.push(new Promise((resolve, reject) => {
        worker.call({
          method: 'endProfile',
          args: [],
          resolve,
          reject,
          retries: 0
        });
      }));
    }

    var profiles = await Promise.all(promises);
    let trace = new _Trace.default();
    let filename = `profile-${profileId++}.trace`;
    let stream = trace.pipe(_fs.default.createWriteStream(filename));

    for (let profile of profiles) {
      trace.addCPUProfile(names.shift(), profile);
    }

    trace.flush();
    await new Promise(resolve => {
      stream.once('finish', resolve);
    });

    _logger.default.info({
      origin: '@parcel/workers',
      message: `Wrote profile to ${filename}`
    });
  }

  static getNumWorkers() {
    return process.env.PARCEL_WORKERS ? parseInt(process.env.PARCEL_WORKERS, 10) : (0, _cpuCount.default)();
  }

  static isWorker() {
    return !!_childState.child;
  }

  static getWorkerApi() {
    (0, _assert.default)(_childState.child != null, 'WorkerFarm.getWorkerApi can only be called within workers');
    return _childState.child.workerApi;
  }

  static getConcurrentCallsPerWorker() {
    return parseInt(process.env.PARCEL_MAX_CONCURRENT_CALLS, 10) || 5;
  }

}

exports.default = WorkerFarm;