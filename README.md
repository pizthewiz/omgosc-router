## omgosc-router
A simple OSC message router for the [omgosc](https://github.com/deanm/omgosc) receiver.

OSC message handling usually leaves one with large conditionals or switch statements. While [omgosc](https://github.com/deanm/omgosc) does emit events for an osc message's address, *omgosc-router* implements a simple router based on [Express](https://github.com/visionmedia/express) to make handling more explicit and much more flexible.

### EXAMPLES
```javascript
var osc = require('omgosc');
var Router = require('./omgosc-router')();

var receiver = new osc.UdpReceiver(9999);
var router = new Router();
receiver.on('', router.handle.bind(router));

router.route('/slide_add', function (msg) {
  console.log('slide add', msg);
});
router.route('*', function (msg) {
  console.warn("WARNING - OSC message unhandled, sent to '%s'", msg.path);
});
```

Alternatively, if the *omgosc* module is passed into *omgosc-router* at `require` time, a couple of methods will be added (monkey patched) to `osc.UdpReceiver` and a more concise syntax can be used.
```javascript
var osc = require('omgosc');
require('./omgosc-router')(osc);

var receiver = new osc.UdpReceiver(9999);
receiver.route('/slide_add', function (msg) {
  console.log('slide add', msg);
});
receiver.route('*', function (msg) {
  console.warn("WARNING - OSC message unhandled, sent to '%s'", msg.path);
});
```

Much like one would do in [Express](https://github.com/visionmedia/express), routes can specify parameters that will be matched and the values provided in an `params` argument in the callback. This allows a single route to handle many addresses at once.
```javascript
function Oscillator() {
  this.coarseTune = 0;
}
// two tracks with two oscillators each
var tracks = [[new Oscillator(), new Oscillator()], [new Oscillator(), new Oscillator()]];

var receiver = new osc.UdpReceiver(9999);
receiver.route('/:track/:oscillator/coarse_tune', function (msg, params) {
  var trackIndex = ['track1', 'track2'].indexOf(params.track);
  var oscillatorIndex = ['oscillator1', 'oscillator2'].indexOf(params.oscillator);
  var oscillator = tracks[trackIndex][oscillatorIndex];
  oscillator.coarseTune = msg.params[0];
  console.log('coarseTune: %d (%s:%s)', oscillator.coarseTune, params.track, params.oscillator);
});
```

### NOTES
*omgosc-router* does not implement OSC message dispatch via pattern matching from the OSC message address. The feature is generally unimplemented in most OSC libraries and not particularly useful in practice.
