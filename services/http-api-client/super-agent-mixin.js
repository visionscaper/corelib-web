/**
 * Created by Freddy Snijder on 14/12/14.
 */
(function() {
    var NS              = null;

    var _l              = null;
    var _               = null;
    var Class           = null;
    var request         = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        var jsface      = require("jsface");

        _               = require('../../util.js').utils;
        _l              = require('../../logger.js').logger;

        request         = require('superagent');
        Class           = jsface.Class;

        NS              = exports;
    } else {
        //Add to Visionscapers namespace
        NS              = window.__VI__ || window;

        _               = NS.utils;
        _l              = NS.logger;

        request         = NS.request || window.request;
        Class           = window.jsface.Class;
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
         * @param {String} method           HTTP Method name
         * @param {String} url              Path to resource
         * @param {Object|null} data        data to send
         *
         * @return {Object}                 request object
         */
        _createRequest : function(method, url, data) {
            var me  = this.getName() + "::SuperAgentMixin::_createRequest";
            var req = null;

            if (_.hasMethod(superagent, method)) {
                req = superagent[method](url);
                req.set('Content-Type', 'application/json')
                   .set('Accept', 'application/json');

                return req;
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
         * @param {Object} req                              Request object.
         *                                                  See {{#crossLink "HTTPAPIClient:_createRequest"}}{{/crossLink}}
         * @param {Function} internalResponseCb             Callback function(data, err, status, headers) on response
         *
         * @return {Boolean}                                True when sending of the request was successful, else false
         *
         * @protected
         */
        _sendRequest : function(req, internalResponseCb) {
            var me      = this.getName() + "::SuperAgentMixin::_sendRequest";
            var success = false;

            internalResponseCb = _.ensureFunc(internalResponseCb);

            if (!_.hasMethod(req, 'end')) {
                _l.error(me, "Request method does not have the expected end method, unable to send request");
                return success;
            }

            req.end(function(_err, _data) {
                var data = null;
                var err  = null;

                if (_.def(_err)) {
                    err = _err;
                    internalResponseCb(data, err, -1);
                    return;
                }

                _data = _data || {};

                var SAError = _data.error;
                if (_.obj(SAError)) {
                    err = {
                        message : SAError.message || "UNKNOWN ERROR",
                        status  : _data.status
                    };

                    internalResponseCb(data, err, _data.status, _data.headers);
                    return;
                }

                data = _data.body;
                internalResponseCb(data, err, _data.status, _data.headers);
            });

            success = true;
            return success;
        }
    });
})();
