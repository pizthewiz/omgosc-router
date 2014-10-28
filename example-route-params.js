/*jshint node:true, strict:true */
'use strict';

var osc = require('omgosc');
require('./omgosc-router')(osc);

function Oscillator() {
  this.coarseTune = 0;
  this.waveform = 'sawtooth';
  this.level = 100;
}
// assuming two tracks with two oscillators each
var tracks = [[new Oscillator(), new Oscillator()], [new Oscillator(), new Oscillator()]];

var port = process.env.PORT || 9999;
var receiver = new osc.UdpReceiver(port);
console.log("✔ OSC receiver listening on port %d", port);

receiver.route('/analog4/:track/:oscillator/coarse_tune', function (msg, params) {
  // NB - it sure would be nie to have middleware for this
  var trackIndex = ['track1', 'track2'].indexOf(params.track);
  var oscillatorIndex = ['oscillator1', 'oscillator2'].indexOf(params.oscillator);
  if (trackIndex === -1 || oscillatorIndex === -1) {
    console.warn("WARNING - bad track or oscillator index, skipping");
    return;
  }

  var oscillator = tracks[trackIndex][oscillatorIndex];
  oscillator.coarseTune = msg.params[0];
  console.log('coarseTune: %d (%s:%s)', oscillator.coarseTune, params.track, params.oscillator);
});
receiver.route('/analog4/:track/:oscillator/waveform', function (msg, params) {
  var trackIndex = ['track1', 'track2'].indexOf(params.track);
  var oscillatorIndex = ['oscillator1', 'oscillator2'].indexOf(params.oscillator);
  var oscillator = tracks[trackIndex][oscillatorIndex];
  if (trackIndex === -1 || oscillatorIndex === -1) {
    console.warn("WARNING - bad track or oscillator index, skipping");
    return;
  }

  oscillator.waveform = msg.params[0];
  console.log('waveform: %s (%s:%s)', oscillator.waveform, params.track, params.oscillator);
});
receiver.route('/analog4/:track/:oscillator/level', function (msg, params) {
  var trackIndex = ['track1', 'track2'].indexOf(params.track);
  var oscillatorIndex = ['oscillator1', 'oscillator2'].indexOf(params.oscillator);
  var oscillator = tracks[trackIndex][oscillatorIndex];
  if (trackIndex === -1 || oscillatorIndex === -1) {
    console.warn("WARNING - bad track or oscillator index, skipping");
    return;
  }

  oscillator.level = msg.params[0];
  console.log('level: %d (%s:%s)', oscillator.level, params.track, params.oscillator);
});
receiver.route('*', function (msg) {
  console.warn("WARNING - OSC message unhandled, sent to '%s'", msg.path);
});
