var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;


var Base = require('./base');
var EntrySingleView = require('./entry_single');

var swap = require('../views/swap.js');


module.exports = Base.ListView.extend({

    template: require('../templates/entry_list.dust'),

    addOne: function (model) {
        //console.debug('add', model.id);
        var view = new EntrySingleView({model: model, tagName: "tr"});
        this.$(".entries").append(view.render().el);
        view.onShow(); // TODO call onShow automatically
    },

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

    onSync: function () {
        //Base.ListView.prototype.onSync.call(this);
        //console.debug('############################################onSync list');
        //swap($('[data-js-region="entry_list_header"]'), new MetaView({data: {meta: this.collection.meta}}));
    },


    onShow: function () {
        //console.debug("############################################onShow list");

        this.collection.each(this.addOne, this);
    },

    events: {
        /*
        'click .title-asc': function () {
            this.collection.reverseSortDirection = false;
            this.collection.sortKey = 'title';
            this.collection.sort(); this.render(); this.onShow();
        },
        'click .title-desc': function () {
            this.collection.reverseSortDirection = true;
            this.collection.sortKey = 'title';
            this.collection.sort(); this.render(); this.onShow();
        }
        */

    }
});