import onsData from '../../data/sources/ons.json';

export const regions = onsData.filter(_ => _.prefix === 'RGN18').map(_ => ({ name: _.name, value: _.code }));
