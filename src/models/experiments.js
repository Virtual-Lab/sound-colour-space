var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

var Experiment = require('./experiment');

module.exports = Backbone.Collection.extend({

    model: Experiment,

    url: function () {
        return apiUrl('experiments');
    },

});
