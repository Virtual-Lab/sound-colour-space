var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;

// foundation needs global.$ because it doesn't "require" jquery for some reason
global.$ = global.jQuery = require('jquery');
require('foundation-sites');

var imagesLoaded = require('imagesloaded');
// provide jQuery argument
imagesLoaded.makeJQueryPlugin($);


var Base = require('./base');
var EntrySingleTimelineView = require('./timeline_single');

var swap = require('../views/swap.js');

var MetaView = Base.TemplateView.extend({

    /*
     initialize: function(options) {
     Base.TemplateView.prototype.initialize.apply(this, [options]);
     this.parent = options.parent;
     },
     */

    template: require('../templates/timeline_header.dust'),

    onShow: function () {

        console.log(this.options.parent);

        this.date_slider = new Foundation.Slider($('#date_slider'), {
            start: 800,
            end: 1900,
            step: 10,
            initialStart: 800,
            initialEnd: 900,
            //doubleSided: true,
            //binding: true,
            clickSelect: true,
            changedDelay: 500
        });
    },

    events: {
        'moved.zf.slider #date_slider': function () {
            $('#dateSliderStart').text(this.date_slider.$input.val());
            $('#dateSliderEnd').text(this.date_slider.$input2.val());
        },
        'changed.zf.slider #date_slider': function () {
            //cthis.options.parent.doQuery();
        }
    }
});


module.exports = Base.TemplateView.extend({

    template: require('../templates/timeline.dust'),

    data: {
        item_counter: 0,
        item_margin: 25,  // margin
        top_right_column: 0,
        top_left_column: 0,
    },

    addOne: function (model) {

        //console.debug('add', model.id);
        var view = new EntrySingleTimelineView({model: model});
        this.$("#timeline_content").append(view.render().el);
        view.onShow();

        view.$el.css('position', 'absolute');

        // increase counter
        this.data.item_counter++;

        //var height = Math.min(model.get('image').height, 108); // TODO set height according to settings.py / browser
        var height = model.get('image').height;

        if (this.data.item_counter % 2 == 0) {
            view.$el.css('right', '0px');
            view.$el.css('top', this.data.top_right_column + 'px');
            this.data.top_right_column += height + this.data.item_margin;
        }
        else {
            view.$el.addClass('left-col');
            view.$el.css('top', this.data.top_left_column + 'px');
            this.data.top_left_column += height + this.data.item_margin;
        }

        view.$el.imagesLoaded()
            .progress(function (instance, image) {
                this.$('#timeline').css('height', $(document).height() + "px");
            }.bind(this));

        //console.warn("total items: ", this.data.item_counter);
        //console.warn("top_right_column: ", this.data.top_right_column);
    },

    removeOne: function (model, collection, options) {
        //$('.grid').packery('remove', this.$('.'+model.get('uuid'))).packery('shiftLayout');
    },

    onSync: function () {
        //Base.ListView.prototype.onSync.call(this);
        console.debug('############################################onSync timeline');
        //swap($('[data-js-region="timeline_header"]'), new MetaView({parent: this, data: {meta: this.collection.meta}}));
    },

    doQuery: function () {

        console.log('doQuery');

        var self = this;
        if (this.data.query) {
            console.log('do search...', this.data.query);
            this.options.collection.search({
                reset: true,
                data: {
                    q: this.data.query,
                    limit: 10,
                    image_size: 'medium'
                },
                success: function (collection, response, options) {
                    console.warn("adding new", collection.models.length);
                    swap($('[data-js-region="timeline_header"]'), new MetaView({
                        parent: self,
                        data: {meta: collection.meta}
                    }));
                    //App.entries.add(collection.models); // merge into App.entries
                }
            });
        } else {
            this.options.collection.fetch({
                //reset: true,
                remove: false,
                data: {
                    limit: 10,
                    image_size: 'medium'
                },
                /*
                success: function (collection, response, options) {
                    console.warn("adding new", collection.models.length);
                    //this.collection.add(collection.models); // merge into App.entries
                    collection.each(this.addOne, this);
                }
                */
            });
        }

    },

    onShow: function () {

        this.listenTo(this.options.collection, 'add', this.addOne);
        this.listenTo(this.options.collection, 'remove', this.removeOne);

        this.doQuery();

        // fetch on bottom
        $(window).on("scroll", _.bind(function () {
            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();
            if ((scrollHeight - scrollPosition) / scrollHeight === 0) {

                // load more!
                if (this.options.collection.meta !== undefined && this.options.collection.meta.next != null) {
                    this.options.collection.url = this.options.collection.meta.next;
                    this.options.collection.fetch({
                        remove: false,
                        success: function (collection, response, options) {
                            //console.warn("adding", response.objects.length, "total: ", collection.models.length);
                            //App.entries.add(collection.models); // merge into App.entries
                        }
                    });
                }
            }
        }, this));
    },


    events: {}

});