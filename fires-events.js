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
         * FiresEvents Mixin. Adds the methods 'event' to fire events and the
         * method 'on' to attach handlers for those events.
         *
         * @class   Configurable
         * @module  M*C
         *
         */

         _handlers: undefined,

         /**
          * Fire a specific event and call all registered functions for that
          * event.
          * @param {string} event Event name
          * @param {object} data Event-specific data that should be passed to
          * all registered functions.
          * @returns {undefined}
          */
         event: function(event, data) {
             var handlerList = _.obj(this._handlers) ? this._handlers[event] : null;
             if(!_.isArray(handlerList)) {
                 // Nothing to do
                 return;
             }

             var i = handlerList.length;
             while (i--) {
                 handlerList[i](data);
             }
         },
         
         /**
          * Add a function to handle a specific event.
          * @param {string} event Event name
          * @param {function} func A function that takes an object of event data 
          * as an argument.
          * @returns {undefined}
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
         }

        /***************************************************
         *
         * PROTECTED METHODS
         *
         **************************************************/

        

    });
})();
