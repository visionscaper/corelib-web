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

        Class  = window.jsface.Class;
    }

    NS.Base = Class(/** @lends Base.prototype */ {

        _valid: false,

        /**
         *
         * @class   Base class for all classes. It only provides functionality to specify and
         *          assess the validity of instances.
         *
         * @constructs
         *
         */
        constructor: function () {

        },

        /**
         *
         * Assess if instance is valid
         *
         * @returns {boolean}
         */
        isValid: function () {
            return this._valid;
        }

    });

    NS.NamedBase = Class(NS.Base, /** @lends NamedBase.prototype */ {

        _name   : null,

        /**
         *
         * @class       NamedBase class is a Base class with functionality to name instances added to it
         * @augments    Base
         *
         * @constructs
         *
         */
        constructor: function (name) {
            NS.NamedBase.$super.call(this);

            this._name = name || "[UNKNOWN]";
        },

        /**
         *
         * Get the name of the instance
         *
         * @returns {String}
         */
        getName: function() {
            return this._name || "[UNKNOWN]";
        }
    });

})();