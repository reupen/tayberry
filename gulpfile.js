'use strict';

const { dest, series, src, watch: watch_ } = require('gulp');
const filter = require('gulp-filter');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint7');
const Server = require('karma').Server;

const rollup = require('@rollup/stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const typescript = require('rollup-plugin-typescript2');

function lint() {
  return src(['src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}

function test(cb) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  }).start();
  cb();
}

function build() {
  return rollup({
    input: './src/tayberry.js',
    plugins: [typescript({ include: ['src/**/*'] })],
    output: {
      format: 'umd',
      name: 'Tayberry',
      sourcemap: true,
    },
  })
    .pipe(source('tayberry.js', './src'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('./dist/'))
    .pipe(filter(['**', '!**/*.js.map']))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('./dist/'));
}

function watch() {
  return watch_(['src/*'], series(lint, build));
}

exports.lint = lint;
exports.test = test;
exports.build = build;
exports.watch = series(lint, build, watch);

exports.default = series(lint, build, test);
exports.ci = series(lint, build, test);
