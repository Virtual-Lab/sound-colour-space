var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');


module.exports = Base.DetailView.extend({

    template: require('../templates/exhibition_detail.dust'),

    onShow: function () {
        // scroll to top
        $(window).scrollTop(0);
    },
});

