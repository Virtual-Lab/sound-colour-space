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
var exhibitionController = require('./controllers/exhibition_controller');


// views
var Base = require('./views/base.js');
var swap = require('./views/swap.js');
var Regions = require('./views/regions.js');

var LayoutView = require('./views/layout.js');
var HomepageView = require('./views/homepage.js');
var Error404View = require('./views/404.js');
var EditorView = require('./views/editor.js');
var ArchiveView = require('./views/archive.js');

var Source = require('./models/source.js');
var SourceDetailView = require('./views/source_detail.js');


ArchiveView.viewState = new Backbone.Model();
ArchiveView.viewState.set('scrollPosition', 0);

var route404 = function (actions) {
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

var sources = function (slug) {

    var source = new Source({slug: slug});

    App.source = source;

    source.fetch(
        {
            success: function (model, response, options) {
                var view = new SourceDetailView({model: source});
                swap(Regions.content, view);
            }
        }
    )
};


module.exports = Backbone.Router.extend({

    initialize: function () {
        console.debug("##################################initialize router");
        this.routesHit = 0;
        // render the base layout
        this.renderBase();
        // define regions RIGHT HERE after base layout has been rendered
        Regions.navigation = $('[data-js-region="navigation"]');
        Regions.content = $('[data-js-region="content"]');
        // render navigation
        //this.renderNavigation();

        // keep count of number of routes handled by the application
        Backbone.history.on('route', function() { this.routesHit++; }, this);
    },

    routes: {
        '(/)': home,
        '404(/)': route404,
        'archive(?*query)(/)': entryController.Archive,
        'sets(/)': setController.List,
        'sets/:doc_id(/)': setController.Detail,
        'timeline(?*query)(/)': entryController.Timeline,
        'keywords(/)': keywordController.List,
        'keywords/:slug(/)': keywordController.Detail,
        'sources/:slug(/)': sources,
        'editor(/)': editor,
        'diagrams/:doc_id(/)': entryController.Detail,
        'exhibitions(/)': exhibitionController.List,
        'exhibition/:slug(/)': exhibitionController.Detail,
        'virtuallab(/)': virtualLabController.List,
        'virtuallab/:slug(/)': virtualLabController.Detail,
        'about(/)': about,
        '*actions': route404
    },

    renderBase: function () {
        var b = new LayoutView({});
        // render the view and attach it to the body
        $(b.render().el).prependTo('body');
        b.onShow();
    },

    renderNavigation: function () {
        //swap(Regions.navigation, new NavigationView({}));
    },

    back: function () {
        if (this.routesHit > 1) {
            // More than one route hit -> user did not land to current page directly
            // Subtract 2 from routesHit, then when its redirected to the "back" page it'll gain only 1
            this.routesHit = this.routesHit - 2;
            window.history.back();
        } else {
            // otherwise go to the home page. Use replaceState if available so
            // the navigation doesn't create an extra history entry
            if (Backbone.history.getFragment() != '/')
                this.routesHit = 0;
            this.navigate('/', {trigger: true, replace: true});
        }
    }
});

