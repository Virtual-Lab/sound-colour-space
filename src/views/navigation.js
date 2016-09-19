'use strict';
var Backbone = require('backbone');

// foundation needs global.$ because it doesn't "require" jquery for some reason
global.$ = global.jQuery = require('jquery');
var foundation = require('foundation-sites');

var _ = require('underscore');
Backbone.$ = $;

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
        STATIC_URL: STATIC_URL
    },

    initialize: function (options) {
        this.options = _.extend({}, options);
        _.extend(this.data, options.data);
        _.bindAll(this, 'render', 'onShow');

    },


    onShow: function () {
        this.$el.foundation();
        //Foundation.reInit('dropdown-menu');
        //Foundation.reInit($('.dropdown menu'));
        console.log('onShow navigation');
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
        App.Router.r.navigate('/q=' + v, {trigger: true});
    },

})
;


