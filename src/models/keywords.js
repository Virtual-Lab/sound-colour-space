var _ = require('underscore');
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

    search: function (letters) {
        if (letters == "") return this;

        var pattern = new RegExp(letters, "gi");

        return this.filter(function (data) {
            return pattern.test(data.get("name"));
        });
    }

});
