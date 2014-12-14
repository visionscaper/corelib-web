/**
 * Created by Freddy on 12/12/14.
 */

(function() {
    var NS          = null;

    var _l          = null;
    var _           = null;
    var NamedBase   = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface  = require("jsface");
        var Class   = jsface.Class;
        Base    = require("../base.js").Base;
        _l      = require('../logger.js').logger;

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window.__VI__ || window;

        _           = NS.utils;
        _l          = NS.logger;
        NamedBase   = NS.NamedBase;
    }

    /**
     *
     * @typedef RequestError
     * @type {object}
     *
     * @property {string} message       ... message describing the error
     * @property {string} [errorCode]   ... A code string representing the error
     * @property {*} [originalError]    ... A reference to the error that resulted in this error
     * @property {number} [status]      ... HTTP status code
     *
     */

    /**
     *
     * Response callback
     *
     * @callback HTTPAPIClient~ResponseCB
     *
     * @param {Object} data         ... On success, data send by the server in response of the request
     * @param {RequestError} err    ... On failure, object describing the error
     *
     */

    NS.HTTPAPIClient = Class(NamedBase, {

        $statics : {
            requiredAPIClientInterface : {
                method : ["get", "post", "put", "del"]
            }
        },

        _APIURL : null,

        /**
         *
         * An Abstract HTTP API client class, allowing to send HTTP requests to a server.
         * Actual implementations can be given by sub-classing this class
         *
         * @Class HTTPAPIClient
         * @constructor
         *
         * @param {String} APIName  ... Name of API
         * @param {String} APIURL   ... Base URL of API
         *
         */
        constructor: function (APIName, APIURL) {
            var me = "HTTPAPIClient::constructor";
            NS.HTTPAPIClient.$super.call(this, APIName);

            this._valid     = true;

            this._APIURL    = APIURL;
            if (!_.url(this._APIURL)) {
                _l.error(me, "Given API URL is not valid, HTTP API Client will not function properly");
                this._valid = false;
            }
        },

        /**
         *
         * Send Get request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @method get
         *
         * @param {String} resourcePath                 ... Path to resource to get
         * @param {HTTPAPIClient~ResponseCB} responseCb ... Callback function(data, err) on response
         *
         * @returns {Boolean}                           ... true if sending the request was successful else false
         *
         */
        get : function(resourcePath, responseCb) {
            return this._request("get", resourcePath, null, responseCb);
        },

        /**
         *
         * Send Post request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @method post
         *
         * @param {String} resourcePath                  ... Path to resource to Post
         * @param {Object|null} data                     ... Data to Post
         * @param {HTTPAPIClient~ResponseCB} responseCb  ... Callback function(data, err) on response
         *
         * @returns {Boolean}                            ... true if sending the request was successful else false
         *
         */
        post : function(resourcePath, data, responseCb) {
            return this._request("post", resourcePath, data, responseCb);
        },

        /**
         *
         * Send Put request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @method put
         *
         * @param {String} resourcePath                  ... Path to resource to Put
         * @param {Object|null} data                     ... Data to Put
         * @param {HTTPAPIClient~ResponseCB} responseCb  ... Callback function(data, err) on response
         *
         * @returns {Boolean}                            ... true if sending the request was successful else false
         *
         */
        put : function(resourcePath, data, responseCb) {
            return this._request("put", resourcePath, data, responseCb);
        },

        /**
         *
         * Send Delete request. Also see {{#crossLink "HTTPAPIClient:request"}}{{/crossLink}}
         *
         * @method del
         *
         * @param {String} resourcePath                 ... Path to resource to Delete
         * @param {HTTPAPIClient~ResponseCB} responseCb ... Callback function(data, err) on response
         *
         * @returns {Boolean}                           ... true if sending the request was successful else false
         *
         */
        del : function(resourcePath, responseCb) {
            return this._request("del", resourcePath, null, responseCb);
        },

        /**
         *
         * Send an HTTP request
         *
         * @method request
         *
         * @param {String} method                       ... HTTP Method name
         * @param {String} resourcePath                 ... Path to resource
         * @param {Object|null} data                    ... Request data to send
         * @param {HTTPAPIClient~ResponseCB} responseCb ... Callback function(data, err) on response
         *
         * @returns {Boolean}                           ... true if sending the request was successful else false
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

            var url = _.joinPaths([this._baseURLPath, resourcePath]);

            var req = this._createRequest(method, url, data);
            if (!_.obj(req)) {
                _l.error(me, "A problem occurred creating the request, unable to send [{0}] request".fmt(method));
                return success;
            }

            return this._sendRequest(req, function(data, err) {
                var argList = Array.prototype.slice.call(arguments, 0);

                if (!_.def(err)) {
                    //SUCCESS
                    //Call _onRequestSuccess with all provided params
                    self._onSuccessResponse.apply(self, argList);
                } else {
                    //ERROR
                    //Call _onRequestError with all provided params
                    self._onErrorResponse.apply(self, argList);
                }

                responseCb(data, null);
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
         * @method _createRequest
         * @protected
         *
         * @param {String} method       ... HTTP Method name
         * @param {String} url          ... Request URL
         * @param {Object|null} data    ... data to send
         *
         * @return {Object}             ... request object
         */
        _createRequest : function(method, url, data) {
            var me = this.getName() + "::_createRequest";

            _l.error(me, "Method to create request not implemented. " +
                         "Please override this method in order to send requests");

            return null;
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
         * {{#crossLink "HTTPAPIClient:_sendRequest"}}{{/crossLink}}
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
        /*************** END METHODS TO OVERRIDE ***************/
    });
})();
