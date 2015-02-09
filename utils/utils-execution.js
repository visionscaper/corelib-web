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
    NS.UtilsExecution = {};
    NS.UtilsExecution.addTo = function(utils, log) {

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

        utils._mustNOTexist("exec");
        /**
         *
         * Executes method with name methodName on obj with params paramList
         *
         * @param {Object} obj                      object on which to call method
         * @param {String} methodName               name of method to call
         * @param {Array|*} paramList               array of argument values, or single value when calling with
         *                                          single argument, use [] to call without argument
         *
         * @param {String} [objectName=null]        When the objectName string is not empty (and not null) the
         *                                          function will log messages (including the objectName) when
         *                                          necessary. When it is empty or null, no logging is performed

         *
         * @returns {*}                             Return value of method call, when the call is not found the
         *                                          return value is always undefined.
         *
         */
        var execUtilFunc = function (obj, methodName, paramList, objectName) {
            var me          = "Utils::call";
            var returnVal   = undefined;

            var doLog       = !utils.empty(objectName);

            if (!utils.hasMethod(obj, methodName)) {
                if (doLog) { log.warn(me, "[{0}] object has no method named {1}".fmt(objectName, methodName)); }

                return returnVal;
            }

            if (utils.array(paramList)) {
                returnVal = obj[methodName].apply(obj, paramList);
            } else {
                returnVal = obj[methodName].call(obj, paramList);
            }

            return returnVal;
        };
        utils.exec = utils.exec || execUtilFunc;

        utils._mustNOTexist("interfaceAdheres");
        /**
         *
         * Checks if object obj adheres to interface defined by interfaceDef
         *
         * @param {Object} obj                              The object that is tested if it adheres to
         *                                                  interface interfaceDef
         *
         * @param {Object} interfaceDef                     Object defining the interface that obj needs to have
         * @param {Array} [interfaceDef.methods=[]]         Array with method names
         * @param {Array} [interfaceDef.properties=[]]      Array with property names
         *
         * @param {String} [description=null]               When the description string not is empty (and not null) the
         *                                                  function will log messages (including the description) when
         *                                                  necessary. When it is empty or null, no logging is performed
         *
         */
        var interfaceAdheres = function (obj, interfaceDef, description) {
            var me = "Utils::adheresToInterface";
            var adheres = false;

            var doLog = !utils.empty(description);

            if (!utils.obj(obj) && !utils.func(obj)) {
                return adheres;
            }

            if (!utils.obj(interfaceDef)) {
                if (doLog) {
                    log.warn(me, ("No valid interface definition given for {0}, " +
                                  "unable to test interface adherence").fmt(description));
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
            var idx = 0;
            for (idx in interfaceDef.methods) {

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
            for (idx in interfaceDef.properties) {

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

        utils.interfaceAdheres = utils.interfaceAdheres || interfaceAdheres;

        utils._mustNOTexist("execInSeries");
        /**
         *
         * Executes all functions in funcHash in series and returns when all functions have called back.
         *
         * @param {object} funcHash                     hash object of functions to execute in series:
         *                                              {
         *                                                  'funcName1' : func1(cbReady),
         *                                                  'funcName2' : func2(dataIn, errIn, cbReady),
         *                                                  ...
         *                                                  'funcNameN' : funcN(dataIn, errIn, cbReady)
         *                                              }
         *
         *                                              dataIn, errIn are the data and error information provided by the
         *                                              previously called function.
         *
         *                                              Every func1...N calls cbReady(dataOut, errOut)
         *                                              If no error, err is undefined or null
         *
         * @param {function} allCallsCompletedCb        function(data, err) Calls this function if all functions are ready
         *                                              or when forceComplete=false and any function calls cbReady with
         *                                              error
         *
         * @param {boolean} [forceComplete = false]     If true the function waits until every function has called their
         *                                              cbReady func, even if one or more functions called cbReady
         *                                              with error
         *
         * Example:
         *
         * var funcHash = {
         *  'add A' : function(cbReady) {
         *              var data = {};
         *              data.A = 'A';
         *
         *              cbReady(data, null); //No error
         *            },
         *
         *  'add B' : function(dataIn, errIn, cbReady) {
         *              dataIn.B = 'B';
         *
         *              cbReady(dataIn, errIn);
         *            }
         *  }
         *
         *  _.execInSeries(funcHash, function(data, err) {
         *
         *      console.log("Created data structure : ", data);
         *
         *  }
         *
         */
        var execInSeries = function (funcHash, allCallsCompletedCb, forceComplete) {
            var me = "Utils::execInSeries";

            allCallsCompletedCb = utils.ensureFunc(allCallsCompletedCb);

            if (!utils.obj(funcHash)) {
                log.warn(me, "No function hash given, calling allCallsCompletedCb callback function");

                allCallsCompletedCb(null, null);

                return;
            }

            if (!utils.bool(forceComplete)) {
                forceComplete = false;
            }

            var funcIdx         = -1;

            /**
             *
             * IMPORTANT : THIS ENSURES THAT THE FUNCTIONS ARE EXECUTED IN THE ORDER GIVEN
             *
             */
            var funcNameList    = [];
            for (var funcName in funcHash) {
                funcNameList.push(funcName);
            }
            /**
             *
             * END IMPORTANT
             *
             */

            var numFuncs        = funcNameList.length;

            var __funcReady     = function (dataIn, errIn) {
                var _errIn = errIn;

                if (utils.def(errIn)) {
                    _errIn = {
                        message: 'function [' + funcNameList[funcIdx] + '] reported an error',
                        originalError: errIn
                    };

                    if (!forceComplete) {
                        allCallsCompletedCb(dataIn, _errIn);
                        return;
                    } else {
                        log.warn(me, '{0}. Continuing despite error ...'.fmt(_errIn.message));
                    }
                }

                __nextFunc(dataIn, _errIn);
            };

            var __nextFunc = function (dataIn, errIn) {
                var _errIn = errIn;

                funcIdx++;
                if (funcIdx < numFuncs) {
                    var nextFuncName = funcNameList[funcIdx];
                    var nextFunc = funcHash[nextFuncName];
                    if (utils.func(nextFunc)) {
                        log.debug(me, "Executing [{0}]".fmt(nextFuncName));

                        if (funcIdx < 1) {
                            nextFunc(__funcReady);
                        } else {
                            nextFunc(dataIn, _errIn, __funcReady);
                        }
                    } else {
                        _errIn = {
                            message: 'Function hash entry [{0}] is not a function, ' +
                            'unable execute'.fmt(nextFuncName)
                        };

                        if (utils.def(errIn)) {
                            _errIn.originalError = errIn;
                        }

                        __funcReady(dataIn, _errIn);
                    }
                } else {
                    allCallsCompletedCb(dataIn, _errIn);
                }
            };

            __nextFunc();
        };
        utils.execInSeries = utils.execInSeries || execInSeries;

        utils._mustNOTexist("execASync");
        /**
         *
         * Executes all functions in funcHash ASYNChronously and calls
         *  allCallsCompletedCb when all funcs have called back.
         *
         * @param {object} funcHash                     hash object of functions to execute asynchronously:
         *                                              {
         *                                                  'funcName1' : func1(cbReady),
         *                                                  'funcName2' : func2(cbReady),
         *                                                  ...
         *                                                  'funcNameN' : funcN(cbReady)
         *                                              }
         *
         *                                              every func1...N calls cbReady(err).
         *                                              If no error err is undefined or null.
         *
         * @param {function} allCallsCompletedCb        function(errHash) This function is called when all functions called
         *                                              their cbReady callback, or when forceComplete=false and any
         *                                              function calls cbReady with error.
         *
         *                                              errHash is an object, providing for each function that resulted in
         *                                              error an error object. Thus when 'funcName_i' resulted in error,
         *                                              errHash['funcName_i']
         *
         * @param {boolean} [forceComplete = false]     If true the function waits until every function has called their
         *                                              cbReady func, even if one or more functions called cbReady with
         *                                              error
         *
         * Example:
         *
         * var funcHash = {
         *  'add A' : function(cbReady) {
         *              var data = {};
         *              data.A = 'A';
         *
         *              cbReady(); //No error
         *            },
         *
         *  'add B' : function(cbReady) {
         *              dataIn.B = 'B';
         *
         *              cbReady(); //No error
         *            }
         *  }
         *
         *  _.execASync(funcHash, function(errHash) {
         *
         *      if (!_.empty(errHash)) {
         *          for (funcName in errHash) {
         *              console.error(funcName + " function resulted in error : ", errHash[funcName]);
         *          }
         *      }
         *
         *  }
         *
         */
        utils.execASync = function (funcHash, allCallsCompletedCb, forceComplete) {
            var me = "Utils::execASync";

            allCallsCompletedCb = utils.ensureFunc(allCallsCompletedCb);

            if (!utils.obj(funcHash)) {
                log.info(me, "No function hash given, calling allCallsCompletedCb callback function");

                allCallsCompletedCb(null, null);

                return;
            }

            if (!utils.bool(forceComplete)) {
                forceComplete = false;
            }

            if (utils.empty(funcHash)) {
                log.info(me, "Function hash empty, calling allCallsCompletedCb callback function");

                allCallsCompletedCb(null, null);

                return;
            }

            var allReadyCbsCalled = false;

            var funcReady   = {};
            var funcErr     = {};
            var funcReadyCb = {};

            var funcName = null;

            var __checkAllReady = function (funcName, err) {
                if (!allReadyCbsCalled) {
                    if (utils.def(err) && !forceComplete) {
                        allCallsCompletedCb(funcErr);
                        allReadyCbsCalled = true;
                    } else {
                        var allFuncsReady = true;
                        for (funcName in funcHash) {
                            allFuncsReady &= funcReady[funcName];

                            if (!allFuncsReady) {
                                break;
                            }
                        }

                        if (allFuncsReady) {
                            allCallsCompletedCb(funcErr);
                            allReadyCbsCalled = true;
                        }
                    }
                }
            };

            var __createFuncReadyCb = function (funcName) {
                return function (err) {
                    var _err = err;
                    log.debug(me, "Executing [{0}] READY".fmt(funcName));

                    if (utils.def(err)) {
                        _err = {
                            message: "[{0}] function reported ERROR".fmt(funcName),
                            originalError: err
                        };

                        log.error(me, _err.message, _err.originalError);

                        funcErr[funcName] = _err;
                    }

                    funcReady[funcName] = true;

                    __checkAllReady(funcName, _err);
                }
            };

            for (funcName in funcHash) {
                funcReady[funcName] = false;
                funcReadyCb[funcName] = __createFuncReadyCb(funcName);
            }

            // DO THE CALLS HERE
            for (funcName in funcHash) {
                var aFunc = funcHash[funcName];

                aFunc(funcReadyCb[funcName]);
            }
        };
        utils.execASync = utils.execASync || execASync;

    };

})();
