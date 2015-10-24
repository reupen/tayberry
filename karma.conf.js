module.exports = function (config) {
    config.set({

        browsers: ['PhantomJS_custom'],

        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                options: {
                    windowName: 'my-window',
                    settings: {
                        webSecurityEnabled: false
                    }
                },
                flags: ['--load-images=true'],
                debug: true
            }
        },

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
            transform: ['babelify']
        }

        // define reporters, port, logLevel, browsers etc.
    });
};
