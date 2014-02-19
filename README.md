
## omgosc-router
A simple OSC message router for the [omgosc](https://github.com/deanm/omgosc) receiver.

The usually-unstructured handling of message routing leaves one with large conditionals or switch statements. *omgosc-router* implements a simple Router based on that from [Express](https://github.com/visionmedia/express), largely for convenience. It is my intention that this project will be a prototype for an Objective-C router implementation that will go into [PonyExpress](https://github.com/pizthewiz/PonyExpress). Additionally, the [OSCQueryProposal](https://github.com/mrRay/OSCQueryProposal) has some very interesting elements that a central router will help in realizing.

### EXAMPLE

```javascript
var router = new OSCRouter();
receiver.on('', router.handle.bind(router));
router.use('/heartbeat', function (msg) {
  handleHeartbeat(msg);
});
router.use('/slide_add', function (msg) {
  handleSlideAdd(msg);
});
router.use('*', function (msg) {
  console.warn('WARNING - OSC message unhandled, sent to \'' + msg.path + '\'');
});
```
