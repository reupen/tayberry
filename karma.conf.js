module.exports = function (config) {
  config.set({
    browsers: ['FirefoxHeadless', 'ChromeHeadlessNoSandbox'],

    basePath: '',

    frameworks: ['jasmine', 'karma-typescript'],

    files: ['src/**/*.spec.js'],

    exclude: [],

    preprocessors: {
      'src/**/*.js': ['karma-typescript'],
    },

    karmaTypescriptConfig: {
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      },
      compilerOptions: {
        allowJs: true,
      },
      include: ['src/**/*', 'test/**/*'],
      exclude: ['node_modules'],
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },

    // define reporters, port, logLevel, browsers etc.
  });
};
