var Backbone = require('backbone');
global.$ = global.jQuery = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');

var Lightbox = require('../helpers/lightbox');



module.exports = Base.DetailView.extend({

    template: require('../templates/entry_detail.dust'),

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL,
    },

    onShow: function () {
        // scroll to top
        $(window).scrollTop(0);

        /*
        if (this.model.get('image')) {
            console.log(this.model.get('image').url);
            this.model.set('originalImage', this.model.get('image').url.split('.')[0] + '.jpg');
        }
        */

        // typeset math
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    },

    events: {

        'click img': function (e) {

            var lightbox = new Lightbox();

            lightbox.load({
                maxImgSize: 1.0,
            });

            e.preventDefault();

            lightbox.open(this.model.get('image').url.split('.')[0] + '.' + this.model.get('image').url.split('.')[1]);


        }

    },

});

