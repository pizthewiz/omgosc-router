/*jshint node:true, strict:false */

var osc = require('omgosc');
require('./omgosc-router')(osc);

var coarseTune = 0;
var waveform = 'sawtooth';

var port = process.env.PORT || 9999;
var receiver = new osc.UdpReceiver(port);
console.log("✔ OSC receiver listening on port %d", port);

receiver.route('/analog4/track1/oscillator1/coarse_tune', function (msg) {
  coarseTune = msg.params[0];
  console.log('coarseTune: %d', coarseTune);
});
receiver.route('/analog4/track1/oscillator1/waveform', function (msg) {
  waveform = msg.params[0];
  console.log('waveform: %s', waveform);
});
receiver.route('*', function (msg) {
  console.warn("WARNING - OSC message unhandled, sent to '%s'", msg.path);
});
