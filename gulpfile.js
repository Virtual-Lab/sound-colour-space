'use strict';

var config = require('./gulp-settings.json');

var watchify = require('watchify');
var aliasify = require('aliasify');
var browserify = require('browserify');

var gulp = require('gulp');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');


var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');


var uglify = require('gulp-uglify');

var reactify = require('reactify');


var sassPaths = [
    'sass/lib/fd-6.2'
];

var AUTOPREFIXER_BROWSERS = [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4'
];


// add custom browserify options here
var customOpts = {
    entries: ['./src/main.js'],
    debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

var aliasifyConfig = {
    aliases: {
        "underscore": "lodash"
    },
    verbose: true
};

// add transformations here
b.transform([
    "dustify",
    {
        "path": "src/templates"
    }
]);

b.transform(aliasify, aliasifyConfig);

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return b.bundle()
    // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./website/site-static/js'))
        .pipe(browserSync.stream({match: '**/*.js'}));
}


gulp.task('proxy', ['styles', 'admin-styles', 'js'], function () {

    browserSync.init({
        notify: false,
        port: config.local_port,
        host: config.hostname,
        //open: "external",
        open: false,
        proxy: {
            target: "127.0.0.1:" + config.proxy_port
        },
        ui: {
            port: config.local_port + 1,
            weinre: {
                port: config.local_port + 2
            }
        }
    });

    gulp.watch("sass/**/*.*", ['styles', 'admin-styles']);
    //gulp.watch("website/**/*.html").on('change', browserSync.reload);
});

gulp.task('styles', function () {
    return gulp.src([
        'sass/screen.sass'
    ])
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: sassPaths,
            outputStyle: 'expanded',
            sourceComments: true,
            precision: 10
        }).on('error', sass.logError))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('website/site-static/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}))
        .pipe($.size({title: 'styles'}));
});

gulp.task('admin-styles', function () {
    return gulp.src([
        'sass/site/admin/django-slick-admin.sass'
    ])
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: './node_modules/django-slick-admin-styles/sass/',
            outputStyle: 'expanded',
            precision: 10
        }).on('error', sass.logError))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe($.sourcemaps.write())
        //.pipe(concat('django-slick-admin.css'))
        .pipe(gulp.dest('website/site-static/django_slick_admin/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}))
        .pipe($.size({title: 'styles'}));
});

// gulp.task('dist', function () {
//     return gulp.src([
//             'website/site-static/sass/screen.sass',
//             'website/site-static/sass/print.sass',
//             'website/site-static/sass/admin.sass'
//         ])
//         .pipe($.sass({
//             includePaths: sassPaths,
//             outputStyle: 'compact',
//             sourceComments: false,
//             precision: 10
//         }))
//         .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
//         .pipe($.stripCssComments({}))
//         .pipe(gulp.dest('website/site-static/dist/css/'))
//         .pipe($.size({title: 'styles'}));
// });

gulp.task('babel', function () {
    return gulp.src([
        'node_modules/foundation-sites/js/*.js'
    ])
    //.pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('website/site-static/js/fd-6.2/'))
        .pipe($.size({title: 'babel'}));
});

// gulp.task('scripts', function() {
//     return gulp.src([
//           'website/site-static/js/**/*.coffee',
//     ])
//     .pipe($.coffee({bare: true}).on('error', gutil.log))
//     .pipe(gulp.dest('website/site-static/dist/js/'));
// });

gulp.task('default', ['proxy']);
gulp.task('watch', ['proxy']);

