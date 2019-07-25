import React, { Component } from 'react';

import Filter from './filter.jsx';
import Blob from './Blob.jsx';
import Drilldown from './Drilldown.jsx';

import * as aggregators from '../aggregator/apprentices.js';

import loadJson from '../utils/loadJson.js';

import heading from '../content/title.md';

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function getDrillTexts({ drill, data }) {
  return data.map(_ => _[drill]).filter(onlyUnique)
}

function generateFilter({ filter, key }) {
  return (record) => (filter && filter.length > 0) ? filter.includes(record[key]) : true;
}

function multiFilter (filters) {
  return (record) => filters.reduce((accumulator, current) => (accumulator && current(record)), true);
}

function filterData({ state, data }) {
  const filter = [
    generateFilter({ filter: state.regionFilter, key: 'onsRegion' }),
    generateFilter({ filter: state.sectorFilter, key: 'SSA T1' }),
    generateFilter({ filter: state.genderFilter, key: 'Gender' }),
  ]
  return data.filter(multiFilter(filter));
}

export default class Explorer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filteredData: [],
      drill: null,
      regionFilter: [ 'E12000003' ],
      sectorFilter: [],
      genderFilter: [],
      aggregator: aggregators['starts'],
    }
    this.setFilter = this.setFilter.bind(this);
  }

  setDrill(drill) {
    this.setState(() => ({ drill }))
  }

  setFilter(filterSpec) {
    this.setState(() => filterSpec);
    this.setState((state) => ({ filteredData: filterData({ state, data: state.data }) }));
  }

  render() {
    const { aggregator } = this.state;
    const oneNumber = aggregator({ data: this.state.filteredData });

    let drillDown = null;
    if (this.state.drill) {
      const names = getDrillTexts({data: this.state.filteredData, drill: this.state.drill});
      const drills = names.map((drillName, i) => <Drilldown
        key={ i }
        data={ this.state.filteredData }
        dimension={ this.state.drill }
        category={ drillName }
        aggregator={ aggregator }
      />)
      drillDown = <section id='drilldown'>
        { drills }
      </section>;
    }

    return <>
        <header>
          <h1>Apprenticeship Explorer</h1>
        </header>
        <article id='blurb' dangerouslySetInnerHTML={{ __html: heading }} />
        <section id='summary'>
          <Blob value={ oneNumber } />
        </section>
        <Filter
            selected={{
              region: this.state.regionFilter,
              sector: this.state.sectorFilter
            }}
            handler={ this.setFilter } />
        <section id='control'>
          <p>Show by:</p>
          <button onClick={ () => this.setDrill('SSA T1') }>Sector</button>
          <button onClick={ () => this.setDrill('LAD') }>Local Authority</button>
          <button onClick={ () => this.setDrill('Gender') }>Gender</button>
          <button onClick={ () => this.setDrill('Level') }>Level</button>
          <button onClick={ () => this.setDrill(null) }>Clear</button>
        </section>
        { drillDown }
      </>;
  }

  async loadReport() {
    const data = await loadJson({ url: this.props.url });
    const filteredData = filterData({ state: this.state, data });
    this.setState(() => ({ data, filteredData }));
  }

  componentDidMount() {
    this.loadReport();
    // setInterval(() => this.loadReports(), 300000);
  }

}

