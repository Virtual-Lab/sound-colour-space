var _ = require('underscore');

var Base = require('./base');
var Entries = require('../models/entries');
var TimelineSection = require('./timeline_section.js');

App.Collection.timelineCollections = {};

module.exports = Base.TemplateView.extend({

    template: require('../templates/timeline.dust'),

    data: {

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

    },

    onShow: function () {

        var offset_top = 140;

        var _sectionViews = [];
        _.each(this.data.ranges, function (element, index, list) {

            if (!App.Collection.timelineCollections[element.title]) {
                App.Collection.timelineCollections[element.title] = new Entries({});

                var image_size = 'x-small';
                if (Foundation.MediaQuery.atLeast('large')) {
                    image_size = 'medium'
                }
                App.Collection.timelineCollections[element.title].query = {
                    limit: 4,
                    order_by: 'date',
                    image_size: image_size,
                    date__range: element.range
                };

                App.Collection.timelineCollections[element.title].search({
                    reset: true,
                    data: App.Collection.timelineCollections[element.title].query,
                });
            }

            var view = new TimelineSection({
                collection: App.Collection.timelineCollections[element.title],
                data: element
            });
            this.$('[data-js-region="timeline_sections"]').append(view.render().el);
            view.onShow();
        });

        // Cache selectors
        var lastId,
            timelineMenu = $("#timeline_menu"),
            timelineMenuHeight = offset_top, //timelineMenu.outerHeight() + 15,
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

            }

        });



        /*
         // fetch on scroll

         $(window).on("scroll", _.bind(function () {

         var scrollHeight = $(document).height();
         var scrollPosition = $(window).height() + $(window).scrollTop();

         // user scrolling upwards
         if ($(window).scrollTop() === 0) {

         }

         // user scrolled to bottom of page
         else if ((scrollHeight - scrollPosition) / scrollHeight < 0.1) {

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


         var params = _.extend(
         {date__range: this.data.ranges[this.data.currentRange].range},
         this.collection.query);

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
         */


        // initialize foundation on $el
        this.$el.foundation();
    },

    onRemove: function () {
        $(window).unbind('scroll');
    },

    events: {}

});