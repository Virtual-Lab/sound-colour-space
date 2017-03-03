'use strict';

var config = require('./gulp-settings.json');

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpSequence = require('gulp-sequence');
var concat = require('gulp-concat');
var $ = require('gulp-load-plugins')();

var watchify = require('watchify');
var aliasify = require('aliasify');
var browserify = require('browserify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');

var browserSync = require('browser-sync').create();

var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

var STATIC_ROOT = {
    dev: './website/site-static/',
    dist: './website/site-static/dist/'
};

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

var SASS_INCLUDE_PATHS = [
    'sass/lib/fd-6.2',
    //'sass/lib/font-awesome-4.6.3',
    'sass/lib/lightbox'
];

var FOUNDATION_JS = [
    // core
    './node_modules/foundation-sites/js/foundation.core.js',

    // dependencies
    './node_modules/foundation-sites/js/foundation.util.motion.js',
    './node_modules/foundation-sites/js/foundation.util.triggers.js',
    './node_modules/foundation-sites/js/foundation.util.keyboard.js',
    './node_modules/foundation-sites/js/foundation.util.touch.js',

    './node_modules/foundation-sites/js/foundation.util.mediaQuery.js',
    './node_modules/foundation-sites/js/foundation.slider.js',
    './node_modules/foundation-sites/js/foundation.accordion.js',

];

var SASS_SRC_PATHS = [
    './sass/screen.sass'
];

var JS_SRC_PATHS = [
    './src/main.js'
];

var FONT_SRC_PATHS = [
    './fonts/**/*'
];


gulp.task('proxy', ['styles:base', 'javascript:base'], function () {

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

    gulp.watch("sass/**/*.*", ['styles:base']);
});


/**********************************************************************
 * SCRIPTS
 **********************************************************************/

gulp.task('javascript', gulpSequence(
    'javascript:foundation',
    'javascript:base'
));

gulp.task('javascript:foundation', function () {
    return gulp.src(FOUNDATION_JS)
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe(concat('foundation.js'))
        .pipe(gulp.dest('./src/lib/'));
});

gulp.task('javascript:base', function () {
    return buildScript(/* watch = */ true);
});

function buildScript(watch) {
    var props = {
        entries: [JS_SRC_PATHS],
        insertGlobals: watch ? true : false,
        debug: watch ? true : false,
    };

    var bundler = watch ? watchify(browserify(props)) : browserify(props);

    bundler.transform([
        "dustify",
        {
            "path": "src/templates"
        }
    ]);

    // aliasify
    var aliasifyConfig = {
        aliases: {
            "underscore": "lodash",
            "jquery": "./node_modules/jquery/dist/jquery.js"
        },
        verbose: false
    };
    bundler.transform(aliasify, aliasifyConfig);

    // strip all console messages
    if (!watch)
        bundler.transform("stripify");

    function rebundle() {
        bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            // optional, remove if you don't need to buffer file contents
            .pipe(buffer())
            // optional, remove if you dont want sourcemaps
            .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
            .pipe(sourcemaps.write('./')) // writes .map file
            .pipe(gulp.dest(STATIC_ROOT.dev + 'js/'))
            .pipe(browserSync.stream({match: '**/*.js'}));
    }

    function dist() {
        bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe($.size({title: 'script size:'}))
            .pipe(gulp.dest(STATIC_ROOT.dist + 'js/'));
    }

    bundler.on('log', gutil.log);
    bundler.on('update', function () {
        rebundle();
        gutil.log('Rebundle ...');
    });

    /*
     // hack to make sure process exits
     gulp.on('stop', function () {
     if (!watch) {
     gutil.log('DONE.');
     process.nextTick(function () {
     process.exit(0);
     });
     }
     });
     */

    if (watch)
        return rebundle();
    else
        return dist();
}


/**********************************************************************
 * STYLES
 **********************************************************************/
gulp.task('styles', function (callback) {
    gulpSequence(
        'styles:base',
        'styles:admin'
    )(callback)
});

gulp.task('styles:base', function () {
    return gulp.src(SASS_SRC_PATHS)
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: SASS_INCLUDE_PATHS,
            outputStyle: 'expanded',
            sourceComments: true,
            precision: 10
        }).on('error', sass.logError))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(STATIC_ROOT.dev + 'css/'))
        .pipe(browserSync.stream({match: '**/*.css'}))
        .pipe($.size({title: 'styles'}));
});

gulp.task('styles:admin', function () {
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
        .pipe(gulp.dest(STATIC_ROOT.dev + 'django_slick_admin/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}))
        .pipe($.size({title: 'styles'}));
});

/**********************************************************************
 * DISTRIBUTION
 **********************************************************************/

// HINT never call accidentally watchify (dist task will not exit)

gulp.task('dist', gulpSequence(
    //'lint:styles',
    'dist:styles',
    //'lint:scripts',
    // make sure we have the libraries
    'javascript:foundation',
    'dist:javascript',
    'dist:fonts'
));

gulp.task('dist:styles', function () {
    return gulp.src(SASS_SRC_PATHS)
        .pipe($.sass({
            includePaths: SASS_INCLUDE_PATHS,
            precision: 10,
            outputStyle: 'compressed'
        }))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(concat('screen.css'))
        .pipe(gulp.dest(STATIC_ROOT.dist + 'css/'))
        .pipe($.size({title: 'stylesheet size:'}));
});

gulp.task('dist:javascript', function () {
    return buildScript(/* watch = */ false);
});


gulp.task('dist:fonts', function () {
    gulp.src(FONT_SRC_PATHS)
        .pipe(gulp.dest(STATIC_ROOT.dist + 'fonts/'))
        .pipe($.size({title: 'fonts size:'}));
});


/**********************************************************************
 * ENTRY POINT
 **********************************************************************/
gulp.task('default', ['proxy']);
gulp.task('watch', ['proxy']);


