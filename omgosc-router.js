/*jshint node:true, strict:false */

// NB - pathRegexp taken directly from Express https://github.com/visionmedia/express/blob/master/lib/utils.js
var pathRegexp = function(path, keys, sensitive, strict) {
  if (toString.call(path) == '[object RegExp]') return path;
  if (Array.isArray(path)) path = '(' + path.join('|') + ')';
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
};

function Route(path, callback) {
  this.path = path;
  this.regexp = pathRegexp(path, [], false, false);
  this.callback = callback;
}

Route.prototype.match = function (msg) {
  return this.regexp.exec(msg.path);
};

Route.prototype.dispatch = function (msg) {
  this.callback(msg);
};

function Router() {
  this.routes = [];
}

Router.prototype.route = function (path, callback) {
  // check if the path already exists
  for (var idx = 0; idx < this.routes.length; idx++) {
    if (path === this.routes[idx].path) {
      console.error('ERROR - route for path \'%s\' already exists, skipping', path);
      return;
    }
  }

  var r = new Route(path, callback);
  this.routes.push(r);
};

Router.prototype.handle = function (msg) {
  if (toString.call(this.routes) !== '[object Array]') {
    console.error('ERROR - Router not bound to \'this\' when calling handle(), failed to route message');
    return;
  }

  for (var idx = 0; idx < this.routes.length; idx++) {
    var r = this.routes[idx];
    if (r.match(msg)) {
      r.dispatch(msg);
      break;
    }
  }
};

module.exports = function (osc) {
  // naive inspection if the omgosc module was passed in
  if (toString.call(osc) == '[object Object]') {
    osc.UdpReceiver.prototype.route = function (path, callback) {
      if (this.router === undefined) {
        this.router = new Router();
        this.on('', this.router.handle.bind(this.router));
      }

      this.router.route(path, callback);
    };

    osc.UdpReceiver.prototype.routes = function () {
      return this.router ? this.router.routes : [];
    };
  }

  return Router;
};
