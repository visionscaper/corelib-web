/**
 *
 * Adds default 'logger' object to the name space
 *
 * Created by Freddy Snijder on 12/12/14.
 */
(function() {
    var NS      = null;
    var Logging = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        NS = exports;

        Logging = require('./logging.js').Logging;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;

        Logging = NS.Logging;
    }

    NS.logger  = new Logging.Logger(Logging.LoggingLevel.DEBUG);
})();
