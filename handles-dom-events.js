/**
 *
 * Mixin as helper to easily add and remove instance methods as DOM event listeners
 *
 * Created by Freddy on 04/10/15.
 *
 */

(function() {

    //Add to Visionscapers namespace
    var NS              = window.__VI__ || window;

    var _               = NS.utils;
    var _l              = NS.logger;
    var Class           = window.jsface.Class;

    var DataMap         = NS.DataMap;

    NS.HandlesDOMEvents = Class({

        _DOMEventListeners  : null,

        /***************************************************
         *
         * PROTECTED METHODS
         *
         **************************************************/

        /**
         *
         * See addEventListener, e.g. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
         *
         * The difference is that method will be bound to this and saved in a lis such that it can be easily removed
         * when called removeDOMListener
         *
         * @param {object} DOMElement           DOM element to which we want to listen to for event type
         *
         * @param {string} type                 Event type
         * @param {string} methodName           Method name of this instance that should act as listener
         * @param {boolean} [useCapture]
         * @param {boolean} [wantsUntrusted]
         *
         */
        _addDOMEventListener : function(DOMElement, type, methodName, useCapture, wantsUntrusted) {
            var iName   = _.exec(this, "getIName") || "[UNKNOWN INSTANCE]";
            var me      = "[{}]HandlesDOMEvents::_addDOMEventListener".fmt(iName);

            var typeValid       = _.string(type) && !_.empty(type);
            var methodNameValid = _.string(methodName) && !_.empty(methodName);

            var method          = methodNameValid ? this[methodName] : null;
            var methodExists    = _.func(method);

            var safeMethodName  = methodNameValid ? methodName : "[UNKNOWN METHOD]";
            var safeType        = typeValid ? type : "[UNKNOWN EVENT TYPE]";

            if (!typeValid) {
                _l.error(me, ("No valid event type given, " +
                              "unable to add method [{0}] as DOM event listener").fmt(safeMethodName));
                return;
            }

            if (!methodNameValid) {
                _l.error(me, ("No valid method name given, " +
                              "unable to add method as [{0}] DOM event listener").fmt(safeType));
                return;
            }

            if (!_.hasMethod(DOMElement, "addEventListener")) {
                _l.error(me, ("No valid DOM element provided, " +
                              "unable to add method [{0}] as [{1}] DOM event listener").fmt(safeMethodName, safeType));
                return;
            }

            if (!methodExists) {
                _l.error(me, ("This instance had no method named [{0}], " +
                              "unable to add method as [{1}] DOM event listener").fmt(safeMethodName, safeType));
                return;
            }

            this._llTryInitDOMEventListeners(DOMElement, type);

            var boundMethod = method.bind(this);
            DOMElement.addEventListener(type, boundMethod, useCapture, wantsUntrusted);

            //Register bound method to find it back later on so we are able to remove it as listener from DOM element
            this._DOMEventListeners.get(DOMElement)[type][methodName] = boundMethod;
        },

        /**
         *
         * See addEventListener, e.g. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
         *
         * The listener function listening to DOMElement for event type, with name methodName, will be retrieved
         *  and removed as listener from the DOMElement
         *
         * @param {object} DOMElement           DOM element to which we want to listen to for event type
         *
         * @param {string} type                 Event type
         * @param {string} methodName           Method name of this instance that should act as listener
         * @param {boolean} [useCapture]
         *
         */
        _removeDOMEventListener : function(DOMElement, type, methodName, useCapture) {
            var iName   = _.exec(this, "getIName") || "[UNKNOWN INSTANCE]";
            var me      = "[{}]HandlesDOMEvents::_removeDOMEventListener".fmt(iName);

            var typeValid       = _.string(type) && !_.empty(type);
            var methodNameValid = _.string(methodName) && !_.empty(methodName);

            var safeMethodName  = methodNameValid ? methodName : "[UNKNOWN METHOD]";
            var safeType        = typeValid ? type : "[UNKNOWN EVENT TYPE]";

            if (!typeValid) {
                _l.error(me, ("No valid event type given, " +
                              "unable to remove method [{0}] as DOM event listener").fmt(safeMethodName));
                return;
            }

            if (!methodNameValid) {
                _l.error(me, ("No valid method name given, " +
                              "unable to remove method as [{0}] DOM event listener").fmt(safeType));
                return;
            }

            if (!_.hasMethod(DOMElement, "removeEventListener")) {
                _l.error(me, ("No valid DOM element provided, " +
                              "unable to remove method [{0}] as [{1}] DOM event listener").fmt(safeMethodName, safeType));
                return;
            }

            this._llTryInitDOMEventListeners(DOMElement, type);

            //Retrieve the bound method and unregister it as listener from the DOM element
            var boundMethod = this._DOMEventListeners.get(DOMElement)[type][methodName];
            DOMElement.removeEventListener(type, boundMethod, useCapture);
        },

        _llTryInitDOMEventListeners : function(DOMElement, eventName) {
            if(!_.obj(this._DOMEventListeners)) {
                this._DOMEventListeners = new DataMap();
            }
            if(!_.obj(this._DOMEventListeners.get(DOMElement))) {
                this._DOMEventListeners.set(DOMElement, {});
            }

            var listeners = this._DOMEventListeners.get(DOMElement);
            if (!_.obj(listeners[eventName])) {
                listeners[eventName] = {};
            }
        }
    });

})();

