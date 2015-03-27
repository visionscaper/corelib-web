/**
 * Created by Freddy on 26/03/15.
 */

(function() {
    var NS              = null;

    var _l              = null;
    var _               = null;
    var Class           = null;

    var $               = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        //UNTESTED : Based on Zepto-node
        var Domino  = require('domino');
        var Zepto   = require('zepto-node');

        var _window = Domino.createWindow();

        $           = Zepto(_window);

        _           = require('../../util.js').utils;
        _l          = require('../../logger.js').logger;

        Class       = jsface.Class;

        NS          = exports;
    } else {
        //Add to Visionscapers namespace
        NS          = window.__VI__ || window;

        _           = NS.utils;
        _l          = NS.logger;

        $           = window.$;
        Class       = window.jsface.Class;
    }

    NS.HandlesAuthToken = Class({

        _authToken                      : null,

        /**
         *
         * Mixin that adds functionality to a HTTPAPI to handle authentication tokens.
         *
         * Use set setAuthToken(token) after you have received the auth token using your API
         *
         * @module          corelib-web
         * @class           HandlesAuthToken
         *
         * @for             HTTPAPI
         *
         */

        setAuthToken : function(token) {
            this._authToken = token;
        },

        /***************************************************************
         *
         * PROTECTED METHODS
         *
         ***************************************************************/

        _willSendRequest : function(request) {
            var me  = this.getIName() + "::HandlesAuthToken::_willSendRequest";

            if (!_.string(this._authToken) || _.empty(this._authToken)) {
                _l.debug(me, "No auth token given, not setting auth token in header");
                return;
            }

            if (!this._setRequestHeader(request, "authorization", "Token " + this._authToken)) {
                _l.error(me, "Setting the authentication token in the Authorization header failed, " +
                             "authentication with server will fail for this request");
            }
        }

    });
})();