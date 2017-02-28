var Backbone = require('backbone');
global.$ = global.jQuery = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');

module.exports = Base.DetailView.extend({

    template: require('../templates/source_detail.dust'),

});

