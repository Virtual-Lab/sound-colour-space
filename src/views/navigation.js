'use strict';

//var $ = require('jquery');
global.$ = global.jQuery = require('jquery');
var _ = require('underscore');

var Backbone = require('backbone');
Backbone.$ = $;

// foundation needs global.$ because it doesn't "require" jquery for some reason

require('foundation-sites');

// configure nprogress
var nprogress = require('nprogress');
nprogress.configure({
    showSpinner: false,
    speed: 50
});
// patch backbone
require('backbone-nprogress');


var Base = require('./base.js');
var apiUrl = require('../apiUrl');

module.exports = Base.TemplateView.extend({

    template: require('../templates/navigation.dust'),

    data: {
        STATIC_URL: STATIC_URL,

        "currentUrl": function () {
            return (Backbone.History.started == true ? Backbone.history.getFragment().split('/')[0] : '/');
        },


        menu: [
            /*
             {
             "url": "",
             "text": "Root"
             },
             */
            {
                "url": "archive",
                "text": "Archive"
            },
            {
                "url": "timeline",
                "text": "Timeline"
            },
            {
                "url": "exibitions",
                "text": "Exibitions"
            },
            {
                "url": "virtuallab",
                "text": "Virtual Lab"
            },
            {
                "url": "documentation",
                "text": "Documentation"
            }
        ]

    },

    initialize: function (options) {
        this.options = _.extend({}, options);
        _.extend(this.data, options.data);
        _.bindAll(this, 'render', 'onShow');

    },


    onShow: function () {
        console.log('onShow navigation', Backbone.history.getFragment());
    },

    events: {
        'click button.search': 'filter',
        'keypress input[type=search]': 'filterOnEnter',
        'search input[type=search]': 'filterOnEnter',
    },

    filterOnEnter: function (e) {
        if (e.which !== 13) return;
        this.filter(e);
    },
    filter: function (e) {
        var v = $('input.search').val();
        if (v === '') return;
        $('input.search').blur(); // TODO loose focus on mobile only?
        App.Router.r.navigate('/archive/q=' + v, {trigger: true});
    },

})
;


