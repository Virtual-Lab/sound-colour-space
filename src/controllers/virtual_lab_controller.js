var _ = require('underscore');
var $ = require('jquery');

var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Experiments = require('../models/experiments');
var Experiment = require('../models/experiment');

// views
var VirtualLabListView = require('../views/experiment_list');
var VirtualLabDetailView = require('../views/experiment_detail');


module.exports.List = function () {
    console.debug('##### Virtual Lab Controller -> List');
    if (!App.Experiments)
        App.Experiments = new Experiments();

    var virtuallab = new VirtualLabListView({collection: App.Experiments});
    swap(Regions.content, virtuallab);
    App.Experiments.fetch();
};


module.exports.Detail = function (slug) {
    console.debug('##### Virtual Lab Controller -> Detail', slug);

    //var entry = new Entry({doc_id: doc_id});
    var experiment = new Experiment({ slug: slug });

    // render
    swap(Regions.content, new VirtualLabDetailView({model: experiment}));

    // fetch
    experiment.fetch();
};
