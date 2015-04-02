/**
 * Created by Freddy Snijder on 15/05/14.
 */


(function() {
    var NS = null;

    var __isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
    if (__isNode) {
        require("../extensions/string.ext.js");

        NS = exports;
    } else {
        //Add to Visionscapers namespace
        NS = window["__VI__"] || window;
    }

    //using underscore.js _ as base object
    //changing and augmenting it where we want to
    NS.UtilsStrings = {};
    NS.UtilsStrings.addTo = function (utils, log) {

        if (typeof(log) != "object") {
            console.warn("UtilsStrings : no logging object provided, using browser console logger");
            log = console;
        }

        if ((typeof(utils) != "object") && (typeof(utils) != "function")) {
            log.error("UtilsStrings", "No valid utils object given, not adding utils");
            return;
        }

        if ((typeof(utils._utilsComponents) != "object") || (!utils._utilsComponents["base"])) {
            log.error("UtilsStrings", "This utils component needs the base utils component, not adding utils");
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
            utils._utilsComponents["strings"] = true;
        }

        /**************************************************
         *
         * END Register utils component
         *
         **************************************************/

        utils._mustNOTexist("joinPaths");
        /**
         *
         * Joins paths in the paths array, by ensuring that there are no double slashes at
         * the join positions
         *
         * @param {Array} paths
         *
         * @returns {String|null}
         *
         */
        var joinPaths = function (paths) {
            var concatenated = null;

            if (!utils.array(paths)) {
                return concatenated;
            }

            var nextPath;
            var numPaths = paths.length;
            if (numPaths == 0) {
                concatenated = "";
            } else if (numPaths == 1) {
                concatenated = paths[0] + "";
            }

            if (utils.string(concatenated)) {
                return concatenated;
            }

            var __join = function (path1, path2) {
                path1 = path1 + "";
                path2 = path2 + "";

                var firstPathEndsWithSlash = (path1[path1.length - 1] == '/');
                var secondPathStartsWithSlash = (path2[0] == '/');

                if (!firstPathEndsWithSlash) {
                    path1 += '/';
                }

                if (secondPathStartsWithSlash) {
                    path2 = path2.slice(1);
                }

                return path1 + path2;
            };

            concatenated = paths[0];
            for (var idx = 1; idx < numPaths; idx++) {
                nextPath = paths[idx];

                concatenated = __join(concatenated, nextPath);
            }

            return concatenated;
        };
        utils.joinPaths = utils.joinPaths || joinPaths;


        utils._mustNOTexist("url");
        var URLPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

        /**
         *
         * Returns true if given string is a valid URL, else false
         *
         * @param {String} str     string to be tested
         *
         * @returns {boolean}
         *
         */
        var url = function (str) {
            return (URLPattern.test(str) === true);
        };
        utils.url = utils.url || url;

        utils._mustNOTexist("trim");
        //From https://github.com/visionmedia/superagent
        var trim = function (s) {
            return s.replace(/(^\s*|\s*$)/g, '');
        };
        utils.trim = utils.trim || trim;

        utils._mustNOTexist("capitaliseFirst");
        var capitaliseFirst = function (s) {
            if (!utils.string(s)) {
                return null;
            }

            return s.charAt(0).toUpperCase() + s.slice(1);
        };
        utils.capitaliseFirst = utils.capitaliseFirst || capitaliseFirst;

        utils._mustNOTexist("encoded");
        /**
         *
         * HTML entity encodes the string
         *
         * @param {String} s
         *
         * @returns {String|null}
         *
         */
        var encoded = function (s) {
            var encodedStr = null;

            if (!utils.string(s)) {
                return encodedStr;
            }

            //http://stackoverflow.com/a/18750001/889617
            var encodedStr = s.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return '&#' + i.charCodeAt(0) + ';';
            });

            return encodedStr;
        };
        utils.encoded = utils.encoded || encoded;
    };

})();