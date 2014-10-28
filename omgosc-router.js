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
  this.regexp = pathRegexp(path, this.keys = [], false, false);
  this.callback = callback;
}

// NB - match taken directly from Express https://github.com/visionmedia/express/blob/master/lib/router/route.js
Route.prototype.match = function (path) {
  var keys = this.keys
    , params = this.params = {}
    , m = this.regexp.exec(path)
    , n = 0;

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];

    try {
      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];
    } catch(e) {
      var err = new Error("Failed to decode param '" + m[i] + "'");
      err.status = 400;
      throw err;
    }

    if (key) {
      params[key.name] = val;
    } else {
      params[n++] = val;
    }
  }

  return true;
};

Route.prototype.dispatch = function (msg) {
  this.callback(msg, this.params);
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
  // catch common context binding error
  if (toString.call(this.routes) !== '[object Array]') {
    console.error('ERROR - Router not bound to \'this\' when calling handle(), failed to route message');
    return;
  }

  for (var idx = 0; idx < this.routes.length; idx++) {
    var r = this.routes[idx];
    if (r.match(msg.path)) {
      r.dispatch(msg);
      break;
    }
  }
};

module.exports = function (osc) {
  // naive inspection if the omgosc module was passed in to monkey patch
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
