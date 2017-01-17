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

    /*
    // override render function because adding items must be done in the onShow() function
    render: function () {

        this.template(_.extend(this.data, {meta: this.collection.meta}), function (err, out) {
            if (err) {
                console.error(err);
            }
            else {
                this.$el.html($(out).html());
                this.$el.attr($(out).attr());
            }
        }.bind(this));

        return this;
    },

    onShow: function () {
        //console.debug("############################################onShow list");
        this.collection.each(this.addOne, this);
    },
    */

});