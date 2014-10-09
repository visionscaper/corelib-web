/**
 * Created by Freddy on 15/05/14.
 */

//Using this to set the Logger static props
LoggerLevel = {
  NO_LOGGING    : 100,
  ERROR         : 4,
  WARN          : 3,
  INFO          : 2,
  DEBUG         : 1
};

var Logger = Class({

    $statics: {
        noLogging   : LoggerLevel.NO_LOGGING,
        errorLevel  : LoggerLevel.ERROR,
        warnLevel   : LoggerLevel.WARN,
        infoLevel   : LoggerLevel.INFO,
        debugLevel  : LoggerLevel.DEBUG
    },

    _logLevel : LoggerLevel.WARN,

    // See _setLogLevelNames
    _levelNames : {},

    //See _setLogFunctions
    _logFunc : {},

    constructor : function(level) {
        var me = "Logger::constructor";
        var _u = this._utils;

        this._setLogLevelNames();
        this._setLogFunctions();

        if (!_u.def(level)) {
            console.log("{0} : no logging level given, setting log-level to warn".fmt(me));
            level = LoggerLevel.WARN;
        }

        if (!_u.def(this._logFunc[level])) {
            console.log("{0} : level {1} unknown, setting log-level to warn".fmt(me, level));
            level = LoggerLevel.WARN;
        }

        this._logLevel = level;
    },

    setLogLevel : function(level) {
        var me = "Logger::setLogLevel";
        var _u = this._utils;

        if (!_u.def(level)) {
            console.error("{0} : no logging level given, doing nothing".fmt(me));
            return;
        }

        if (!_u.def(this._logFunc[level])) {
            console.info("{0} : level {1} unknown, doing nothing".fmt(me, level));
            return;
        }

        this._logLevel = level;
    },

    error : function(me, message) {
        if (this._logLevel > Logger.errorLevel) {
            return;
        }

        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(Logger.errorLevel);

        this._log.apply(this, args);
    },

    warn : function(me, message) {
        if (this._logLevel > Logger.warnLevel) {
            return;
        }

        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(Logger.warnLevel);

        this._log.apply(this, args);
    },

    info : function(me, message) {
        if (this._logLevel > Logger.infoLevel) {
            return;
        }

        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(Logger.infoLevel);

        this._log.apply(this, args);
    },

    debug : function(me, message) {
        if (this._logLevel > Logger.debugLevel) {
            return;
        }

        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(Logger.debugLevel);

        this._log.apply(this, args);
    },

    /*************************************
     *
     * PROTECTED METHODS
     *
     *************************************/

    _setLogLevelNames : function() {
        this._levelNames[Logger.noLogging]      = "NO LOGGING";
        this._levelNames[Logger.errorLevel]     = "ERROR";
        this._levelNames[Logger.warnLevel]      = "WARNING";
        this._levelNames[Logger.infoLevel]      = "INFO";
        this._levelNames[Logger.debugLevel]     = "DEBUG";
    },

    _setLogFunctions  : function() {
        this._logFunc[Logger.noLogging]         = function() {};
        this._logFunc[Logger.errorLevel]        = console.error || console.log;
        this._logFunc[Logger.warnLevel]         = console.warn || console.log;
        this._logFunc[Logger.infoLevel]         = console.info || console.log;
        this._logFunc[Logger.debugLevel]        = console.debug || console.log;
    },

    /**
     *
     * @param {number} [level=Logger.infoLevel]
     * @param {string} [me=null]
     * @param {string} [message="[NO MESSAGE GIVEN]"]
     *
     * @protected
     *
     */
    _log : function(level, me, message) {
        var _u = this._utils;

        level = level || Logger.infoLevel;
        message = message || "[NO MESSAGE GIVEN]";

        var preFix = _u.now() + " [" + this._levelNames[level] + "] ";
        if (_u.string(me) && (me.length > 0)) {
            preFix += me + " : "
        }

        message = preFix + message;

        var logArgs = Array.prototype.slice.call(arguments, 3);
        logArgs.unshift(message);

        var logFunc = _u.ensureFunc(this._logFunc[level]);
        logFunc.apply(console, logArgs);
    },

    /*** Internal util methods to make the logger class completely independent ***/
    _utils : {
        def : function(v) {
            return ((v !== null) && (v !== undefined));
        },

        string : function(s) {
            return (typeof(s) === "string");
        },

        ensureFunc : function(f) {
            return (typeof(f) === "function") ? f : function(){};
        },

        now : function() {
            return (new Date()).getTime();
        }
    }

    /*************************************
     *
     * END PROTECTED METHODS
     *
     *************************************/
});
