var _ = require('underscore');
var $ = require('jquery');

var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Keywords = require('../models/keywords');
var Keyword = require('../models/keyword');

// views
var KeywordListView = require('../views/keyword_list');
var KeywordDetailView = require('../views/keyword_detail');


module.exports.List = function () {
    console.debug('##### Keywords Controller -> List');

    // create new collection
    App.Keywords = new Keywords();

    // create & render view
    swap(Regions.content, new KeywordListView({collection: App.Keywords}));

    // fetch data
    App.Keywords.fetch({
        data: {
            order_by: 'name',
            limit: 10000 // make sure we get all
        }
    });
};

module.exports.Detail = function (slug) {
    console.debug('##### Keywords Controller -> Detail', slug);

    // create model
    var keyword = new Keyword({slug: slug});

    // fetch data
    keyword.fetch({
        data: {},
        success: function () {
            // create & render view
            swap(Regions.content, new KeywordDetailView({model: keyword, data: {}}));
        }
    });
};
