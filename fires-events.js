/**
 * Created by Freddy Snijder on 13/01/15.
 */

(function() {

    //Add to Visionscapers namespace
    var NS          = window.__VI__ || window;

    var _           = NS.utils;
    var _l          = NS.logger;
    var Class       = window.jsface.Class;
    var NamedBase   = NS.NamedBase;

    NS.FiresEvents = Class({

        /**
         *
         * FiresEvents Mixin. Adds the methods :
         *  - 'fire' to fire events,
         *  - 'on' to attach handlers for those events.
         *  - 'onAnyEvent' to attach global event handler, called for any event
         *
         * @class   Configurable
         * @module  M*C
         *
         */

        _handlers       : undefined,
        _globalHandlers : undefined,

        /**
         * Fire a specific event and call all registered functions for that
         * event.
         * @param {string} event Event name
         * @param {object} data Event-specific data that should be passed to
         * all registered functions.
         * @returns {undefined}
         */
        fire: function(event, data) {
            //Not very DRY, but fast.

            //Specific event handlers first, after that the global event handlers are called
            var handlerList = _.obj(this._handlers) ? this._handlers[event] : null;
            if(!_.isArray(handlerList)) {
                // Nothing to do
                return;
            }

            var i = handlerList.length;
            while (i--) {
                handlerList[i](data);
            }

            //Inform global event handlers
            handlerList = this._globalHandlers;
            if(!_.isArray(handlerList)) {
                // Nothing to do
                return;
            }

            i = handlerList.length;
            while (i--) {
                handlerList[i](event, data);
            }
        },

        /**
         * Add a function to handle a specific event.
         * @param {string} event    Event name
         * @param {function} func   A function that takes an object of event data
         * as an argument.
         *
         * @returns {boolean}
         */
        on: function(event, func) {
            var iName   = _.exec(this, "getIName") || "UNKNOWN INSTANCE";
            var me      = "[{}]FiresEvents::on".fmt(iName);

            var success = false;

            if (_.empty(event)) {
                _l.error(me, ("Given event name is not valid, " +
                "unable to add handler for event").fmt(event));
                return success;
            }
            if (!_.func(func)) {
                _l.error(me, ("Given event handler is not a function, " +
                "unable to add handler for event [{0}]").fmt(event));
                return success;
            }

            if(!_.obj(this._handlers)) {
                this._handlers = {};
            }
            if(!_.isArray(this._handlers[event])) {
                this._handlers[event] = [];
            }

            this._handlers[event].push(func);
            return (success = true);
        },

        /**
         * Add a global handler to handle any fired event
         *
         * @param {function} func   function(event, eventData)
         *
         * @returns {Boolean}       True on success, else false
         */
        onAnyEvent : function(func) {
            var iName   = _.exec(this, "getIName") || "UNKNOWN INSTANCE";
            var me      = "[{0}]::FiresEvents::onAnyEvent".fmt(iName);

            var success = false;

            if (!_.func(func)) {
                _l.error(me, "Given global event handler is not a function, " +
                              "unable to add global handler");

                return success;
            }

            if(!_.array(this._globalHandlers)) {
                this._globalHandlers = [];
            }

            this._globalHandlers.push(func);
            return (success = true);
        }

        /***************************************************
         *
         * PROTECTED METHODS
         *
         **************************************************/

    });
})();
