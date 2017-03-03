/////////////////////////////////////
// helper functions
/////////////////////////////////////
'use strict';

var scrollToPosition = function(offset) {
    if (App.Helper.offsetTop != undefined) {
        $('html, body').stop().animate({
            scrollTop: offset
        }, 300);
    }
};

exports.scrollToPosition = scrollToPosition;