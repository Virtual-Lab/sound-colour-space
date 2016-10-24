var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');


module.exports = Base.DetailView.extend({

    template: require('../templates/experiment_detail.dust'),

    data: {

    },

    onShow: function () {
        // scroll to top
        $(window).scrollTop(0);
    },

    events: {},




});

