/**
 * Created by Freddy on 15/05/14.
 */

(function() {
    var NS = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface = require("jsface");
        var Class  = jsface.Class;
        //var extend = jsface.extend;

        require("./extensions/string.ext.js");

        NS = exports;

    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;
    }

    //Using this to set the Logger static props
    NS.LoggerLevel = {
        NO_LOGGING    : 100,
        ERROR         : 4,
        WARN          : 3,
        INFO          : 2,
        DEBUG         : 1
    };

    NS.Logger = Class({

        $statics        : {
            noLogging       : NS.LoggerLevel.NO_LOGGING,
            errorLevel      : NS.LoggerLevel.ERROR,
            warnLevel       : NS.LoggerLevel.WARN,
            infoLevel       : NS.LoggerLevel.INFO,
            debugLevel      : NS.LoggerLevel.DEBUG
        },

        _logLevel       : NS.LoggerLevel.WARN,

        // See _setLogLevelNames
        _levelNames         : {},
        _maxLevelNameLength : 0,

        //See _setLogFunctions
        _logFunc        : {},

        //Used for node.js, see _setLogLevelColors
        _logLevelColor  : {},

        constructor : function(level) {
            var me = "Logger::constructor";
            var _u = NS.Logger.utils;

            this._setLogLevelNames();
            this._setLogFunctions();
            this._setLogLevelColors();

            if (!_u.def(level)) {
                console.log("{0} : no logging level given, setting log-level to warn".fmt(me));
                level = NS.LoggerLevel.WARN;
            }

            if (!_u.def(this._logFunc[level])) {
                console.log("{0} : level {1} unknown, setting log-level to warn".fmt(me, level));
                level = NS.LoggerLevel.WARN;
            }

            this._logLevel = level;
        },

        setLogLevel : function(level) {
            var me = "Logger::setLogLevel";
            var _u = NS.Logger.utils;

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
            if (this._logLevel > NS.Logger.errorLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(NS.Logger.errorLevel);

            this._log.apply(this, args);
        },

        warn : function(me, message) {
            if (this._logLevel > NS.Logger.warnLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(NS.Logger.warnLevel);

            this._log.apply(this, args);
        },

        info : function(me, message) {
            if (this._logLevel > NS.Logger.infoLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(NS.Logger.infoLevel);

            this._log.apply(this, args);
        },

        debug : function(me, message) {
            if (this._logLevel > NS.Logger.debugLevel) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(NS.Logger.debugLevel);

            this._log.apply(this, args);
        },

        /*************************************
         *
         * PROTECTED METHODS
         *
         *************************************/

        _setLogLevelNames   : function() {
            this._levelNames[NS.Logger.noLogging]      = "NO LOGGING";
            this._levelNames[NS.Logger.errorLevel]     = "ERROR";
            this._levelNames[NS.Logger.warnLevel]      = "WARNING";
            this._levelNames[NS.Logger.infoLevel]      = "INFO";
            this._levelNames[NS.Logger.debugLevel]     = "DEBUG";

            this._maxLevelNameLength = 0;
            var levels = Object.getOwnPropertyNames(this._levelNames);
            for (var idx in levels) {
                var level = levels[idx];

                //Don't look at level name length of NS.Logger.noLogging
                if (level == NS.Logger.noLogging) {
                    continue;
                }

                var l = this._levelNames[level].length;
                if (l > this._maxLevelNameLength) {
                    this._maxLevelNameLength = l;
                }
            }
        },

        _setLogFunctions    : function() {
            this._logFunc[NS.Logger.noLogging]         = function() {};
            this._logFunc[NS.Logger.errorLevel]        = console.error || console.log;
            this._logFunc[NS.Logger.warnLevel]         = console.warn || console.log;
            this._logFunc[NS.Logger.infoLevel]         = console.info || console.log;
            this._logFunc[NS.Logger.debugLevel]        = console.debug || console.log;
        },

        _setLogLevelColors  : function() {
            this._logLevelColor[NS.Logger.errorLevel]  = '\033[45m'; //Magenta
            this._logLevelColor[NS.Logger.warnLevel]   = '\033[46m'; //Cyan
            this._logLevelColor[NS.Logger.infoLevel]   = '\033[42m'; //Green
        },

        /**
         *
         * Allows pre-processing of log text
         *
         * Default implementation when in node.js environment is to
         * color the log level strings
         *
         * @param {String} level    ... log level of the log text
         * @param {String} logText  ... the text string to pre-process
         *
         * @return {String}         ... pre-processed log string
         *
         * @protected
         */
        _preProcessLogText : function(level, logText) {
            var _u = NS.Logger.utils;

            if (__isNode !== true) {
                return logText;
            }

            return this._colorText(this._levelNames[level], logText, this._logLevelColor[level]);
        },

        _colorText : function(txt, inStr, colorCode) {
            var _u          = NS.Logger.utils;
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
                            coloredTxt += colorCode + txt + NS.Logger.colorResetCode;
                            coloredTxt += inStr.substring(idx+lt, places[i+1]);
                        } else {
                            coloredTxt += colorCode + txt + NS.Logger.colorResetCode;
                            coloredTxt += inStr.substring(idx+lt, lis);
                        }
                    }
                }
            }

            return coloredTxt;
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
            var _u = NS.Logger.utils;

            level = level || NS.Logger.infoLevel;
            message = message || "[NO MESSAGE GIVEN]";

            var levelName       = this._levelNames[level];
            var levelNameLength = _u.string(levelName) ? levelName.length : ((levelName + " ").length-1);

            //Ensure that all level names have the same length
            var gap             = Array(this._maxLevelNameLength-levelNameLength+1).join(" ");

            var preFix          = _u.now() + " [" + levelName + gap  + "] ";
            if (_u.string(me) && (me.length > 0)) {
                preFix += me + " : "
            }

            message = preFix + message;
            message = this._preProcessLogText(level, message);

            var logArgs = Array.prototype.slice.call(arguments, 3);
            logArgs.unshift(message);

            var logFunc = _u.ensureFunc(this._logFunc[level]);
            logFunc.apply(console, logArgs);
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
    NS.Logger.utils = {
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

    NS.Logger.colorResetCode = '\033[0m';

})();