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

function createBundler(b, minify) {
    return function () {
        // set up the browserify instance on a task basis
        var ret = b.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('tayberry.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/'));
        if (minify) {
            ret = ret.pipe(filter(['*', '!**/*.js.map']))
                .pipe(rename({suffix: '.min'}))
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(uglify())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('./dist/'));
        }
        return ret;
    }
}

var opts = assign({}, watchify.args, customOpts);
var bDev = watchify(browserify(opts));
var bProd = browserify(opts);
var bundleDev = createBundler(bDev, false);
var bundleProd = createBundler(bProd, true);

gulp.task('dev', bundleDev);
bDev.on('update', bundleDev);
bDev.on('log', gutil.log);

gulp.task('prod', bundleProd);
bProd.on('log', gutil.log);


function createLintTask(taskName, files) {
    gulp.task(taskName, function () {
        return gulp.src(files)
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failOnError())
            ;
    });
}

createLintTask('lint', ['src/**/*.js', 'test/**/*.js']);

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});
