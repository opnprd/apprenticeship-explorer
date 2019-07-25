import React, { Component } from 'react';
import TagCloud from './TagCloud.jsx';

import { regions } from '../utils/geo.js';

const sectors = [
  { name: 'Agriculture, Horticulture and Animal Care', value: 'Agriculture, Horticulture and Animal Care' },
  { name: 'Construction, Planning and the Built Environment', value: 'Construction, Planning and the Built Environment' },
  { name: 'Engineering and Manufacturing Technologies', value: 'Engineering and Manufacturing Technologies' }
]

function lookupOne(data, key, value) {
  return data.filter(_ => _[key] === value)[0];
}

function valueToName(reference) {
  return (value) => lookupOne(reference, 'value', value).name;
}

function Selector (props) {
  const options = props.options.map((_, i) => (<option key={ i } value={ _.value }>{ _.name }</option>));
  return <select name={ props.name } multiple={ true } value={ props.value } onChange={ props.handler }>
    { options }
  </select>
}

function FilterBlock (props) {
  const valueNames = props.value.map(valueToName(props.options));

  return <fieldset id={ props.name } className='filter-block'>
    <label htmlFor={ props.name }>{ props.title }</label>
    <Selector
      name={ props.name }
      value={ props.value }
      options={ props.options }
      handler={ props.handler } />
    <TagCloud
      value={ valueNames } />
  </fieldset>;
}

export default class Filter extends Component {
  constructor(props) {
    super(props)
    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  handleFilterChange (reference) {
    return (e) => {
      const newState = {};
      const newValue = Array.from(e.target.selectedOptions, option => option.value);
      newState[reference] = newValue;
      this.props.handler(newState);
    }
  }

  render() {
    return <section id='filter'>
      <h2>Filter data</h2>
      <form>
        <FilterBlock
          title='Region'
          name='region'
          options={ regions }
          value={ this.props.selected.region }
          handler={ this.handleFilterChange('regionFilter') } />
        <FilterBlock
          title='Sector'
          name='sector'
          options={ sectors }
          value={ this.props.selected.sector }
          handler={ this.handleFilterChange('sectorFilter') } />
      </form>
    </section>;
  }
}