"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prettyDiagnostic;

var _codeframe = _interopRequireDefault(require("@parcel/codeframe"));

var _markdownAnsi = _interopRequireDefault(require("@parcel/markdown-ansi"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prettyDiagnostic(diagnostic) {
  let {
    origin,
    message,
    stack,
    codeFrame,
    hints,
    filePath,
    language
  } = diagnostic;
  let result = {
    message: '',
    stack: '',
    codeframe: '',
    hints: []
  };
  result.message = (0, _markdownAnsi.default)(`**${origin}**: ${message}`);
  result.stack = stack || '';

  if (codeFrame !== undefined) {
    let highlights = Array.isArray(codeFrame.codeHighlights) ? codeFrame.codeHighlights : [codeFrame.codeHighlights];
    let formattedCodeFrame = (0, _codeframe.default)(codeFrame.code, highlights, {
      useColor: true,
      syntaxHighlighting: true,
      language: // $FlowFixMe sketchy null checks do not matter here...
      language || (filePath ? _path.default.extname(filePath).substr(1) : undefined)
    });
    result.codeframe += typeof filePath !== 'string' ? '' : (0, _markdownAnsi.default)(`__${filePath}:${highlights[0].start.line}:${highlights[0].start.column}__\n`);
    result.codeframe += formattedCodeFrame;
  }

  if (Array.isArray(hints) && hints.length) {
    result.hints = hints.map(h => {
      return (0, _markdownAnsi.default)(h);
    });
  }

  return result;
}