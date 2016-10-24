var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var Base = require('./base');

module.exports = Base.SingleView.extend({

    data: {},

    template: require('../templates/experiment_single.dust'),

    onShow: function () {

        this.$el.on({
            mouseenter: function () {
                $(this).addClass("active");
            },
            mouseleave: function () {
                $(this).removeClass("active");
            }
        });
    },

    events: {}
});