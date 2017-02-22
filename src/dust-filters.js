// dust filters
var dust = require('dustjs-linkedin');

// KEPT FOR REFERENCE

/*
var marked = require('marked');
var md5 = require('blueimp-md5');

var renderer = new marked.Renderer();

// override link rendering
renderer.link = function (href, title, text) {

    //console.warn(href);

    if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '" target="_blank" data-bypass>' + text + '</a>';
    }

//  else if (href.split('/')[0].indexOf('diagram') === 0) {
//        return '<a href="/diagrams/' + href.split('/')[1] + '" title="' + (title != null ? title : "") + '" target="_blank">' + text + '</a>';
//  }
//  else if (href.split('/')[0].indexOf('set') === 0) {
//      return '<a href="/sets/' + href.split('/')[1] + '" title="' + (title != null ? title : "") + '" target="_blank">' + text + '</a>';
//  }


    else {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '">' + text + '</a>';
    }
};

// markdown filter
dust.filters.markdown = function (text) {
    return marked(text, {renderer: renderer});
};

// human file size filter
dust.filters.humanFileSize = function (bytes) {
    var si = true;
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
};

// md5 hash filter

 dust.filters.md5 = function(value) {
 return md5(value);
 };


*/
