import React, { Component } from 'react';

import Blob from './Blob.jsx';
import Drilldown from './Drilldown.jsx';

import loadJson from '../utils/loadJson.js';

import heading from '../content/title.md';

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function getDrillTexts({ drill, data }) {
  return data.map(_ => _[drill]).filter(onlyUnique)
}

export default class Explorer extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [], drill: null }
  }

  setDrill(drill) {
    this.setState(() => ({ drill }))
  }

  render() {
    const { aggregator } = this.props;
    const { data, drill } = this.state;
    const oneNumber = aggregator({ data });

    let drillDown = null;
    if (drill) {
      const names = getDrillTexts({data, drill});
      console.dir(names);
      const drills = names.map((drillName, i) => <Drilldown
        key={ i }
        data={ data }
        dimension={ drill }
        category={ drillName }
        aggregator={ aggregator }
      />)
      drillDown = <section id='drilldown'>
        { drills }
      </section>;
    }

    return <>
        <header dangerouslySetInnerHTML={{ __html: heading }} />
        <section id='summary'>
          <Blob value={ oneNumber } />
        </section>
        {/* <section id='control'>
          <p>Show by:</p>
          <button onClick={ () => this.setDrill('Local_Authority') }>Local Authority</button>
          <button onClick={ () => this.setDrill('Company') }>Company</button>
          <button onClick={ () => this.setDrill(null) }>Clear</button>
        </section>
        { drillDown } */}
      </>;
  }

  async loadReport() {
    const data = await loadJson({ url: this.props.url });
    this.setState(() => ({ data }));
  }

  componentDidMount() {
    this.loadReport();
    // setInterval(() => this.loadReports(), 300000);
  }

}

