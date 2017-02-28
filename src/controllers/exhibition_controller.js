var _ = require('underscore');
var $ = require('jquery');

var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Exhibitions = require('../models/exhibitions');
var Exhibition = require('../models/exhibition');

// views
var VirtualLabListView = require('../views/exhibition_list');
var VirtualLabDetailView = require('../views/exhibition_detail');


module.exports.List = function () {
    console.debug('##### Virtual Lab Controller -> List');
    if (!App.Exhibitions)
        App.Exhibitions = new Exhibitions();

    var virtuallab = new VirtualLabListView({collection: App.Exhibitions});
    swap(Regions.content, virtuallab);
    App.Exhibitions.fetch();
};


module.exports.Detail = function (slug) {
    console.debug('##### Virtual Lab Controller -> Detail', slug);

    //var entry = new Entry({doc_id: doc_id});
    var exhibition = new Exhibition({ slug: slug });

    // render
    swap(Regions.content, new VirtualLabDetailView({model: exhibition}));

    // fetch
    exhibition.fetch();
};
