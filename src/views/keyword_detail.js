var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');
var swap = require('./swap');
var EntryListView = require('./entry_list');
var EntryGridView = require('./entry_grid');
var EntryEvenGridView = require('./entry_even_grid');

var Entries = require('../models/entries');

var apiUrl = require('../apiUrl');
var URI = require('urijs');


module.exports = Base.DetailView.extend({

    template: require('../templates/keyword_detail.dust'),

    data: {
        preferredView: 'list'
    },

    onShow: function () {
        // scroll to top
        $(window).scrollTop(0);

        // create entry collection for tagged entries
        this.collection = new Entries();
        // search query for keyword (tags)
        this.collection.query = {
            tags: this.model.get('slug'),
            limit: 30,
            order_by: 'date',
            match: 'OR',
            image_size: 'x-small'
        };

        var uri = new URI(apiUrl('entries') + 'search?' + URI.buildQuery(this.collection.query, true)).readable();

        this.collection.search({
            reset: true,
            //data: params,
            url: uri,
            success: function (collection, response, options) {
               if (!App.preferredView)
                    App.preferredView = 'list';
                if (App.preferredView === 'list')
                    var view = new EntryListView({collection: this.collection});
                else if (App.preferredView === 'grid')
                    var view = new EntryGridView({collection: this.collection});
                else
                    var view = new EntryEvenGridView({
                        collection: this.collection,
                        data: {num_columns: this.model.get('num_columns')}
                    });

                swap($('[data-js-region="entry_list"]'), view);

            }.bind(this)
        });

    },

    events: {
        // change views
        'click .toggle-list': function () {
            App.preferredView = "list";
            this.data.preferredView = App.preferredView;
            this.render();
            var view = new EntryListView({collection: this.collection});
            swap($('[data-js-region="entry_list"]'), view);
        },

        'click .toggle-even-grid': function () {
            App.preferredView = "even-grid";
            this.data.preferredView = App.preferredView;
            this.render();
            var view = new EntryEvenGridView({
                collection: this.collection,
                data: {num_columns: this.model.get('num_columns')}
            });
            swap($('[data-js-region="entry_list"]'), view);
        },
        'click .toggle-grid': function () {
            App.preferredView = "grid";
            this.data.preferredView = App.preferredView;
            this.render();
            var view = new EntryGridView({collection: this.collection});
            swap($('[data-js-region="entry_list"]'), view);
        },

    },

});

