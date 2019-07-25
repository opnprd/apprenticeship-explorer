import React from 'react';
import ReactDOM from 'react-dom';
import Explorer from './components/Explorer.jsx';

export function initialise({ appRootId = 'app' } = {}) {
  ReactDOM.render(
    <Explorer />,
    document.getElementById(appRootId)
  );
};
