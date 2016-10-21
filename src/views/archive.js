var Base = require('./base');

var EntryListView = require('./entry_list');
var EntryGridView = require('./entry_grid');

var swap = require('../views/swap.js');


var MetaView = Base.TemplateView.extend({
    template: require('../templates/entry_list_header.dust'),
});


module.exports = Base.TemplateView.extend({

    template: require('../templates/archive.dust'),

    data: {
        logged_in_slug: SLUG    // used in the template to check if the user is on his own profile page
    },

    onShow: function () {

        console.log("onShow archive");

        // render and fetch entries
        if (!App.preferredView)
            App.preferredView = 'list'

        if (App.preferredView === 'list')
            var view = new EntryListView({collection: this.collection});
        else
            var view = new EntryGridView({collection: this.collection});

        swap($('[data-js-region="entry_list"]'), view);
        this.updateMeta();

        if (this.data.query) {
            console.log('do search...', this.data.query);
            this.collection.search({
                reset: true,
                data: {
                    q: this.data.query,
                    limit: 30
                },
                success: function (collection, response, options) {
                    console.warn("adding", collection.models.length, "total", this.collection.length);
                    this.updateMeta();
                }.bind(this)
            })
        } else {
            this.collection.fetch({
                reset: true, // TODO back to 'remove: false'??
                data: {
                    sort_by: (this.collection.reverseSortDirection? '-':'') + this.collection.sortKey,
                    limit: 30
                },
                success: function (collection, response, options) {
                    this.updateMeta();
                }.bind(this)
            });
        }

        // fetch on bottom
        $(window).on("scroll", _.bind(function () {
            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();
            if ((scrollHeight - scrollPosition) / scrollHeight === 0) {

                // load more!
                if (this.collection.meta !== undefined && this.collection.meta.next != null) {
                    this.collection.url = this.collection.meta.next; // TODO can't change url like this!!!!!
                    this.collection.fetch({
                        remove: false,
                        success: function (collection, response, options) {
                            console.warn("adding", response.objects.length, "total", this.collection.length);

                            swap($('[data-js-region="entry_list_header"]'), new MetaView({data: {meta: this.collection.meta}}));

                        }.bind(this)
                    });
                }
            }
        }, this));


    },

    search: function () {
        console.log('DO THE TWIST...', this.data.query);
        this.collection.fetch({
            reset: true,
            data: {
                sort_by: (this.collection.reverseSortDirection? '-':'') + this.collection.sortKey,
                //q: this.data.query,
                limit: 100
            },
            success: function (collection, response, options) {
                console.warn("adding", collection.models.length, "total", this.collection.length);

                if (App.preferredView === 'list')
                    var view = new EntryListView({collection: this.collection});
                else
                    var view = new EntryGridView({collection: this.collection});

                swap($('[data-js-region="entry_list"]'), view);
                //this.updateMeta();
            }.bind(this)
        })
    },

    updateMeta: function () {
        swap($('[data-js-region="entry_list_header"]'), new MetaView({data: {meta: this.collection.meta}}));
    },

    filterOnEnter: function (e) {
        if (e.which !== 13) return;
        this.filter(e);
    },
    filter: function (e) {
        var v = $('input.search').val();
        if (v === '') return;
        //$('input.search').blur(); // TODO loose focus on mobile only?
        App.Router.r.navigate('/archive/q=' + v, {trigger: true});
    },

    events: {

        'change .sort_by': function (e) {
            this.collection.sortKey = e.target.value;
            this.search();
        },

        'change .sort_order': function (e) {
            this.collection.reverseSortDirection = (e.target.value==='ascending'? false : true);
            this.search();
        },

        'click button.search': 'filter',
        'keypress input[type=search]': 'filterOnEnter',
        'search input[type=search]': 'filterOnEnter',

        'click .toggle-grid': function () {
            var view = new EntryGridView({collection: this.collection});
            swap($('[data-js-region="entry_list"]'), view);
            App.preferredView = "grid";
        },
        'click .toggle-list': function () {
            var view = new EntryListView({collection: this.collection});
            swap($('[data-js-region="entry_list"]'), view);
            App.preferredView = "list";
        },

    }

});

