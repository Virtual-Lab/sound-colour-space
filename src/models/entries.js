var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var apiUrl = require('../apiUrl');

var Entry = require('./entry');

module.exports = Backbone.Collection.extend({

    model: Entry,

    url: function () {
        return apiUrl('entries');
    },

    search: function (options) {
        options = options || {};
        if (options.url === undefined) {
            options.url = apiUrl('entries') + 'search';
        }
        return Backbone.Model.prototype.fetch.call(this, options);
    },

    /*
     // client based sorting
     // needs sortKey and reverseSortingDirection variables in collection
     comparator: function (a, b) {

     var sampleDataA = a.get(this.sortKey),
     sampleDataB = b.get(this.sortKey);

     if (this.reverseSortDirection) {
     if (sampleDataA > sampleDataB) {
     return -1;
     }
     if (sampleDataB > sampleDataA) {
     return 1;
     }
     return 0;
     } else {
     if (sampleDataA < sampleDataB) {
     return -1;
     }
     if (sampleDataB < sampleDataA) {
     return 1;
     }
     return 0;
     }

     },
     */
});
