"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relativeBundlePath = relativeBundlePath;

var _path = _interopRequireDefault(require("path"));

var _nullthrows = _interopRequireDefault(require("nullthrows"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function relativeBundlePath(from, to) {
  let p = _path.default.relative(_path.default.dirname((0, _nullthrows.default)(from.filePath)), (0, _nullthrows.default)(to.filePath)).replace(/\\/g, '/');

  if (p[0] !== '.') {
    p = './' + p;
  }

  return p;
}