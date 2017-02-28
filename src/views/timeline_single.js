var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
Backbone.$ = $;

var marked = require('marked');

var imagesLoaded = require('imagesloaded');
// provide jQuery argument
imagesLoaded.makeJQueryPlugin($);


window.jQuery = window.$ = $;
require('velocity-animate');
require('velocity-animate/velocity.ui');
delete window.jQuery;
delete window.$;


var Base = require('./base');

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

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL
    },

    template: require('../templates/timeline_single.dust'),

    /*
     onRemove: function () {
     console.warn('onRemove single');
     $el = this.$el;
     $el.fadeOut("slow", function() {
     Base.SingleView.prototype.onRemove.call(this);
     }).bind(this);

     },*/

    events: {
        "click .eye": function () {
            this.$el.find('img').toggleClass('active');
            this.$el.find('.card').toggleClass('active');
            this.$el.find('.overlay').toggleClass('active');
            var ID = this.model.get('uuid');
            MathJax.Hub.Queue(
                ["Typeset", MathJax.Hub, ID],
                function () {
                    $('#'+ID).html(marked($('#'+ID).html(), {renderer: renderer}));
                    $('#'+ID).css('opacity', '1');
                }
            );
        }
    }
});

