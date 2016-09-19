/*
 var Backbone = require('backbone');
 var $ = require('jquery');
 var _ = require('lodash');
 Backbone.$ = $;
 */

var Base = require('./base.js');

//var joint = require('../trial/index.js');
//var joint = require('jointjs');
//joint.ui.SelectionView = require('./joint.ui.selectionView');

var Entries = require('../models/entries');
var SearchCollection = new Entries();

module.exports = Base.TemplateView.extend({

    template: require('../templates/editor.dust'),

    initialize: function (options) {
        this.options = _.extend({}, options);
        this.data = _.extend({}, options.data);


        _.bindAll(this, 'render', 'onShow');
    },

    search: function (e) {
        if (e.which === 13) {   // return pressed
            var query = e.currentTarget.value;

            var self = this;

            SearchCollection.search({
                reset: true,
                data: {
                    q: query,
                    limit: 15
                },
                success: function (collection, response, options) {
                    //App.entries.add(collection.models); // merge into App.entries
                    //console.log(collection.models);
                    var i = 0;
                    var stencils = [];

                    var length = collection.models.length();

                    //collection.models.forEach(function (m) {

                    /*

                    for (var i = 0, row; row = length / 2; i++) {
                        for (var j = 0; col; col =

                            console.log(, m.get('image'));

                            for (y = 0; i <)
                                 var img = new joint.shapes.basic.Image({
                                     position: {x: (i % 2 === 0) ? 0 : 150, y: i * 150},
                                     size: {width: 150, height: 150},
                                     attrs: {
                                         image: {
                                             width: 150,
                                             height: 150,
                                             'xlink:href': BASE_URL + m.get('image')
                                         }
                                     }
                                 });
                            stencils.push(img);
                            //App.stencil.load([img], 'diagrams');


                            var t = new joint.shapes.basic.Text({
                                position: {x: 0, y: i * 20},
                                size: {width: 200, height: 10},
                                attrs: {text: {text: m.get('title'), 'font-weight': 'bold'}}
                            });
                            //stencils.push(t);
                            //App.stencil.load([, 'diagrams');
                        }

                    }
                    */


                    //});
                    App.stencil.load(stencils, 'diagrams');


                }
            });

        }
    },

    events: {
        'keyup .search': 'search',
    },

    onShow: function () {
        console.debug("onShow", "editor");

        App.graph = new joint.dia.Graph;

        App.paper = new joint.dia.Paper({
            el: '#paper',
            width: 1200,
            gridSize: 1,
            model: App.graph
        });


        App.stencil = new joint.ui.Stencil({
            paper: App.paper,
            width: 200,
            height: 300,
            groups: {
                diagrams: {label: 'Diagrams', index: 1},
                //text: {label: 'Text', index: 2, closed: true},
                //advanced: {label: 'Advanced', index: 3, closed: true}
            }
        });


        App.paper.setDimensions(this.$('#paper').width(), this.$('#paper').height());

        this.$('#stencil_holder').append(App.stencil.render().el);


        /*
         var rct = new joint.shapes.basic.Rect({
         position: {x: 10, y: 10}, size: {width: 50, height: 30}
         });
         var circ = new joint.shapes.basic.Circle({
         position: {x: 70, y: 10}, size: {width: 50, height: 30}
         });

         var t = new joint.shapes.basic.Text({
         position: {x: 10, y: 10}, size: {width: 50, height: 30},
         attrs: {text: {text: 'Text', 'font-weight': 'bold'}}
         });
         this.stencil.load([t], 'text');
         this.stencil.load([rct, circ], 'advanced');
         */

        /*
         var i = new joint.shapes.basic.Image({
         position: {x: 0, y: 0},
         size: {width: 150, height: 150},
         attrs: {
         image: {
         width: 150,
         height: 150,
         'xlink:href': BASE_URL + MEDIA_URL + 'diagrams/6ee972b2/3ed4/4714/98cf/480b2b0b09dc.jpg'
         }
         }
         });
         var ii = new joint.shapes.basic.Image({
         position: {x: 150, y: 0},
         size: {width: 150, height: 150},
         attrs: {
         image: {
         width: 150,
         height: 150,
         'xlink:href': BASE_URL + MEDIA_URL + 'diagrams/542fa62b/765e/42c7/a9de/7cbfc9c94e04.jpg'
         }
         }
         });

         this.stencil.load([i, ii], 'diagrams');
         */

        //$search_box = '<input type="search" placeholder="search" class="search">';
        //this.$('#stencil_holder').insertAfter($search_box);

        /*
         var selection = new Backbone.Collection;
         var selectionView = new joint.ui.SelectionView({paper: this.paper, graph: this.graph, model: selection});

         this.paper.on('blank:pointerdown', selectionView.startSelecting);

         this.paper.on('cell:pointerup', function (cellView, evt) {
         if ((evt.ctrlKey || evt.metaKey) && !(cellView.model instanceof joint.dia.Link)) {
         selection.add(cellView.model);
         selectionView.createSelectionBox(cellView);
         }
         });

         this.paper.on('cell:pointerup', function (cellView) {
         // We don't want a Halo for links.
         if (cellView.model instanceof joint.dia.Link) return;

         var halo = new joint.ui.Halo({cellView: cellView});
         halo.render();
         });

         selectionView.on('selection-box:pointerdown', function (evt) {
         if (evt.ctrlKey || evt.metaKey) {
         var cell = selection.get($(evt.target).data('model'));
         selection.reset(selection.without(cell));
         selectionView.destroySelectionBox(this.paper.findViewByModel(cell));
         }
         });

         this.paper.on('cell:pointerup', function (cellView) {
         // We don't want a Halo for links.
         if (cellView.model instanceof joint.dia.Link) return;

         var freeTransform = new joint.ui.FreeTransform({
         graph: self.graph,
         paper: self.paper,
         cell: cellView.model
         });
         freeTransform.render();
         });


         selection.on('reset add', function () {
         // Print types of all the elements in the selection.
         this.$('#selection-info').text('Selected types: ' + selection.pluck('type'));
         }.bind(this));

         */

        $('#btn_open_svg').on('click', function () {
            App.paper.openAsSVG({preserveDimensions: true});
        });

    }
});