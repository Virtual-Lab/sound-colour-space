var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var Base = require('./base');

var marked = require('marked');

var renderer = new marked.Renderer();

// override link rendering
renderer.link = function (href, title, text) {

    if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '" target="_blank" data-bypass>' + text + '</a>';
    } else {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '">' + text + '</a>';
    }
};

module.exports = Base.SingleView.extend({

    data: {},

    template: require('../templates/entry_list_single.dust'),

    onShow: function () {

        this.$el.on({
            mouseenter: function () {
                $(this).addClass("active");
            },
            mouseleave: function () {
                $(this).removeClass("active");
            }
        });

        // we skip mathjax, but pretty render the markdown (even link not working, because the whole element is a link)
        $d = this.$el.find('.description');
        $d.html(marked($d.html(), {renderer: renderer}));
        this.$el.find('.description').css('opacity', '1');

    },

    events: {}
});