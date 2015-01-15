/**
 * Created by Freddy on 16/05/14.
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

        Class  = window.jsface.Class;
    }

    /**
     *
     * Base class for all classes
     *
     * The Base class only provides functionality to specify and assess the validity of instances.
     *
     * @class Base
     * @module corelib-web
     *
     */
    NS.Base = Class({

        _valid: false,

        constructor: function () {

        },

        isValid: function () {
            return this._valid;
        }

    });

    /**
     *
     * NamedBase class is a Base class with functionality to name instances added to it
     *
     * @class NamedBase
     * @module corelib-web
     *
     */
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