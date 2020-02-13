"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchSourceMappingURL = matchSourceMappingURL;
exports.default = loadSourceMapUrl;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SOURCEMAP_RE = /(?:\/\*|\/\/)\s*[@#]\s*sourceMappingURL\s*=\s*([^\s*]+)(?:\s*\*\/)?\s*$/;
const DATA_URL_RE = /^data:[^;]+(?:;charset=[^;]+)?;base64,(.*)/;

function matchSourceMappingURL(contents) {
  return contents.match(SOURCEMAP_RE);
}

async function loadSourceMapUrl(fs, filename, contents) {
  let match = matchSourceMappingURL(contents);

  if (match) {
    let url = match[1].trim();
    let dataURLMatch = url.match(DATA_URL_RE);
    filename = dataURLMatch ? filename : _path.default.join(_path.default.dirname(filename), url);
    return {
      url,
      filename,
      map: JSON.parse(dataURLMatch ? Buffer.from(dataURLMatch[1], 'base64').toString() : await fs.readFile(filename, 'utf8'))
    };
  }
}