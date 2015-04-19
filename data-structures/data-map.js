/**
 * Created by Freddy on 19/04/15.
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

    NS.DataMap = Class({

        _keys   : null,
        _values : null,

        /**
         *
         * Simulates a Map data structure, allowing any value (including object instances) as key.
         *
         * Based on http://stackoverflow.com/a/20515918/889617
         *
         * @module  corelib-web
         * @class   Map
         *
         * @constructor
         *
         */
        constructor: function () {
            //TODO : initialize from list of keys and values
            this._keys      = [];
            this._values    = [];
        },

        set : function(key, value) {
            var index = this._keys.indexOf(key);
            if (index < 0) {
                this._keys.push(key);
                this._values.push(value);
            } else {
                this._values[index] = value;
            }
        },

        get : function(key) {
            var value = undefined;
            var index = this._keys.indexOf(key);

            if (index >= 0) {
                value = this._values[index];
            }


            return value;
        },

        remove : function(key) {
            var value = undefined;
            var index = this._keys.indexOf(key);

            if (index >= 0) {
                value = this._values[index];

                this._values.splice(index, 1);
                this._keys.splice(index, 1);
            }

            return value;
        },

        getAllKeys : function() {
            return this._keys.slice(0);
        }

    });

})();