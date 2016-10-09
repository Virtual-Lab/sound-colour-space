var Base = require('./base');

var Entries = require('../models/entries');
var EntryListView = require('./entry_list');
var EntryTimelineView = require('./timeline');

var swap = require('../views/swap.js');


module.exports = Base.TemplateView.extend({

    template: require('../templates/archive.dust'),

    data: {
        logged_in_slug: SLUG    // used in the template to check if the user is on his own profile page
    },

    onShow: function () {

        // render and fetch entries

        //var view = new EntryListView({collection: this.options.collection});
        var view = new EntryTimelineView({collection: this.options.collection});
        //App.view = view;

        swap($('[data-js-region="entry_list"]'), view);

        if (this.data.query) {
            console.log('do search...', this.data.query);
            this.options.collection.search({
                reset: true,
                data: {
                    q: this.data.query,
                    limit: 100
                },
                success: function (collection, response, options) {
                    console.warn("adding new", collection.models.length);
                    App.entries.add(collection.models); // merge into App.entries
                }
            })
        } else {
            this.options.collection.fetch({
                remove: false,
                data: {
                    limit: 100
                }
            });
        }


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

    /*
     events: {
     "click .load": function () {
     if (App.entries.meta !== undefined && App.entries.meta.next != null) {
     App.entries.url = App.entries.meta.next;
     App.entries.fetch({
     remove: false
     });
     }
     }
     },
     */

});
