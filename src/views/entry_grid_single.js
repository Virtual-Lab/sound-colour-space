var Base = require('./base');

module.exports = Base.SingleView.extend({

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL
    },

    template: require('../templates/entry_grid_single.dust'),

});