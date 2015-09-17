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

    NS.Base = Class({

        _valid: false,

        /**
         *
         * Base class for all classes. It only provides functionality to specify and
         * assess the validity of instances.
         *
         * @module  corelib-web
         * @class   Base
         *
         * @constructor
         *
         */
        constructor: function () {

        },

        /**
         *
         * Assess if instance is valid
         *
         * @method isValid
         *
         * @returns {boolean}
         */
        isValid: function () {
            return this._valid;
        }

    });

    NS.NamedBase = Class(NS.Base, /** @lends NamedBase.prototype */ {

        _instanceName   : null,

        /**
         *
         * NamedBase class is a Base class with functionality to name instances added to it
         *
         * @module      corelib-web
         * @class       NamedBase
         * @extends     Base
         *
         * @constructor
         *
         */
        constructor: function (name) {
            NS.NamedBase.$super.call(this);

            this._instanceName = name || "[UNKNOWN]";
        },

        /**
         *
         * Get the name of the instance
         *
         * @method getIName
         *
         * @returns {String}
         */
        getIName: function() {
            return this._instanceName || "[UNKNOWN]";
        },

        toString : function() {
            return this.getIName();
        }
    });

})();