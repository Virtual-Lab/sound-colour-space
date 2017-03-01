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

var TimelineSingleView = require('./timeline_single.js');

module.exports = Base.ListView.extend({

    template: require('../templates/timeline_section.dust'),


    addOne: function (model) {
        //console.debug('add', model.id);
        var view = new TimelineSingleView({model: model});
        this.$(".entries").append(view.render().el);

        view.onShow();

        view.$el.imagesLoaded()
            .progress(function (instance, image) {

                $('.grid.' + this.options.data.class).packery('appended', view.$el);

                if (view.$el.position().left < 400) { // TODO maybe calculate half of div width?
                    view.$el.addClass("left-col");

                } else {
                    view.$el.addClass("right-col");
                }

                $('#timeline').height($(document).height());

            }.bind(this));
    },

    removeOne: function (model, collection, options) {
        $('.grid').packery('remove', this.$('.' + model.get('uuid'))).packery('shiftLayout');
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

    loadMore: function () {
        // load more!
        if (this.collection.meta !== undefined && this.collection.meta.next != null) {
            //console.warn(this.collection.meta.next);
            this.collection.url = this.collection.meta.next;

            this.collection.fetch({
                remove: false,
                success: function (collection, response, options) {
                    //console.warn("adding", response.objects.length, "total", this.collection.length);
                    //this.entry_list_header_meta();

                    if (this.collection.meta.next == null) {
                        this.disableLoadMore();
                    }

                }.bind(this)
            });
        }
    },

    disableLoadMore: function () {
        this.$el.find('.load_more').remove();
        //this.$el.find('.load_more').html("All diagrams loaded.");
    },


    onShow: function () {

        $('.entries').append('<div class="grid-sizer"></div>');
        this.$el.find(".entries").append('<div class="gutter-sizer"></div>');

        var $entries = $('.entries').packery({
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer',
            gutter: '.gutter-sizer',
            //percentPosition: true,
            transitionDuration: '0.2s'
        });

        this.collection.each(this.addOne, this);


    },

    events: {
        'click .load_more': 'loadMore',
    },

});