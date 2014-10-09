/**
 * Created by Freddy on 16/05/14.
 */


try {
    _Collaspace     = _Collaspace || {};
    _CS             = _Collaspace;
} catch(e) {
    _Collaspace     = _CS = {};
}


_CS.Base            = Class({

    _valid      : false,

    constructor : function() {

    },

    isValid     : function() {
        return this._valid;
    }

});