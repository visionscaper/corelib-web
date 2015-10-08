/**
 * Created by Freddy Snijder on 16/05/14.
 */


(function() {
    var NS      = null;
    var Class   = null;

    var _               = null;
    var _l              = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface = require("jsface");
        var Class  = jsface.Class;

        _               = require('./utils.js').utils;
        _l              = require('./logger.js').logger;

        //var extend = jsface.extend;

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;

        _               = NS.utils;
        _l              = NS.logger;

        Class  = window.jsface.Class;
    }

    var instanceCounter = -1;

    NS.Base = Class({

        _valid          : false,

        /**
         *
         * ID of instance
         *
         * @private
         *
         */
        __instanceID    : null,

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
            instanceCounter++;
            this.__instanceID = instanceCounter;
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
        },

        getInstanceID : function() {
            return this.__instanceID
        },

        toString : function() {
            return "Instance (ID{0})".fmt(this.__instanceID);
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

            if (!_.string(name) || _.empty(name)) {
                _l.error("NamedBase::constructor", "Given instance name is not a string, changing to '[INVALID NAME]'");
                name = "[INVALID NAME]";
            }

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
            return "{0} (ID{1})".fmt(this.getIName(), this.getInstanceID());
        }
    });

})();