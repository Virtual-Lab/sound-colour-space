var Base = require('./base.js');

// layout template
module.exports = Base.TemplateView.extend({
    template: require('../templates/404.dust'),

    onShow: function() {

    }
});