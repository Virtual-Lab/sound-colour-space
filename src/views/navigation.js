'use strict';

global.$ = global.jQuery = require('jquery');

var URI = require('urijs');
var _ = require('underscore');

var Backbone = require('backbone'); Backbone.$ = $;

var foundation = require('foundation-sites');

// configure nprogress
var nprogress = require('nprogress');
nprogress.configure({
    showSpinner: false,
    speed: 50
});
// patch backbone
require('./backbone-nprogress');


//var sticky = require('../helpers/sticky-kit');

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
            /*
             {
             "url": "",
             "text": "Root"
             },
             */
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

    initialize: function (options) {
        this.options = _.extend({}, options);
        _.extend(this.data, options.data);
        _.bindAll(this, 'render', 'onShow');

    },


    onShow: function () {
        //console.log('onShow navigation', Backbone.history.getFragment());

        // initialize foundation on $el
        //this.$el.foundation();

    },

    events: {

        // undefine offsetTop when clicked on navigation menu point
        'click .nav_link': function () {
            App.Helper.offsetTop = 0;
        },

        'click .toggle_menu': function () {
            //this.$el.find('#mobile_menu').css('display', 'block');
            this.$el.find('#mobile_menu').toggle();
        },
    }

})
;


