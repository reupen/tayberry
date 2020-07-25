module.exports = {
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-viewport',
    '@storybook/addon-storysource',
  ],
  parameters: {
    layout: 'fullscreen',
  },
  stories: ['../stories/*.stories.[tj]s'],
};
