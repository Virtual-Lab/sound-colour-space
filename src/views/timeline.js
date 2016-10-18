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
        'changed.zf.slider #date_slider': function() {
            //cthis.options.parent.doQuery();
        }
    }
});

App.Helper.i = 0;
App.Helper.d = 20;  // margin
App.Helper.top_right_column = 0;
App.Helper.top_left_column = 0;

module.exports = Base.ListView.extend({

    template: require('../templates/timeline.dust'),

    addOne: function (model) {

        //console.debug('add', model.id);
        var view = new EntrySingleTimelineView({model: model});
        this.$("#timeline_content").append(view.render().el);
        view.onShow();

        view.$el.css('position', 'absolute');

        // increase counter
        App.Helper.i++;

        if (App.Helper.i % 2 == 0) {
            view.$el.css('top', App.Helper.top_right_column + 'px');
            //view.$el.css('left', '586px');
            view.$el.css('right', '0px');
            App.Helper.top_right_column += model.get('image').height + App.Helper.d;
        }
        else {
            view.$el.addClass('left-col');
            view.$el.css('top', App.Helper.top_left_column + 'px');
            //view.$el.css('left', '0px');
            App.Helper.top_left_column += model.get('image').height + App.Helper.d;
        }

        view.$el.imagesLoaded()
            .progress(function (instance, image) {
                this.$('#timeline').css('height', $(document).height() + "px");
            }.bind(this));
    },

    removeOne: function (model, collection, options) {
        //$('.grid').packery('remove', this.$('.'+model.get('uuid'))).packery('shiftLayout');
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
        console.debug('############################################onSync timeline');
        //swap($('[data-js-region="timeline_header"]'), new MetaView({parent: this, data: {meta: this.collection.meta}}));
    },


    doQuery: function() {
        var self = this;
        if (this.data.query) {
            console.log('do search...', this.data.query);
            this.options.collection.search({
                reset: true,
                data: {
                    q: this.data.query,
                    limit: 10
                },
                success: function (collection, response, options) {
                    console.warn("adding new", collection.models.length);
                    swap($('[data-js-region="timeline_header"]'), new MetaView({parent: self, data: {meta: collection.meta}}));
                    //App.entries.add(collection.models); // merge into App.entries
                }
            });
        } else {
            this.options.collection.fetch({
                remove: false,
                data: {
                    limit: 10
                }
            });
        }

    },

    onShow: function () {

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
                            console.warn("adding", response.objects.length, "total: ", collection.models.length);
                            App.entries.add(collection.models); // merge into App.entries
                        }
                    });
                }
            }
        }, this));
    },


    events: {}

});