"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prettyError;

function prettyError(err, opts = {}) {
  if (typeof err === 'string') {
    return {
      message: err
    };
  }

  let message = err.message;

  if (!message) {
    message = 'Unknown error';
  }

  if (err.fileName != null) {
    let fileName = err.fileName;

    if (err.loc) {
      fileName += `:${err.loc.line}:${err.loc.column}`;
    }

    message = `${fileName}: ${message}`;
  }

  let stack;

  if (err.codeFrame != null && err.codeFrame !== '') {
    stack = opts.color === true && err.highlightedCodeFrame || err.codeFrame;
  } else if (err.stack) {
    stack = err.stack.slice(err.stack.indexOf('\n') + 1);
  }

  return {
    message,
    stack
  };
}