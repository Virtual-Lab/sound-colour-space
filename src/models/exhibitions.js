var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

var Exhibition = require('./exhibition');

module.exports = Backbone.Collection.extend({

    model: Exhibition,

    url: function () {
        return apiUrl('exhibitions');
    },

});
