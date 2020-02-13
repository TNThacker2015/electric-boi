"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = syncPromise;

var _deasync = _interopRequireDefault(require("deasync"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Synchronously waits for a promise to return by
 * yielding to the node event loop as needed.
 */
function syncPromise(promise) {
  let isDone = false;
  let res, err;
  promise.then(value => {
    res = value;
    isDone = true;
  }, error => {
    err = error;
    isDone = true;
  });

  _deasync.default.loopWhile(() => !isDone);

  if (err) {
    throw err;
  } // $FlowFixMe this is valid since we wait using deasync above


  return res;
}