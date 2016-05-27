/**
 * Created by Freddy Snijder on 15/05/14.
 */

(function() {
    var NS      = null;
    var DataMap = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        require("./../extensions/string.ext.js");

        DataMap = require("../data-structures/data-map.js").DataMap;

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;

        DataMap = NS.DataMap;
    }

    //using underscore.js _ as base object
    //changing and augmenting it where we want to

    NS.UtilsBase = {};
    NS.UtilsBase.addTo = function (utils, log) {

        if (log !== Object(log)) {
            console.warn("UtilsBase : no logging object provided, using browser console logger");
            log = console;
        }

        if ((utils !== Object(utils)) && (typeof(utils) != "function")) {
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

        _mustNOTexist("class");
        utils.class = utils.class || function (C) {
            return utils.func(C) && (C === C.prototype.constructor);
        };

        _mustNOTexist("int");
        utils.int = utils.int || function(arg) {
            return utils.number(arg) && (arg % 1 === 0);
        };

        _mustNOTexist("instanceof");
        utils.instanceof = utils.instanceof || function(checkClass, arg) {
            if(!utils.def(arg)) {
                return function(futureArg) {
                    return utils.instanceof(checkClass, futureArg);
                }
            } else {
                return arg instanceof checkClass;
            }
        };

        _mustNOTexist("equals");
        /**
         *
         * Returns true if v1 and v2 are equal else false.
         *
         * For objects the values of its own properties are compared using ===.
         * For arrays the item values are compared using ===.
         *
         * This function can also compare DataMap structures
         *
         * So for both objects and arrays the equality assessment is only done one level deep.
         *
         * @returns {boolean}
         *
         */
        utils.equals = utils.equals || function (v1, v2) {
            var isDef   = utils.def(v1);
            var isDef2  = utils.def(v2);

            if (!isDef && !isDef2) {
                return true;
            }

            var valType     = (typeof v1);
            var isArray     = utils.array(v1);
            var isDataMap   = v1 instanceof DataMap;
            var isEqual = (isDef === isDef2) &&
                          (valType === (typeof v2)) &&
                          (isArray === utils.array(v2)) &&
                          (isDataMap === (v2 instanceof DataMap));

            if (!isEqual) {
                return isEqual;
            }

            if (valType === "object") {
                var val1    = null;
                var val2    = null;

                var i       = null;

                var propertiesV1, propertiesV2;
                if (!isArray && !isDataMap) {
                    propertiesV1 = Object.getOwnPropertyNames(v1);
                    propertiesV2 = Object.getOwnPropertyNames(v2);

                    isEqual = propertiesV1.length == propertiesV2.length;
                    if (!isEqual) {
                        return isEqual;
                    }

                    for (i = 0; i < propertiesV1.length; i++) {
                        val1 = v1[propertiesV1[i]];
                        val2 = v2[propertiesV1[i]];
                        isEqual = isEqual && (val1 === val2);
                        if (!isEqual) {
                            return isEqual;
                        }
                    }

                    return isEqual;
                } else if (isDataMap) {
                    propertiesV1 = v1.getAllKeys();
                    propertiesV2 = v2.getAllKeys();

                    isEqual = propertiesV1.length == propertiesV2.length;
                    if (!isEqual) {
                        return isEqual;
                    }

                    for (i = 0; i < propertiesV1.length; i++) {
                        val1 = v1.get(propertiesV1[i]);
                        val2 = v2.get(propertiesV1[i]);
                        isEqual = isEqual && (val1 === val2);
                        if (!isEqual) {
                            return isEqual;
                        }
                    }

                    return isEqual;
                } else {
                    //Array

                    isEqual = (v1.length == v2.length);
                    if (!isEqual) {
                        return isEqual;
                    }

                    for (i = 0; i < v1.length; i++) {
                        val1 = v1[i];
                        val2 = v2[i];
                        isEqual = isEqual && (val1 === val2);
                        if (!isEqual) {
                            return isEqual;
                        }
                    }

                    return isEqual;
                }
            }

            isEqual = (v1 === v2);
            return isEqual;
        };

        _mustNOTexist("ensureFunc");
        utils.ensureFunc = utils.ensureFunc || function (f, funcName) {
            var sureFunc = f;
            if (!utils.func(sureFunc)) {
                sureFunc = function() {};
                if (utils.def(funcName)) {
                    log.error("Utils::ensureFunc", "[{0}] is not a function, providing stand-in function".fmt(funcName));
                }
            }

            return sureFunc;
        };

        _mustNOTexist("ensureObj");
        utils.ensureObj = utils.ensureObj || function (o, objDesc) {
            var sureObj = o;
            if (!utils.obj(sureObj)) {
                sureObj = {};
                if (utils.def(objDesc)) {
                    log.error("Utils::ensureObj", "[{0}] is not an object, providing new object instance".fmt(objDesc));
                }
            }

            return sureObj;
        };

        _mustNOTexist("ensure");
        utils.ensure = utils.ensure || function (variable, evalFunc, defaultValue, message) {
                var sure = variable;
                if (!evalFunc(variable)) {
                    sure = defaultValue;
                    if (utils.def(message)) {
                        log.error("Utils::ensure", message, variable);
                    }
                }

                return sure;
            };

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

            // Path must be a non-empty string or a number
            if (!(utils.number(path) || (utils.string(path) && !utils.empty(path))) ) {
                if (describe) {
                    log.error(me, "path to property is invalid, can't get property of [{0}] object".fmt(objName));
                }
                return value;
            }

            var props = utils.string(path) ? path.split('.') : [path];
            var numProps = props.length;
            var prop = null;

            var pathTravelled = "";

            value = obj;
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
        utils.set = utils.set || function (obj, path, value, objName, force) {
            var me = "utils::set";
            var success = false;

            // objName can also be traded in for force
            if(!utils.def(force) && utils.bool(objName)) {
                force = objName;
            }

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
                        if (!utils.obj(targetObj[prop]) && force === true) {
                            targetObj[prop] = {};
                        }
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
        utils.stringify = utils.stringify || function(obj, replacer, space) {
            var me  = "Utils::stringify";

            if (!utils.def(space)) {
                space = 4;
            }

            var s   = null;
            try {
                s = JSON.stringify.call(JSON, obj, replacer, space);
            } catch(e) {
                log.error(me, "Unable to stringify object : ", utils.get(e, "message"));
                s = "[Unable to stringify object]";
            }

            return s;
        };
        
        _mustNOTexist("parsableToNumber");
        utils.parsableToNumber = utils.parsableToNumber || function(number) {
            return !isNaN(parseFloat(number));
        };

        _mustNOTexist("removeFrom");
        utils.removeFrom = utils.removeFrom || function(from, element, description) {
            var me  = "Utils::removeFrom";
            
            var removed = -1;
            
            if(!utils.array(from)) {
                if(utils.def(description)) {
                    log.warn(me, "Cannot remove element. [{0}] is not an array.".fmt(description));
                }
                return -1;
            }
            if(!utils.def(element)) {
                if(utils.def(description)) {
                    log.warn(me, "Cannot remove undefined element from [{0}].");
                }
                return -1;
            }
            
            // Remove all references to the element
            for(var i = 0; i < from.length; i++) {
                if(from[i] === element) {
                    from.splice(i, 1);
                    i--;
                    removed++;
                }
            }
            
            return removed;
        };

        _mustNOTexist("hasValue");
        /**
         *
         * Returns if a property of object obj has a value val
         *
         * @param {object} obj
         * @param {*} val
         * @param {string} [objDescription]
         *
         * @returns {boolean}
         *
         */
        utils.hasValue = utils.hasValue || function(obj, val, objDescription) {
            var me = "Utils::hasValue";

            if (!utils.obj(obj)) {
                if (utils.def(objDescription)) {
                    log.warn(me, "[{0}] is not an object, value not found.".fmt(objDescription));
                    return false;
                }
            }

            for (var prop in obj) {
                if(obj.hasOwnProperty(prop) && obj[prop] === val) {
                    return true;
                }
            }
            return false;
        };

        _mustNOTexist("findProp");
        /**
         *
         * Returns first property name of obj that has value val
         *
         * @param {object} obj
         * @param {*} val
         * @param {string} [objDescription]
         *
         * @returns {string|null}   Property name if found, else null
         *
         */
        utils.findProp = utils.findProp || function(obj, val, objDescription) {
                    var me = "Utils::findProp";

                    if (!utils.obj(obj)) {
                        if (utils.def(objDescription)) {
                            log.warn(me, ("[{0}] is not an object, " +
                                          "unable to find property with value.").fmt(objDescription));
                            return false;
                        }
                    }

                    for (var prop in obj) {
                        if(obj.hasOwnProperty(prop) && obj[prop] === val) {
                            return prop;
                        }
                    }
                    return null;
                };

        _mustNOTexist("allOccurrences");
        /**
         *
         * Find indices of all occurrences of value in list
         *
         * @param {array|string}   list
         * @param {*} value
         *
         * @returns {array|null}           On success an array of indices is returned, on error null
         *
         */
        var allOccurrences = function(list, value) {
            var me = "Utils::allOccurrences";

            if (!utils.array(list) && !utils.string(list)) {
                log.error(me, "Given list is not an array or string");
                return null;
            }

            if (utils.string(list) && !utils.string(value)) {
                log.error(me, "Unable to search for a non string value in a string");
                return null;
            }

            if (utils.string(list) && utils.string(value) && utils.empty(value)) {
                log.warn(me, "Unable to search for an empty string in a string");
                return [];
            }

            var startIndex  = 0;
            var index       = -1;
            var indices     = [];

            var listLen     = list.length;

            while ((index = list.indexOf(value, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + 1;
            }

            return indices;
        };
        utils.allOccurrences = utils.allOccurrences || allOccurrences;

        _mustNOTexist("inRange");
        var inRange = function(number, min, max) {
            return utils.number(number) &&
                            number >= min &&
                            number <= max;
        };
        utils.inRange = utils.inRange || inRange;

        _mustNOTexist("clip");
        var clip = function(number, min, max) {
            var me = "Utils::clip";
            if(!utils.number(number)) {
                utils.warn(me, "Argument ({0}) is not a number. Defaulting to minimum ({1}).".fmt(number, min));
                return min;
            }
            if(number < min) return min;
            if(number > max) return max;
            return number;
        };
        utils.clip = utils.clip || clip;

        _mustNOTexist("isMobileNavigator");
        var isMobileNavigator = function() {
            var check = false;
            (function (a) {
                        if (
                                /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) ||
                                /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
                        ) {
                            check = true
                        }
                    })(navigator.userAgent || navigator.vendor || window.opera);

            return check;
        };
        utils.isMobileNavigator = utils.isMobileNavigator || isMobileNavigator;
    };

})();