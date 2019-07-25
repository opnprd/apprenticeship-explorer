import React from 'react';
import ReactDOM from 'react-dom';
import Explorer from './components/Explorer.jsx';

const url = './report.json'

import { starts, populationEstimate } from './aggregator/apprentices.js';

export function initialise({ appRootId = 'app' } = {}) {
  ReactDOM.render(
    <Explorer url={ url } aggregator={ starts }/>,
    document.getElementById(appRootId)
  );
};
