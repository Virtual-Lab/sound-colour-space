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
            limit: 100
        }
    });
};


module.exports.Detail = function (slug) {
    console.debug('##### Virtual Lab Controller -> Detail', slug);

    //var entry = new Entry({doc_id: doc_id});
    var set = new Set({slug: slug});

    // render
    swap(Regions.content, new SetDetailView({model: set}));

    // fetch
    set.fetch();
};
