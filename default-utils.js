/**
 *
 * Augments Underscore with own utils and adds it to the name space
 *
 * Created by Freddy on 12/12/14.
 */
(function() {
    var me  = "DefaultUtils";

    var NS  = null;

    var _u  = null;
    var _l  = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        NS = exports;

        _l = require('./default-logger.js').logger;
        _u = require('underscore')._;

        require('./utils/utils-base.js').UtilsBase.addTo(_u, _l);
        require('./utils/utils-execution.js').UtilsExecution.addTo(_u, _l);
        require('./utils/utils-strings.js').UtilsStrings.addTo(_u, _l);
    } else {
        //Add to Visionscapers namespace
        NS = window.__VI__ || window;

        _u = NS._ || window._;
        _l = NS.logger;

        var __isOk = function(u) {
            return ((typeof u == "object") && (typeof u.addTo == "function"));
        };

        if (__isOk(NS.UtilsBase)) {
            NS.UtilsBase.addTo(_u, _l);
        } else {
            _l.error(me, "Namespace does not contain valid UtilsBase utility extender, " +
                         "unable to extend utils object with base utils");
        }

        if (__isOk(NS.UtilsExecution)) {
            NS.UtilsExecution.addTo(_u, _l);
        } else {
            _l.error(me, "Namespace does not contain valid UtilsExecution utility extender, " +
                         "unable to extend utils object with execution utils");
        }

        if (__isOk(NS.UtilsStrings)) {
            NS.UtilsStrings.addTo(_u, _l);
        } else {
            _l.error(me, "Namespace does not contain valid UtilsStrings utility extender, " +
                         "unable to extend utils object with string utils");
        }
    }

    NS.utils = _u;
})();
