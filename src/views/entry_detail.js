var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var foundation = require('foundation-sites');
Backbone.$ = $;

var Base = require('./base');

var marked = require('marked');
//var md5 = require('blueimp-md5');


var renderer = new marked.Renderer();

// override link rendering
renderer.link = function (href, title, text) {

    if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) {
        return '<a href="' + href + '" title="' + (title != null ? title : "") + '" target="_blank" data-bypass>' + text + '</a>';
    } else {
        if (href.split('/')[0].indexOf('diagram') === 0) {
            return '<a href="/diagrams/' + href.split('/')[1] + '" title="' + (title != null ? title : "") + '" target="_blank">' + text + '</a>';
        } else if (href.split('/')[0].indexOf('set') === 0) {
            return '<a href="/sets/' + href.split('/')[1] + '" title="' + (title != null ? title : "") + '" target="_blank">' + text + '</a>';
        }
    }

};


marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false, // IMPORTANT, because we do MathJax before markdown,
                     //            however we do escaping in 'CreatePreview'.
    smartLists: true,
    smartypants: false
});


module.exports = Base.DetailView.extend({

    template: require('../templates/entry_detail.dust'),

    data: {
        DIAGRAMS_URL: DIAGRAMS_URL,
        mjRunning: false,
        mjTimeout: null
    },

    initialize: function (options) {
        this.options = _.extend({}, options);
        _.extend(this.data, options.data);
        _.bindAll(this, 'onRequest', 'onSync', 'render', 'onShow', 'Escape', 'CreatePreview', 'PreviewDone');

        this.listenTo(this.model, 'change', function () {
            console.debug('change....', this.model.id);
            this.render();
            this.onShow();
        });
        this.listenTo(this.model, 'request', this.onRequest);
        this.listenTo(this.model, 'sync', this.onSync);
        this.listenTo(this.model, 'destroy', this.remove);
        this.listenTo(this.model, 'remove', this.remove);

    },

    onShow: function () {
        // scroll to top
        $(window).scrollTop(0);

        this.mjBuffer = document.getElementById("marked-mathjax-preview-buffer");
        this.CreatePreview();
    },

    events: {},

    Escape: function (html, encode) {
        return html
            .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },


    CreatePreview: function () {

        // if (this.data.mjRunning) return;

        var text = $('.description').text();

        if (text === "")
            return;

        //console.log("Plain text", text);

        text = this.Escape(text);                       // Escape tags before doing stuff
        //console.log("escaped text is: ", text);

        this.mjBuffer.innerHTML = text;
        //this.data.mjRunning = true;

        //console.log("CreatePreview", this.mjBuffer);


        MathJax.Hub.Queue(
            ["Typeset", MathJax.Hub, this.mjBuffer],
            ["PreviewDone", this],
            ["resetEquationNumbers", MathJax.InputJax.TeX]
        );

    },

    //
    //  Indicate that MathJax is no longer running,
    //  do markdown over MathJax's result,
    //  and swap the buffers to show the results.
    //
    PreviewDone: function () {
        //this.data.mjRunning = false;
        var text = this.mjBuffer.innerHTML;
        //console.log("PreviewDone:", this.mjBuffer.innerHTML);


        // replace occurrences of &gt; at the beginning of a new line
        // with > again, so Markdown blockquotes are handled correctly
        text = text.replace(/^&gt;/mg, '>');

        this.mjBuffer.innerHTML = marked(text, {renderer: renderer});

        //this.SwapBuffers();

        //console.log("final:", this.data.mjBuffer);
        $('.description').html(this.mjBuffer.innerHTML);

    }


});

