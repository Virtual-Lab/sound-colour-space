var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Entries = require('../models/entries');
var Entry = require('../models/entry');

// views
var ArchiveView = require('../views/archive');
var TimelineView = require('../views/timeline');
var EntryDetailView = require('../views/entry_detail');

if (!App.entries)
    App.entries = new Entries();

// archive
module.exports.Archive = function (q) {

    if (q) {
        console.debug('##### Controller -> Archive with query', q);
        var entries = new Entries();
        swap(Regions.content, new ArchiveView({collection: entries, data: {query: q}}));
    }
    else {
        console.debug('##### Controller -> Archive');
        // clear input
        $('input.search').val('');
        swap(Regions.content, new ArchiveView({collection: App.entries}));
    }

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
