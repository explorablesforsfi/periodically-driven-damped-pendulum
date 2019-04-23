(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};

}).call(this,require('_process'))
},{"./common":3,"_process":1}],3:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = require('ms');

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;

},{"ms":4}],4:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}],5:[function(require,module,exports){
// -------------------------------------------------------------------------------
// RK45js : A JavaScript implementation of the Runge-Kutta-Fehlberg method.
//
// The Runge-Kutta-Fehlberg method (RK45 method) is a numerical integration
// routine for solving systems of differential equations.  RK45 differs from
// the normal Runge-Kutta algorithm by featuring an adapative step size. As
// the integration proceeds, if the step size is too big (i.e. produces an
// error larger than a set value) then the step size is decreased until the
// error is within an acceptable value.  Conversely, if the error is much
// smaller than the tolerance, the step size is increased to improve computational
// efficiency.
//
// This implementation is written in JavaScript and is based loosely off an
// older C version I wrote some time ago.
//
// Features:
//      - Computational solver can be instantiated as an object.
//      - No fixed limit to the order (size) of the system that can be solved.
//      - Sanity checking built-in prior to starting computation.
//      - Unit test suite (Mocha + Chai) for testing your installation.
//
// Getting Started:
// At the most basic level, you need to do the following:
//      - Instantiate a solver
//      - Define the derivative function(s) you are solving
//      - Set the intial conditions
//      - Specify the start and stop values in the independent variable; e.g. time.
//      - Call the solver.
//      - Read out your answer!
//
// See the "rk45_sample.js" file for an example of getting started with a one
// degree of freedom (first order) system.
//
// Remy Malan
// February 2017
//
// License: MIT
// -------------------------------------------------------------------------------

var debug = require('debug')('rk45');

exports.System = function() {
    this.x0 = null;         // Array of initial conditions.
    this.fn = null;         // Array of functions to solve.
    this.newX = null;       // Array of solved values.
    this.h = 0.1;           // Time step.
    this.tol = 1.0e-5;      // Solution tolerance; used for adaptive step size adjustment.
    this.start = 0.0;       // Integration start time.
    this.stop = 1.0;        // Integration end time.
    this.R = null;          // Array for error calculations.
    this.delta = null;      // Array for step adjustment.
    this.count = 0;         // Count of how many steps of integration were done.
    this.maxCount = 2048;   // Watchdog value for integration loop counter.
    this.status =           // Error / success status.
        {success: false,    // True if solved correctly, false otherwise.
         state: 'init',     // Label of state of solver: 'init', 'solve', 'complete', 'error'
         message: null};    // More detailed info.
}

exports.System.prototype = {

    // Set initial conditions.
    setInitX:   function( initX ) { return this.x0 = initX; },
    setFn:      function( fn_array ) { return this.fn = fn_array; },
    setStart:   function( start_time ) { return this.start = start_time; },
    setStop:    function( stop_time ) { return this.stop = stop_time; },
    setH:       function( h ) { return this.h = h; },
    setTol:     function( tol ) { return this.tol = tol; },
    setMaxCount:function( maxCount ) { return this.maxCount = maxCount; },

    // Get status.
    getStatus:  function() { return this.status; },
    
    // Check that "obvious" issues are not present before trying to solve.
    checkSetUp: function() {
        if (this.start >= this.stop) {
            this.status.state = 'error';
            if (this.start == this.stop)
                this.status.message = 'Stop time same as start time.';
            else
                this.status.message = 'Stop time is less than start time.';
            return( this.status.state );
        }
        if (this.x0.length != this.fn.length) {
            this.status.state = 'error';
            this.status.message = 'Dimension of initial conditions not the same as dimension of functions.';
            return( this.status.state );
        }
        if (this.h <= 0) {
            this.status.state = 'error';
            if (this.h == 0.0)
                this.status.message = 'h is zero but must be a positive number.';
            else
                this.status.message = 'h is less than zero but must be a positive number.';
            return( this.status.state );
        }
        return( 'ok' );
    },
 
    // Compute 'k' coefficients, k1 - k6.
    computeK:   function(t) {
        var t_new = t;
        var x_new = this.newX.slice();
        var dimension = this.x0.length;
        var k = new Array(dimension);
        // k1
        for (var i=0; i<dimension; i++) {
            k[i] = new Array(6);
            k[i][0] = this.h * this.fn[i](t_new,x_new);
        }
        // k2
        t_new = t + this.h / 4.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + k[i][0] / 4.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][1] = this.h * this.fn[i](t_new,x_new);
        }
        // k3
        t_new = t + this.h * 3.0 / 8.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + (3.0*k[i][0] + 9.0*k[i][1])/32.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][2] = this.h * this.fn[i](t_new,x_new);
        }
        // k4
        t_new = t + this.h * 12.0 / 13.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + (1932.0*k[i][0] - 7200.0*k[i][1] + 7296.0*k[i][2])/2197.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][3] = this.h * this.fn[i](t_new,x_new);
        }
        // k5
        t_new = t + this.h;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] + 439.0*k[i][0]/216.0 - 8.0*k[i][1] + 3680.0*k[i][2]/513.0 - 845.0*k[i][3]/4104.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][4] = this.h * this.fn[i](t_new,x_new);
        }
        // k6
        t_new = t + this.h / 2.0;
        for (var i=0; i<dimension; i++) {
            x_new[i] = this.newX[i] - 8.0*k[i][0]/27.0 + 2.0*k[i][1] - 3544.0*k[i][2]/2565.0 + 1859.0*k[i][3]/4104.0 - 11.0*k[i][4]/40.0;
        }
        for (var i=0; i<dimension; i++) {
            k[i][5] = this.h * this.fn[i](t_new,x_new);
        }
        
        return( k );
    },

    // Run computation loop.
    solve:      function() {

        // Check for inconsistencies in user inputs.
        if (this.checkSetUp() != 'ok') {
            return;
        }

        var dimension = this.x0.length;         // Dimension or order of the system.
        var t = this.start;                     // Time variable.

        this.newX = new Array( dimension );
        this.newX = this.x0                     // Output is set to initial values.
        this.R = new Array( dimension );
        this.delta = new Array( dimension );

        this.count = 0;                         // Set loop counter to zero.

        while (t < this.stop) {

            debug("t: "+t+", newX: "+this.newX);
            
            // Compute the 'k' coefficients.
            var k = this.computeK(t);

            for (var i=0; i<k.length; i++) {
                debug("k["+i+"]: "+k[i]);
//                for (var j=0; j<k[i].length; j++)
//                   debug("k["+i+"]["+j+"]: "+k[i][j]);
            }
            
            // Compute error estimates and
            // step size adjustment.
            
            for (var i=0; i<dimension; i++) {
                this.R[i] = Math.abs( k[i][0]/360.0 - 128.0*k[i][2]/4275.0 - 2197.0*k[i][3]/75240.0 + k[i][4]/50.0 + 2*k[i][5]/55.0 );
                this.R[i] = this.R[i] / this.h;
                this.delta[i] = 0.84*Math.pow((this.tol/this.R[i]),0.25);
            }
            
            debug("delta: " + this.delta + "; min: " + Math.min.apply(null, this.delta));

            if (Math.max.apply(null,this.R) <= this.tol)  {
                debug("Good to compute!");
                t = t + this.h;
                for (var i=0; i<dimension; i++) {
                    this.newX[i] = this.newX[i] + (25.0*k[i][0]/216.0 + 1408.0*k[i][2]/2565.0 + 2197.0*k[i][3]/4104.0 - k[i][4]/5.0);
                }
                this.h = this.h * Math.min.apply(null, this.delta);
            }
            else {
                debug("Need to adjust step size, max R: "+Math.max.apply(null,this.R));
                debug("Scale factor: "+Math.min.apply(null, this.delta));
                this.h = this.h * Math.min.apply(null, this.delta);
            }
            
    		if (this.h >= (this.stop - t))
			    this.h = this.stop - t;
		    
		    if (this.count++ > this.maxCount) {
			    break;
			}
        }
        
        // Check why loop stopped.
 
 		if (this.count++ > this.maxCount) {
		    this.status.success = false;
		    this.status.state = 'error';
		    this.status.message = 'Iteration count exceeded MAX count (' + this.maxCount + ')';
        }
        else if (t >= this.stop) {
		    this.status.success = true;
		    this.status.state = 'complete';
		    this.status.message = 'Integration completed sucessfully.';
        }  
    }
        
}


},{"debug":2}],6:[function(require,module,exports){
(function (process){
// ---------------------------------------------------------------------
// Sample use of the RK45js code.  In this case solving an ODE (Ordinary
// Differential Equation) of the form:
//
//                  dy/dt = y - t^2 + 1; y(0) = 0.5
//
// Find the value of y(t) when t=2.
//
// Note: in the code you will not see a reference to a variable 'y'.
//       Rather, you will see a reference to X0.  The solver uses
//       generalized coordinates (x0, x1, x2, ..., xN) rather than
//       referring to 'x', 'y', 'z', etc.
// ---------------------------------------------------------------------

var rk45 = require( "./rk45.js" );

// ------------------------------------------
// Set up equation(s) and initial conditions.
// ------------------------------------------

var diffEqX0 = function( time, x ) { return (x[0]-time*time+1); }
var initCoord = [ 0.5 ];

// -------------------------
// Create a new RK45 solver.
// -------------------------

var foo = new rk45.System();

foo.setStart( 0.0 );        // Initial start time, t=0.
foo.setStop( 2.0 );         // Time at which we want a solution, t=2.
foo.setInitX( initCoord );  // y(0) -- value of y when t=0.
foo.setFn( [diffEqX0] );    // Differential equation we're solving.

// ---------------------------------------------------------
// Call the solver function: foo.solve().
// Bracket with calls hrtime calls to see how long it takes.
// ---------------------------------------------------------

var hrstart = process.hrtime();
foo.solve();
var hrend = process.hrtime(hrstart);

// ---------------------------------------
// Check status of result.  Should be o.k.
// ---------------------------------------

var status = foo.getStatus();

console.log("status: \n\tsuccess: %s\n\tstate: %s\n\tmessage: %s", status.success, status.state, status.message);

// -------------
// Print result.
// -------------

console.log("result: " + foo.newX);
console.log("Computed in %d iterations taking %ds %dms", foo.count, hrend[0], hrend[1]/1000000);

}).call(this,require('_process'))
},{"./rk45.js":5,"_process":1}]},{},[6]);
