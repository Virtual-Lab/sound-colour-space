var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

module.exports = Backbone.Model.extend({

    idAttribute: 'slug',

    initialize: function() {
    },

    url: function() {
        return apiUrl('source', this.id);
    },

});
