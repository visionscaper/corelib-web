/**
 * Created by Freddy Snijder on 13/01/15.
 */

(function() {

    //Add to Visionscapers namespace
    var NS          = window.__VI__ || window;

    var _           = NS.utils;
    var _l          = NS.logger;
    var Class       = window.jsface.Class;

    NS.FiresEvents = Class({

        /**
         *
         * FiresEvents Mixin. Adds the methods :
         *  - 'fire' to fire events,
         *  - 'on' to attach handlers for those events.
         *  - 'onAnyEvent' to attach global event handler, called for any event
         *
         * @class   Configurable
         * @module  CoreLibWeb
         *
         */

        _handlers       : undefined,
        _globalHandlers : undefined,

        /**
         * Add a function to handle a specific event.
         *
         * @param {string} event    Event name
         * @param {function} func   A function that takes an object of event data
         *                          as an argument.
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

            this._llTryInitEventHandlers(event);

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

            this._llTryInitGlobalHandlers();

            this._globalHandlers.push(func);
            return (success = true);
        },

        /**
         *
         * Checks if function func is listed as a handler for event
         * If no event value is given, it is checked if the given func is a global listener
         *
         * @param {function} func
         * @param {string} [event=null]
         *
         * @returns {boolean}   True when function is listed as listener, else false
         *
         */
        hasListener : function(func, event) {
            var iName   = _.exec(this, "getIName") || "UNKNOWN INSTANCE";
            var me      = "[{0}]FiresEvents::hasListener".fmt(iName);

            if (!_.func(func)) {
                return false;
            }

            var isGlobal = !_.def(event);

            var idx = -1;
            if (isGlobal) {
                this._llTryInitGlobalHandlers();

                idx = this._globalHandlers.indexOf(func);
            } else {
                this._llTryInitEventHandlers(event);

                idx = this._handlers[event].indexOf(func);
            }

            return (idx >= 0);
        },

        /**
         *
         * Removes handler func for event
         * If no event value is given, func is assumed to be a global handler.
         * In this case it is removed from the global handler list
         *
         * @param {function} func
         * @param {string} [event=null]
         *
         * @returns {boolean}   True on remove success, else false
         *
         */
        removeListener : function(func, event) {
            var iName   = _.exec(this, "getIName") || "UNKNOWN INSTANCE";
            var me      = "[{}]FiresEvents::removeListener".fmt(iName);

            var success = false;

            if (!_.func(func)) {
                _l.error(me, ("Given event handler is not a function, " +
                              "unable to remove handler for event [{0}]").fmt(event));
                return success;
            }

            var isGlobal = !_.def(event);

            var idx = -1;
            if (isGlobal) {
                this._llTryInitGlobalHandlers();

                idx = this._globalHandlers.indexOf(func);

                if (idx >= 0) {
                    this._globalHandlers.splice(idx, 1);
                }
            } else {
                this._llTryInitEventHandlers(event);

                idx = this._handlers[event].indexOf(func);
                if (idx >= 0) {
                    this._handlers[event].splice(idx, 1);
                }
            }

            return (success = (idx >= 0));
        },

        /***************************************************
         *
         * PROTECTED METHODS
         *
         **************************************************/

        /**
         *
         * Fire a specific event and call all registered handlers for that event.
         *
         * NOTE : Any additional arguments (other then event and data) are passed to the registered handlers.
         *
         * @param {string} event                Event name
         * @param {object} data                 Event-specific data that should be passed to all registered handler.
         *
         * @returns {undefined}
         *
         */
        _fire: function(event, data) {
            //Not very DRY, but fast.

            var args = [].slice.call(arguments);

            //Inform global event handlers
            var handlerList = this._globalHandlers;
            if(_.isArray(handlerList)) {
                var i = handlerList.length;
                while (i--) {
                    handlerList[i].apply(null, args);
                }
            }

            //Specific event handlers first, after that the global event handlers are called
            handlerList = _.obj(this._handlers) ? this._handlers[event] : null;
            if(!_.isArray(handlerList)) {
                // Nothing to do
                return;
            }

            //Remove event
            args.shift();

            i = handlerList.length;
            while (i--) {
                handlerList[i].apply(null, args);
            }
        },

        _llTryInitEventHandlers : function(event) {
            if(!_.obj(this._handlers)) {
                this._handlers = {};
            }
            if(!_.isArray(this._handlers[event])) {
                this._handlers[event] = [];
            }
        },

        _llTryInitGlobalHandlers : function() {
            if(!_.array(this._globalHandlers)) {
                this._globalHandlers = [];
            }
        }

    });
})();
