import React from 'react';
import ReactDOM from 'react-dom';
import Explorer from './components/Explorer.jsx';

const url = './reports.csv'

import aggregator from './utils/aggregator.js';

export function initialise({ appRootId = 'app' } = {}) {
  ReactDOM.render(
    <Explorer url={ url } aggregator={ aggregator }/>,
    document.getElementById(appRootId)
  );
};
