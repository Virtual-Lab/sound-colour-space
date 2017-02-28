var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;


var imagesLoaded = require('imagesloaded');
// provide jQuery argument
imagesLoaded.makeJQueryPlugin($);

var Packery = require('packery');
// make Packery a jQuery plugin
var jQueryBridget = require('jquery-bridget');
jQueryBridget('packery', Packery, $);

var Base = require('./base');
var EntryGridSingleView = require('./entry_grid_single');

var swap = require('../views/swap.js');

module.exports = Base.ListView.extend({

    template: require('../templates/entry_grid.dust'),

    addOne: function (model) {
        //console.debug('add', model.id);
        var view = new EntryGridSingleView({model: model});
        this.$(".entries").append(view.render().el);
        view.onShow(); // TODO call onShow automatically

        view.$el.imagesLoaded()
            .progress(function (instance, image) {
                //$('.grid-item').fadeIn();
                $('.grid').packery('appended', view.$el);
            });
    },

    removeOne: function (model, collection, options) {
        $('.grid').packery('remove', this.$('.'+model.get('uuid'))).packery('shiftLayout');
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

    onShow: function () {
        //console.debug("############################################onShow list");

        $('.grid').append('<div class="grid-sizer"></div>');
        //this.$el.find(".entries").append('<div class="gutter-sizer"></div>');

        $('.grid').packery({
            "itemSelector": ".grid-item",
            "columnWidth": ".grid-sizer",
            "percentPosition": true,
            "transitionDuration": "0.2s"
        });

        this.collection.each(this.addOne, this);

    },

    events: {},

});