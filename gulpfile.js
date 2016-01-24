'use strict';

var gulp = require('gulp');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');
var Server = require('karma').Server;

var rollup = require('gulp-rollup');
var rollupbabel = require('rollup-plugin-babel');

gulp.task('lint', function () {
    return gulp.src(['src/**/*.js', 'test/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        ;
});

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('build', function () {
    gulp.src('./src/tayberry.js', {read: false})
        .pipe(rollup({
            sourceMap: true,
            plugins: [
                rollupbabel({
                    presets: ['es2015-rollup']
                })
            ],
            format: 'umd',
            moduleName: 'Tayberry'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'))
        .pipe(filter(['*', '!**/*.js.map']))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['lint', 'build', 'test']);

gulp.task('watch', ['default'], function () {
    gulp.watch('src/*', ['lint', 'build']);
});

