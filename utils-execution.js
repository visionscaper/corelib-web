/**
 * Created by Freddy on 15/05/14.
 */

(function() {
    var NS = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        require("./extensions/string.ext.js");

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;
    }

    //using underscore.js _ as base object
    //changing and augmenting it where we want to

    NS.extendWithUtils = function(utils, log) {

        if (typeof(log) != "object") {
            console.warn("UtilsExecution : no logging object provided, using browser console logger");
            log = console;
        }

        if ((typeof(utils) != "object") && (typeof(utils) != "function")) {
            log.error("UtilsExecution", "No valid utils object given, not adding execution utils");
            return;
        }

        if ((typeof(utils._utilsComponents) != "object") || (!utils._utilsComponents["base"])) {
            log.error("UtilsExecution", "This utils component needs the base utils component, not adding execution utils");
            return;
        }

        /**************************************************
         *
         * Register utils component
         *
         **************************************************/

            //Different util components are registered here
            //This allows us to check in a simple way if certain functionality is available
        utils._mustExist("_utilsComponents");
        if (utils.obj(utils._utilsComponents)) {
            utils._utilsComponents["execution"] = true;
        }

        /**************************************************
         *
         * END Register utils component
         *
         **************************************************/

        utils._mustNOTexist("hasMethod");
        /**
         *
         * Checks if an object has method named methodName
         *
         * @param {Object} obj
         * @param {String} methodName
         *
         * @returns {true|false}
         *
         */
        var hasMethod = function (obj, methodName) {
            return utils.obj(obj) && utils.func(obj[methodName]);
        };
        utils.hasMethod = utils.hasMethod || hasMethod;

        utils._mustNOTexist("adheresToInterface");
        /**
         *
         * Checks if object obj adheres to interface defined by interfaceDef
         *
         * @param {Object} obj                  ... The object that is tested if it adheres to interface interfaceDef
         *
         * @param {Object} interfaceDef         ... Object defining the interface that obj needs to have
         * @param {Array} [interfaceDef.methods=[]]    ... Array with method names
         * @param {Array} [interfaceDef.properties=[]] ... Array with property names
         *
         * @param {String} [description=null]   ... When the description string not is empty (and not null) the function
         *                                          will log messages (including the description) when necessary
         *                                          When it is empty or null, no logging is performed
         *
         */
        var adheresToInterface = function (obj, interfaceDef, description) {
            var me = "Utils::adheresToInterface";
            var adheres = false;

            var doLog = !utils.empty(description);

            if (!utils.obj(obj) && !utils.func(obj)) {
                return adheres;
            }

            if (!utils.obj(interfaceDef)) {
                if (doLog) {
                    log.warn(me, "No valid interface definition given, unable to test interface adherence");
                }
                return adheres;
            }

            if (!utils.array(interfaceDef.methods)) {
                interfaceDef.methods = [];
            }

            if (!utils.array(interfaceDef.properties)) {
                interfaceDef.properties = [];
            }

            adheres = true;

            var methodName = null;
            var hasMethod = false;
            for (var idx in interfaceDef.methods) {

                methodName = interfaceDef.methods[idx];
                hasMethod = utils.func(obj[methodName]);

                adheres = adheres && hasMethod;

                if (!hasMethod) {
                    if (doLog) {
                        log.error(me, "{0} : Method {1} does not exist".fmt(description, methodName));
                    } else {
                        break;
                    }
                }
            }

            var propName = null;
            var prop = null;
            var hasProp = false;
            for (var idx in interfaceDef.properties) {

                propName = interfaceDef.properties[idx];
                prop = obj[propName];
                hasProp = utils.def(prop) && !utils.func(prop);

                adheres = adheres && hasProp;

                if (!hasProp) {
                    if (doLog) {
                        log.error(me, "{0} : Properties {1} does not exist or is a method".fmt(description, propName));
                    } else {
                        break;
                    }
                }
            }

            return adheres;
        };
        utils.adheresToInterface = utils.adheresToInterface || adheresToInterface;

    };

})();
