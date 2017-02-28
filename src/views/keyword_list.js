var _ = require('underscore');

var Base = require('./base');

var Keywords = require('../models/keywords.js');

var KeywordSingleView = Base.SingleView.extend({
    template: require('../templates/keyword_single.dust'),
});


module.exports = Base.ListView.extend({

    template: require('../templates/keyword_list.dust'),

    addOne: function (model) {
        //console.log('adding', model.id);
        var view = new KeywordSingleView({model: model});
        this.$(".entries").append(view.render().el);
        view.onShow();
    },

    doFilter: function () {


        var name = this.$el.find('input[type=search]').val();

        App.Keywords.fetch({
            data: {
                order_by: 'name',
                name__icontains: name,
                limit: 10000 // make sure we get all
            }
        });


    },

    removeFilter: function () {
        App.Keywords.fetch({
            data: {
                order_by: 'name',
                limit: 10000 // make sure we get all
            }
        });
    },

    keyPressed: function (e) {
        if (e.which !== 13) return;  // return if not RETURN pressed
        this.doFilter();
    },

    events: {
        'keypress input[type=search]': 'keyPressed',
        'search input[type=search]': 'keyPressed',
        'click .remove_filter': 'removeFilter',
    }

});