var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

var Set = require('./set');

module.exports = Backbone.Collection.extend({

    model: Set,

    url: function () {
        return apiUrl('sets');
    },

});
