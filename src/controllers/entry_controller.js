var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

// models
var Entries = require('../models/entries');
var Entry = require('../models/entry');

// views
var ArchiveView = require('../views/archive.js');
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

// entry detail
module.exports.Detail = function (uuid) {
    console.debug('##### Controller -> Detail', uuid);

    var entry = new Entry({uuid: uuid});

    // render
    swap(Regions.content, new EntryDetailView({model: entry}));

    App.currentView = EntryDetailView;

    // fetch
    entry.fetch();
};
