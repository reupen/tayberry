module.exports = function (config) {
    config.set({

        browsers: ['PhantomJS', 'Firefox', 'Chrome'],

        phantomjsLauncher: {
            exitOnResourceError: true
        },
        basePath: '',
        frameworks: ['browserify', 'jasmine'],

        files: [
            'test/unit/**/*.js'
        ],

        exclude: [],

        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: [['babelify', { presets: ['es2015'] }]]
        }

        // define reporters, port, logLevel, browsers etc.
    });
};
