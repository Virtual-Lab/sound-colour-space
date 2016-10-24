// Application router
// ==================
'use strict';
var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

var entryController = require('./controllers/entry_controller');
var setController = require('./controllers/set_controller');
var virtualLabController = require('./controllers/virtual_lab_controller');

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
        'archive(?*query)(/)': entryController.Archive,
        'sets(/)': setController.List,
        'sets/:slug(/)': setController.Detail,
        'timeline(/)(q=:q)': entryController.Timeline,
        'editor(/)': editor,
        'diagrams/:doc_id(/)': entryController.Detail,
        'virtuallab(/)': virtualLabController.List,
        'virtuallab/:slug(/)': virtualLabController.Detail,
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

