var Backbone = require('backbone');
global.$ = global.jQuery = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var marked = require('marked');

var Base = require('./base');

var Lightbox = require('../helpers/lightbox');

var renderer = new marked.Renderer();

// override link rendering
renderer.link = function (href, title, text) {

    if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '" target="_blank" data-bypass>' + text + '</a>';
    } else {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '">' + text + '</a>';
    }
};

module.exports = Base.DetailView.extend({

    template: require('../templates/entry_detail.dust'),

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL,
    },

    onShow: function () {

        // scroll to top
        $(window).scrollTop(0);

        MathJax.Hub.Queue(
            ["Typeset", MathJax.Hub, "description"],
            function () {
                $('.description').html(marked($('.description').html(), {renderer: renderer}));
                $('.description').css('opacity', '1');
            }
        );

    },

    events: {

        'click img': function (e) {

            var lightbox = new Lightbox();

            lightbox.load({
                //maxImgSize: 1.0,
            });
            e.preventDefault();

            var img = new Image();
            // hack to get the full size image
            img.src = this.model.get('image').url.split('.')[0] + '.' + this.model.get('image').url.split('.')[1];
            // set caption
            img.setAttribute('data-jslghtbx-caption', this.model.get('title'));

            lightbox.open(
                img
            );

        }

    },

});

