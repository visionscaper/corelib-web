/**
 * Created by Freddy Snijder on 15/05/14.
 */

(function() {
    var NS = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        require("./../extensions/string.ext.js");

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;
    }

    //using underscore.js _ as base object
    //changing and augmenting it where we want to

    NS.UtilsBase = {};
    NS.UtilsBase.addTo = function (utils, log) {

        if (typeof(log) != "object") {
            console.warn("UtilsBase : no logging object provided, using browser console logger");
            log = console;
        }

        if ((typeof(utils) != "object") && (typeof(utils) != "function")) {
            log.error("UtilsBase", "no valid utils object given, unable to extend");
            return;
        }

        //Using these functions (in the particular way as used below) to ensure that Webstorm (or other IDE) can find
        // the method definition, while still providing feedback when a method already exists

        var _mustNOTexist = function (name) {
            if ((utils[name] !== null) && (utils[name] !== undefined)) {
                log.warn("UtilsBase", "property or method {0} already exists, not overwriting".fmt(name));
            }
        };
        var _mustExist = function (name) {
            if ((utils[name] === null) || (utils[name] === undefined)) {
                log.error("UtilsBase", "property or method {0} does not exists, will not be available".fmt(name));
            }
        };

        _mustNOTexist("_mustNOTexist");
        utils._mustNOTexist = utils._mustNOTexist || _mustNOTexist;

        _mustNOTexist("_mustExist");
        utils._mustExist = utils._mustExist || _mustExist;

        /**************************************************
         *
         * Register utils component
         *
         **************************************************/

        //Different util components are registered here
        //This allows us to check in a simple way if certain functionality is available
        _mustNOTexist("_utilsComponents");
        utils._utilsComponents = utils._utilsComponents || {
            base: true
        };

        /**************************************************
         *
         * END Register utils component
         *
         **************************************************/

        _mustNOTexist("def");
        utils.def = utils.def || function (v) {
            return ((v !== null) && (v !== undefined));
        };

        _mustNOTexist("obj");
        _mustExist("isObject");
        utils.obj = utils.obj || utils.isObject;

        _mustNOTexist("bool");
        _mustExist("isBoolean");
        utils.bool = utils.bool || utils.isBoolean;

        _mustNOTexist("number");
        _mustExist("isNumber");
        utils.number = utils.number || utils.isNumber;

        _mustNOTexist("string");
        _mustExist("isString");
        utils.string = utils.string || utils.isString;

        _mustNOTexist("array");
        _mustExist("isArray");
        utils.array = utils.array || utils.isArray;

        _mustNOTexist("func");
        _mustExist("isFunction");
        utils.func = utils.func || utils.isFunction;

        _mustNOTexist("date");
        _mustExist("isDate");
        utils.date = utils.date || utils.isDate;

        _mustNOTexist("empty");
        _mustExist("isEmpty");
        utils.empty = utils.empty || utils.isEmpty;

        _mustNOTexist("ensureFunc");
        utils.ensureFunc = utils.ensureFunc || function (f, funcName) {
            var sureFunc = f;
            if (!utils.func(sureFunc)) {
                sureFunc = function() {};
                if (utils.def(funcName)) {
                    log.error("Utils::endureFunc : [{0}] is not a function, providing stand-in function".fmt(funcName));
                }
            }

            return sureFunc;
        };

        _mustNOTexist("now");
        utils.now = utils.now || function () {
            return (new Date()).getTime();
        };

        _mustNOTexist("get");
        utils.get = utils.get || function (obj, path, objName) {
            var me      = "Utils::get";
            var value    = null;

            var describe = !utils.empty(objName);

            if (!utils.obj(obj)) {
                if (describe) {
                    log.error(me, "object [{0}] is invalid, can't get property [{1}]".fmt(objName, path));
                }
                return value;
            }

            if (!utils.string(path) || utils.empty(path)) {
                if (describe) {
                    log.error(me, "path to property is invalid, can't get property of [{0}] object".fmt(objName));
                }
                return value;
            }

            var props = path.split(".");
            var numProps = props.length;
            var prop = null;

            var pathTravelled = "";

            var value = obj;
            for (var idx = 0; idx < numProps; idx++) {
                prop = props[idx];

                if (utils.obj(value)) {
                    value = value[prop];
                } else {
                    if (describe) {
                        log.warn(me, "[{0}] of object [{1}] is not an object, unable to get property [{2}]".fmt(
                                pathTravelled,
                                objName,
                                path
                        ));
                    }

                    value = null;
                    break;
                }

                if (describe) {
                    pathTravelled += ((idx > 0) ? '.' : '') + prop;
                }
            }

            return value;
        };

        _mustNOTexist("set");
        utils.set = utils.set || function (obj, path, value, objName) {
            var me = "utils::set";
            var success = false;

            var describe = !utils.empty(objName);

            if (!utils.obj(obj)) {
                if (describe) {
                    log.error(me, "object [{0}] is invalid, can't set property [{1}]".fmt(objName, path));
                }
                return success;
            }

            if (!utils.string(path) || utils.empty(path)) {
                if (describe) {
                    log.error(me, "path to property is invalid, can't set property of [{0}] object".fmt(objName));
                }
                return success;
            }

            var props = path.split(".");
            var numProps = props.length;
            var prop = null;

            var pathTravelled = "";

            var targetObj = obj;
            for (var idx = 0; idx < numProps; idx++) {
                prop = props[idx];

                if (utils.obj(targetObj)) {
                    if (idx < numProps - 1) {
                        targetObj = targetObj[prop];
                    } else {
                        success = true;
                        targetObj[prop] = value;
                    }
                } else {
                    if (describe) {
                        log.warn(me, "[{0}] of object [{1}] is not an object, unable to set property [{2}]".fmt(
                                pathTravelled,
                                objName,
                                path
                        ));
                    }

                    break;
                }

                if (describe) {
                    pathTravelled += ((idx > 0) ? '.' : '') + prop;
                }
            }

            return success;
        };

        _mustNOTexist("stringify");
        utils.stringify = utils.stringify || function(obj) {
            var me  = "Utils::stringify";

            var s   = null;
            try {
                s = JSON.stringify(obj);
            } catch(e) {
                log.error(me, "Unable to stringify object : ", utils.get(e, "message"));
                s = "[Unable to stringify object]";
            }

            return s;
        }
    };

})();