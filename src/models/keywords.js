var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

var Keyword = require('./keyword');

module.exports = Backbone.Collection.extend({

    model: Keyword,

    url: function () {
        return apiUrl('keywords');
    },

});
