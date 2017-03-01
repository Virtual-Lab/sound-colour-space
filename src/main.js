window.App = {
    Helper: {},
    Router: {},
    Model: {},
    Collection: {},
    View: {},
    Form: {}
};

global.$ = global.jQuery = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = $;

Cookies = require('js-cookie');

App.preferredView = Cookies.get('preferredView');
if (!App.preferredView) {
    App.preferredView = 'list';
    Cookies.set('preferredView', App.preferredView);
}


// we do need this for dustjs helpers!!!
require('dustjs-helpers');
require('./dust-filters.js');

var Router = require('./router.js');

var swap = require('./views/swap.js');
var Regions = require('./views/regions.js');
var NavigationView = require('./views/navigation.js');


// global key shortcuts
var key = require('keymaster');

key('s', function () {
    $('input[type=search]').focus();
    return false; // prevent writing of 's'
});

key('h', function () {
    App.Router.r.navigate('/', {trigger: true});
});

key('a', function () {
    App.Router.r.navigate('/archive', {trigger: true});
});

key('t', function () {
    App.Router.r.navigate('/timeline', {trigger: true});
});


(function ($) {
    $.QueryString = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

// jquery attr() functionality
// usage:
// var $div = $("<div data-a='1' id='b'>");
// $div.attr();  // returning { "data-a": "1", "id": "b" }
(function (old) {
    $.fn.attr = function () {
        if (arguments.length === 0) {
            if (this.length === 0) {
                return null;
            }

            var obj = {};
            $.each(this[0].attributes, function () {
                if (this.specified) {
                    obj[this.name] = this.value;
                }
            });
            return obj;
        }
        return old.apply(this, arguments);
    };
})($.fn.attr);


$(function () {
    // set the csrftoken
    //Backbone.Tastypie.csrfToken = Cookies.get('csrftoken');

    $(document).foundation();

    // catch xhr errors globally
    $(document).ajaxError(function (event, xhr) {
        if (xhr.status == 404) {
            App.Router.r.navigate('/404', {trigger: true, replace: true});
        }
        else if (xhr.status == 401) {
            console.warn("401: NEEDS LOGIN!");
        }
    });

    Backbone.History.prototype.navigate = _.wrap(Backbone.History.prototype.navigate, function () {
        // Get arguments as an array
        var args = _.toArray(arguments);
        // firs argument is the original function
        var original = args.shift();
        // Set the before event
        Backbone.history.trigger('before:url-change', args);
        // Call original function
        var res = original.apply(this, args);
        // After event
        Backbone.history.trigger('url-changed');
        // Return original result

        return res;
    });

    // before url change we save the position
    Backbone.history.bind('before:url-change', function (path, e) {
        App.Helper.offsetTop = $(window).scrollTop();
    });

    // event on BACKSPACE or history.back etc.
    window.addEventListener('popstate', function (e) {

        if (App.Helper.offsetTop != undefined) {
            $('html, body').stop().animate({
                scrollTop: App.Helper.offsetTop
            }, 300);
        }
    });

    // event on url changed (but not BACKSPACE.. for some reason)
    Backbone.history.bind('url-changed', function () {

        //console.warn("url-changed", window.location);
        window.scrollTo(0, 0);

    });

    // override href clicks
    $(document).on('click', 'a:not([data-bypass])', function (evt) {

        var href = $(this).attr('href');
        var protocol = this.protocol + '//';

        if (href.slice(protocol.length) !== protocol) {
            evt.preventDefault();
            App.Router.r.navigate(href, {trigger: true});
        }
    });


    App.Router.r = new Router();
    var navigation = new NavigationView({});

    App.Router.r.on('route', function (route, params) {
        navigation.render();
        navigation.onShow();
    });
    Backbone.history.start({pushState: true});


    swap(Regions.navigation, navigation);

});


