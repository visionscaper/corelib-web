/**
 * Created by Freddy Snijder on 16/05/14.
 */


(function() {
    var NS      = null;
    var Class   = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface = require("jsface");
        var Class  = jsface.Class;
        //var extend = jsface.extend;

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;

        var Class  = window.jsface.Class;
    }


    NS.Base = Class({

        _valid: false,

        constructor: function () {

        },

        isValid: function () {
            return this._valid;
        }

    });

    NS.NamedBase = Class(NS.Base, {

        _name   : null,

        constructor: function (name) {
            NS.NamedBase.$super.call(this);

            this._name = name || "[UNKNOWN]";
        },

        getName: function() {
            return this._name || "[UNKNOWN]";
        }
    });

})();