/**
 * Created by Freddy on 14/12/14.
 */
(function() {
    var NS              = null;

    var _l              = null;
    var request         = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface      = require("jsface");
        var Class       = jsface.Class;

        _l              = require('../../logger.js').logger;
        request         = require('superagent');

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS              = window.__VI__ || window;

        request         = NS.request || window.request;
    }

    NS.SuperAgentMixin = Class({

        /***************************************************************
         *
         * PROTECTED METHODS
         *
         ***************************************************************/
        /**
         *
         * Method that creates a request so it can be send
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method needs to be overridden by any subclass
         *
         * @method _createRequest
         * @protected
         *
         * @param {String} method       ... HTTP Method name
         * @param {String} url          ... Path to resource
         * @param {Object|null} data    ... data to send
         *
         * @return {Object}             ... request object
         */
        _createRequest : function(method, url, data) {
            var me = this.getName() + "::SuperAgentMixin::_createRequest";

            if (_.hasMethod(request, method)) {
                return request[method](url);
            } else {
                _l.error(me, "Method {0} is not supported, unable to create request".fmt(method));
                return null;
            }
        },

        /**
         *
         * Method that sends requests
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method needs to be overridden by any subclass
         *
         * @method _sendRequest
         * @protected
         *
         * @param {Object} req                          ... Request object.
         *                                                  See {{#crossLink "HTTPAPIClient:_createRequest"}}{{/crossLink}}
         * @param {HTTPAPIClient~ResponseCB} responseCb ... Callback function(data, err) on response
         *
         * @return {Boolean}                            ... True when sending of the request was successful, else false
         *
         */
        _sendRequest : function(req, responseCb) {
            var me      = this.getName() + "::SuperAgentMixin::_sendRequest";
            var success = false;

            if (!_.hasMethod(req, 'end')) {
                _l.error(me, "Request method does not have the expected end method, unable to send request");
                return success;
            }

            req.end(function(err, data) {
                responseCb(data, err);
            });

            success = true;
            return success;
        }
    });
})();
