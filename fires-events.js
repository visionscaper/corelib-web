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
             if(!_.def(this._handlers) || !_.isArray(this._handlers[event])) {
                 // Nothing to do
                 return;
             }
             for(var i in this._handlers[event]) {
                 this._handlers[event](data);
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
             if(!_.def(this._handlers)) {
                 this._handlers = {};
             }
             if(!_.isArray(this._handlers[event])) {
                 this._handlers[event] = [];
             }
             this._handlers[event].push(func);
         }

        /***************************************************
         *
         * PROTECTED METHODS
         *
         **************************************************/

        

    });
})();
