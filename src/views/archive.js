var Base = require('./base');

var EntryListView = require('./entry_list');
var EntryGridView = require('./entry_grid');

var apiUrl = require('../apiUrl');
var swap = require('../views/swap.js');

var URI = require('urijs');


var MaskView = Base.TemplateView.extend({
    template: require('../templates/search_field_mask.dust'),


});

var HeaderView = Base.TemplateView.extend({
    template: require('../templates/entry_list_header.dust'),

    onShow: function () {

        this.$el.foundation();

        if (!_.isUndefined(this.options.parent.collection.query.order_by))
            $('.order_by').val(this.options.parent.collection.query.order_by);


        if (!_.isUndefined(this.options.parent.collection.query.date__range))
            $('#date_range_toggle').prop('checked', true);


        this.date_slider = new Foundation.Slider($('#date_slider'), {
            start: 800,
            end: new Date().getFullYear() + 1,
            step: 1,
            initialStart: _.isUndefined(this.options.parent.collection.query.date__range) ? 800 : this.options.parent.collection.query.date__range.split(',')[0],
            initialEnd: _.isUndefined(this.options.parent.collection.query.date__range) ? new Date().getFullYear() + 1 : this.options.parent.collection.query.date__range.split(',')[1],
            //doubleSided: true,
            //binding: true,
            clickSelect: true,
            changedDelay: 500,
            moveTime: 200,
        });



        // toggle accordion if advanced search filters are active
        if (this.options.parent.collection.query.tags != undefined || this.options.parent.collection.query.date__range != undefined) {
            $('#refine_search').foundation('down', $('.accordion-content'));
        }

        Foundation.reInit('slider');

    },

    keyPressed: function (e) {
        if (e.which !== 13) return;  // return if not RETURN pressed
        this.options.parent.query(e); // call query function
    },

    events: {
        'moved.zf.slider #date_slider': function () {
            $('#dateSliderStart').val(this.date_slider.$input.val());
            $('#dateSliderEnd').val(this.date_slider.$input2.val());
        },
        'changed.zf.slider #date_slider': function () {
            //this.options.parent.query(); // TODO
        },

        'click .add_search_field': function () {
            var m = new MaskView({});
            $('#search_field_masks').append(m.render().$el);
        },

        'click .remove_search_field': function (e) {
            if ($(".row.search_field_mask").length > 1)
                e.target.closest(".row.search_field_mask").remove();
        },

        'click .tag': function (e) {
            $(e.currentTarget).toggleClass('selected');
            this.options.parent.query();
        },

        'click button.search': function () {
            this.options.parent.query();
        },

        'click button.apply_date_range': function() {
            $('#date_range_toggle').prop('checked', true);
            this.options.parent.query();
        },

        'keypress input[type=search]': 'keyPressed',
        'search input[type=search]': 'keyPressed',

    }
});

var MetaView = Base.TemplateView.extend({
    template: require('../templates/entry_list_header_meta.dust'),
});


module.exports = Base.TemplateView.extend({

    template: require('../templates/archive.dust'),

    data: {
        logged_in_slug: SLUG    // used in the template to check if the user is on his own profile page
    },

    onShow: function () {
        // render and fetch entries
        if (!App.preferredView)
            App.preferredView = 'list';

        if (App.preferredView === 'list')
            var view = new EntryListView({collection: this.collection});
        else
            var view = new EntryGridView({collection: this.collection});

        swap($('[data-js-region="entry_list"]'), view);

        this.header();

        // fetch on bottom
        $(window).on("scroll", _.bind(function () {
            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();
            if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
                // load more!
                if (this.collection.meta !== undefined && this.collection.meta.next != null) {
                    //console.warn(this.collection.meta.next);
                    this.collection.url = this.collection.meta.next;
                    this.collection.fetch({
                        remove: false,
                        success: function (collection, response, options) {
                            //console.warn("adding", response.objects.length, "total", this.collection.length);
                            this.entry_list_header_meta();
                        }.bind(this)
                    });
                }
            }
        }, this));
    },

    search: function () {

        var uri = new URI(apiUrl('entries') + 'search?' + URI.buildQuery(this.collection.query, true)).readable();

        this.collection.search({
            reset: true,
            //data: params,
            url: uri,
            success: function (collection, response, options) {
                //console.warn("adding", collection.models.length, "total", this.collection.length);
                this.header();
                this.entry_list_header_meta();
                //console.log(this.collection.meta);
            }.bind(this)
        });
    },

    header: function () {
        swap($('[data-js-region="entry_list_header"]'), new HeaderView({
            parent: this,
            data: {meta: this.collection.meta}
        }));
    },

    entry_list_header_meta: function () {
        swap($('[data-js-region="entry_list_header_meta"]'), new MetaView({
            parent: this,
            data: {meta: _.extend(this.collection.meta, {totalItems: this.collection.length})}
        }));
    },

    query: function (opts) {

        //$('input.search').blur(); // TODO loose focus on mobile only?

        this.collection.query.q = [];

        var that = this;

        $('.search_field_mask').each(function (i, obj) {
            if ($(this).find('input.search').val() != '')
                that.collection.query.q.push($(this).find('.type').val() + "::" + $(this).find('input.search').val());
        });

        // get match
        this.collection.query.match = $('.match').val();

        // set date__range
        this.collection.query.date__range = $('#dateSliderStart').val() + ',' + $('#dateSliderEnd').val();

        // remove date__range again, if not checked :P
        if (!$('#date_range_toggle').is(':checked')) {
            this.collection.query = _.omit(this.collection.query, 'date__range');
        }

        var tags = [];
        $('.tag.selected').each(function () {
            tags.push($(this).attr('data-slug'));
        });
        if (!_.isEmpty(tags))
            this.collection.query.tags = tags.join(',');
        else
            this.collection.query = _.omit(this.collection.query, 'tags');

        var params = URI.buildQuery(this.collection.query, true);
        var uri = new URI('/archive?' + params).readable();
        App.Router.r.navigate(uri, {trigger: true, replace: false});
    },

    events: {

        'click #date_range_toggle': function (e) {
            this.query({trigger: true, replace: true});
        },

        'change .order_by': function (e) {
            this.collection.query.order_by = e.target.value;
            this.query({trigger: true, replace: true});
        },

        // change views
        'click .toggle-grid': function () {
            var view = new EntryGridView({collection: this.collection});
            swap($('[data-js-region="entry_list"]'), view);
            App.preferredView = "grid";
        },
        'click .toggle-list': function () {
            var view = new EntryListView({collection: this.collection});
            swap($('[data-js-region="entry_list"]'), view);
            App.preferredView = "list";
        },

    }

});

