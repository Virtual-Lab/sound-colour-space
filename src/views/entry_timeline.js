var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;


var imagesLoaded = require('imagesloaded');
// provide jQuery argument
imagesLoaded.makeJQueryPlugin($);


var Base = require('./base');
var EntrySingleTimelineView = require('./entry_single_timeline');

var swap = require('../views/swap.js');

var MetaView = Base.TemplateView.extend({
    template: require('../templates/entry_list_header.dust'),
});

var i = 0;
App.Helper.top_right_column = 0;
App.Helper.top_left_column = 0;

module.exports = Base.ListView.extend({

    template: require('../templates/entry_timeline.dust'),

    addOne: function (model) {

        //console.debug('add', model.id);
        var view = new EntrySingleTimelineView({model: model});
        this.$("#timeline_content").append(view.render().el);
        view.onShow();

        view.$el.css('position', 'absolute');

        if (i % 2 == 0) {
            view.$el.css('top', App.Helper.top_right_column+'px');
            //view.$el.css('left', '586px');
            view.$el.css('right', '0px');
            //top_right_column += model.get('image').height;
            App.Helper.top_right_column += view.$el.find('img')[0].height + 20;
        }
        else {
            view.$el.addClass('left-col');
            view.$el.css('top', App.Helper.top_left_column+'px');
            //view.$el.css('left', '0px');
            //top_left_column += model.get('image').height;
            App.Helper.top_left_column += view.$el.find('img')[0].height + 20;
        }

        view.$el.imagesLoaded()
            .progress(function (instance, image) {

            });

        this.$('#timeline').css('height', App.Helper.top_right_column > App.Helper.top_left_column ? App.Helper.top_right_column+"px" : App.Helper.top_left_column+"px");

        // increase counter
        i++;
    },

    removeOne: function (model, collection, options) {
        //$('.grid').packery('remove', this.$('.'+model.get('uuid'))).packery('shiftLayout');
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
        swap($('[data-js-region="entry_list_header"]'), new MetaView({data: {meta: this.collection.meta}}));
    },


    onShow: function () {
        console.debug("############################################onShow list");

        this.collection.each(this.addOne, this);


    },

    events: {

    }

});