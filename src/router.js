// Application router
// ==================
'use strict';
var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

var entryController = require('./controllers/entry_controller');

// views
var LayoutView = require('./views/layout.js');
var HomepageView = require('./views/homepage.js');
var Error404View = require('./views/404.js');
var NavigationView = require('./views/navigation.js');
var EditorView = require('./views/editor.js');
var ArchiveView = require('./views/archive.js');
var EntryDetailView = require('./views/entry_detail.js');

var swap = require('./views/swap.js');
var Regions = require('./views/regions.js');

ArchiveView.viewState = new Backbone.Model();
ArchiveView.viewState.set('scrollPosition', 0);

//EntryDetailView.viewState = new Backbone.Model();
//EntryDetailView.viewState.set('scrollPosition', 0);

var home = function() {
    swap(Regions.content, new HomepageView({}));
    App.currentView = HomepageView;
};

var defaultRoute = function (actions) {
    swap(Regions.content, new Error404View({}));
    App.currentView = Error404View;
};

var editor = function (actions) {
    swap(Regions.content, new EditorView({}));
    App.currentView = EditorView;
};

/*
var archive = function (q) {
    if (q) {
        swap(Regions.content, new ArchiveView({collection: App.entries, data: {query: q}}));
    }
    else {
        // clear input
        $('input.search').val('');
        swap(Regions.content, new ArchiveView({}));
    }
    // scroll to position
    //console.warn('scrolling archive to ', ArchiveView.viewState.get('scrollPosition'));
    //var throttled = _.throttle(function() { return ArchiveView.viewState.get('scrollPosition'); }, 1000);
    //$(document).scrollTop(throttled);
    //$(document).scrollTop(throttled);
    //$(document).scrollTop(throttled);

    // set current view
    App.currentView = ArchiveView;
    App.currentView.viewState.set('view', 'ArchiveView');
};
*/
module.exports = Backbone.Router.extend({

    initialize: function () {
        console.debug("##################################initialize router");
        // render the base layout
        this.renderBase();
        // define regions RIGHT HERE after base layout has been rendered
        Regions.navigation = $('[data-js-region="navigation"]');
        Regions.content = $('[data-js-region="content"]');
        // render navigation
        //this.renderNavigation();
    },

    routes: {
        '(/)': home,
        'archive(/)(q=:q)': entryController.Archive,
        'timeline(/)(q=:q)': entryController.Timeline,
        'editor(/)': editor,
        'diagrams/:doc_id(/)': entryController.Detail,
        '*actions': defaultRoute
    },

    renderBase: function () {
        var b = new LayoutView({});
        // render the view and attach it to the body
        $(b.render().el).prependTo('body');
        b.onShow();
    },

    renderNavigation: function () {
        //swap(Regions.navigation, new NavigationView({}));
    }
});

