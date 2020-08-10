export function createChartContainer(): HTMLDivElement {
  const div = document.createElement('div');

  Object.assign(div.style, {
    height: 'calc(100vh - 2rem)',
    width: 'calc(100vw - 2rem)',
    margin: '1rem',
  });

  return div;
}
