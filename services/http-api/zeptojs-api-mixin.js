/**
 * Created by Freddy Snijder on 14/12/14.
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

    NS.ZeptoJSAPIMixin = Class({

        /**
         *
         * Mixin to implement HTTPAPI with the ZeptoJS library
         * Uses JSON as content type
         *
         * @module          corelib-web
         * @class           ZeptoJSAPIMixin
         *
         * @for             HTTPAPI
         *
         */

        $statics : {

            getResponseHeaders : function(xhr) {
                var me      = "ZeptoJSAPIMixin::getResponseHeaders";
                var headers = null;

                if (!_.hasMethod(xhr, 'getAllResponseHeaders')) {
                    _l.error(me, "XHR object is not valid, unable to get response headers");
                    return headers;
                }

                var headerStr = xhr.getAllResponseHeaders();

                //From https://github.com/visionmedia/superagent
                var lines = headerStr.split(/\r?\n/);
                var index;
                var line;
                var field;
                var val;

                headers = {};

                lines.pop(); // trailing CRLF

                for (var i = 0, len = lines.length; i < len; ++i) {
                    line = lines[i];
                    index = line.indexOf(':');
                    field = line.slice(0, index).toLowerCase();
                    val = _.trim(line.slice(index + 1));
                    headers[field] = val;
                }

                return headers;
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
         * Used by {{#crossLink "HTTPAPI:request"}}{{/crossLink}}
         *
         * This method needs to be overridden by any subclass
         *
         * @method _createRequest
         * @protected
         *
         * @param {String} method           HTTP Method name
         * @param {String} url              Path to resource
         * @param {Object|null} data        data to send
         *
         * @return {Object}                 request object
         */
        _createRequest : function(method, url, data) {
            var me = this.getIName() + "::ZeptoJSAPIMixin::_createRequest";

            if (_.string(method)) {
                method = method.toLowerCase();
                if (method == "del") {
                    method = "delete";
                }
            } else {
                _l.error(me, "No valid request method provided, unable to create request object.");
                return null;
            }

            return {
                type        : method,
                url         : url,
                data        : data,
                contentType : "application/json",
                dataType    : "json"
            };
        },

        /**
         *
         * Method that sends requests
         * Used by {{#crossLink "HTTPAPI:request"}}{{/crossLink}}
         *
         * This method needs to be overridden by any subclass
         *
         * @method _sendRequest
         * @protected
         *
         * @param {Object} req                              Request object.
         *                                                  See {{#crossLink "HTTPAPI:_createRequest"}}{{/crossLink}}
         * @param {Function} internalResponseCb             Callback function(data, err, status, headers) on response
         *
         * @return {Boolean}                                True when sending of the request was successful, else false
         *
         * @protected
         */
        _sendRequest : function(req, internalResponseCb) {
            var me      = this.getIName() + "::ZeptoJSAPIMixin::_sendRequest";
            var success = false;

            internalResponseCb = _.ensureFunc(internalResponseCb);

            if (!_.hasMethod($, 'ajax')) {
                _l.error(me, "Expected ajax method not found on $, unable to send request");
                return success;
            }

            if (!_.obj(req)) {
                _l.error(me, "Request is not a valid object, unable to send request");
                return success;
            }

            req.success = function(data, status, xhr) {
                internalResponseCb(data, null, status, ZeptoJSAPIMixin.getResponseHeaders(xhr));
            };

            req.error   = function(xhr, errorType, error) {
                xhr = xhr || {};

                internalResponseCb(
                        null,
                        {
                            message : xhr.responseText,
                            status  : xhr.status
                        },
                        xhr.status,
                        ZeptoJSAPIMixin.getResponseHeaders(xhr));
            };

            $.ajax(req);

            success = true;
            return success;
        }
    });
})();
