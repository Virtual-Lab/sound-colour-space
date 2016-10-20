var Base = require('./base.js');

// layout template
module.exports = Base.TemplateView.extend({
    template: require('../templates/homepage.dust'),

    data: {
        STATIC_URL: STATIC_URL, // TODO make static url available globally in all templates
    },

    onShow: function () {
    }
});