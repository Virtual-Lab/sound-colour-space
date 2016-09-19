var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

module.exports = Backbone.Model.extend({

    idAttribute: 'uuid',

    initialize: function() {
    },

    url: function() {
        return apiUrl('entry', this.id);
    },

});
