var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;


var Base = require('./base');
var EntryListSingleView = require('./entry_list_single');

var swap = require('../views/swap.js');


module.exports = Base.ListView.extend({

    template: require('../templates/entry_list.dust'),

    addOne: function (model) {
        //console.debug('add', model.id);
        var view = new EntryListSingleView({model: model, tagName: "tr"});
        this.$(".entries").append(view.render().el);
        view.onShow();
    },

    onShow: function () {

        this.collection.each(this.addOne, this);


    },
});