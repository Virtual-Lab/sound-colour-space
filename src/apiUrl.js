var api_url = '/api/v1/';

var URLs = {
    entries: function () {
        return api_url + 'entry/';
    },
    entry: function (uuid) {
        return URLs.entries() + uuid;
    },

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