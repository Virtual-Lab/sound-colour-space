var _ = require('underscore');
var $ = require('jquery');

var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Entries = require('../models/entries');
var Entry = require('../models/entry');

// views
var ArchiveView = require('../views/archive');
var TimelineView = require('../views/timeline');
var EntryDetailView = require('../views/entry_detail');

var oldQuery = "";

function parseQueryString(queryString) {
    var params = {};
    if (queryString) {
        _.each(
            _.map(decodeURI(queryString).split(/&/g), function (el, i) {
                var aux = el.split('='), o = {};
                if (aux.length >= 1) {
                    var val = undefined;
                    if (aux.length == 2)
                        val = aux[1];
                    o[aux[0]] = val;
                }
                return o;
            }),
            function (o) {
                _.extend(params, o);
            }
        );
    }
    return params;
}


// archive
module.exports.Archive = function (query) {

    //if (!App.ArchiveEntries)
    if (oldQuery != query || !App.ArchiveEntries)
        App.ArchiveEntries = new Entries();

    oldQuery = query;

    var params = parseQueryString(query);

    App.ArchiveEntries.query = _.defaults(params, {limit: 15, order_by: '-date'});

    swap(Regions.content, new ArchiveView({collection: App.ArchiveEntries}));

};

// timeline
module.exports.Timeline = function (q) {
    console.debug('##### Controller -> Timeline');

    var entries = new Entries();
    swap(Regions.content, new TimelineView({collection: entries, data: {query: q}}));

};

// entry detail
module.exports.Detail = function (doc_id) {
    console.debug('##### Controller -> Detail', doc_id);

    var entry = new Entry({doc_id: doc_id});

    // render
    swap(Regions.content, new EntryDetailView({model: entry}));

    App.currentView = EntryDetailView;

    // fetch
    entry.fetch();
};
