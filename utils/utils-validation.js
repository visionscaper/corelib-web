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

        if (log !== Object(log)) {
            console.warn("UtilsValidation : no logging object provided, using browser console logger");
            log = console;
        }

        if ((utils !== Object(utils)) && (typeof(utils) != "function")) {
            log.error("UtilsValidation", "No valid utils object given, not adding utils");
            return;
        }

        if ((utils._utilsComponents !== Object(utils._utilsComponents)) || (!utils._utilsComponents["execution"])) {
            log.error("UtilsValidation", "This utils component needs the execution utils component, not adding utils");
            return;
        }

        if ((utils._utilsComponents !== Object(utils._utilsComponents)) || (!utils._utilsComponents["base"])) {
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

        utils._mustNOTexist("isValid");
        var isValid = function(arg) {
            return utils.obj(arg) && utils.hasMethod(arg, 'isValid') && arg.isValid();
        };
        utils.isValid = utils.isValid || isValid;

        utils._mustNOTexist("valueError");
        utils._mustNOTexist("valueWarn");
        var badValueMessage = function(name, value, why, defaultTo) {
            // If reason does not end with full stop, add one.
            if(!/\.\s*?/.exec(why)) {
                why += '.';
            }

            var messages = [];
            messages.push("Bad value for '{0}'.".fmt(name));
            if(utils.isObject(why)) {
                messages.push("Expected structure:");
                messages.push(why);
            } else {
                messages.push(why);
            }
            messages.push("Given: ");
            messages.push(value);
            if(arguments.length === 4) {
                messages.push("Using default:");
                messages.push(defaultTo);
            }
            return messages;
        };
        var valueError = function(me, name, value, why) {
            var messages = badValueMessage(name, value, why);
            log.log('error', me, messages, {stackOffset: 3});
        };
        var valueWarn = function(me, name, value, why, defaultTo) {
            var messages = badValueMessage(name, value, why, defaultTo);
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
         *
         * Validates a value, based on the given parameters
         *
         * @param {string} me               The identity of the checker.
         * @param {string} name             The name of the variable to check.
         * @param value                     The value of the variable to check.
         * @param {string|bool} method      Boolean check for validity, or name of util for validation.
         * @param {message} [message]       [Optional] The message to display when variable is not valid.
         * @param {object} options          An object of extra option.
         * @param [options.default]         A default value if given value is invalid. If not provided, validation will fail if invalid value.
         * @param {bool} [options.warn]     If false, no warning will be given if default is chosen. Defaults to true.
         *
         * @return {object}                 Result object with following properties:
         *                                      name        Name of the variable.
         *                                      original    Given value of the variable.
         *                                      valid       Validated value of the variable.
         *                                      [warning]   [if available] The warning object {message: ...} issued for
         *                                                      this variable.
         *                                      [error]     [if available] The error object {message: ...} issued for
         *                                                      this variable.
         */
        var validateOne = function(me, name, value, method, message, options) {
            var valid = true;
            if(utils.obj(message)) { // message was omitted
                options = message;
                message = undefined;
            }

            var result = { name: name, original: value };

            // Get method from utils, if method is string
            if(utils.string(method)) {
                // Get function from utils
                var utilMethod = utils[method];

                // If no message is provided, try to find one from validationMessages
                if (!utils.def(message)) {
                    if (utils.has(validationMessages, method)) {
                        message = validationMessages[method];
                    } else {
                        message = "Must be {0}.".fmt(method);
                    }
                }
                if(!utils.func(utilMethod)) {
                    message = "Don't know how to validate '{0}'.".fmt(method);
                    method = false;
                } else {
                    method = utilMethod;
                }
            }

            // No message provided or found, go for generic.
            if(!utils.def(message)) {
                message = "Invalid.";
            }

            // Apply validation method
            if(utils.func(method)) {
                if (!method.apply(utils, [value])) {
                    valid = false;
                }
            // Boolean validation
            } else {
                valid = method === true;
            }

            // Feedback
            if(!valid) {
                if(utils.obj(options) && utils.has(options, 'default')) {
                    var warn = utils.get(options, 'warn');
                    var __warn = utils.func(warn) ? warn : function() { return warn !== false; };
                    if(__warn(value) !== false) {
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

        utils._mustNOTexist("validate");
        /**
         * Validates a set of values, based on the given parameters
         *
         * TODO : FS 24112015 : add a few examples that spans the usage space
         *
         * @param {string} me               The identity of the checker.
         * @param {object} checks           An object of checks. Where the keys are the names of the variables and the
         *                                  values arrays of parameters that are passed to {@link utils.validateOne},
         *                                  prepended by <me> and <checks>.
         * @param {string} consequence      A message to be given if validation fails.
         *
         * TODO FS 24112015 : define parameter errCallback
         *
         * @returns {object|bool}           If validation was passed, an object will be returned containing a the keys
         *                                  of the given checks object, with their validated values.
         *                                  If any of the validations failed, FALSE will be returned.
         */
        var validate = function(me, checks, consequence, errCallback) {
            var validated = {};
            var hasCallback = utils.func(errCallback);

            if(utils.obj(checks)) {
                //TODO : FS 24112015 : better name i
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

                    if(utils.def(consequence)) {
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
            var original, error, warning, validValue;
            //TODO : FS 24112015 : better name i
            for(var i in validated) {
                original = utils.get(validated[i], 'original');
                error = utils.get(validated[i], 'error');
                warning = utils.get(validated[i], 'warning');
                validValue = utils.get(validated[i], 'valid');
                if(utils.obj(error)) {
                    errors[i] = error;

                    if(!hasCallback) {
                        valueError(me, i, original, error.message);
                    } else {
                        error.message = badValueMessage(i, utils.stringify(original), error.message).join(' ');
                    }
                    valid = false;
                }
                if(utils.obj(warning)) {
                    warnings[i] = warning;
                    if(!hasCallback) {
                        valueWarn(me, i, original, warning.message, validValue);
                    } else {
                        warning.message = badValueMessage(i, utils.stringify(original), warning.message, utils.stringify(validValue)).join(' ');
                    }
                }

                if(utils.has(validated[i], 'valid')) {
                    results[i] = validated[i].valid;
                }
            }

            if(hasCallback && !valid) {
                errCallback(null, {
                    message: consequence,
                    originalError: {
                        error_hash: errors,
                        debug: true
                    }
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

        utils._mustNOTexist("validateObj");
        /**
         * Validates an object, the same way .validate validates isolated values.
         * @param {string} me
         * @param {object} obj
         * @param {string} name
         * @param {object} checks
         * @param {string} consequence
         * @param {function} errCallback
         */
        var validateObj = function(me, obj, name, checks, consequence, errCallback) {
            // Simply add a check to see if the given value is an object, but hooked to the same error handling.
            var valid1 = _.validate("utils-validation::validateObj", {
                name : [obj, 'obj']
            }, "Could not validate object.", errCallback);
            if(!valid1) return false;

            // Check the object's properties
            var finalChecks = {};
            var invalidChecks = false;
            for(var prop in checks) {
                var args = checks[prop];
                var isArray = utils.array(args);

                // Lazy, single-parameter validation (string or function)
                if(utils.string(args) || utils.func(args)) {
                    finalChecks[prop] = [args];
                    // Normal validation using array
                } else if (isArray) {
                    finalChecks[prop] = utils.clone(args);
                    // Invalid validation
                } else {
                    invalidChecks = true;
                    finalChecks[prop] = [false, "Invalid validation definition."]
                }

                // If checks were invalid, use args as value.
                if(invalidChecks) {
                    finalChecks[prop].unshift(args);
                // Otherwise, add value to arguments.
                } else {
                    finalChecks[prop].unshift(obj[prop]);
                }
            }

            // Adapt consequence to include the validated object's name.
            var finalConsequence = "Invalid object for '{0}'.".fmt(name);
            if(utils.def(consequence)) {
                finalConsequence += " " + consequence;
            }

            // Run regular validation
            return _.validate(me, finalChecks, finalConsequence, errCallback)
        };
        utils.validateObj = utils.validateObj || validateObj;
    };

})();