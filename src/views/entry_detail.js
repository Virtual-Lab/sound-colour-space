var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');


module.exports = Base.DetailView.extend({

    template: require('../templates/entry_detail.dust'),

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL,
    },

    onShow: function () {
        // scroll to top
        $(window).scrollTop(0);

        // typeset math
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

    },

    events: {},

});

