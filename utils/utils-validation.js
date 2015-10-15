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
        utils._mustExist(utils._utilsComponents, "_utilsComponents");
        if (utils.obj(utils._utilsComponents)) {
            utils._utilsComponents["validation"] = true;
        }

        /**************************************************
         *
         * END Register utils component
         *
         **************************************************/

        utils._mustNOTexist(utils.isValid, "isValid");
        var isValid = function(arg) {
            return utils.obj(arg) && utils.hasMethod(arg, 'isValid') && arg.isValid();
        };
        utils.isValid = utils.isValid || isValid;

        utils._mustNOTexist(utils.valueError, "valueError");
        utils._mustNOTexist(utils.valueWarn, "valueWarn");
        var badValueMessage = function(name, value, why, defaultTo) {
            var messages = [];
            messages.push("Bad value for: {0}.".fmt(name));
            if(utils.isObject(why)) {
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
            isValid: "Is invalid.",
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

            var result = { name: name, original: value };

            // Direct method
            if(method === false) {
                valid = false;
            // Util method
            } else if (utils.string(method)) {
                // Method doesn't exist
                if(!utils.func(utils[method])) {
                    valueError(me, name, value, "Don't know how to validate '{0}'.".fmt(method));
                    message = "Don't know how to validate '{0}'.".fmt(method);
                    valid = false;
                } else {
                    // Apply util method
                    if (!utils[method].apply(utils, [value])) {
                        valid = false;
                        if (!utils.def(message)) {
                            if (utils.has(validationMessages, method)) {
                                message = validationMessages[method];
                            } else {
                                message = "Must be {0}.".fmt(method);
                            }
                        }
                    }
                }
            }

            if(!utils.def(message)) {
                message = "Invalid.";
            }

            if(!valid) {
                if(utils.obj(options) && utils.has(options, 'default')) {
                    if(utils.get(options, 'warn') !== false) {
                        result.warning = {
                            message: message
                        };
                    }
                    result.valid = options.default;
                } else {
                    result.error = {
                        message: message
                    }
                }
            } else {
                result.valid = value;
            }

            return result;
        };

        utils._mustNOTexist(utils.validate, "validate");
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
        var validate = function(me, checks, consequence, errCallback) {
            var validated = {};
            var hasCallback = utils.func(errCallback);

            if(utils.obj(checks)) {
                for(var i in checks) {
                    checks[i].unshift(i);
                    checks[i].unshift(me);
                    var current = validateOne.apply(utils, checks[i]);
                    validated[i] = current;
                }
            } else {
                if(hasCallback) {
                    errCallback(null, {
                        message: "Cannot validate. Parameter 'checks' must be object. " + consequence
                    });
                } else {
                    log.error(me, "Cannot validate. Parameter 'checks' must be object.", checks);

                    //TODO : this does not seem to be correct
                    if(!utils.def(consequence)) {
                        log.error(consequence);
                    }
                }
                return false;
            }

            // Go through results
            var errors = {};
            var warnings = {};
            var valid = true;
            var results = {};
            for(var i in validated) {
                if(utils.has(validated[i], 'error')) {
                    errors[i] = {
                        message: validated[i].error
                    };
                    if(!hasCallback) {
                        valueError(me, i, utils.get(validated[i], 'original'), utils.get(validated[i], 'error.message'));
                    }
                    valid = false;
                }
                if(utils.has(validated[i], 'warning')) {
                    warnings[i] = {
                        message: validated[i].warning
                    };
                    if(!hasCallback) {
                        valueWarn(me, i, utils.get(validated[i], 'original'), utils.get(validated[i], 'warning.message'));
                    }
                }

                if(utils.has(validated[i], 'valid')) {
                    results[i] = validated[i].valid;
                }
            }

            if(hasCallback && !valid) {
                errCallback(null, {
                    message: consequence,
                    originalError: errors
                });
            }

            if(!valid) {
                if(utils.def(consequence)) {
                    log.error(me, consequence);
                }
                return false;
            } else {
                return results;
            }
        };
        utils.validate = utils.validate || validate;
    };

})();