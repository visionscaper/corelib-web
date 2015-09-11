/**
 * Created by Freddy Snijder on 15/05/14.
 */


(function() {
    var NS = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;
    }

    //using underscore.js _ as base object
    //changing and augmenting it where we want to
    NS.UtilsValidation = {};
    NS.UtilsValidation.addTo = function (utils, log) {

        if (typeof(log) != "object") {
            console.warn("UtilsValidation : no logging object provided, using browser console logger");
            log = console;
        }

        if ((typeof(utils) != "object") && (typeof(utils) != "function")) {
            log.error("UtilsValidation", "No valid utils object given, not adding utils");
            return;
        }

        if ((typeof(utils._utilsComponents) != "object") || (!utils._utilsComponents["execution"])) {
            log.error("UtilsValidation", "This utils component needs the execution utils component, not adding utils");
            return;
        }

        if ((typeof(utils._utilsComponents) != "object") || (!utils._utilsComponents["base"])) {
            log.error("UtilsValidation", "This utils component needs the base utils component, not adding utils");
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
            utils._utilsComponents["validation"] = true;
        }

        /**************************************************
         *
         * END Register utils component
         *
         **************************************************/

        utils._mustNOTexist("valueError");
        utils._mustNOTexist("valueWarn");
        var badValueMessage = function(name, value, why, defaultTo) {
            var messages = [];
            messages.push("Bad value for: {0}.".fmt(name));
            if(_.isObject(why)) {
                messages.push("| Expected structure:");
                messages.push(why);
            } else {
                messages.push("| Reason:");
                messages.push(why);
            }
            messages.push("| Value:");
            messages.push(value);
            if(arguments.length === 4) {
                messages.push("| Default:");
                messages.push(defaultTo);
            }
            return messages;
        };
        var valueError = function(me, name, value, why) {
            var messages = badValueMessage(name, value, why);
            log.log('error', me, messages, {stackOffset: 3});
        };
        var valueWarn = function(me, name, value, why) {
            var messages = badValueMessage(name, value, why);
            log.log('warn', me, messages, {stackOffset: 3});
        };
        utils.valueError = utils.valueError || valueError;
        utils.valueWarn = utils.valueWarn || valueWarn;

        utils._mustNOTexist("validateOne");
        var validationMessages = {
            def: "Must be defined.",
            obj: "Must be object.",
            string: "Must be string.",
            bool: "Must be boolean.",
            number: "Must be number.",
            array: "Must be array.",
            func: "Must be function.",
            date: "Must be date.",
            empty: "Must be empty.",
            class: "Must be class.",
            int: "Must be int.",
            parsableToNumber: "Must be parsable to Number."
        };
        /**
         * Validates a value, based on the given parameters
         * @param {string} me               The identity of the checker.
         * @param {string} name             The name of the variable to check.
         * @param value                     The value of the variable to check.
         * @param {string|bool} method      Boolean check for validity, or name of util for validation.
         * @param {message} [message]       [Optional] The message to display when variable is not valid.
         * @param {object} options          An object of extra option.
         * @param [options.default]         A default value if given value is invalid. If not provided, validation will fail.
         * @param {bool} [options.warn]     If false, no warning will be given if default is chosen. Defaults to true.
         *
         * @returns {object|bool}           If validation was passed, an object will be returned containing a key equal
         *                                  the given name, with the validated value.
         *                                  If validation fails, FALSE will be returned.
         */
        var validateOne = function(me, name, value, method, message, options) {
            var valid = true;
            if(utils.obj(message)) { // message was ommitted
                options = message;
                message = undefined;
            }
            // Direct method
            if(method === false) {
                valid = false;
            // Util method
            } else if (_.string(method)) {
                // Method doesn't exist
                if(!utils.func(utils[method])) {
                    valueError(me, name, value, "Don't know how to validate '{0}'.".fmt(method));
                    return false;
                }

                // Apply util method
                if(!utils[method].apply(utils, [value])) {
                    valid = false;
                    if (!_.def(message)) {
                        if (_.has(validationMessages, method)) {
                            message = validationMessages[method];
                        } else {
                            message = "Must be {0}.".fmt(method);
                        }
                    }
                }
            }

            if(!_.def(message)) {
                message = "Invalid.";
            }

            if(!valid) {
                if(utils.obj(options) && _.has(options, 'default')) {
                    if(_.get(options, 'warn') !== false) {
                        valueWarn(me, name, value, message);
                    }
                    var returnValue = {};
                    returnValue[name] = options.default;
                    return returnValue;
                } else {
                    valueError(me, name, value, message);
                    return false;
                }
            }

            var returnValue = {};
            returnValue[name] = value;
            return returnValue;
        };
        utils.validateOne = utils.validateOne || validateOne;

        utils._mustNOTexist("validate");
        /**
         * Validates a set of values, based on the given parameters
         * @param {string} me               The identity of the checker.
         * @param {object} checks           An object of checks. Where the keys are the names of the variables and the
         *                                  values arrays of parameters that are passed to {@link utils.validateOne}, prepended by
         *                                  <me> and <checks>.
         * @param {string} consequence      A message to be given if validation fails.
         *
         * @returns {object|bool}           If validation was passed, an object will be returned containing a the keys
         *                                  of the given checks object, with their validated values.
         *                                  If any of the validations failed, FALSE will be returned.
         */
        var validate = function(me, checks, consequence) {
            var validated = {};
            if(_.obj(checks)) {
                for(var i in checks) {
                    checks[i].unshift(i);
                    checks[i].unshift(me);
                    var validateThis = validateOne.apply(utils, checks[i]);
                    if(validateThis === false) {
                        validated[i] = false;
                    } else {
                        validated[i] = validateThis[i];
                    }
                }
            } else {
                log.error(me, "Cannot validate. Parameter 'checks' must be object.", checks);
                if(!_.def(consequence)) {
                    log.error(consequence);
                }
                return false;
            }
            // If any of the validated parameters failed, return false.
            for(var i in validated) {
                if(validated[i] === false) {
                    if(!_.def(consequence)) {
                        log.error(consequence);
                    }
                    return false;
                }
            }

            return validated;
        };
        utils.validate = utils.validate || validate;
    };

})();