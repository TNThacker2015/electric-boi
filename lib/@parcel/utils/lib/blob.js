"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blobToBuffer = blobToBuffer;
exports.blobToString = blobToString;

var _ = require("../");

var _stream = require("stream");

function blobToBuffer(blob) {
  if (blob instanceof _stream.Readable) {
    return (0, _.bufferStream)(blob);
  } else if (blob instanceof Buffer) {
    return Buffer.from(blob);
  } else {
    return Buffer.from(blob, 'utf8');
  }
}

async function blobToString(blob) {
  if (blob instanceof _stream.Readable) {
    return (await (0, _.bufferStream)(blob)).toString();
  } else if (blob instanceof Buffer) {
    return blob.toString();
  } else {
    return blob;
  }
}