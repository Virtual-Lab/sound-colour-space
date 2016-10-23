var Base = require('./base');

var EntryListView = require('./entry_list');
var EntryGridView = require('./entry_grid');

var swap = require('../views/swap.js');


var HeaderView = Base.TemplateView.extend({
    template: require('../templates/entry_list_header.dust'),

    onShow: function () {

        $(document).foundation();
        console.log("HeaderView", this.data);

        if (!_.isUndefined(this.options.parent.collection.query.q))
            $("input.search[type=search]").val(this.options.parent.collection.query.q);

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
    },

    events: {
        'moved.zf.slider #date_slider': function () {
            $('#dateSliderStart').val(this.date_slider.$input.val());
            $('#dateSliderEnd').val(this.date_slider.$input2.val());
        },
        'changed.zf.slider #date_slider': function () {

        }
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
        this.search();

        // fetch on bottom
        $(window).on("scroll", _.bind(function () {
            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();
            if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
                // load more!
                if (this.collection.meta !== undefined && this.collection.meta.next != null) {
                    this.collection.url = this.collection.meta.next;
                    this.collection.fetch({
                        remove: false,
                        success: function (collection, response, options) {
                            // console.warn("adding", response.objects.length, "total", this.collection.length);
                            this.entry_list_header_meta();
                        }.bind(this)
                    });
                }
            }
        }, this));
    },

    search: function () {
        //console.log('DO THE TWIST...', this.collection.query);

        var params = _.extend({}, this.collection.query);

        this.collection.search({
            reset: true,
            data: params,
            success: function (collection, response, options) {
                // console.warn("adding", collection.models.length, "total", this.collection.length);
                this.entry_list_header_meta();
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
            data: {meta: _.extend(this.collection.meta, { numEntries: this.collection.length })}
        }));
    },

    keyPressed: function (e) {
        if (e.which !== 13) return;
        this.query(e);
    },

    query: function (opts) {

        var options = _.defaults(opts, {trigger: true, replace: false});

        //$('input.search').blur(); // TODO loose focus on mobile only?
        var q = $('input.search').val();
        //if (q === '') return;
        this.collection.query.q = q;

        this.collection.query.date__range = $('#dateSliderStart').val() + ',' + $('#dateSliderEnd').val();

        if (!$('#date_range_toggle').is(':checked')) {
            this.collection.query = _.omit(this.collection.query, 'date__range');
        }

        App.Router.r.navigate('/archive?' + $.param(this.collection.query), opts);
    },

    events: {
        'click button.search': 'query',
        'keypress input[type=search]': 'keyPressed',
        'search input[type=search]': 'keyPressed',

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

