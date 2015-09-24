/**
 * Created by Freddy Snijder on 15/05/14.
 */

(function() {
    var NS      = null;
    var Class   = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface = require("jsface");
        Class  = jsface.Class;
        //var extend = jsface.extend;

        require("./extensions/string.ext.js");

        NS = exports;

    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;

        Class  = window.jsface.Class;
    }

    NS.Logging = {};

    var Logging = NS.Logging;

    //Using this to set the Logger static props
    Logging.LoggingLevel = {
        NO_LOGGING    : 100,
        ERROR         : 4,
        WARN          : 3,
        INFO          : 2,
        DEBUG         : 1,
        TRACE         : 0
    };

    Logging.Logger = Class({

        $statics        : {
            noLogging       : Logging.LoggingLevel.NO_LOGGING,
            errorLevel      : Logging.LoggingLevel.ERROR,
            warnLevel       : Logging.LoggingLevel.WARN,
            infoLevel       : Logging.LoggingLevel.INFO,
            debugLevel      : Logging.LoggingLevel.DEBUG,
            traceLevel      : Logging.LoggingLevel.TRACE
        },

        _logLevel       : Logging.LoggingLevel.WARN,

        // See _setLogLevelNames
        _levelNames         : {},
        _maxLevelNameLength : 0,

        //See _setLogFunctions
        _logFunc            : {},

        //Used for node.js, see _setLogLevelColors
        _logLevelColor      : {},

        _minMeLength        :  0,
        _maxMeLength        : 70,

        _stackLimit         : 10,
        _minStackLevel      : Logging.LoggingLevel.WARN,

        /**
         * Creates a logger object that shows logs of log-level 'level' and higher levels
         *
         * @module      corelib-web
         * @class       Logging.Logger
         *
         * @param {number} level    See Logging.LoggingLevel
         *
         */
        constructor : function(level) {
            var me = "Logger::constructor";
            var _u = Logging.Logger.utils;

            this._setLogLevelNames();
            this._setLogFunctions();
            this._setLogLevelColors();

            if (!_u.def(level)) {
                console.log("{0} : no logging level given, setting log-level to warn".fmt(me));
                level = Logging.LoggingLevel.WARN;
            }

            if (!_u.def(this._logFunc[level])) {
                console.log("{0} : level {1} unknown, setting log-level to warn".fmt(me, level));
                level = Logging.LoggingLevel.WARN;
            }

            this._logLevel = level;
        },

        getStackTrace: function(offset, limit) {
            var _u = Logging.Logger.utils;

            if(!_u.int(offset) || offset < 0) {
                offset = 0;
            }
            if(!_u.int(limit) || limit < 0) {
                limit = 0;
            }

            var stack = new Error('').stack.split("\n");

            // If first line is arbitrary (error) line
            if(_u.string(stack[0])) {
                var fileMatch = /.*\/(.*):(\d+):\d+/;
                if(fileMatch.exec(stack[0]) === null) {
                    offset++;
                }
            }
            return {trace: stack.slice(offset, offset + limit)};
        },

        /**
         *
         * @method setLogLevel
         *
         * @param level     See Logging.LoggingLevel
         *
         */
        setLogLevel : function(level) {
            var me = "Logger::setLogLevel";
            var _u = Logging.Logger.utils;

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

        /**
         *
         * Log error message
         *
         * @method error
         *
         * @param {string} me       String indicating which entity or method reports this message
         * @param (string} message  The error message
         *
         */
        error : function(me, message) {
            if (this._logLevel > Logging.Logger.errorLevel) {
                return;
            }
            var args = Array.prototype.slice.call(arguments, 0);
            args.shift(); // remove 'me' from messages

            this._log.call(this, Logging.Logger.errorLevel, me, args);
        },

        /**
         *
         * Warn error message
         *
         * @method warn
         *
         * @param {string} me       String indicating which entity or method reports this message
         * @param (string} message  The warning message
         *
         */
        warn : function(me, message) {
            if (this._logLevel > Logging.Logger.warnLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.shift(); // remove 'me' from messages

            this._log.call(this, Logging.Logger.warnLevel, me, args);
        },

        /**
         *
         * Info error message
         *
         * @method info
         *
         * @param {string} me       String indicating which entity or method reports this message
         * @param (string} message  The info message
         *
         */
        info : function(me, message) {
            if (this._logLevel > Logging.Logger.infoLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.shift(); // remove 'me' from messages

            this._log.call(this, Logging.Logger.infoLevel, me, args);
        },

        /**
         *
         * Debug error message
         *
         * @method debug
         *
         * @param {string} me       String indicating which entity or method reports this message
         * @param (string} message  The debug message
         *
         */
        debug : function(me, message) {
            if (this._logLevel > Logging.Logger.debugLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.shift(); // remove 'me' from messages

            this._log.call(this, Logging.Logger.debugLevel, me, args);
        },

        /**
         * Generic, configurable message.
         * @param {string} level                String indicating logging level.
         * @param {string} me                   String indicating which entity or method reports this message
         * @param {array} messages              Array of messages to log.
         * @param {object} options              Configuration object.
         * @param {int} options.stackOffset     Number of items in stack trace to skip.
         * @param {int} options.stackLimit      Number of items in stack trace to show.
         */
        log : function(level, me, messages, options) {
            var stringLevel = level.toUpperCase();
            var level = Logging.LoggingLevel[stringLevel];
            this._log.call(this, level, me, messages, options);
        },

        /*************************************
         *
         * PROTECTED METHODS
         *
         *************************************/

        /**
         *
         * TODO Description
         *
         * @method _setLogLevelNames
         * @protected
         *
         */
        _setLogLevelNames   : function() {
            this._levelNames[Logging.Logger.noLogging]      = "NO LOGGING";
            this._levelNames[Logging.Logger.errorLevel]     = "ERROR";
            this._levelNames[Logging.Logger.warnLevel]      = "WARNING";
            this._levelNames[Logging.Logger.infoLevel]      = "INFO";
            this._levelNames[Logging.Logger.debugLevel]     = "DEBUG";
            this._levelNames[Logging.Logger.traceLevel]     = "TRACE";

            this._maxLevelNameLength = 0;
            var levels = Object.getOwnPropertyNames(this._levelNames);
            for (var idx in levels) {
                var level = levels[idx];

                //Don't look at level name length of Logging.Logger.noLogging
                if (level == Logging.Logger.noLogging) {
                    continue;
                }

                var l = this._levelNames[level].length;
                if (l > this._maxLevelNameLength) {
                    this._maxLevelNameLength = l;
                }
            }
        },

        /**
         *
         * TODO Description
         *
         * @method _setLogFunctions
         * @protected
         *
         */
        _setLogFunctions    : function() {
            this._logFunc[Logging.Logger.noLogging]         = function() {};
            this._logFunc[Logging.Logger.errorLevel]        = console.error || console.log;
            this._logFunc[Logging.Logger.warnLevel]         = console.warn || console.log;
            this._logFunc[Logging.Logger.infoLevel]         = console.info || console.log;
            this._logFunc[Logging.Logger.debugLevel]        = console.debug || console.log;
        },

        /**
         *
         * TODO Description
         *
         * @method _setLogLevelColors
         * @protected
         *
         */
        _setLogLevelColors  : function() {
            this._logLevelColor[Logging.Logger.errorLevel]  = '\033[45m'; //Magenta
            this._logLevelColor[Logging.Logger.warnLevel]   = '\033[46m'; //Cyan
            this._logLevelColor[Logging.Logger.infoLevel]   = '\033[42m'; //Green
        },

        /**
         *
         * Allows pre-processing of log text
         *
         * Default implementation when in node.js environment is to
         * color the log level strings
         *
         * @method _preProcessLogText
         * @protected
         *
         * @param {String} level        log level of the log text
         * @param {String} logText      the text string to pre-process
         *
         * @return {String}             pre-processed log string
         *
         */
        _preProcessLogText : function(level, logText) {
            var _u = Logging.Logger.utils;

            if (__isNode !== true) {
                return logText;
            }

            return this._colorText(this._levelNames[level], logText, this._logLevelColor[level]);
        },

        /**
         *
         * TODO Description
         *
         * @method _colorText
         * @protected
         *
         */
        _colorText : function(txt, inStr, colorCode) {
            var _u          = Logging.Logger.utils;
            var coloredTxt  = inStr;

            if (_u.def(colorCode)) {
                var lis         = inStr.length;
                var lt          = txt.length;
                var places      = _u.getIndicesOf(txt, inStr);
                var numPlaces   = places.length;

                if (numPlaces>0) {
                    coloredTxt = '';

                    var idx=0;
                    for(var i=0; i<numPlaces; i++) {
                        idx = places[i];
                        if (i==0) {
                            coloredTxt += inStr.substring(0, idx);
                        }

                        if (i < numPlaces-1){
                            coloredTxt += colorCode + txt + Logging.Logger.colorResetCode;
                            coloredTxt += inStr.substring(idx+lt, places[i+1]);
                        } else {
                            coloredTxt += colorCode + txt + Logging.Logger.colorResetCode;
                            coloredTxt += inStr.substring(idx+lt, lis);
                        }
                    }
                }
            }

            return coloredTxt;
        },

        _prefix  : function(me, level) {
            var _u = Logging.Logger.utils;
            var levelName       = this._levelNames[level];

            //Ensure that all level names have the same length
            var levelNameLength = _u.string(levelName) ? levelName.length : ((levelName + " ").length-1);
            var gap             = Array(this._maxLevelNameLength-levelNameLength+1).join(" ");

            var preFix          = _u.now() + " [" + levelName + gap  + "] ";
            var meLength        = _u.string(me) ? me.length : 0;
            if (meLength > 0) {

                if (meLength < this._minMeLength) {
                    gap = Array(this._minMeLength-meLength+1).join(" ");
                    me  = me + gap;
                } else {
                    if (meLength <= this._maxMeLength) {
                        this._minMeLength = meLength;
                    }
                }

                preFix += me + " : "
            }
            return preFix;
        },

        /**
         * Generic, configurable message.
         *
         * @protected
         * @method _log
         *
         * @param {string} me                   String indicating which entity or method reports this message
         * @param {string} level                String indicating logging level.
         * @param {array} messages              Array of messages to log.
         * @param {object} options              Configuration object.
         * @param {int} options.stackOffset     Number of items in stack trace to skip.
         * @param {int} options.stackLimit      Number of items in stack trace to show.
         */
        _log : function(level, me, messages, options) {
            var _u = Logging.Logger.utils;

            level = level || Logging.Logger.infoLevel;
            var logFunc = _u.ensureFunc(this._logFunc[level]);

            var message = _u.array(messages) && messages.length > 0 ? messages[0] : undefined;

            if ((!_u.string(me)) && (!_u.string(message))) {
                logFunc.apply(console);
                return;
            }

            message = message || "[NO MESSAGE GIVEN]";

            var preFix = this._prefix(me, level);

            // Get stack trace
            var stack = undefined;
            if(level >= this._minStackLevel) {
                var offset = 3, limit = this._stackLimit;
                if(_u.object(options)) {
                    if (_u.int(options.stackOffset)) {
                        offset += options.stackOffset;
                    }
                    if (_u.int(options.limit)) {
                        offset += options.limit;
                    }
                }
                stack = this.getStackTrace(offset,limit);
            }

            var logArgs = messages;
            logArgs.shift(); // remove first message
            if (!_u.object(message)) {
                message = preFix + message;
                message = this._preProcessLogText(level, message);

                logArgs.unshift(message);
            } else {
                logArgs.unshift(message);
                logArgs.unshift(preFix);
            }

            logFunc.apply(console, logArgs);
            if(_u.def(stack)) {
                var stackLogFunc = _u.ensureFunc(this._logFunc[Logging.LoggingLevel.DEBUG]);
                var tracePrefix = this._prefix(me, Logging.Logger.traceLevel);
                stackLogFunc.apply(console, [tracePrefix, stack]);
            }
        }

        /*************************************
         *
         * END PROTECTED METHODS
         *
         *************************************/
    });

    /****************************************
     *
     * STATICS FOR INTERNAL USE
     *
     ****************************************/

    /*** Internal util methods to make the logger class
     *   completely independent ***/
    Logging.Logger.utils = {
        def : function(v) {
            return ((v !== null) && (v !== undefined));
        },

        object : function(o) {
            return (typeof(o) === "object");
        },

        string : function(s) {
            return (typeof(s) === "string");
        },

        ensureFunc : function(f) {
            return (typeof(f) === "function") ? f : function(){};
        },

        array : function(a) {
            var typename = Object.prototype.toString.call(a).slice(8, -1);
            return typename == 'Array';
        },

        int : function(i) {
            return !isNaN(parseFloat(i)) && isFinite(i) && (i % 1 === 0);
        },

        now : function() {
            return (new Date()).getTime();
        },

        getIndicesOf : function(searchStr, str, caseSensitive) {
            var startIndex = 0, searchStrLen = searchStr.length;
            var index, indices = [];

            if (!caseSensitive) {
                str = str.toLowerCase();
                searchStr = searchStr.toLowerCase();
            }

            while ((index = str.indexOf(searchStr, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + searchStrLen;
            }

            return indices;
        }
    };

    Logging.Logger.colorResetCode = '\033[0m';

})();
