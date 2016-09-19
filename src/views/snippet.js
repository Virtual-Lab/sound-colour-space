var BaseView = Backbone.View.extend({
    render: function () {
        var html, $oldel = this.$el, $newel;

        html = this.html();
        $newel = $(html);

        this.setElement($newel);
        $oldel.replaceWith($newel);

        return this;
    }
});

var ItemView = BaseView.extend({
    events: {
        'click': function () {
            console.log(this.model.get('first'));
        }
    }
});
var CollectionView = BaseView.extend({
    initialize: function (opts) {
        this.template = opts.template;
        this.listenTo(this.collection, 'reset', this.render);
    },
    html: function () {
        var models = this.collection.map(function (model) {
            return _.extend(model.toJSON(), {
                cid: model.cid
            });
        });
        return this.template({models: models});
    },
    render: function () {
        BaseView.prototype.render.call(this);

        var coll = this.collection;
        this.$('[data-cid]').each(function (ix, el) {
            new ItemView({
                el: el,
                model: coll.get($(el).data('cid'))
            });
        });

        return this;
    }
});
var FormView = Backbone.View.extend({
    events: {
        'keyup input[name="what"]': _.throttle(function (e) {
            this.model.set('what', e.currentTarget.value);
        }, 200),
        'click input[name="where"]': function (e) {
            this.model.set('where', e.currentTarget.value);
        }
    }
});

var Filter = Backbone.Model.extend({
    defaults: {
        what: '',
        where: 'all'
    },
    initialize: function (opts) {
        this.collection = opts.collection;
        this.filtered = new Backbone.Collection(opts.collection.models);
        this.on('change:what change:where', this.filter);
    },
    filter: function () {
        var what = this.get('what').trim(),
            where = this.get('where'),
            lookin = (where === 'all') ? ['first', 'last'] : where,
            models;

        if (what === '') {
            models = this.collection.models;
        } else {
            models = this.collection.filter(function (model) {
                return _.some(_.values(model.pick(lookin)), function (value) {
                    return ~value.toLowerCase().indexOf(what);
                });
            });
        }

        this.filtered.reset(models);
    }
});


var people = new Backbone.Collection([
    {first: 'John', last: 'Doe'},
    {first: 'Mary', last: 'Jane'},
    {first: 'Billy', last: 'Bob'},
    {first: 'Dexter', last: 'Morgan'},
    {first: 'Walter', last: 'White'},
    {first: 'Billy', last: 'Bobby'}
]);
var flt = new Filter({collection: people});

var inputView = new FormView({
    el: 'form',
    model: flt
});

var listView = new CollectionView({
    template: _.template($('#template-list').html()),
    collection: flt.filtered
});

$('#content').append(listView.render().el);