module.exports = function (config) {
    config.set({

        browsers: ['FirefoxHeadless', 'ChromeHeadless'],

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
            transform: [['babelify', {presets: ['env']}]]
        },

        // define reporters, port, logLevel, browsers etc.
    });
};
