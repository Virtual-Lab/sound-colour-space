global.$ = global.jQuery = require('jquery');

var foundation = require('foundation-sites');
var Backbone = require('backbone');
Backbone.$ = $;
var _ = require('underscore');

var imagesLoaded = require('imagesloaded');
imagesLoaded.makeJQueryPlugin($);

var Base = require('./base');
var EntrySingleTimelineView = require('./timeline_single');

require('../helpers/sticky-kit');


module.exports = Base.TemplateView.extend({

    template: require('../templates/timeline.dust'),

    data: {
        item_counter: 0,
        item_margin: 25,  // margin
        top_right_column: 0,
        top_left_column: 0,

        ranges: [
            {range: "900,1199", title: "10th century", class: "10th"},
            {range: "1200,1299", title: "13th century", class: "13th"},
            {range: "1300,1399", title: "14th century", class: "14th"},
            {range: "1400,1499", title: "15th century", class: "15th"},
            {range: "1500,1599", title: "16th century", class: "16th"},
            {range: "1600,1699", title: "17th century", class: "17th"},
            {range: "1700,1799", title: "18th century", class: "18th"},
            {range: "1800,1899", title: "19th century", class: "19th"},
            {range: "1900," + new Date().getFullYear(), title: "20th century", class: "20th"},
        ],
        currentRange: 0,
        readyToFetch: true,

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

        if (this.data.top_left_column >= this.data.top_right_column) {
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
                //this.$('#timeline_navigator_sizer').css('height', $(document).height() + "px");
            }.bind(this));
    },

    removeOne: function (model, collection, options) {
        //$('.grid').packery('remove', this.$('.'+model.get('uuid'))).packery('shiftLayout');
    },

    onSync: function () {
        //Base.ListView.prototype.onSync.call(this);
        console.debug('############################################onSync timeline');
        //swap($('[data-js-region="timeline_header"]'), new MetaView({parent: this, data: {meta: this.collection.meta}}));
    },

    addSection: function() {
        var Section = Base.TemplateView.extend({
            template: require('../templates/timeline_section_header.dust'),
            data: this.data.ranges[this.data.currentRange],
        });
        var $header = new Section({}).render().$el;
        if (this.data.top_right_column > this.data.top_left_column) {
            $header.css('top', this.data.top_right_column + 'px');
            this.$('#timeline_content').append($header);
            this.data.top_right_column += $header.height();
            this.data.top_left_column = this.data.top_right_column
        } else {
            $header.css('top', this.data.top_left_column + 'px');
            var $h = this.$('#timeline_content').append($header);
            this.data.top_left_column +=  $header.height();
            this.data.top_right_column = this.data.top_left_column;
        }
    },

    onShow: function () {

        /*
        this.data.top_right_column = 0;
        this.data.top_left_column = 0;
        this.data.item_counter = 0;
        this.data.currentRange = 0;
        this.data.readyToFetch = true;
        */

        $("[data-sticky_navigator]").stick_in_parent({
            parent: "[data-sticky_navigator_parent]",
            offset_top: 90,
            bottoming: false
        });

        this.listenTo(this.options.collection, 'add', this.addOne);
        this.listenTo(this.options.collection, 'remove', this.removeOne);

        // add 1st header
        this.addSection();

        var params = _.extend({date__range: this.data.ranges[this.data.currentRange].range}, this.collection.query);

        this.collection.search({
            reset: true,
            data: params,
            success: function (collection, response, options) {

            }.bind(this)
        });


        // Cache selectors
        var lastId,
            timelineMenu = $("#timeline_menu"),
            timelineMenuHeight = 90.0, //timelineMenu.outerHeight() + 15,
            // All list items
            menuItems = timelineMenu.find("a");
        // Anchors corresponding to menu items
        this.scrollItems = menuItems.map(function () {
            var item = $($(this).attr("href"));
            if (item.length) {
                return item;
            }
        });


        // Bind click handler to menu items
        // so we can get a fancy scroll animation
        menuItems.click(function (e) {
            var href = $(this).attr("href"),
                offsetTop = href === "#" ? 0 : $(href).offset().top - timelineMenuHeight + 1;
            $('html, body').stop().animate({
                scrollTop: offsetTop
            }, 300);
            e.preventDefault();
        });

        // scroll spy for navigation
        var that = this;
        $(window).scroll(function () {
            // Get container scroll position
            var fromTop = $(this).scrollTop() + timelineMenuHeight;

            // Get id of current scroll item
            var cur = that.scrollItems.map(function () {
                if ($(this).offset().top < fromTop)
                    return this;
            });
            // Get the id of the current element
            cur = cur[cur.length - 1];
            var id = cur && cur.length ? cur[0].id : "";

            if (lastId !== id) {
                lastId = id;
                // Set/remove active class
                menuItems
                    .parent().removeClass("active")
                    .end().filter("[href='#" + id + "']").parent().addClass("active");
                //console.warn(id);
            }

        });


        // fetch on scroll

        $(window).on("scroll", _.bind(function () {

            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();

            // user scrolling upwards
            if ($(window).scrollTop() === 0) {

            }

            // user scrolled to bottom of page
            else if ((scrollHeight - scrollPosition) / scrollHeight === 0) {

                // load more of the same if we have more pages!
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
                // or else advance to next time period..
                else if (this.data.readyToFetch) {

                    this.data.readyToFetch = false;

                    this.data.currentRange += 1;
                    this.addSection();


                    var params = _.extend({date__range: this.data.ranges[this.data.currentRange].range}, this.collection.query);

                    this.collection.search({
                        remove: false,
                        data: params,
                        success: function (collection, response, options) {

                            this.data.readyToFetch = true; // we can fetch another range

                            // update sections
                            this.scrollItems = menuItems.map(function () {
                                var item = $($(this).attr("href"));
                                if (item.length) {
                                    return item;
                                }
                            });

                        }.bind(this)
                    });
                }
            }
        }, this));


        // initialize foundation on $el
        this.$el.foundation();
    },

    onRemove: function () {
        $(window).unbind('scroll');
    },

    events: {}

});