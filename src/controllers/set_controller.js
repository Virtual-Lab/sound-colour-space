var _ = require('underscore');
var $ = require('jquery');

var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Sets = require('../models/sets');
var Set = require('../models/set');

// views
var SetListView = require('../views/set_list');
var SetDetailView = require('../views/set_detail');


module.exports.List = function () {
    console.debug('##### Set Controller -> List');
    if (!App.Sets)
        App.Sets = new Sets();

    swap(Regions.content, new SetListView({collection: App.Sets}));
    App.Sets.fetch({
        data: {
            includes: 'cover',
            limit: 1000 // make sure we got all sets
        }
    });
};


module.exports.Detail = function (doc_id) {
    console.debug('##### Set Controller -> Detail', doc_id);

    var set = new Set({doc_id: doc_id});

    // render
    swap(Regions.content, new SetDetailView({model: set, data: {preferredView: App.preferredView}}));

    // fetch
    set.fetch({
        data: {
            image_size: 'x-small',
        },
        success: function() {

        }
    });
};
