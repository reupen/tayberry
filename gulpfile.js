'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var babelify = require("babelify");

var assign = require('lodash.assign');

var customOpts = {
    entries: './js/tayberry.js',
    standalone: 'Tayberry',
    debug: true,
    transform: [babelify]
};

var opts = assign({}, watchify.args, customOpts);
var bDev = watchify(browserify(opts));
var bProd = browserify(opts);

gulp.task('dev', bundleDev); // so you can run `gulp js` to build the file
bDev.on('update', bundleDev); // on any dep update, runs the bundler
bDev.on('log', gutil.log); // output build logs to terminal

function bundleDev() {
    // set up the browserify instance on a task basis
    return bDev.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('tayberry.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js/'));
}

gulp.task('prod', bundleProd); // so you can run `gulp js` to build the file
bProd.on('log', gutil.log); // output build logs to terminal

function bundleProd() {
    // set up the browserify instance on a task basis
    return bProd.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('tayberry.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js/'));
}