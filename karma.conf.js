module.exports = function (config) {
  config.set({
    browsers: ['FirefoxHeadless', 'ChromeHeadlessNoSandbox'],

    basePath: '',

    frameworks: ['jasmine', 'karma-typescript'],

    files: ['node_modules/regenerator-runtime/runtime.js', 'src/**/*'],

    exclude: [],

    preprocessors: {
      'src/**/*.+(js|ts|tsx)': ['karma-typescript'],
    },

    karmaTypescriptConfig: {
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      },
      compilerOptions: {
        allowJs: true,
        esModuleInterop: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
  });
};
