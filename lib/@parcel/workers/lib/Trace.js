"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chromeTraceEvent = require("chrome-trace-event");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Trace {
  constructor() {
    _defineProperty(this, "tracer", void 0);

    _defineProperty(this, "tid", void 0);

    _defineProperty(this, "eventId", void 0);

    this.tracer = new _chromeTraceEvent.Tracer();
    this.tid = 0;
    this.eventId = 0;
    this.init();
  }

  getEventId() {
    return this.eventId++;
  }

  init() {
    this.tracer.instantEvent({
      name: 'TracingStartedInPage',
      id: this.getEventId(),
      cat: ['disabled-by-default-devtools.timeline'],
      args: {
        data: {
          sessionId: '-1',
          page: '0xfff',
          frames: [{
            frame: '0xfff',
            url: 'parcel',
            name: ''
          }]
        }
      }
    });
    this.tracer.instantEvent({
      name: 'TracingStartedInBrowser',
      id: this.getEventId(),
      cat: ['disabled-by-default-devtools.timeline'],
      args: {
        data: {
          sessionId: '-1'
        }
      }
    });
  }

  addCPUProfile(name, profile) {
    const trace = this.tracer;
    const tid = this.tid;
    this.tid++;
    const cpuStartTime = profile.startTime;
    const cpuEndTime = profile.endTime;
    trace.instantEvent({
      tid,
      id: this.getEventId(),
      cat: ['toplevel'],
      name: 'TaskQueueManager::ProcessTaskFromWorkQueue',
      args: {
        src_file: '../../ipc/ipc_moji_bootstrap.cc',
        src_func: 'Accept'
      },
      ts: cpuStartTime
    });
    trace.completeEvent({
      tid,
      name: 'EvaluateScript',
      id: this.getEventId(),
      cat: ['devtools.timeline'],
      ts: cpuStartTime,
      dur: cpuEndTime - cpuStartTime,
      args: {
        data: {
          url: 'parcel',
          lineNumber: 1,
          columnNumber: 1,
          frame: '0xFFF'
        }
      }
    });
    trace.instantEvent({
      tid,
      ts: 0,
      ph: 'M',
      cat: ['__metadata'],
      name: 'thread_name',
      args: {
        name
      }
    });
    trace.instantEvent({
      tid,
      name: 'CpuProfile',
      id: this.getEventId(),
      cat: ['disabled-by-default-devtools.timeline'],
      ts: cpuEndTime,
      args: {
        data: {
          cpuProfile: profile
        }
      }
    });
  }

  pipe(writable) {
    return this.tracer.pipe(writable);
  }

  flush() {
    this.tracer.push(null);
  }

}

exports.default = Trace;