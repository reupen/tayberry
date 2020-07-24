const viewports = {
  '100pc': {
    name: '100%',
    styles: {
      width: '100%',
      height: '100%',
    },
  },
  '1200x900': {
    name: '1200x900',
    styles: {
      width: '1200px',
      height: '900px',
    },
  },
  '800x600': {
    name: '800x600',
    styles: {
      width: '800px',
      height: '600px',
    },
  },
  '600x450': {
    name: '600x450',
    styles: {
      width: '600px',
      height: '450px',
    },
  },
  '400x300': {
    name: '400x300',
    styles: {
      width: '400px',
      height: '300px',
    },
  },
};

export const parameters = {
  viewport: {
    viewports: viewports,
    defaultViewport: '800x600',
  },
  layout: 'fullscreen',
  options: {
    panelPosition: 'right',
  },
};
