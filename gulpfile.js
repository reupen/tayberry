'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var istanbul = require('gulp-istanbul');
var babelify = require("babelify");
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var Server = require('karma').Server;
var notify = require('gulp-notify');

var assign = require('lodash.assign');

var customOpts = {
    entries: './src/tayberry.js',
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
        .pipe(gulp.dest('./dist/'));
}

gulp.task('prod', bundleProd); // so you can run `gulp js` to build the file
bProd.on('log', gutil.log); // output build logs to terminal

function bundleProd() {
    // set up the browserify instance on a task basis
    return bProd.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('colour.spec.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'))
        .pipe(filter(['*', '!**/*.js.map']))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
}

function jscsNotify(file) {
  if (!file.jscs) { return; }
  return file.jscs.success ? false : 'JSCS failed';
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe(plumber())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError())
      //.pipe(jscs())
      .pipe(notify(jscsNotify));
  });
}

createLintTask('lint-src', ['src/**/*.js']);

createLintTask('lint-test', ['test/**/*.js']);

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});
