"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.measureStreamLength = measureStreamLength;
exports.readableFromStringOrBuffer = readableFromStringOrBuffer;
exports.bufferStream = bufferStream;
exports.blobToStream = blobToStream;

var _stream = require("stream");

function measureStreamLength(stream) {
  return new Promise((resolve, reject) => {
    let length = 0;
    stream.on('data', chunk => {
      length += chunk;
    });
    stream.on('end', () => resolve(length));
    stream.on('error', reject);
  });
}

function readableFromStringOrBuffer(str) {
  // https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
  const stream = new _stream.Readable();
  stream.push(str);
  stream.push(null);
  return stream;
}

function bufferStream(stream) {
  return new Promise((resolve, reject) => {
    let buf = Buffer.from([]);
    stream.on('data', data => {
      buf = Buffer.concat([buf, data]);
    });
    stream.on('end', () => {
      resolve(buf);
    });
    stream.on('error', reject);
  });
}

function blobToStream(blob) {
  if (blob instanceof _stream.Readable) {
    return blob;
  }

  return readableFromStringOrBuffer(blob);
}