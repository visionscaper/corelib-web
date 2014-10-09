/**
 * Created by Freddy on 15/05/14.
 */

//using underscore.js _ as base object
//changing and augmenting it where we want to

(function(utils, log) {

    if (typeof(log) != "object") {
        console.warn("Utils : no logging object provided, using browser console logger");
        log = console;
    }

    if ((typeof(utils) != "object") && (typeof(utils) != "function")) {
        log.error("Utils", "No valid utils object given, not adding execution utils");
        return;
    }

    if ((typeof(utils._utilsComponents) != "object") || (!utils._utilsComponents["base"])) {
        log.error("Utils", "This utils component needs the base utils component, not adding execution utils");
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
    var joinPaths = function(paths) {
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

        var _join = function(path1, path2) {
            path1 = path1 + "";
            path2 = path2 + "";

            var firstPathEndsWithSlash      = (path1[path1.length-1] == '/');
            var secondPathStartsWithSlash   = (path2[0] == '/');

            if (!firstPathEndsWithSlash) {
                path1 += '/';
            }

            if (secondPathStartsWithSlash) {
                path2 = path2.slice(1);
            }

            return path1+path2;
        };

        concatenated = paths[0];
        for(var idx = 1; idx < numPaths; idx++) {
            nextPath = paths[idx];

            concatenated = _join(concatenated, nextPath);
        }

        return concatenated;
    };
    utils.joinPaths = utils.joinPaths || joinPaths;

})(_, _l);