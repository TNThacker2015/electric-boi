"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class DefaultMap extends Map {
  constructor(getDefault, entries) {
    super(entries);

    _defineProperty(this, "_getDefault", void 0);

    this._getDefault = getDefault;
  }

  get(key) {
    let ret;

    if (this.has(key)) {
      ret = super.get(key);
    } else {
      ret = this._getDefault(key);
      this.set(key, ret);
    } // $FlowFixMe


    return ret;
  }

}

exports.default = DefaultMap;