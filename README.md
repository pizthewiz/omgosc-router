
## omgosc-router
A simple OSC message router for the [omgosc](https://github.com/deanm/omgosc) receiver.

OSC message handling usually leaves one with large conditionals or switch statements. *omgosc-router* implements a simple router based on [Express](https://github.com/visionmedia/express), to make handling more explicit. This project also acts as a simple mechanism to prototype before an Objective-C router implementation is added to [PonyExpress](https://github.com/pizthewiz/PonyExpress) and as a way to investigate some aspects of the [OSCQueryProposal](https://github.com/mrRay/OSCQueryProposal).

### EXAMPLE

```javascript
var osc = require('omgosc');
var Router = require('./omgosc-router')();

var port = process.env.PORT || 9999;
var receiver = new osc.UdpReceiver(port);
console.log("✔ OSC receiver listening on port %d", port);

var router = new Router();
receiver.on('', router.handle.bind(router));

router.route('/slide_add', function (msg) {
  console.log('slide add', msg);
});
router.route('/slide_remove', function (msg) {
  console.log('slide remove', msg);
});
router.route('*', function (msg) {
  console.warn("WARNING - OSC message unhandled, sent to '%s'", msg.path);
});
```

Alternatively, if the *omgosc* module is passed into *omgosc-router* at `require` time, a couple of methods will be added to `osc.UdpReceiver` and a more concise syntax can be used.
```javascript
var osc = require('omgosc');
require('./omgosc-router')(osc);

var port = process.env.PORT || 9999;
var receiver = new osc.UdpReceiver(port);
console.log("✔ OSC receiver listening on port %d", port);

receiver.route('/slide_add', function (msg) {
  console.log('slide add', msg);
});
receiver.route('/slide_remove', function (msg) {
  console.log('slide remove', msg);
});
receiver.route('*', function (msg) {
  console.warn("WARNING - OSC message unhandled, sent to '%s'", msg.path);
});
```
