'use strict';

global.$ = global.jQuery = require('jquery');
var _ = require('underscore');

var Regions = require('../views/regions.js');
var swap = require('../views/swap.js');

var URI = require('urijs');

var dust = require('dustjs-linkedin');


// models
var Entries = require('../models/entries');
var Entry = require('../models/entry');

// views
var Base = require('../views/base');
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
    console.debug('##### Controller -> Archive');

    if (oldQuery != query || !App.ArchiveEntries) {
        App.ArchiveEntries = new Entries();
        var params = URI.parseQuery(query);
        App.ArchiveEntries.query = _.defaults(
            params, {
            limit: 15, order_by: 'date', match: 'OR', image_size: 'x-small'}
            );
    }

    var archive = new ArchiveView({
        collection: App.ArchiveEntries
    });
    App.View.archive = archive;

    swap(Regions.content, archive);

    if (oldQuery != query)
        archive.search();

    oldQuery = query;
};

// timeline
module.exports.Timeline = function (query) {
    console.debug('##### Controller -> Timeline');

    if (Foundation.MediaQuery.atLeast('medium')) {

        swap(Regions.content, new TimelineView({}));

    } else {

        var noMobileView = Base.TemplateView.extend({
            template: require('../templates/not_on_mobile.dust'),
        });
        swap(Regions.content, new noMobileView({}));

    }

};

// entry detail
module.exports.Detail = function (doc_id) {
    console.debug('##### Controller -> Detail', doc_id);

    var entry = new Entry({doc_id: doc_id});

    // render
    // normally we render here already, but we don't because of mathjax issues

    App.currentView = EntryDetailView;

    // fetch
    entry.fetch(
        {
            success: function () {
                // render
                swap(Regions.content, new EntryDetailView({model: entry}));
            },
            error: function(model, response, options) {
                // error handling is done in main.js
            }
        }
    );
};
