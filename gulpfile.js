'use strict';

var gulp = require('gulp');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');
var Server = require('karma').Server;

var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rollupbabel = require('rollup-plugin-babel');

gulp.task('lint', function () {
    return gulp.src(['src/**/*.js', 'test/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('test:ci', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS', 'Firefox', 'ChromeNoSandbox']
    }, done).start();
});

gulp.task('build', function () {
    return rollup({
        input: './src/tayberry.js',
        sourcemap: true,
        plugins: [
            rollupbabel({
                presets: [['es2015', {'modules': false}]],
                plugins: ['external-helpers']
            })
        ],
        format: 'umd',
        name: 'Tayberry'
    })
        .pipe(source('tayberry.js', './src'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'))
        .pipe(filter(['**', '!**/*.js.map']))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['lint', 'build', 'test']);

gulp.task('ci', ['lint', 'build', 'test:ci']);

gulp.task('watch', ['default'], function () {
    gulp.watch('src/*', ['lint', 'build']);
});

