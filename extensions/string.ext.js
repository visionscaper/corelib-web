/**
 * Created by Freddy Snijder on 15/05/14.
 */

/*** EXTENDING STRING ***/

// http://stackoverflow.com/a/4673436/889617
if (!String.prototype.fmt) {
    String.prototype.fmt = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return (typeof args[number] != 'undefined') ? args[number] : match;
        });
    };
}