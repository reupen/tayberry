module.exports = function (config) {
    config.set({

        browsers: ['FirefoxHeadless', 'ChromeHeadlessNoSandbox'],

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

        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        }

        // define reporters, port, logLevel, browsers etc.
    });
};
