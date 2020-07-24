module.exports = {
  stories: ['../stories/*.stories.[tj]s'],
  addons: ['@storybook/addon-knobs/register', '@storybook/addon-viewport/register'],
  parameters: {
    layout: 'fullscreen',
  },
};
