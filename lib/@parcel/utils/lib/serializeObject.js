"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = serializeObject;

var _terser = require("terser");

var _serializeToJs = require("serialize-to-js");

function serializeObject(obj, shouldMinify = false) {
  let code = `module.exports = ${(0, _serializeToJs.serialize)(obj)};`;

  if (shouldMinify) {
    let minified = (0, _terser.minify)(code);

    if (minified.error) {
      throw minified.error;
    }

    code = minified.code;
  }

  return code;
}