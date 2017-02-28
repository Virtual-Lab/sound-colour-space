var Base = require('./base.js');

var URI = require('urijs');

// layout template
module.exports = Base.TemplateView.extend({
    template: require('../templates/404.dust'),

    search: function () {
        var query = this.$el.find('input.search').val();
        if (query == '') return;
        var params = 'q=fulltext::' + query;
        var uri = new URI('/archive?' + params).readable();
        App.Router.r.navigate(uri, {trigger: true, replace: false});
    },

    keyPressed: function (e) {
        if (e.which !== 13) return;  // return if not RETURN pressed
        this.search();
    },

    events: {
        'click .button.search': 'search',
        'keypress input[type=search]': 'keyPressed',
        'search input[type=search]': 'keyPressed'
    }
});