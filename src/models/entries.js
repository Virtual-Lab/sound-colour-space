var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

var Entry = require('./entry');

module.exports = Backbone.Collection.extend({

    model: Entry,

    url: function () {
        return apiUrl('entries');
    },

    search: function (options) {
        options = options || {};
        if (options.url === undefined) {
            options.url = apiUrl('entries') + 'search';
        }
        return Backbone.Model.prototype.fetch.call(this, options);
    },
});
