/**
 * Created by Freddy Snijder on 12/12/14.
 */

(function() {
    var NS          = null;

    var _l          = null;
    var _           = null;
    var Class       = null;
    var NamedBase   = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface  = require("jsface");

        _           = require('../../utils.js').utils;
        _l          = require('../../logger.js').logger;

        Class       = jsface.Class;
        NamedBase   = require("../../base.js").Base;

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window.__VI__ || window;

        _           = NS.utils;
        _l          = NS.logger;
        Class       = window.jsface.Class;
        NamedBase   = NS.NamedBase;
    }

    /**
     *
     * @typedef RequestError
     * @type {object}
     *
     * @property {string} message         message describing the error
     * @property {string} [errorCode]     A code string representing the error
     * @property {*} [originalError]      A reference to the error that resulted in this error
     * @property {number} [status]        HTTP status code
     *
     */

    /**
     *
     * Response callback
     *
     * @callback HTTPAPIClient~ResponseCB
     *
     * @param {Object} data           On success, data send by the server in response of the request
     * @param {RequestError} err      On failure, object describing the error
     * @param {Number} status         Response HTTP status
     *
     */

    NS.HTTPAPIClient = Class(NamedBase, /** @lends HTTPAPIClient.prototype */ {

        _APIURL : null,

        /**
         * @class       An Abstract HTTP API client class, allowing to send HTTP requests to a server.
         *              Actual implementations can be given by sub-classing this class
         *
         * @augments    NamedBase
         *
         * @param {String} APIName        Name of API
         * @param {String} APIURL         Base URL of API
         *
         * @constructs
         *
         */
        constructor: function (APIName, APIURL) {
            var me = "HTTPAPIClient::constructor";
            NS.HTTPAPIClient.$super.call(this, APIName);

            this._valid     = true;

            this._APIURL    = APIURL;
        },

        /**
         *
         * Send Get request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @param {String} resourcePath                   Path to resource to get
         * @param {HTTPAPIClient~ResponseCB} responseCb   Callback function(data, err, status) on response
         *
         * @returns {Boolean}                             true if sending the request was successful else false
         *
         */
        get : function(resourcePath, responseCb) {
            return this.request("get", resourcePath, null, responseCb);
        },

        /**
         *
         * Send Post request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @param {String} resourcePath                    Path to resource to Post
         * @param {Object|null} data                       Data to Post
         * @param {HTTPAPIClient~ResponseCB} responseCb    Callback function(data, err, status) on response
         *
         * @returns {Boolean}                              true if sending the request was successful else false
         *
         */
        post : function(resourcePath, data, responseCb) {
            return this.request("post", resourcePath, data, responseCb);
        },

        /**
         *
         * Send Put request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @param {String} resourcePath                    Path to resource to Put
         * @param {Object|null} data                       Data to Put
         * @param {HTTPAPIClient~ResponseCB} responseCb    Callback function(data, err, status) on response
         *
         * @returns {Boolean}                              true if sending the request was successful else false
         *
         */
        put : function(resourcePath, data, responseCb) {
            return this.request("put", resourcePath, data, responseCb);
        },

        /**
         *
         * Send Delete request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @param {String} resourcePath                   Path to resource to Delete
         * @param {HTTPAPIClient~ResponseCB} responseCb   Callback function(data, err, status) on response
         *
         * @returns {Boolean}                             true if sending the request was successful else false
         *
         */
        del : function(resourcePath, responseCb) {
            return this.request("del", resourcePath, null, responseCb);
        },

        /**
         *
         * Send an HTTP request
         *
         * @param {String} method                         HTTP Method name
         * @param {String} resourcePath                   Path to resource
         * @param {Object|null} data                      Request data to send
         * @param {HTTPAPIClient~ResponseCB} responseCb   Callback function(data, err, status) on response
         *
         * @returns {Boolean}                             true if sending the request was successful else false
         *
         */
        request : function(method, resourcePath, data, responseCb) {
            var me      = this.getName() + "::_request";
            var self    = this;

            var success = false;

            if (!this.isValid()) {
                _l.error(me, "API client is not valid, unable to send [{0}] request".fmt(method));
                return success;
            }

            if (!_.string(resourcePath)) {
                _l.error(me, "No valid resourcePath given, unable to send [{0}] request".fmt(method));
                return success;
            }

            responseCb = _.ensureFunc(responseCb, "Ready callback for request");

            var url = _.joinPaths([this._APIURL, resourcePath]);

            var req = this._createRequest(method, url, data);
            if (!_.obj(req)) {
                _l.error(me, "A problem occurred creating the request, unable to send [{0}] request".fmt(method));
                return success;
            }

            this._willSendRequest(req);

            return this._sendRequest(req, function(data, err, status, headers) {
                if (!_.def(err)) {
                    //SUCCESS
                    //Call _onRequestSuccess with all provided params
                    self._onSuccessResponse.call(self, data, status, headers);
                } else {
                    //ERROR
                    //Call _onRequestError with all provided params
                    self._onErrorResponse.call(self, err, status, headers);
                }

                responseCb(data, err, status);
            });
        },

        /***************************************************************
         *
         * PROTECTED METHODS
         *
         ***************************************************************/

        /***************** METHODS TO OVERRIDE *****************/

        /**
         *
         * Method that creates a request so it can be send
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method needs to be overridden by any subclass
         *
         * @protected
         *
         * @param {String} method         HTTP Method name
         * @param {String} url            Request URL
         * @param {Object|null} data      data to send
         *
         * @return {Object}               request object
         */
        _createRequest : function(method, url, data) {
            var me = this.getName() + "::_createRequest";

            _l.error(me, "Method to create request not implemented. " +
            "Please override this method in order to send requests");

            return null;
        },

        /**
         *
         * Called just before the request is send
         *
         * @param {object} request    request to be sent
         * @protected
         */
        _willSendRequest : function(request) {},

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
         * @param {Object} req                            Request object.
         *                                                  See {{#crossLink "HTTPAPIClient:_createRequest"}}{{/crossLink}}
         * @param {Function} internalResponseCb           Callback function(data, err, status, headers) on response
         *
         * @return {Boolean}                              True when sending of the request was successful, else false
         *
         * @protected
         */
        _sendRequest : function(req, internalResponseCb) {
            var me = this.getName() + "::_sendRequest";

            _l.error(me, "Send request method not implemented yet. " +
            "Please override this method in order to send requests");

            return false;
        },

        /**
         *
         * Method called on response success
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method will be called with any number of parameters given through the responseCb by
         * {{#crossLink "HTTPAPIClient:_sendRequest"}}{{/crossLink}}
         *
         * @method _onSuccessResponse
         * @protected
         *
         * @param {object} data                           Response data
         * @param {number} status                         Response HTTP status
         * @param {Object} headers                        Response headers
         *
         * @protected
         */
        _onSuccessResponse : function(data, status, headers) {},

        /**
         *
         * Method called on error response
         * Used by {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * This method will be called with any number of parameters given through the responseCb by
         * {{#crossLink "HTTPAPIClient:_sendRequest"}}{{/crossLink}}
         *
         * @method _onErrorResponse
         * @protected
         *
         * @param {RequestError} err                      Request error
         * @param {number} status                         Response HTTP status
         * @param {Object} headers                        Response headers
         *
         */
        _onErrorResponse : function(err, status, headers) {}
        /*************** END METHODS TO OVERRIDE ***************/
    });
})();
