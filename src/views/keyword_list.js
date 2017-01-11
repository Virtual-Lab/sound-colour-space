var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;

var Base = require('./base');
var swap = require('../views/swap.js');

var KeywordSingleView = Base.SingleView.extend({
    tagName: 'li',
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

    onSync: function () {
        //Base.ListView.prototype.onSync.call(this);
        console.debug('############################################onSync list');
    },


    onShow: function () {
        console.debug("############################################onShow list");
        this.collection.each(this.addOne, this);
    },

    events: {
    }
});