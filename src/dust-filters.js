var dust  = require('dustjs-linkedin');

// dust filters
var marked = require('marked');
//var md5 = require('blueimp-md5');

// override link rendering
var renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    return '<a href="' + href + '" title="' + title + '" target="_blank" data-bypass>' + text + '</a>';
};

// markdown filter
dust.filters.markdown = function(text) {
    return marked(text, { renderer: renderer });
}

// md5 hash filter
/*
dust.filters.md5 = function(value) {
    return md5(value);
};
*/

// human file size filter
dust.filters.humanFileSize = function(bytes) {
    var si = true;
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
    ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
    : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
};

// twitter filter
dust.filters.hipster = function(text) {
    return twttr.txt.autoLink(text,
    {
        usernameUrlBase: BASE_URL+"/",
        hashtagUrlBase: BASE_URL+"/search#",
        listUrlBase: BASE_URL+"/",
    });
}
