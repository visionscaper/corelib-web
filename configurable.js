/**
 * Created by Freddy Snijder on 13/01/15.
 */

(function() {

    //Add to Visionscapers namespace
    var NS              = null;

    var _               = null;
    var _l              = null;
    var Class           = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface      = require("jsface");

        _               = require('./utils.js').utils;
        _l              = require('./logger.js').logger;

        Class           = jsface.Class;

        NS              = exports;
    } else {
        //Add to Visionscapers namespace
        NS              = window.__VI__ || window;

        _               = NS.utils;
        _l              = NS.logger;

        Class           = window.jsface.Class;
    }

    NS.Configurable = Class({

        /**
         *
         * Configurable Mixin. Adds a protected method _addConfigProperties(config).
         * This method adds properties in a config object to the instance of the class
         * that uses this mixin.
         *
         * Every config <property> is stored as _<property> (with underscore in front) in the instance.
         *
         * @class   Configurable
         * @module  M*C
         *
         */

        /***************************************************
         *
         * PROTECTED METHODS
         *
         **************************************************/

        /**
         *
         * Adds properties in object Config to the instance as _<property> or
         *  overwrites the existing value of _<property>.
         *
         * @param {Object} config       Object that contains properties to add to the instance
         * @param {Object} defaults     Object that contains default values for undefined config properties.
         * @protected
         *
         */
        _addConfigProperties : function(config, defaults) {
            var me = "[{0}]Configurable::_addConfigProperties".fmt(_.exec(this, 'getIName') || '[UNKOWN]');

            // Copy config properties
            if (_.obj(config)) {
                var props = Object.getOwnPropertyNames(config);
                for (var propIdx in props) {
                    var prop            = props[propIdx];
                    var instanceProp    = "_" + prop;

                    var instancePropVal = this[instanceProp];
                    var isEqual         = instancePropVal === config[prop];
                    if (!isEqual) {
                        if (instancePropVal !== undefined) {
                            _l.debug(me, "Overwriting the existing value of property {0}".fmt(instanceProp))
                        }

                        this[instanceProp] = config[prop];
                    }
                }
            }
            
            // Set defaults for undefined properties
            if (_.obj(defaults)) {
                var props = Object.getOwnPropertyNames(defaults);
                for (var propIdx in props) {
                    var prop            = props[propIdx];
                    var instanceProp    = "_" + prop;

                    if (this[instanceProp] === undefined) {
                        this[instanceProp] = defaults[prop];
                    }
                }
            }
        }

    });
})();
