var api_url = '/api/v1/';

var URLs = {
    entries: function () {
        return api_url + 'entry/';
    },
    entry: function (doc_id) {
        return URLs.entries() + doc_id;
    },

    experiments: function () {
        return api_url + 'experiment/';
    },
    experiment: function (slug) {
        return URLs.experiments() + slug;
    },

    sets: function () {
        return api_url + 'collection/';      // CAUTION: API URI IS 'COLLECTION' NOT SET FOR DJANGO COMPATIBILITY
    },
    set: function (slug) {
        return URLs.sets() + slug;
    }


    /*
     subscriptions: function(userId, id) {
     return "/api/users/"+ userId +"/subscriptions/" + id;
     }
     */
};

// Helper for accessing the URL list.
var apiUrl = function (type) {
    var url = URLs[type] ? URLs[type].apply(this, [].slice.call(arguments, 1)) : undefined;
    return url;
};

module.exports = apiUrl;