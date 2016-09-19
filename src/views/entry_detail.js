var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
Backbone.$ = $;

var Base = require('./base');

module.exports = Base.DetailView.extend({

    template: require('../templates/entry_detail.dust'),

    data: { },

    onShow: function() {
        // scroll to top
        $(window).scrollTop(0);
    },

    events: {
    },


});

