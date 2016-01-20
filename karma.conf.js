module.exports = function (config) {
    config.set({

        browsers: ['PhantomJS', 'Firefox', 'Chrome'],

        phantomjsLauncher: {
            exitOnResourceError: true
        },
        basePath: '',
        frameworks: ['jasmine'],

        files: [
            'test/unit/**/*.js'
        ],

        exclude: [],

        preprocessors: {
            'src/**/*.js': ['babel'],
            'test/**/*.js': ['babel']
        },
        babelPreprocessor: {
            options: {
                presets: ['es2015'],
                sourceMap: 'inline'
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        }
        // define reporters, port, logLevel, browsers etc.
    });
};
