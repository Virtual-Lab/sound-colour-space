var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
Backbone.$ = $;

var imagesLoaded = require('imagesloaded');
// provide jQuery argument
imagesLoaded.makeJQueryPlugin($);

var Packery = require('packery');
// make Packery a jQuery plugin
var jQueryBridget = require('jquery-bridget');
jQueryBridget('packery', Packery, $);


window.jQuery = window.$ = $;
require('velocity-animate');
require('velocity-animate/velocity.ui');
delete window.jQuery;
delete window.$;


var Base = require('./base');

module.exports = Base.SingleView.extend({

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL
    },

    template: require('../templates/entry_grid_single.dust'),

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

    /*
    onRemove: function () {
        console.warn('onRemove single');
        $el = this.$el;
        $el.fadeOut("slow", function() {
            Base.SingleView.prototype.onRemove.call(this);
        }).bind(this);

    },*/

    events: {}
});