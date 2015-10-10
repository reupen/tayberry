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
var b = watchify(browserify(opts));

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
    // set up the browserify instance on a task basis
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('tayberry.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js/'))
        //.pipe(rename({suffix: '.min'}))
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify())
        //.on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js/'));
}