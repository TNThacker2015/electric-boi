"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeDeferredWithPromise = makeDeferredWithPromise;

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeDeferredWithPromise() {
  let deferred;
  let promise = new Promise((resolve, reject) => {
    deferred = {
      resolve,
      reject
    };
  }); // Promise constructor callback executes synchronously, so this is defined

  (0, _assert.default)(deferred != null);
  return {
    deferred,
    promise
  };
}