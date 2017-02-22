// Application router
// ==================
'use strict';
var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

var entryController = require('./controllers/entry_controller');
var setController = require('./controllers/set_controller');
var keywordController = require('./controllers/keyword_controller');
var virtualLabController = require('./controllers/virtual_lab_controller');

// views
var Base = require('./views/base.js');
var swap = require('./views/swap.js');
var Regions = require('./views/regions.js');

var LayoutView = require('./views/layout.js');
var HomepageView = require('./views/homepage.js');
var Error404View = require('./views/404.js');
var EditorView = require('./views/editor.js');
var ArchiveView = require('./views/archive.js');


ArchiveView.viewState = new Backbone.Model();
ArchiveView.viewState.set('scrollPosition', 0);

var defaultRoute = function (actions) {
    swap(Regions.content, new Error404View({}));
};

var home = function () {
    swap(Regions.content, new HomepageView({}));
};

var exhibitions = function () {
    var ExhibitionsView = Base.TemplateView.extend({
        data: {
          MEDIA_URL: MEDIA_URL,
        },
        template: require('./templates/exhibitions.dust'),
    });
    swap(Regions.content, new ExhibitionsView({}));
};

var about = function () {
    var AboutView = Base.TemplateView.extend({
        template: require('./templates/about.dust'),
    });
    swap(Regions.content, new AboutView({}));
};

var editor = function (actions) {
    swap(Regions.content, new EditorView({}));
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
        'sets/:doc_id(/)': setController.Detail,
        'timeline(?*query)(/)': entryController.Timeline,
        'keywords(/)': keywordController.List,
        'keywords/:slug(/)': keywordController.Detail,
        'editor(/)': editor,
        'diagrams/:doc_id(/)': entryController.Detail,
        'exhibitions(/)': exhibitions,
        'virtuallab(/)': virtualLabController.List,
        'virtuallab/:slug(/)': virtualLabController.Detail,
        'about(/)': about,
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

