var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;


var imagesLoaded = require('imagesloaded');
// provide jQuery argument
imagesLoaded.makeJQueryPlugin($);

var Packery = require('packery');
// make Packery a jQuery plugin
var jQueryBridget = require('jquery-bridget');
jQueryBridget('packery', Packery, $);

var Base = require('./base');
var EntrySingleView = require('./entry_single');

var swap = require('../views/swap.js');

var MetaView = Base.TemplateView.extend({
    template: require('../templates/entry_list_header.dust'),
});

module.exports = Base.ListView.extend({

    template: require('../templates/entry_list.dust'),

    addOne: function (model) {
        //console.debug('add', model.id);
        var view = new EntrySingleView({model: model});
        this.$(".entries").append(view.render().el);
        view.onShow(); // TODO call onShow automatically

        view.$el.imagesLoaded()
            .progress(function (instance, image) {
                //$('.grid-item').fadeIn();
                $('.grid').packery('appended', view.$el);
            });
    },
    
    removeOne: function (model, collection, options) {
        $('.grid').packery('remove', this.$('.'+model.get('uuid'))).packery('shiftLayout');
    },

    // override render function because adding items must be done in the onShow() function
    render: function () {

        this.template(_.extend(this.data, {meta: this.collection.meta}), function (err, out) {
            if (err) {
                console.error(err);
            }
            else {
                this.$el.html($(out).html());
                this.$el.attr($(out).attr());
            }
        }.bind(this));

        return this;
    },

    onSync: function () {
        //Base.ListView.prototype.onSync.call(this);
        console.debug('############################################onSync list');
        /*
         var tc = this.collection.meta.total_count;
         if (tc <= 4) {
         this.$el.find('.entries').addClass('large-up-' + tc).removeClass('large-up-5');

         if (tc == 1) {
         this.$el.find('.entry').addClass('align-self-middle').removeClass('align-self-bottom');
         }
         }
         */


        swap($('[data-js-region="entry_list_header"]'), new MetaView({data: {meta: this.collection.meta}}));

    },


    onShow: function () {
        console.debug("############################################onShow list");

        $('.grid').append('<div class="grid-sizer"></div>');
        //this.$el.find(".entries").append('<div class="gutter-sizer"></div>');

        $('.grid').packery({
            "itemSelector": ".grid-item",
            "columnWidth": ".grid-sizer",
            "percentPosition": true,
            "transitionDuration": "0.2s"
        });

        this.collection.each(this.addOne, this);


    },

    events: {
        "click .toggle_grid": function () {
            $('.entries').toggleClass('grid');
        }
    }

});