const layer = {
  id: 'data',
  source: 'datas',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-radius': 10,
    'circle-opacity': 0.9,
    'circle-color': '#f03e3e',
  },
};
const cluster = {
  id: 'cluster',
  type: 'circle',
  source: 'datas',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#339af0',
      100,
      '#fcc419',
      750,
      '#f28cb1',
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
    'circle-opacity': 0.5,
  },
};
const countCuster = {
  id: 'countCluster',
  type: 'symbol',
  source: 'datas',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
};

export { layer, cluster, countCuster };
