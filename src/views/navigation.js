'use strict';
var URI = require('urijs');
var _ = require('underscore');
var Backbone = require('backbone');

// configure nprogress
var nprogress = require('nprogress');
nprogress.configure({
    showSpinner: false,
    speed: 50
});
// patch backbone
require('./backbone-nprogress');

var Base = require('./base.js');
var apiUrl = require('../apiUrl');

module.exports = Base.TemplateView.extend({

    template: require('../templates/navigation.dust'),

    data: {
        STATIC_URL: STATIC_URL,

        "currentUrl": function () {
            return (Backbone.History.started == true ? '/'+URI(window.location.href).segment(0): '/');
        },

        menu: [
            {
                "url": "/archive",
                "text": "Archive"
            },
            {
                "url": "/sets",
                "text": "Sets"
            },
            {
                "url": "/timeline",
                "text": "Timeline"
            },
            {
                "url": "/keywords",
                "text": "Keywords"
            },
            {
                "url": "/exhibitions",
                "text": "Exhibitions"
            },
            {
                "url": "/virtuallab",
                "text": "Virtual Lab"
            },
            {
                "url": "/about",
                "text": "About"
            }
        ]

    },

    events: {
        'click .toggle_menu': function () {
            this.$el.find('#mobile_menu').toggle();
        },
    }

});


