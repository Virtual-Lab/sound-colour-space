var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Entries = require('../models/entries');
var Entry = require('../models/entry');

// views
var ArchiveView = require('../views/archive');
var TimelineView = require('../views/timeline');
var EntryDetailView = require('../views/entry_detail');

// list
module.exports.List = function (q) {
    console.debug('##### Controller -> List');

    if (!App.entries)
        App.entries = new Entries();

    if (q) {
        var entries = new Entries();
        swap(Regions.content, new ArchiveView({collection: entries, data: {query: q}}));
    }
    else {
        // clear input
        $('input.search').val('');
        swap(Regions.content, new ArchiveView({collection: App.entries}));
    }

};

// timeline
module.exports.Timeline = function(q)  {
    console.debug('##### Controller -> Timeline');

    if (!App.entries) // TODO maybe get rid of App.entries?
        App.entries = new Entries();

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
