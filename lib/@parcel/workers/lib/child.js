"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Child = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

var _logger = _interopRequireWildcard(require("@parcel/logger"));

var _diagnostic = _interopRequireWildcard(require("@parcel/diagnostic"));

var _bus = _interopRequireDefault(require("./bus"));

var _Profiler = _interopRequireDefault(require("./Profiler"));

var _Handle = _interopRequireDefault(require("./Handle"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Child {
  constructor(ChildBackend) {
    _defineProperty(this, "callQueue", []);

    _defineProperty(this, "childId", void 0);

    _defineProperty(this, "maxConcurrentCalls", 10);

    _defineProperty(this, "module", void 0);

    _defineProperty(this, "responseId", 0);

    _defineProperty(this, "responseQueue", new Map());

    _defineProperty(this, "loggerDisposable", void 0);

    _defineProperty(this, "child", void 0);

    _defineProperty(this, "profiler", void 0);

    _defineProperty(this, "workerApi", void 0);

    _defineProperty(this, "handles", new Map());

    _defineProperty(this, "sharedReferences", new Map());

    _defineProperty(this, "workerApi", {
      callMaster: (request, awaitResponse = true) => this.addCall(request, awaitResponse),
      createReverseHandle: fn => this.createReverseHandle(fn),
      getSharedReference: ref => this.sharedReferences.get(ref)
    });

    this.child = new ChildBackend(this.messageListener.bind(this), this.handleEnd.bind(this)); // Monitior all logging events inside this child process and forward to
    // the main process via the bus.

    this.loggerDisposable = _logger.default.onLog(event => {
      _bus.default.emit('logEvent', event);
    });
  }

  messageListener(message) {
    if (message.type === 'response') {
      return this.handleResponse(message);
    } else if (message.type === 'request') {
      return this.handleRequest(message);
    }
  }

  send(data) {
    this.child.send(data);
  }

  childInit(module, childId) {
    // $FlowFixMe this must be dynamic
    this.module = require(module);
    this.childId = childId;
  }

  async handleRequest(data) {
    let {
      idx,
      method,
      args,
      handle: handleId
    } = data;
    let child = (0, _nullthrows.default)(data.child);

    const responseFromContent = content => ({
      idx,
      child,
      type: 'response',
      contentType: 'data',
      content
    });

    const errorResponseFromError = e => ({
      idx,
      child,
      type: 'response',
      contentType: 'error',
      content: (0, _diagnostic.anyToDiagnostic)(e)
    });

    let result;

    if (handleId != null) {
      try {
        let fn = (0, _nullthrows.default)(this.handles.get(handleId)).fn;
        result = responseFromContent(fn(...args));
      } catch (e) {
        result = errorResponseFromError(e);
      }
    } else if (method === 'childInit') {
      try {
        let [moduleName, childOptions] = args;

        if (childOptions.patchConsole) {
          (0, _logger.patchConsole)();
        }

        result = responseFromContent(this.childInit(moduleName, child));
      } catch (e) {
        result = errorResponseFromError(e);
      }
    } else if (method === 'startProfile') {
      this.profiler = new _Profiler.default();

      try {
        result = responseFromContent((await this.profiler.startProfiling()));
      } catch (e) {
        result = errorResponseFromError(e);
      }
    } else if (method === 'endProfile') {
      try {
        let res = this.profiler ? await this.profiler.stopProfiling() : null;
        result = responseFromContent(res);
      } catch (e) {
        result = errorResponseFromError(e);
      }
    } else if (method === 'createSharedReference') {
      this.sharedReferences.set(args[0], args[1]);
      result = responseFromContent(null);
    } else if (method === 'deleteSharedReference') {
      this.sharedReferences.delete(args[0]);
      result = responseFromContent(null);
    } else {
      try {
        result = responseFromContent(( // $FlowFixMe
        await this.module[method](this.workerApi, ...args)));
      } catch (e) {
        result = errorResponseFromError(e);
      }
    }

    this.send(result);
  }

  handleResponse(data) {
    let idx = (0, _nullthrows.default)(data.idx);
    let contentType = data.contentType;
    let content = data.content;
    let call = (0, _nullthrows.default)(this.responseQueue.get(idx));

    if (contentType === 'error') {
      (0, _assert.default)(typeof content !== 'string');
      call.reject(new _diagnostic.default({
        diagnostic: content
      }));
    } else {
      call.resolve(content);
    }

    this.responseQueue.delete(idx); // Process the next call

    this.processQueue();
  } // Keep in mind to make sure responses to these calls are JSON.Stringify safe


  addCall(request, awaitResponse = true) {
    var _promise;

    // $FlowFixMe
    let call = _objectSpread({}, request, {
      type: 'request',
      child: this.childId,
      awaitResponse,
      resolve: () => {},
      reject: () => {}
    });

    let promise;

    if (awaitResponse) {
      promise = new Promise((resolve, reject) => {
        call.resolve = resolve;
        call.reject = reject;
      });
    }

    this.callQueue.push(call);
    this.processQueue();
    return (_promise = promise) !== null && _promise !== void 0 ? _promise : Promise.resolve();
  }

  sendRequest(call) {
    let idx;

    if (call.awaitResponse) {
      idx = this.responseId++;
      this.responseQueue.set(idx, call);
    }

    this.send({
      idx,
      child: call.child,
      type: call.type,
      location: call.location,
      handle: call.handle,
      method: call.method,
      args: call.args,
      awaitResponse: call.awaitResponse
    });
  }

  processQueue() {
    if (!this.callQueue.length) {
      return;
    }

    if (this.responseQueue.size < this.maxConcurrentCalls) {
      this.sendRequest(this.callQueue.shift());
    }
  }

  handleEnd() {
    this.loggerDisposable.dispose();
  }

  createReverseHandle(fn) {
    let handle = new _Handle.default({
      fn,
      workerApi: this.workerApi,
      childId: this.childId
    });
    this.handles.set(handle.id, handle);
    return handle;
  }

}

exports.Child = Child;