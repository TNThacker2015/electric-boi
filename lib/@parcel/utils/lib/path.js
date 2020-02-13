"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeSeparators = normalizeSeparators;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const COMMON_SEPARATORS = ['/', '\\'];

function normalizeSeparators(filePath) {
  let ret = filePath;

  for (let separator of COMMON_SEPARATORS) {
    ret = ret.split(separator).join(_path.default.sep);
  }

  return ret;
}