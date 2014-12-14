/**
 * Created by Freddy on 14/12/14.
 */
(function() {
    var NS              = null;

    var _l              = null;
    var request         = null;

    var HTTPAPIClient   = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface      = require("jsface");
        var Class       = jsface.Class;

        _l              = require('../logger.js').logger;
        request         = require('superagent');

        HTTPAPIClient   = require('./services/http-api-client.js').logger;

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS              = window.__VI__ || window;

        request         = NS.request || window.request;
        HTTPAPIClient   = NS.HTTPAPIClient;
    }

    NS.SAAPIClient = Class(HTTPAPIClient, {

        constructor: function (APIName, APIURL) {
            var me = "SAAPIClient::constructor";
            HTTPAPIClient.$super.call(this, APIName, APIURL);

            if (!_.adheresToInterface(request, HTTPAPIClient.requiredAPIClientInterface)) {
                _l.error(me, "Super agent request object does not conform to expected interface");
                this._valid = false;
            }
        },

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
            var me = this.getName() + "::SAAPIClient::_createRequest";

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
            var me      = this.getName() + "::SAAPIClient::_sendRequest";
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
        },

        /**
         *
         * Method called on response success
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method will be called with any number of parameters given through the responseCb by
         * {{#crossLink "SAAPIClient:_sendRequest"}}{{/crossLink}}
         *
         * @method _onSuccessResponse
         * @protected
         *
         * @param {String} data                         ... Response data
         *
         */
        _onSuccessResponse : function(data) {
            var me = this.getName() + "::_llRequest";
            _l.warn(me, "No implementation provided on request success. At least provide empty method");
        },

        /**
         *
         * Method called on error response
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method will be called with any number of parameters given through the responseCb by
         * {{#crossLink "SAAPIClient:_sendRequest"}}{{/crossLink}}
         *
         * @method _onErrorResponse
         * @protected
         *
         * @param {RequestError} err                    ... Request error
         *
         */
        _onErrorResponse : function(err) {
            var me = this.getName() + "::_onErrorResponse";
            _l.warn(me, "No implementation provided on request success. At least provide empty method");
        }
    });
})();
